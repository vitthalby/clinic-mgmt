import { db } from "@/lib/db"
import { features, roleFeaturePermissions, roles, users } from "@/lib/schema"
import { eq } from "drizzle-orm"

export type Permission = {
    canView: boolean;
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

export type PermissionMap = Record<string, Permission>;

export async function getUserPermissions(userId: string): Promise<PermissionMap> {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { role: true },
    })

    if (!user || !user.role) return {};

    const adminRoleName = process.env.ADMIN_ROLE || "ADMIN"

    // Super User / Admin Bypass
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

    // Get role ID from the role name
    const roleRecord = await db.query.roles.findFirst({
        where: eq(roles.name, user.role),
    })

    if (!roleRecord) return {};

    const rawPermissions = await db.select({
        featureKey: features.key,
        canView: roleFeaturePermissions.canView,
        canAdd: roleFeaturePermissions.canAdd,
        canEdit: roleFeaturePermissions.canEdit,
        canDelete: roleFeaturePermissions.canDelete,
    })
        .from(roleFeaturePermissions)
        .innerJoin(features, eq(roleFeaturePermissions.featureId, features.id))
        .where(eq(roleFeaturePermissions.roleId, roleRecord.id))

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
