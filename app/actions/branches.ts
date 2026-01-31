"use server"

import { db } from "@/lib/db"
import { branches, userBranchRoles, branchFeatures, features, users, branchOperatingHours, branchServices, services } from "@/lib/schema"
import { eq, desc, inArray, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { requireAuth, requirePermission, getAdminRoleName } from "@/lib/auth-utils"
import { 
    ActionResult, 
    success, 
    handleActionError,
    ValidationError,
    NotFoundError 
} from "@/lib/errors"

export type FeatureAssignment = {
    featureId: string
    isEnabled: boolean
}

export type OperatingHoursEntry = {
    dayOfWeek: number // 0-6 (Sunday-Saturday)
    slotIndex: number // 0, 1, 2... for multiple slots per day
    openTime: string  // "09:00" format
    closeTime: string // "18:00" format
    isClosed: boolean
}

export type BranchServiceAssignment = {
    serviceId: string
    price?: number | null    // Branch-specific price in cents/paisa (null = use default)
    duration?: number | null // Branch-specific duration in minutes (null = use default)
    isActive: boolean
}

/**
 * Set the selected branch in cookie
 */
export async function selectBranch(branchId: string): Promise<ActionResult<void>> {
    try {
        await requireAuth()
        cookies().set("clinic-branch-id", branchId)
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Get branches available to the current user
 */
export async function getAvailableBranches() {
    try {
        const user = await requireAuth()
        const adminRoleName = getAdminRoleName()

        // Super users see all branches
        if (user.role === adminRoleName) {
            return db.query.branches.findMany({
                orderBy: [desc(branches.createdAt)],
            })
        }

        // Regular users only see their assigned branches
        const mappings = await db
            .select({ branchId: userBranchRoles.branchId })
            .from(userBranchRoles)
            .where(eq(userBranchRoles.userId, user.id))

        const branchIds = mappings.map((m) => m.branchId)

        if (branchIds.length === 0) return []

        return db.query.branches.findMany({
            where: inArray(branches.id, branchIds),
            orderBy: [desc(branches.createdAt)],
        })
    } catch (error) {
        console.error("getAvailableBranches error:", error)
        return []
    }
}

/**
 * Get all branches (requires authentication)
 */
export async function getBranches() {
    try {
        await requireAuth()
        return db.query.branches.findMany({
            orderBy: [desc(branches.createdAt)],
        })
    } catch (error) {
        console.error("getBranches error:", error)
        return []
    }
}

/**
 * Create a new branch with optional feature assignments, operating hours, and services
 */
export async function createBranch(data: {
    name: string
    address?: string
    phone?: string
    email?: string
    pinCode?: string
    state?: string
    featureAssignments?: FeatureAssignment[]
    operatingHours?: OperatingHoursEntry[]
    branchServices?: BranchServiceAssignment[]
}): Promise<ActionResult<{ id: string }>> {
    try {
        // Require permission to add branches
        await requirePermission("branches", "add")

        // Validate required fields
        if (!data.name?.trim()) {
            throw new ValidationError("Branch name is required")
        }

        // Get current user for audit
        const user = await requireAuth()

        // Insert branch
        const [newBranch] = await db.insert(branches).values({
            name: data.name.trim(),
            address: data.address?.trim(),
            phone: data.phone?.trim(),
            email: data.email?.trim(),
            pinCode: data.pinCode?.trim(),
            state: data.state?.trim(),
            createdBy: user.id,
            updatedBy: user.id,
        }).returning()

        // Assign features if provided
        if (data.featureAssignments && data.featureAssignments.length > 0) {
            await db.insert(branchFeatures).values(
                data.featureAssignments.map((fa) => ({
                    branchId: newBranch.id,
                    featureId: fa.featureId,
                    isEnabled: fa.isEnabled,
                }))
            )
        }

        // Save operating hours if provided
        if (data.operatingHours && data.operatingHours.length > 0) {
            await db.insert(branchOperatingHours).values(
                data.operatingHours.map((oh) => ({
                    branchId: newBranch.id,
                    dayOfWeek: oh.dayOfWeek,
                    slotIndex: oh.slotIndex,
                    openTime: oh.openTime,
                    closeTime: oh.closeTime,
                    isClosed: oh.isClosed,
                }))
            )
        }

        // Assign branch services if provided
        if (data.branchServices && data.branchServices.length > 0) {
            await db.insert(branchServices).values(
                data.branchServices.map((bs) => ({
                    branchId: newBranch.id,
                    serviceId: bs.serviceId,
                    price: bs.price,
                    duration: bs.duration,
                    isActive: bs.isActive,
                }))
            )
        }

        revalidatePath("/management/branches")
        return success({ id: newBranch.id })
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Update an existing branch with optional feature assignments, operating hours, and services
 */
export async function updateBranch(
    id: string,
    data: {
        name?: string
        address?: string
        phone?: string
        email?: string
        pinCode?: string
        state?: string
        isActive?: boolean
        featureAssignments?: FeatureAssignment[]
        operatingHours?: OperatingHoursEntry[]
        branchServices?: BranchServiceAssignment[]
    }
): Promise<ActionResult<void>> {
    try {
        // Require permission to edit branches
        const user = await requirePermission("branches", "edit")

        // Verify branch exists
        const existing = await db.query.branches.findFirst({
            where: eq(branches.id, id),
        })

        if (!existing) {
            throw new NotFoundError("Branch")
        }

        // Update branch details
        await db.update(branches).set({
            name: data.name?.trim(),
            address: data.address?.trim(),
            phone: data.phone?.trim(),
            email: data.email?.trim(),
            pinCode: data.pinCode?.trim(),
            state: data.state?.trim(),
            isActive: data.isActive,
            updatedAt: new Date(),
            updatedBy: user.id,
        }).where(eq(branches.id, id))

        // Update feature assignments if provided
        if (data.featureAssignments !== undefined) {
            // Remove existing assignments
            await db.delete(branchFeatures).where(eq(branchFeatures.branchId, id))

            // Add new assignments
            if (data.featureAssignments.length > 0) {
                await db.insert(branchFeatures).values(
                    data.featureAssignments.map((fa) => ({
                        branchId: id,
                        featureId: fa.featureId,
                        isEnabled: fa.isEnabled,
                    }))
                )
            }
        }

        // Update operating hours if provided
        if (data.operatingHours !== undefined) {
            // Remove existing hours
            await db.delete(branchOperatingHours).where(eq(branchOperatingHours.branchId, id))

            // Add new hours
            if (data.operatingHours.length > 0) {
                await db.insert(branchOperatingHours).values(
                    data.operatingHours.map((oh) => ({
                        branchId: id,
                        dayOfWeek: oh.dayOfWeek,
                        slotIndex: oh.slotIndex,
                        openTime: oh.openTime,
                        closeTime: oh.closeTime,
                        isClosed: oh.isClosed,
                    }))
                )
            }
        }

        // Update branch services if provided
        if (data.branchServices !== undefined) {
            // Remove existing services
            await db.delete(branchServices).where(eq(branchServices.branchId, id))

            // Add new services
            if (data.branchServices.length > 0) {
                await db.insert(branchServices).values(
                    data.branchServices.map((bs) => ({
                        branchId: id,
                        serviceId: bs.serviceId,
                        price: bs.price,
                        duration: bs.duration,
                        isActive: bs.isActive,
                    }))
                )
            }
        }

        revalidatePath("/management/branches")
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Get all available features
 */
export async function getAllFeatures() {
    try {
        await requireAuth()
        return db.query.features.findMany({
            orderBy: [desc(features.createdAt)],
        })
    } catch (error) {
        console.error("getAllFeatures error:", error)
        return []
    }
}

/**
 * Get features enabled for a specific branch
 */
export async function getBranchFeatures(branchId: string) {
    try {
        await requireAuth()
        
        const assignments = await db
            .select({
                featureId: branchFeatures.featureId,
                isEnabled: branchFeatures.isEnabled,
            })
            .from(branchFeatures)
            .where(eq(branchFeatures.branchId, branchId))

        return assignments
    } catch (error) {
        console.error("getBranchFeatures error:", error)
        return []
    }
}

/**
 * Get branches with minimal data for list view (optimized)
 */
export async function getBranchesMinimal() {
    try {
        await requireAuth()
        
        const allBranches = await db.query.branches.findMany({
            columns: {
                id: true,
                name: true,
                state: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                createdBy: true,
                updatedBy: true,
            },
            orderBy: [desc(branches.createdAt)],
        })

        // Resolve audit user names
        const userIds = new Set<string>()
        allBranches.forEach(b => {
            if (b.createdBy) userIds.add(b.createdBy)
            if (b.updatedBy) userIds.add(b.updatedBy)
        })

        let userMap = new Map<string, string>()
        if (userIds.size > 0) {
            const userList = await db.query.users.findMany({
                where: inArray(users.id, Array.from(userIds)),
                columns: { id: true, firstName: true, lastName: true, name: true, email: true },
            })
            userMap = new Map(userList.map(u => [
                u.id,
                u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u.name || u.email)
            ]))
        }

        return allBranches.map((b) => ({
            ...b,
            createdByName: b.createdBy ? userMap.get(b.createdBy) || null : null,
            updatedByName: b.updatedBy ? userMap.get(b.updatedBy) || null : null,
        }))
    } catch (error) {
        console.error("getBranchesMinimal error:", error)
        return []
    }
}

/**
 * Get full branch details by ID (for expanded view)
 */
export async function getBranchDetails(id: string) {
    try {
        await requireAuth()
        
        const branch = await db.query.branches.findFirst({
            where: eq(branches.id, id),
        })

        if (!branch) return null

        // Get audit user names
        const userIds = [branch.createdBy, branch.updatedBy].filter(Boolean) as string[]
        let userMap = new Map<string, string>()
        
        if (userIds.length > 0) {
            const userList = await db.query.users.findMany({
                where: inArray(users.id, userIds),
                columns: { id: true, firstName: true, lastName: true, name: true, email: true },
            })
            userMap = new Map(userList.map(u => [
                u.id,
                u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u.name || u.email)
            ]))
        }

        return {
            ...branch,
            createdByName: branch.createdBy ? userMap.get(branch.createdBy) || null : null,
            updatedByName: branch.updatedBy ? userMap.get(branch.updatedBy) || null : null,
        }
    } catch (error) {
        console.error("getBranchDetails error:", error)
        return null
    }
}

/**
 * Get enabled features for a branch (for role management filtering)
 * Only returns features that are both assigned to the branch AND have isEnabled=true
 */
export async function getEnabledFeaturesForBranch(branchId: string) {
    try {
        await requireAuth()
        
        const enabledFeatures = await db
            .select({
                id: features.id,
                name: features.name,
                key: features.key,
                description: features.description,
                availableActions: features.availableActions,
            })
            .from(branchFeatures)
            .innerJoin(features, eq(branchFeatures.featureId, features.id))
            .where(
                and(
                    eq(branchFeatures.branchId, branchId),
                    eq(branchFeatures.isEnabled, true)
                )
            )

        return enabledFeatures
    } catch (error) {
        console.error("getEnabledFeaturesForBranch error:", error)
        return []
    }
}

/**
 * Delete a branch
 */
export async function deleteBranch(id: string): Promise<ActionResult<void>> {
    try {
        // Require permission to delete branches
        await requirePermission("branches", "delete")

        // Verify branch exists
        const existing = await db.query.branches.findFirst({
            where: eq(branches.id, id),
        })

        if (!existing) {
            throw new NotFoundError("Branch")
        }

        await db.delete(branches).where(eq(branches.id, id))

        revalidatePath("/management/branches")
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Get operating hours for a branch
 */
export async function getBranchOperatingHours(branchId: string): Promise<OperatingHoursEntry[]> {
    try {
        await requireAuth()

        const hours = await db
            .select({
                dayOfWeek: branchOperatingHours.dayOfWeek,
                slotIndex: branchOperatingHours.slotIndex,
                openTime: branchOperatingHours.openTime,
                closeTime: branchOperatingHours.closeTime,
                isClosed: branchOperatingHours.isClosed,
            })
            .from(branchOperatingHours)
            .where(eq(branchOperatingHours.branchId, branchId))
            .orderBy(branchOperatingHours.dayOfWeek, branchOperatingHours.slotIndex)

        return hours.map(h => ({
            ...h,
            slotIndex: h.slotIndex ?? 0,
            isClosed: h.isClosed ?? false,
        }))
    } catch (error) {
        console.error("getBranchOperatingHours error:", error)
        return []
    }
}

/**
 * Get services assigned to a branch
 */
export async function getBranchServices(branchId: string) {
    try {
        await requireAuth()

        const result = await db
            .select({
                serviceId: branchServices.serviceId,
                serviceName: services.name,
                serviceCode: services.code,
                serviceCategory: services.category,
                defaultPrice: services.defaultPrice,
                defaultDuration: services.defaultDuration,
                branchPrice: branchServices.price,
                branchDuration: branchServices.duration,
                isActive: branchServices.isActive,
            })
            .from(branchServices)
            .innerJoin(services, eq(branchServices.serviceId, services.id))
            .where(eq(branchServices.branchId, branchId))
            .orderBy(services.name)

        return result.map(r => ({
            ...r,
            isActive: r.isActive ?? true,
        }))
    } catch (error) {
        console.error("getBranchServices error:", error)
        return []
    }
}

/**
 * Get active services for a branch (for appointments and staff assignment)
 */
export async function getActiveBranchServices(branchId: string) {
    try {
        await requireAuth()

        const result = await db
            .select({
                serviceId: branchServices.serviceId,
                serviceName: services.name,
                serviceCode: services.code,
                serviceCategory: services.category,
                price: branchServices.price,
                duration: branchServices.duration,
                defaultPrice: services.defaultPrice,
                defaultDuration: services.defaultDuration,
            })
            .from(branchServices)
            .innerJoin(services, eq(branchServices.serviceId, services.id))
            .where(
                and(
                    eq(branchServices.branchId, branchId),
                    eq(branchServices.isActive, true),
                    eq(services.isActive, true)
                )
            )
            .orderBy(services.name)

        return result.map(r => ({
            ...r,
            // Use branch-specific price/duration if set, otherwise default
            effectivePrice: r.price ?? r.defaultPrice,
            effectiveDuration: r.duration ?? r.defaultDuration,
        }))
    } catch (error) {
        console.error("getActiveBranchServices error:", error)
        return []
    }
}
