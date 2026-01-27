/**
 * User Data Access Layer
 * 
 * Centralized functions for user-related database operations
 */

import { db } from "@/lib/db"
import { users, userBranchRoles, branches, roles } from "@/lib/schema"
import { eq, inArray, desc, and, isNull } from "drizzle-orm"

export type UserWithBranchRoles = typeof users.$inferSelect & {
  branchRoles: {
    branchId: string
    branchName: string
    roleId: string
    roleName: string
  }[]
}

export type UserListOptions = {
  branchId?: string
  isSuperUser?: boolean
  excludeAdmins?: boolean
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  })
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
  })
}

/**
 * Get users with their branch-role assignments
 * Optimized to avoid N+1 queries
 */
export async function getUsersWithBranchRoles(
  options: UserListOptions = {}
): Promise<{
  users: UserWithBranchRoles[]
  branches: (typeof branches.$inferSelect)[]
  roles: (typeof roles.$inferSelect)[]
}> {
  const { branchId, isSuperUser = false } = options
  const adminRoleName = process.env.ADMIN_ROLE || "ADMIN"

  let userList: (typeof users.$inferSelect)[] = []

  // Fetch users based on context
  if (isSuperUser && !branchId) {
    // Super users see all users if no branch filter
    userList = await db.query.users.findMany({
      orderBy: [desc(users.firstName)],
    })
  } else if (branchId) {
    if (isSuperUser) {
      // Super user viewing a specific branch
      const branchUsers = await db
        .select({ user: users })
        .from(users)
        .innerJoin(userBranchRoles, eq(users.id, userBranchRoles.userId))
        .where(eq(userBranchRoles.branchId, branchId))
        .orderBy(desc(users.firstName))

      userList = branchUsers.map((r) => r.user)
    } else {
      // Non-super users only see non-admin users in their branch
      const branchUsers = await db
        .select({ user: users })
        .from(users)
        .innerJoin(userBranchRoles, eq(users.id, userBranchRoles.userId))
        .where(
          and(
            eq(userBranchRoles.branchId, branchId),
            isNull(users.role) // Exclude global admins
          )
        )
        .orderBy(desc(users.firstName))

      userList = branchUsers.map((r) => r.user)
    }
  }

  // Batch fetch branch-role mappings
  const userIds = userList.map((u) => u.id)
  let mappings: { userId: string; branchId: string; roleId: string }[] = []

  if (userIds.length > 0) {
    if (!isSuperUser && branchId) {
      // Scope mappings to current branch for non-super users
      mappings = await db
        .select({
          userId: userBranchRoles.userId,
          branchId: userBranchRoles.branchId,
          roleId: userBranchRoles.roleId,
        })
        .from(userBranchRoles)
        .where(
          and(
            inArray(userBranchRoles.userId, userIds),
            eq(userBranchRoles.branchId, branchId)
          )
        )
    } else {
      mappings = await db
        .select({
          userId: userBranchRoles.userId,
          branchId: userBranchRoles.branchId,
          roleId: userBranchRoles.roleId,
        })
        .from(userBranchRoles)
        .where(inArray(userBranchRoles.userId, userIds))
    }
  }

  // Fetch branches and roles for lookups
  let scopedBranches: (typeof branches.$inferSelect)[] = []
  if (isSuperUser) {
    scopedBranches = await db.query.branches.findMany()
  } else if (branchId) {
    scopedBranches = await db.query.branches.findMany({
      where: eq(branches.id, branchId),
    })
  }

  const allRoles = await db.select().from(roles).orderBy(desc(roles.createdAt))

  // Create lookup maps
  const branchMap = new Map(scopedBranches.map((b) => [b.id, b.name]))
  const roleMap = new Map(allRoles.map((r) => [r.id, r.name]))

  // Attach branch-role assignments to users
  const usersWithBranchRoles: UserWithBranchRoles[] = userList.map((user) => {
    const userBranchRoleData = mappings
      .filter((m) => m.userId === user.id)
      .map((m) => ({
        branchId: m.branchId,
        branchName: branchMap.get(m.branchId) || "Unknown",
        roleId: m.roleId,
        roleName: roleMap.get(m.roleId) || "Unknown",
      }))

    return {
      ...user,
      branchRoles: userBranchRoleData,
    }
  })

  return {
    users: usersWithBranchRoles,
    branches: scopedBranches,
    roles: allRoles,
  }
}

/**
 * Check if email already exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  })
  return !!existing
}
