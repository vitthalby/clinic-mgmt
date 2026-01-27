"use server"

import { db } from "@/lib/db"
import { roles, features, roleFeaturePermissions, branches } from "@/lib/schema"
import { eq, desc, or, isNull, and } from "drizzle-orm"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

/**
 * Get roles, optionally filtered by branch
 * - Super users (isSuperUser=true): Get all roles, optionally filtered by branchId
 * - Non-super users: Only get roles for the specified branchId
 */
export async function getRoles(branchId?: string, isSuperUser?: boolean) {
    const session = await auth()
    if (!session?.user) return []

    const adminRoleName = process.env.ADMIN_ROLE || "ADMIN"

    // If super user and no branch filter, return all roles
    if (isSuperUser && !branchId) {
        return db.query.roles.findMany({
            orderBy: [desc(roles.createdAt)],
        })
    }

    // If branch is provided
    if (branchId) {
        if (isSuperUser) {
            // Super users see branch roles + all global roles (including ADMIN)
            return db.query.roles.findMany({
                where: or(
                    eq(roles.branchId, branchId),
                    isNull(roles.branchId)
                ),
                orderBy: [desc(roles.createdAt)],
            })
        } else {
            // Non-super users only see roles for their SPECIFIC branch
            // They should NOT see global ADMIN role or roles from other branches
            return db.query.roles.findMany({
                where: and(
                    eq(roles.branchId, branchId)
                ),
                orderBy: [desc(roles.createdAt)],
            })
        }
    }

    // Fallback: This case shouldn't really be hit by regular users
    if (isSuperUser) {
        return db.query.roles.findMany({
            orderBy: [desc(roles.createdAt)],
        })
    }

    return []
}


/**
 * Get all branches for role management dropdown
 */
export async function getAllBranches() {
    const session = await auth()
    if (!session?.user) return []

    return db.query.branches.findMany({
        orderBy: [desc(branches.createdAt)],
    })
}

export type PermissionInput = {
    featureId: string;
    canView: boolean;
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean
}

/**
 * Create a new role
 * @param data.branchId - If provided, role is branch-specific. If null/undefined, role is global.
 */
export async function createRole(
    data: { name: string; description?: string; branchId?: string | null },
    permissions?: PermissionInput[]
) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    const newRole = await db.insert(roles).values({
        name: data.name.toUpperCase(),
        description: data.description,
        branchId: data.branchId || null, // null for global roles
    }).returning({ id: roles.id })

    const roleId = newRole[0]?.id

    if (roleId && permissions && permissions.length > 0) {
        await updateRolePermissions(roleId, permissions)
    }

    revalidatePath("/management/roles")
}

/**
 * Update an existing role
 */
export async function updateRole(
    id: string,
    data: { name?: string; description?: string; branchId?: string | null },
    permissions?: PermissionInput[]
) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    await db.update(roles).set({
        name: data.name,
        description: data.description,
        branchId: data.branchId !== undefined ? data.branchId : undefined,
        updatedAt: new Date(),
    }).where(eq(roles.id, id))

    if (permissions) {
        await updateRolePermissions(id, permissions)
    }

    revalidatePath("/management/roles")
}

export async function deleteRole(id: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    // TODO: Check if role is in use by any user in userBranchRoles

    await db.delete(roles).where(eq(roles.id, id))
    revalidatePath("/management/roles")
}

export async function getFeatures() {
    return db.query.features.findMany()
}

export async function getRolePermissions(roleId: string) {
    return db.query.roleFeaturePermissions.findMany({
        where: eq(roleFeaturePermissions.roleId, roleId),
    })
}

export async function updateRolePermissions(
    roleId: string,
    permissions: {
        featureId: string;
        canView: boolean;
        canAdd: boolean;
        canEdit: boolean;
        canDelete: boolean
    }[]
) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    // We can loop and upsert
    for (const p of permissions) {
        await db.insert(roleFeaturePermissions).values({
            roleId,
            featureId: p.featureId,
            canView: p.canView,
            canAdd: p.canAdd,
            canEdit: p.canEdit,
            canDelete: p.canDelete,
        }).onConflictDoUpdate({
            target: [roleFeaturePermissions.roleId, roleFeaturePermissions.featureId],
            set: {
                canView: p.canView,
                canAdd: p.canAdd,
                canEdit: p.canEdit,
                canDelete: p.canDelete,
                updatedAt: new Date(),
            }
        })
    }

    revalidatePath(`/management/roles/${roleId}`)
    revalidatePath("/management/roles")
}

