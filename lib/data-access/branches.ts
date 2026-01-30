/**
 * Branch Data Access Layer
 * 
 * Centralized functions for branch-related database operations
 */

import { db } from "@/lib/db"
import { branches, userBranchRoles } from "@/lib/schema"
import { eq, desc, inArray } from "drizzle-orm"
import type { AuditDisplayInfo } from "@/types/audit"
import { resolveAuditUsers } from "./audit-utils"

export type Branch = typeof branches.$inferSelect

export type BranchWithAudit = Branch & AuditDisplayInfo

/**
 * Get all branches
 */
export async function getAllBranches(): Promise<Branch[]> {
  return db.query.branches.findMany({
    orderBy: [desc(branches.createdAt)],
  })
}

/**
 * Get all branches with audit user names resolved
 */
export async function getAllBranchesWithAudit(): Promise<BranchWithAudit[]> {
  const branchList = await db.query.branches.findMany({
    orderBy: [desc(branches.createdAt)],
  })

  return resolveAuditUsers(branchList)
}

/**
 * Get branch by ID
 */
export async function getBranchById(id: string): Promise<Branch | undefined> {
  return db.query.branches.findFirst({
    where: eq(branches.id, id),
  })
}

/**
 * Get branches for a specific user
 */
export async function getBranchesForUser(userId: string): Promise<Branch[]> {
  const mappings = await db
    .select({ branchId: userBranchRoles.branchId })
    .from(userBranchRoles)
    .where(eq(userBranchRoles.userId, userId))

  const branchIds = mappings.map((m) => m.branchId)

  if (branchIds.length === 0) return []

  return db.query.branches.findMany({
    where: inArray(branches.id, branchIds),
    orderBy: [desc(branches.createdAt)],
  })
}

/**
 * Get active branches only
 */
export async function getActiveBranches(): Promise<Branch[]> {
  return db.query.branches.findMany({
    where: eq(branches.isActive, true),
    orderBy: [desc(branches.createdAt)],
  })
}

/**
 * Check if branch exists
 */
export async function branchExists(id: string): Promise<boolean> {
  const branch = await db.query.branches.findFirst({
    where: eq(branches.id, id),
    columns: { id: true },
  })
  return !!branch
}
