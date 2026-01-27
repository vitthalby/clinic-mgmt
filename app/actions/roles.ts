"use server"

import { db } from "@/lib/db"
import { roles, features, roleFeaturePermissions, branches, userBranchRoles } from "@/lib/schema"
import { eq, desc, or, isNull, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireAuth, requirePermission } from "@/lib/auth-utils"
import {
    ActionResult,
    success,
    handleActionError,
    ValidationError,
    NotFoundError,
    ConflictError,
} from "@/lib/errors"

/**
 * Get roles, optionally filtered by branch
 * - Super users (isSuperUser=true): Get all roles, optionally filtered by branchId
 * - Non-super users: Only get roles for the specified branchId
 */
export async function getRoles(branchId?: string, isSuperUser?: boolean) {
    try {
        await requireAuth()

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
                    where: or(eq(roles.branchId, branchId), isNull(roles.branchId)),
                    orderBy: [desc(roles.createdAt)],
                })
            } else {
                // Non-super users only see roles for their SPECIFIC branch
                return db.query.roles.findMany({
                    where: eq(roles.branchId, branchId),
                    orderBy: [desc(roles.createdAt)],
                })
            }
        }

        // Fallback for super users
        if (isSuperUser) {
            return db.query.roles.findMany({
                orderBy: [desc(roles.createdAt)],
            })
        }

        return []
    } catch (error) {
        console.error("getRoles error:", error)
        return []
    }
}

/**
 * Get all branches for role management dropdown
 */
export async function getAllBranches() {
    try {
        await requireAuth()
        return db.query.branches.findMany({
            orderBy: [desc(branches.createdAt)],
        })
    } catch (error) {
        console.error("getAllBranches error:", error)
        return []
    }
}

export type PermissionInput = {
    featureId: string
    canView: boolean
    canAdd: boolean
    canEdit: boolean
    canDelete: boolean
}

/**
 * Create a new role
 * @param data.branchId - If provided, role is branch-specific. If null/undefined, role is global.
 */
export async function createRole(
    data: { name: string; description?: string; branchId?: string | null },
    permissions?: PermissionInput[]
): Promise<ActionResult<{ id: string }>> {
    try {
        await requirePermission("roles", "add")

        // Validate required fields
        if (!data.name?.trim()) {
            throw new ValidationError("Role name is required")
        }

        const roleName = data.name.trim().toUpperCase()

        // Check for duplicate role name in same branch
        const existingRole = await db.query.roles.findFirst({
            where: data.branchId
                ? and(eq(roles.name, roleName), eq(roles.branchId, data.branchId))
                : and(eq(roles.name, roleName), isNull(roles.branchId)),
        })

        if (existingRole) {
            throw new ConflictError("A role with this name already exists")
        }

        const newRole = await db
            .insert(roles)
            .values({
                name: roleName,
                description: data.description?.trim(),
                branchId: data.branchId || null,
            })
            .returning({ id: roles.id })

        const roleId = newRole[0]?.id

        if (roleId && permissions && permissions.length > 0) {
            await updateRolePermissionsInternal(roleId, permissions)
        }

        revalidatePath("/management/roles")
        return success({ id: roleId })
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Update an existing role
 */
export async function updateRole(
    id: string,
    data: { name?: string; description?: string; branchId?: string | null },
    permissions?: PermissionInput[]
): Promise<ActionResult<void>> {
    try {
        await requirePermission("roles", "edit")

        // Verify role exists
        const existing = await db.query.roles.findFirst({
            where: eq(roles.id, id),
        })

        if (!existing) {
            throw new NotFoundError("Role")
        }

        // If name is being changed, check for duplicates
        if (data.name && data.name.toUpperCase() !== existing.name) {
            const branchId = data.branchId !== undefined ? data.branchId : existing.branchId
            const duplicateRole = await db.query.roles.findFirst({
                where: branchId
                    ? and(eq(roles.name, data.name.toUpperCase()), eq(roles.branchId, branchId))
                    : and(eq(roles.name, data.name.toUpperCase()), isNull(roles.branchId)),
            })

            if (duplicateRole && duplicateRole.id !== id) {
                throw new ConflictError("A role with this name already exists")
            }
        }

        await db
            .update(roles)
            .set({
                name: data.name?.trim().toUpperCase(),
                description: data.description?.trim(),
                branchId: data.branchId !== undefined ? data.branchId : undefined,
                updatedAt: new Date(),
            })
            .where(eq(roles.id, id))

        if (permissions) {
            await updateRolePermissionsInternal(id, permissions)
        }

        revalidatePath("/management/roles")
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Delete a role
 */
export async function deleteRole(id: string): Promise<ActionResult<void>> {
    try {
        await requirePermission("roles", "delete")

        // Verify role exists
        const existing = await db.query.roles.findFirst({
            where: eq(roles.id, id),
        })

        if (!existing) {
            throw new NotFoundError("Role")
        }

        // Check if role is in use
        const usersWithRole = await db.query.userBranchRoles.findFirst({
            where: eq(userBranchRoles.roleId, id),
        })

        if (usersWithRole) {
            throw new ConflictError(
                "Cannot delete this role as it is assigned to one or more users. Please reassign users first."
            )
        }

        await db.delete(roles).where(eq(roles.id, id))
        revalidatePath("/management/roles")
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Get all features
 */
export async function getFeatures() {
    try {
        await requireAuth()
        return db.query.features.findMany()
    } catch (error) {
        console.error("getFeatures error:", error)
        return []
    }
}

/**
 * Get permissions for a specific role
 */
export async function getRolePermissions(roleId: string) {
    try {
        await requireAuth()
        return db.query.roleFeaturePermissions.findMany({
            where: eq(roleFeaturePermissions.roleId, roleId),
        })
    } catch (error) {
        console.error("getRolePermissions error:", error)
        return []
    }
}

/**
 * Internal function to update role permissions (no auth check - called from other functions)
 */
async function updateRolePermissionsInternal(
    roleId: string,
    permissions: PermissionInput[]
) {
    for (const p of permissions) {
        await db
            .insert(roleFeaturePermissions)
            .values({
                roleId,
                featureId: p.featureId,
                canView: p.canView,
                canAdd: p.canAdd,
                canEdit: p.canEdit,
                canDelete: p.canDelete,
            })
            .onConflictDoUpdate({
                target: [roleFeaturePermissions.roleId, roleFeaturePermissions.featureId],
                set: {
                    canView: p.canView,
                    canAdd: p.canAdd,
                    canEdit: p.canEdit,
                    canDelete: p.canDelete,
                    updatedAt: new Date(),
                },
            })
    }
}

/**
 * Update role permissions (public API with auth check)
 */
export async function updateRolePermissions(
    roleId: string,
    permissions: PermissionInput[]
): Promise<ActionResult<void>> {
    try {
        await requirePermission("roles", "edit")

        // Verify role exists
        const existing = await db.query.roles.findFirst({
            where: eq(roles.id, roleId),
        })

        if (!existing) {
            throw new NotFoundError("Role")
        }

        await updateRolePermissionsInternal(roleId, permissions)

        revalidatePath(`/management/roles/${roleId}`)
        revalidatePath("/management/roles")
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

