"use server"

import { db } from "@/lib/db"
import { branches, userBranchRoles, branchFeatures, features } from "@/lib/schema"
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
 * Create a new branch with optional feature assignments
 */
export async function createBranch(data: {
    name: string
    address?: string
    phone?: string
    email?: string
    pinCode?: string
    state?: string
    featureAssignments?: FeatureAssignment[]
}): Promise<ActionResult<{ id: string }>> {
    try {
        // Require permission to add branches
        await requirePermission("branches", "add")

        // Validate required fields
        if (!data.name?.trim()) {
            throw new ValidationError("Branch name is required")
        }

        // Insert branch
        const [newBranch] = await db.insert(branches).values({
            name: data.name.trim(),
            address: data.address?.trim(),
            phone: data.phone?.trim(),
            email: data.email?.trim(),
            pinCode: data.pinCode?.trim(),
            state: data.state?.trim(),
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

        revalidatePath("/management/branches")
        return success({ id: newBranch.id })
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Update an existing branch with optional feature assignments
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
    }
): Promise<ActionResult<void>> {
    try {
        // Require permission to edit branches
        await requirePermission("branches", "edit")

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
 * Get branches with their enabled features count
 */
export async function getBranchesWithFeatures() {
    try {
        await requireAuth()
        
        const allBranches = await db.query.branches.findMany({
            orderBy: [desc(branches.createdAt)],
        })

        // Batch fetch feature counts
        const branchIds = allBranches.map((b) => b.id)
        
        if (branchIds.length === 0) {
            return allBranches.map((b) => ({ ...b, enabledFeaturesCount: 0 }))
        }

        const featureCounts = await db
            .select({
                branchId: branchFeatures.branchId,
            })
            .from(branchFeatures)
            .where(eq(branchFeatures.isEnabled, true))

        // Count features per branch
        const countMap = new Map<string, number>()
        for (const fc of featureCounts) {
            countMap.set(fc.branchId, (countMap.get(fc.branchId) || 0) + 1)
        }

        return allBranches.map((b) => ({
            ...b,
            enabledFeaturesCount: countMap.get(b.id) || 0,
        }))
    } catch (error) {
        console.error("getBranchesWithFeatures error:", error)
        return []
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
