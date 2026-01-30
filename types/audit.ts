/**
 * Audit Interfaces
 * 
 * Base interfaces for audit fields that track creation and modification
 * of entities. Any entity that supports auditing should extend these interfaces.
 */

/**
 * Timestamp audit fields - tracks when records are created and updated
 */
export interface AuditTimestamps {
    createdAt: Date | null
    updatedAt: Date | null
}

/**
 * User audit fields - tracks who created and updated records
 */
export interface AuditUsers {
    createdBy: string | null
    updatedBy: string | null
}

/**
 * Full audit fields - combines timestamps and user tracking
 * Use this for entities that need complete audit trail
 */
export interface Auditable extends AuditTimestamps, AuditUsers {}

/**
 * Audit info with resolved user names for display purposes
 */
export interface AuditDisplayInfo {
    createdAt: Date | null
    updatedAt: Date | null
    createdByName: string | null
    updatedByName: string | null
}

/**
 * Helper type to add audit fields to any entity
 */
export type WithAudit<T> = T & Auditable

/**
 * Helper type to add audit display info to any entity
 */
export type WithAuditDisplay<T> = T & AuditDisplayInfo
