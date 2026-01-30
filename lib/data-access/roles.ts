/**
 * Role Data Access Layer
 * 
 * Centralized functions for role-related database operations
 */

import { db } from "@/lib/db"
import { roles, features, roleFeaturePermissions } from "@/lib/schema"
import { eq, desc, or, isNull, and } from "drizzle-orm"
import type { AuditDisplayInfo } from "@/types/audit"
import { resolveAuditUsers } from "./audit-utils"

export type Role = typeof roles.$inferSelect
export type Feature = typeof features.$inferSelect
export type RolePermission = typeof roleFeaturePermissions.$inferSelect

export type RoleWithAudit = Role & AuditDisplayInfo

/**
 * Get all roles
 */
export async function getAllRoles(): Promise<Role[]> {
  return db.query.roles.findMany({
    orderBy: [desc(roles.createdAt)],
  })
}

/**
 * Get all roles with audit user names resolved
 */
export async function getAllRolesWithAudit(): Promise<RoleWithAudit[]> {
  const roleList = await db.query.roles.findMany({
    orderBy: [desc(roles.createdAt)],
  })

  return resolveAuditUsers(roleList)
}

/**
 * Get role by ID
 */
export async function getRoleById(id: string): Promise<Role | undefined> {
  return db.query.roles.findFirst({
    where: eq(roles.id, id),
  })
}

/**
 * Get roles for a specific branch
 * Includes global roles (branchId = null) and branch-specific roles
 */
export async function getRolesForBranch(
  branchId: string,
  includeGlobal: boolean = true
): Promise<Role[]> {
  if (includeGlobal) {
    return db.query.roles.findMany({
      where: or(eq(roles.branchId, branchId), isNull(roles.branchId)),
      orderBy: [desc(roles.createdAt)],
    })
  }

  return db.query.roles.findMany({
    where: eq(roles.branchId, branchId),
    orderBy: [desc(roles.createdAt)],
  })
}

/**
 * Get all features
 */
export async function getAllFeatures(): Promise<Feature[]> {
  return db.query.features.findMany()
}

/**
 * Get permissions for a specific role
 */
export async function getPermissionsForRole(roleId: string): Promise<RolePermission[]> {
  return db.query.roleFeaturePermissions.findMany({
    where: eq(roleFeaturePermissions.roleId, roleId),
  })
}

/**
 * Get permissions with feature details for a role
 */
export async function getPermissionsWithFeatures(roleId: string) {
  return db
    .select({
      featureId: features.id,
      featureKey: features.key,
      featureName: features.name,
      canView: roleFeaturePermissions.canView,
      canAdd: roleFeaturePermissions.canAdd,
      canEdit: roleFeaturePermissions.canEdit,
      canDelete: roleFeaturePermissions.canDelete,
    })
    .from(roleFeaturePermissions)
    .innerJoin(features, eq(roleFeaturePermissions.featureId, features.id))
    .where(eq(roleFeaturePermissions.roleId, roleId))
}

/**
 * Check if role name exists in a branch
 */
export async function roleNameExistsInBranch(
  name: string,
  branchId: string | null,
  excludeRoleId?: string
): Promise<boolean> {
  const conditions = branchId
    ? and(eq(roles.name, name.toUpperCase()), eq(roles.branchId, branchId))
    : and(eq(roles.name, name.toUpperCase()), isNull(roles.branchId))

  const existing = await db.query.roles.findFirst({
    where: conditions,
    columns: { id: true },
  })

  if (!existing) return false
  if (excludeRoleId && existing.id === excludeRoleId) return false

  return true
}
