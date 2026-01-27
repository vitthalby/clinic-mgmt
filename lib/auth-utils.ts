/**
 * Authentication & Authorization Utilities
 * 
 * Centralized utilities for:
 * - Session validation
 * - Permission checking
 * - Role-based access control
 */

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { users, userBranchRoles, roles } from "@/lib/schema"
import { eq, and } from "drizzle-orm"
import { AuthenticationError, AuthorizationError } from "@/lib/errors"
import { getUserPermissions, PermissionMap } from "@/lib/permissions"

export type AuthenticatedUser = {
  id: string
  email: string
  name: string | null
  role: string | null
  isSuperUser: boolean
}

export type AuthContext = {
  user: AuthenticatedUser
  branchId?: string
  permissions: PermissionMap
}

/**
 * Get the admin role name from environment
 */
export function getAdminRoleName(): string {
  return process.env.ADMIN_ROLE || "ADMIN"
}

/**
 * Require authentication - throws if not authenticated
 * Use this in server actions that require a logged-in user
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const session = await auth()
  
  if (!session?.user?.email) {
    throw new AuthenticationError("You must be logged in to perform this action.")
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  })

  if (!dbUser) {
    throw new AuthenticationError("User not found in database.")
  }

  const adminRoleName = getAdminRoleName()

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    isSuperUser: dbUser.role === adminRoleName,
  }
}

/**
 * Require super user (admin) access
 */
export async function requireSuperUser(): Promise<AuthenticatedUser> {
  const user = await requireAuth()
  
  if (!user.isSuperUser) {
    throw new AuthorizationError("This action requires administrator privileges.")
  }
  
  return user
}

/**
 * Get full auth context including permissions for a branch
 */
export async function getAuthContext(branchId?: string): Promise<AuthContext> {
  const user = await requireAuth()
  const permissions = await getUserPermissions(user.id, branchId)
  
  return {
    user,
    branchId,
    permissions,
  }
}

/**
 * Check if user has permission for a specific feature action
 */
export async function checkPermission(
  userId: string,
  featureKey: string,
  action: 'view' | 'add' | 'edit' | 'delete',
  branchId?: string
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, branchId)
  const featurePermissions = permissions[featureKey]
  
  if (!featurePermissions) return false
  
  switch (action) {
    case 'view': return featurePermissions.canView
    case 'add': return featurePermissions.canAdd
    case 'edit': return featurePermissions.canEdit
    case 'delete': return featurePermissions.canDelete
    default: return false
  }
}

/**
 * Require specific permission - throws if not authorized
 */
export async function requirePermission(
  featureKey: string,
  action: 'view' | 'add' | 'edit' | 'delete',
  branchId?: string
): Promise<AuthenticatedUser> {
  const user = await requireAuth()
  
  // Super users have all permissions
  if (user.isSuperUser) return user
  
  const hasPermission = await checkPermission(user.id, featureKey, action, branchId)
  
  if (!hasPermission) {
    throw new AuthorizationError(
      `You do not have permission to ${action} ${featureKey}.`,
      { featureKey, action, branchId }
    )
  }
  
  return user
}

/**
 * Check if user has access to a specific branch
 */
export async function checkBranchAccess(userId: string, branchId: string): Promise<boolean> {
  // First check if user is super user
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { role: true },
  })
  
  if (user?.role === getAdminRoleName()) {
    return true // Super users have access to all branches
  }
  
  // Check if user is assigned to this branch
  const assignment = await db.query.userBranchRoles.findFirst({
    where: and(
      eq(userBranchRoles.userId, userId),
      eq(userBranchRoles.branchId, branchId)
    ),
  })
  
  return !!assignment
}

/**
 * Require branch access - throws if not authorized
 */
export async function requireBranchAccess(branchId: string): Promise<AuthenticatedUser> {
  const user = await requireAuth()
  
  if (user.isSuperUser) return user
  
  const hasAccess = await checkBranchAccess(user.id, branchId)
  
  if (!hasAccess) {
    throw new AuthorizationError(
      "You do not have access to this branch.",
      { branchId }
    )
  }
  
  return user
}

/**
 * Get user's role in a specific branch
 */
export async function getUserBranchRole(userId: string, branchId: string): Promise<string | null> {
  const assignment = await db.query.userBranchRoles.findFirst({
    where: and(
      eq(userBranchRoles.userId, userId),
      eq(userBranchRoles.branchId, branchId)
    ),
  })
  
  if (!assignment) return null
  
  const role = await db.query.roles.findFirst({
    where: eq(roles.id, assignment.roleId),
    columns: { name: true },
  })
  
  return role?.name || null
}

/**
 * Get all branches user has access to
 */
export async function getUserBranches(userId: string): Promise<string[]> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { role: true },
  })
  
  // Super users have access to all branches
  if (user?.role === getAdminRoleName()) {
    const allBranches = await db.query.branches.findMany({
      columns: { id: true },
    })
    return allBranches.map(b => b.id)
  }
  
  // Regular users only have access to assigned branches
  const assignments = await db.query.userBranchRoles.findMany({
    where: eq(userBranchRoles.userId, userId),
    columns: { branchId: true },
  })
  
  return assignments.map(a => a.branchId)
}
