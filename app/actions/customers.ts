"use server"

import { db } from "@/lib/db"
import { customers, branches } from "@/lib/schema"
import { eq, desc, or, ilike, and, sql } from "drizzle-orm"
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
export type CustomerMinimal = {
    id: string
    firstName: string
    lastName: string
    mobile: string
    email: string | null
    gender: string | null
    isActive: boolean | null
    createdAt: Date | null
}

export type CustomerFull = typeof customers.$inferSelect & {
    branchName?: string | null
}

export type CustomerFormData = {
    firstName: string
    lastName: string
    mobile: string
    email?: string
    dob?: string
    gender?: string
    bloodGroup?: string
    addressLine1?: string
    addressLine2?: string
    city?: string
    state?: string
    pincode?: string
    medicalHistory?: string
    allergies?: string
    currentMedications?: string
    emergencyContactName?: string
    emergencyContactPhone?: string
    emergencyContactRelation?: string
    preferredLanguage?: string
    source?: string
    referredBy?: string
    tags?: string[]
    notes?: string
    branchId?: string
    isActive?: boolean
}

/**
 * Get customers list with search and pagination
 */
export async function getCustomers(options: {
    branchId?: string
    search?: string
    page?: number
    limit?: number
    includeInactive?: boolean
}): Promise<{ customers: CustomerMinimal[]; total: number }> {
    try {
        await requireAuth()

        const { branchId, search, page = 1, limit = 20, includeInactive = false } = options
        const offset = (page - 1) * limit

        // Build where conditions
        const conditions = []

        if (branchId) {
            conditions.push(eq(customers.branchId, branchId))
        }

        if (!includeInactive) {
            conditions.push(eq(customers.isActive, true))
        }

        if (search && search.trim()) {
            const searchTerm = `%${search.trim()}%`
            conditions.push(
                or(
                    ilike(customers.firstName, searchTerm),
                    ilike(customers.lastName, searchTerm),
                    ilike(customers.mobile, searchTerm),
                    ilike(customers.email, searchTerm)
                )
            )
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        // Get total count
        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(customers)
            .where(whereClause)

        const total = Number(countResult[0]?.count || 0)

        // Get paginated results
        const customerList = await db
            .select({
                id: customers.id,
                firstName: customers.firstName,
                lastName: customers.lastName,
                mobile: customers.mobile,
                email: customers.email,
                gender: customers.gender,
                isActive: customers.isActive,
                createdAt: customers.createdAt,
            })
            .from(customers)
            .where(whereClause)
            .orderBy(desc(customers.createdAt))
            .limit(limit)
            .offset(offset)

        return { customers: customerList, total }
    } catch (error) {
        console.error("getCustomers error:", error)
        throw error
    }
}

/**
 * Get full customer details
 */
export async function getCustomerDetails(customerId: string): Promise<CustomerFull | null> {
    try {
        await requireAuth()

        const customer = await db.query.customers.findFirst({
            where: eq(customers.id, customerId),
        })

        if (!customer) return null

        // Get branch name if assigned
        let branchName: string | null = null
        if (customer.branchId) {
            const branch = await db.query.branches.findFirst({
                where: eq(branches.id, customer.branchId),
                columns: { name: true },
            })
            branchName = branch?.name || null
        }

        return {
            ...customer,
            branchName,
        }
    } catch (error) {
        console.error("getCustomerDetails error:", error)
        return null
    }
}

/**
 * Create a new customer
 */
export async function createCustomer(data: CustomerFormData): Promise<ActionResult<{ id: string }>> {
    try {
        await requirePermission("customers", "add", data.branchId)

        // Validate required fields
        if (!data.firstName?.trim()) {
            throw new ValidationError("First name is required")
        }
        if (!data.lastName?.trim()) {
            throw new ValidationError("Last name is required")
        }
        if (!data.mobile?.trim()) {
            throw new ValidationError("Mobile number is required")
        }

        // Check for duplicate mobile number
        const existingMobile = await db.query.customers.findFirst({
            where: eq(customers.mobile, data.mobile.trim()),
            columns: { id: true },
        })
        if (existingMobile) {
            throw new ConflictError("A customer with this mobile number already exists")
        }

        // Check for duplicate email if provided
        if (data.email?.trim()) {
            const existingEmail = await db.query.customers.findFirst({
                where: eq(customers.email, data.email.trim()),
                columns: { id: true },
            })
            if (existingEmail) {
                throw new ConflictError("A customer with this email already exists")
            }
        }

        const [newCustomer] = await db
            .insert(customers)
            .values({
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                mobile: data.mobile.trim(),
                email: data.email?.trim() || null,
                dob: data.dob ? new Date(data.dob) : null,
                gender: data.gender || null,
                bloodGroup: data.bloodGroup || null,
                addressLine1: data.addressLine1?.trim() || null,
                addressLine2: data.addressLine2?.trim() || null,
                city: data.city?.trim() || null,
                state: data.state?.trim() || null,
                pincode: data.pincode?.trim() || null,
                medicalHistory: data.medicalHistory?.trim() || null,
                allergies: data.allergies?.trim() || null,
                currentMedications: data.currentMedications?.trim() || null,
                emergencyContactName: data.emergencyContactName?.trim() || null,
                emergencyContactPhone: data.emergencyContactPhone?.trim() || null,
                emergencyContactRelation: data.emergencyContactRelation?.trim() || null,
                preferredLanguage: data.preferredLanguage || "English",
                source: data.source || null,
                referredBy: data.referredBy?.trim() || null,
                tags: data.tags || [],
                notes: data.notes?.trim() || null,
                branchId: data.branchId || null,
                isActive: data.isActive ?? true,
            })
            .returning()

        revalidatePath("/management/customers")
        return success({ id: newCustomer.id })
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Update an existing customer
 */
export async function updateCustomer(
    id: string,
    data: CustomerFormData
): Promise<ActionResult<void>> {
    try {
        await requirePermission("customers", "edit", data.branchId)

        // Verify customer exists
        const existing = await db.query.customers.findFirst({
            where: eq(customers.id, id),
        })

        if (!existing) {
            throw new NotFoundError("Customer")
        }

        // Validate required fields
        if (!data.firstName?.trim()) {
            throw new ValidationError("First name is required")
        }
        if (!data.lastName?.trim()) {
            throw new ValidationError("Last name is required")
        }
        if (!data.mobile?.trim()) {
            throw new ValidationError("Mobile number is required")
        }

        // Check for duplicate mobile (excluding current customer)
        const existingMobile = await db.query.customers.findFirst({
            where: and(
                eq(customers.mobile, data.mobile.trim()),
                sql`${customers.id} != ${id}`
            ),
            columns: { id: true },
        })
        if (existingMobile) {
            throw new ConflictError("A customer with this mobile number already exists")
        }

        // Check for duplicate email if provided (excluding current customer)
        if (data.email?.trim()) {
            const existingEmail = await db.query.customers.findFirst({
                where: and(
                    eq(customers.email, data.email.trim()),
                    sql`${customers.id} != ${id}`
                ),
                columns: { id: true },
            })
            if (existingEmail) {
                throw new ConflictError("A customer with this email already exists")
            }
        }

        await db
            .update(customers)
            .set({
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                mobile: data.mobile.trim(),
                email: data.email?.trim() || null,
                dob: data.dob ? new Date(data.dob) : null,
                gender: data.gender || null,
                bloodGroup: data.bloodGroup || null,
                addressLine1: data.addressLine1?.trim() || null,
                addressLine2: data.addressLine2?.trim() || null,
                city: data.city?.trim() || null,
                state: data.state?.trim() || null,
                pincode: data.pincode?.trim() || null,
                medicalHistory: data.medicalHistory?.trim() || null,
                allergies: data.allergies?.trim() || null,
                currentMedications: data.currentMedications?.trim() || null,
                emergencyContactName: data.emergencyContactName?.trim() || null,
                emergencyContactPhone: data.emergencyContactPhone?.trim() || null,
                emergencyContactRelation: data.emergencyContactRelation?.trim() || null,
                preferredLanguage: data.preferredLanguage || "English",
                source: data.source || null,
                referredBy: data.referredBy?.trim() || null,
                tags: data.tags || [],
                notes: data.notes?.trim() || null,
                branchId: data.branchId || null,
                isActive: data.isActive ?? true,
                updatedAt: new Date(),
            })
            .where(eq(customers.id, id))

        revalidatePath("/management/customers")
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Delete a customer
 */
export async function deleteCustomer(id: string, branchId?: string): Promise<ActionResult<void>> {
    try {
        await requirePermission("customers", "delete", branchId)

        // Verify customer exists
        const existing = await db.query.customers.findFirst({
            where: eq(customers.id, id),
        })

        if (!existing) {
            throw new NotFoundError("Customer")
        }

        await db.delete(customers).where(eq(customers.id, id))
        revalidatePath("/management/customers")
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Toggle customer active status
 */
export async function toggleCustomerStatus(id: string, branchId?: string): Promise<ActionResult<void>> {
    try {
        await requirePermission("customers", "edit", branchId)

        const existing = await db.query.customers.findFirst({
            where: eq(customers.id, id),
            columns: { id: true, isActive: true },
        })

        if (!existing) {
            throw new NotFoundError("Customer")
        }

        await db
            .update(customers)
            .set({
                isActive: !existing.isActive,
                updatedAt: new Date(),
            })
            .where(eq(customers.id, id))

        revalidatePath("/management/customers")
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Search customers for quick lookup (e.g., appointment booking)
 */
export async function searchCustomers(query: string, limit: number = 10): Promise<CustomerMinimal[]> {
    try {
        await requireAuth()

        if (!query || query.trim().length < 2) {
            return []
        }

        const searchTerm = `%${query.trim()}%`

        return db
            .select({
                id: customers.id,
                firstName: customers.firstName,
                lastName: customers.lastName,
                mobile: customers.mobile,
                email: customers.email,
                gender: customers.gender,
                isActive: customers.isActive,
                createdAt: customers.createdAt,
            })
            .from(customers)
            .where(
                and(
                    eq(customers.isActive, true),
                    or(
                        ilike(customers.firstName, searchTerm),
                        ilike(customers.lastName, searchTerm),
                        ilike(customers.mobile, searchTerm)
                    )
                )
            )
            .orderBy(customers.firstName)
            .limit(limit)
    } catch (error) {
        console.error("searchCustomers error:", error)
        return []
    }
}
