"use server"

import { db } from "@/lib/db"
import { services, users } from "@/lib/schema"
import { eq, desc, and } from "drizzle-orm"
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

// Types
export type ServiceMinimal = {
    id: string
    name: string
    code: string | null
    category: string | null
    defaultDuration: number | null
    defaultPrice: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
}

export type ServiceFull = ServiceMinimal & {
    description: string | null
    createdByName?: string | null
    updatedByName?: string | null
}

export type CreateServiceData = {
    name: string
    code?: string
    description?: string
    category?: string
    defaultDuration?: number
    defaultPrice?: number
    isActive?: boolean
}

export type UpdateServiceData = Partial<CreateServiceData>

/**
 * Get all services (minimal data for list view)
 */
export async function getServicesMinimal(): Promise<ServiceMinimal[]> {
    try {
        await requirePermission("services", "view")

        const result = await db
            .select({
                id: services.id,
                name: services.name,
                code: services.code,
                category: services.category,
                defaultDuration: services.defaultDuration,
                defaultPrice: services.defaultPrice,
                isActive: services.isActive,
                createdAt: services.createdAt,
                updatedAt: services.updatedAt,
            })
            .from(services)
            .orderBy(desc(services.createdAt))

        return result
    } catch (error) {
        console.error("getServicesMinimal error:", error)
        return []
    }
}

/**
 * Get all active services (for dropdowns/selection)
 */
export async function getActiveServices(): Promise<Pick<ServiceMinimal, 'id' | 'name' | 'code' | 'category' | 'defaultDuration' | 'defaultPrice'>[]> {
    try {
        await requireAuth()

        const result = await db
            .select({
                id: services.id,
                name: services.name,
                code: services.code,
                category: services.category,
                defaultDuration: services.defaultDuration,
                defaultPrice: services.defaultPrice,
            })
            .from(services)
            .where(eq(services.isActive, true))
            .orderBy(services.name)

        return result
    } catch (error) {
        console.error("getActiveServices error:", error)
        return []
    }
}

/**
 * Get service details by ID
 */
export async function getServiceDetails(id: string): Promise<ServiceFull | null> {
    try {
        await requirePermission("services", "view")

        const result = await db
            .select({
                id: services.id,
                name: services.name,
                code: services.code,
                description: services.description,
                category: services.category,
                defaultDuration: services.defaultDuration,
                defaultPrice: services.defaultPrice,
                isActive: services.isActive,
                createdAt: services.createdAt,
                updatedAt: services.updatedAt,
                createdBy: services.createdBy,
                updatedBy: services.updatedBy,
            })
            .from(services)
            .where(eq(services.id, id))
            .limit(1)

        if (result.length === 0) return null

        const service = result[0]

        // Resolve audit user names
        let createdByName: string | null = null
        let updatedByName: string | null = null

        if (service.createdBy) {
            const creator = await db.query.users.findFirst({
                where: eq(users.id, service.createdBy),
                columns: { name: true, firstName: true, lastName: true },
            })
            createdByName = creator?.name || `${creator?.firstName || ''} ${creator?.lastName || ''}`.trim() || null
        }

        if (service.updatedBy) {
            const updater = await db.query.users.findFirst({
                where: eq(users.id, service.updatedBy),
                columns: { name: true, firstName: true, lastName: true },
            })
            updatedByName = updater?.name || `${updater?.firstName || ''} ${updater?.lastName || ''}`.trim() || null
        }

        return {
            ...service,
            createdByName,
            updatedByName,
        }
    } catch (error) {
        console.error("getServiceDetails error:", error)
        return null
    }
}

/**
 * Create a new service
 */
export async function createService(data: CreateServiceData): Promise<ActionResult<{ id: string }>> {
    try {
        const user = await requirePermission("services", "add")

        // Validate required fields
        if (!data.name?.trim()) {
            throw new ValidationError("Service name is required")
        }

        // Check for duplicate code if provided
        if (data.code?.trim()) {
            const existing = await db.query.services.findFirst({
                where: eq(services.code, data.code.trim().toUpperCase()),
            })
            if (existing) {
                throw new ConflictError(`A service with code "${data.code}" already exists`)
            }
        }

        // Insert service
        const [newService] = await db.insert(services).values({
            name: data.name.trim(),
            code: data.code?.trim().toUpperCase() || null,
            description: data.description?.trim() || null,
            category: data.category?.trim() || null,
            defaultDuration: data.defaultDuration || 30,
            defaultPrice: data.defaultPrice || null,
            isActive: data.isActive !== false,
            createdBy: user.id,
            updatedBy: user.id,
        }).returning()

        revalidatePath("/management/services")
        return success({ id: newService.id })
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Update an existing service
 */
export async function updateService(id: string, data: UpdateServiceData): Promise<ActionResult<void>> {
    try {
        const user = await requirePermission("services", "edit")

        // Check service exists
        const existing = await db.query.services.findFirst({
            where: eq(services.id, id),
        })

        if (!existing) {
            throw new NotFoundError("Service not found")
        }

        // Check for duplicate code if changing it
        if (data.code !== undefined && data.code?.trim() !== existing.code) {
            if (data.code?.trim()) {
                const duplicate = await db.query.services.findFirst({
                    where: and(
                        eq(services.code, data.code.trim().toUpperCase()),
                    ),
                })
                if (duplicate && duplicate.id !== id) {
                    throw new ConflictError(`A service with code "${data.code}" already exists`)
                }
            }
        }

        // Update service
        await db.update(services).set({
            ...(data.name !== undefined && { name: data.name.trim() }),
            ...(data.code !== undefined && { code: data.code?.trim().toUpperCase() || null }),
            ...(data.description !== undefined && { description: data.description?.trim() || null }),
            ...(data.category !== undefined && { category: data.category?.trim() || null }),
            ...(data.defaultDuration !== undefined && { defaultDuration: data.defaultDuration }),
            ...(data.defaultPrice !== undefined && { defaultPrice: data.defaultPrice }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
            updatedBy: user.id,
            updatedAt: new Date(),
        }).where(eq(services.id, id))

        revalidatePath("/management/services")
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Delete a service
 */
export async function deleteService(id: string): Promise<ActionResult<void>> {
    try {
        await requirePermission("services", "delete")

        // Check service exists
        const existing = await db.query.services.findFirst({
            where: eq(services.id, id),
        })

        if (!existing) {
            throw new NotFoundError("Service not found")
        }

        // Delete service (cascades to branch_services and staff_services)
        await db.delete(services).where(eq(services.id, id))

        revalidatePath("/management/services")
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Get unique categories from existing services
 */
export async function getServiceCategories(): Promise<string[]> {
    try {
        await requireAuth()

        const result = await db
            .selectDistinct({ category: services.category })
            .from(services)
            .where(eq(services.isActive, true))

        return result
            .map(r => r.category)
            .filter((c): c is string => c !== null)
            .sort()
    } catch (error) {
        console.error("getServiceCategories error:", error)
        return []
    }
}
