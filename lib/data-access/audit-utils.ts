/**
 * Audit Utilities for Data Access Layer
 * 
 * Shared helper functions for resolving audit user information
 */

import { db } from "@/lib/db"
import { users } from "@/lib/schema"
import { inArray } from "drizzle-orm"
import type { Auditable, AuditDisplayInfo } from "@/types/audit"

/**
 * Resolves audit user IDs to display names for a list of auditable items.
 * This function batches user lookups to avoid N+1 queries.
 * 
 * @param items - Array of items that implement the Auditable interface
 * @returns Array of items with resolved audit display info (createdByName, updatedByName)
 */
export async function resolveAuditUsers<T extends Auditable>(
  items: T[]
): Promise<(T & AuditDisplayInfo)[]> {
  // Collect unique user IDs from createdBy and updatedBy fields
  const userIds = new Set<string>()
  items.forEach(item => {
    if (item.createdBy) userIds.add(item.createdBy)
    if (item.updatedBy) userIds.add(item.updatedBy)
  })

  // If no user IDs to resolve, return items with null names
  if (userIds.size === 0) {
    return items.map(item => ({
      ...item,
      createdByName: null,
      updatedByName: null,
    }))
  }

  // Batch fetch all users
  const userList = await db.query.users.findMany({
    where: inArray(users.id, Array.from(userIds)),
    columns: { id: true, firstName: true, lastName: true, name: true, email: true },
  })

  // Create lookup map: userId -> displayName
  const userMap = new Map(userList.map(u => [
    u.id,
    formatUserDisplayName(u)
  ]))

  // Map items with resolved user names
  return items.map(item => ({
    ...item,
    createdByName: item.createdBy ? userMap.get(item.createdBy) || null : null,
    updatedByName: item.updatedBy ? userMap.get(item.updatedBy) || null : null,
  }))
}

/**
 * Formats a user object into a display name
 */
function formatUserDisplayName(user: {
  firstName: string | null
  lastName: string | null
  name: string | null
  email: string
}): string {
  if (user.firstName) {
    return `${user.firstName} ${user.lastName || ''}`.trim()
  }
  return user.name || user.email
}

/**
 * Resolves audit user IDs for a single item
 */
export async function resolveAuditUsersSingle<T extends Auditable>(
  item: T
): Promise<T & AuditDisplayInfo> {
  const [result] = await resolveAuditUsers([item])
  return result
}
