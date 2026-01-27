/**
 * Data Access Layer
 * 
 * Centralized data access functions that:
 * - Encapsulate database queries
 * - Handle caching where appropriate
 * - Provide type-safe interfaces
 * - Optimize queries to avoid N+1 problems
 */

export * from './users'
export * from './branches'
export * from './roles'
