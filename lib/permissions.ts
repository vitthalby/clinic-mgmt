import { db } from "@/lib/db"
import { features, roleFeaturePermissions, roles, users, userBranchRoles, branchFeatures } from "@/lib/schema"
import { eq, and, inArray } from "drizzle-orm"

export type Permission = {
    canView: boolean;
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

export type PermissionMap = Record<string, Permission>;

/**
 * Get permissions for a user.
 * - For ADMIN users: Returns full permissions for all features
 * - For non-ADMIN users: Looks up their role for the specified branch and returns role-based permissions
 * 
 * @param userId - The user ID
 * @param branchId - The branch ID (required for non-admin users to get branch-specific role)
 */
export async function getUserPermissions(userId: string, branchId?: string): Promise<PermissionMap> {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { role: true },
    })

    if (!user) return {};

    const adminRoleName = process.env.ADMIN_ROLE || "ADMIN"

    // Super User / Admin Bypass - full permissions regardless of branch
    if (user.role === adminRoleName) {
        const allFeatures = await db.query.features.findMany();
        const fullPermissions: PermissionMap = {};
        allFeatures.forEach(f => {
            fullPermissions[f.key] = {
                canView: true,
                canAdd: true,
                canEdit: true,
                canDelete: true,
            }
        });
        return fullPermissions;
    }

    // For non-admin users, we need the branchId to get their branch-specific role
    if (!branchId) {
        console.warn(`getUserPermissions called for non-admin user ${userId} without branchId`)
        return {};
    }

    // Get role from userBranchRoles for this specific branch
    const userBranchRole = await db.query.userBranchRoles.findFirst({
        where: and(
            eq(userBranchRoles.userId, userId),
            eq(userBranchRoles.branchId, branchId)
        ),
    })

    if (!userBranchRole) {
        console.warn(`No role assignment found for user ${userId} in branch ${branchId}`)
        return {};
    }

    // Get enabled features for this branch first
    const enabledBranchFeatures = await db
        .select({ featureId: branchFeatures.featureId })
        .from(branchFeatures)
        .where(
            and(
                eq(branchFeatures.branchId, branchId),
                eq(branchFeatures.isEnabled, true)
            )
        )

    const enabledFeatureIds = enabledBranchFeatures.map(f => f.featureId)

    // If no features are enabled for this branch, return empty permissions
    if (enabledFeatureIds.length === 0) {
        return {};
    }

    // Get permissions for the role, filtered by branch-enabled features
    const rawPermissions = await db.select({
        featureKey: features.key,
        canView: roleFeaturePermissions.canView,
        canAdd: roleFeaturePermissions.canAdd,
        canEdit: roleFeaturePermissions.canEdit,
        canDelete: roleFeaturePermissions.canDelete,
    })
        .from(roleFeaturePermissions)
        .innerJoin(features, eq(roleFeaturePermissions.featureId, features.id))
        .where(
            and(
                eq(roleFeaturePermissions.roleId, userBranchRole.roleId),
                inArray(roleFeaturePermissions.featureId, enabledFeatureIds)
            )
        )

    const permissions: PermissionMap = {};

    rawPermissions.forEach(p => {
        permissions[p.featureKey] = {
            canView: p.canView ?? false,
            canAdd: p.canAdd ?? false,
            canEdit: p.canEdit ?? false,
            canDelete: p.canDelete ?? false,
        }
    });

    return permissions;
}

