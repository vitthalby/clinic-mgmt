"use server"

import { db } from "@/lib/db"
import { branchHolidays, staffHolidays } from "@/lib/schema"
import { eq, and, gte, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireAuth, requirePermission } from "@/lib/auth-utils"
import {
    ActionResult,
    success,
    handleActionError,
    ValidationError,
    NotFoundError,
} from "@/lib/errors"
import {
    getBranchHolidays,
    getStaffHolidays,
    type BranchHoliday,
    type StaffHoliday,
} from "@/lib/data-access/holidays"

// Types
export type BranchHolidayFormData = {
    date: string
    name: string
    isFullDay: boolean
    startTime?: string
    endTime?: string
    notes?: string
}

export type StaffHolidayFormData = {
    userId: string
    date: string
    name: string
    isFullDay: boolean
    startTime?: string
    endTime?: string
    notes?: string
}

/**
 * Get branch holidays
 */
export async function getBranchHolidaysAction(
    branchId: string
): Promise<BranchHoliday[]> {
    try {
        await requireAuth()
        return await getBranchHolidays(branchId)
    } catch (error) {
        console.error("getBranchHolidaysAction error:", error)
        return []
    }
}

/**
 * Create a branch holiday
 */
export async function createBranchHoliday(
    branchId: string,
    data: BranchHolidayFormData
): Promise<ActionResult<{ id: string }>> {
    try {
        await requirePermission("branches", "edit", branchId)
        const user = await requireAuth()

        // Validate required fields
        if (!data.date) {
            throw new ValidationError("Date is required")
        }
        if (!data.name?.trim()) {
            throw new ValidationError("Holiday name is required")
        }

        // Validate partial day closure has times
        if (!data.isFullDay && (!data.startTime || !data.endTime)) {
            throw new ValidationError(
                "Start time and end time are required for partial day closures"
            )
        }

        const [newHoliday] = await db
            .insert(branchHolidays)
            .values({
                branchId,
                date: new Date(data.date),
                name: data.name.trim(),
                isFullDay: data.isFullDay,
                startTime: data.isFullDay ? null : data.startTime,
                endTime: data.isFullDay ? null : data.endTime,
                notes: data.notes?.trim() || null,
                createdBy: user?.id || null,
                updatedBy: user?.id || null,
            })
            .returning()

        revalidatePath("/management/branches")
        revalidatePath("/management/appointments")
        return success({ id: newHoliday.id })
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Update a branch holiday
 */
export async function updateBranchHoliday(
    id: string,
    branchId: string,
    data: BranchHolidayFormData
): Promise<ActionResult<void>> {
    try {
        await requirePermission("branches", "edit", branchId)
        const user = await requireAuth()

        // Verify holiday exists
        const existing = await db.query.branchHolidays.findFirst({
            where: eq(branchHolidays.id, id),
        })

        if (!existing) {
            throw new NotFoundError("Holiday")
        }

        // Validate required fields
        if (!data.date) {
            throw new ValidationError("Date is required")
        }
        if (!data.name?.trim()) {
            throw new ValidationError("Holiday name is required")
        }

        // Validate partial day closure has times
        if (!data.isFullDay && (!data.startTime || !data.endTime)) {
            throw new ValidationError(
                "Start time and end time are required for partial day closures"
            )
        }

        await db
            .update(branchHolidays)
            .set({
                date: new Date(data.date),
                name: data.name.trim(),
                isFullDay: data.isFullDay,
                startTime: data.isFullDay ? null : data.startTime,
                endTime: data.isFullDay ? null : data.endTime,
                notes: data.notes?.trim() || null,
                updatedAt: new Date(),
                updatedBy: user?.id || null,
            })
            .where(eq(branchHolidays.id, id))

        revalidatePath("/management/branches")
        revalidatePath("/management/appointments")
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Delete a branch holiday
 */
export async function deleteBranchHoliday(
    id: string,
    branchId: string
): Promise<ActionResult<void>> {
    try {
        await requirePermission("branches", "edit", branchId)

        // Verify holiday exists
        const existing = await db.query.branchHolidays.findFirst({
            where: eq(branchHolidays.id, id),
        })

        if (!existing) {
            throw new NotFoundError("Holiday")
        }

        await db.delete(branchHolidays).where(eq(branchHolidays.id, id))

        revalidatePath("/management/branches")
        revalidatePath("/management/appointments")
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Get staff holidays
 */
export async function getStaffHolidaysAction(
    userId: string,
    branchId: string
): Promise<StaffHoliday[]> {
    try {
        await requireAuth()
        return await getStaffHolidays(userId, branchId)
    } catch (error) {
        console.error("getStaffHolidaysAction error:", error)
        return []
    }
}

/**
 * Create a staff holiday
 */
export async function createStaffHoliday(
    branchId: string,
    data: StaffHolidayFormData
): Promise<ActionResult<{ id: string }>> {
    try {
        await requirePermission("users", "edit", branchId)
        const user = await requireAuth()

        // Validate required fields
        if (!data.userId) {
            throw new ValidationError("Staff member is required")
        }
        if (!data.date) {
            throw new ValidationError("Date is required")
        }
        if (!data.name?.trim()) {
            throw new ValidationError("Holiday name is required")
        }

        // Validate partial day has times
        if (!data.isFullDay && (!data.startTime || !data.endTime)) {
            throw new ValidationError(
                "Start time and end time are required for partial day time-off"
            )
        }

        const [newHoliday] = await db
            .insert(staffHolidays)
            .values({
                userId: data.userId,
                branchId,
                date: new Date(data.date),
                name: data.name.trim(),
                isFullDay: data.isFullDay,
                startTime: data.isFullDay ? null : data.startTime,
                endTime: data.isFullDay ? null : data.endTime,
                notes: data.notes?.trim() || null,
                createdBy: user?.id || null,
                updatedBy: user?.id || null,
            })
            .returning()

        revalidatePath("/management/users")
        revalidatePath("/management/appointments")
        return success({ id: newHoliday.id })
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Update a staff holiday
 */
export async function updateStaffHoliday(
    id: string,
    branchId: string,
    data: StaffHolidayFormData
): Promise<ActionResult<void>> {
    try {
        await requirePermission("users", "edit", branchId)
        const user = await requireAuth()

        // Verify holiday exists
        const existing = await db.query.staffHolidays.findFirst({
            where: eq(staffHolidays.id, id),
        })

        if (!existing) {
            throw new NotFoundError("Holiday")
        }

        // Validate required fields
        if (!data.date) {
            throw new ValidationError("Date is required")
        }
        if (!data.name?.trim()) {
            throw new ValidationError("Holiday name is required")
        }

        // Validate partial day has times
        if (!data.isFullDay && (!data.startTime || !data.endTime)) {
            throw new ValidationError(
                "Start time and end time are required for partial day time-off"
            )
        }

        await db
            .update(staffHolidays)
            .set({
                date: new Date(data.date),
                name: data.name.trim(),
                isFullDay: data.isFullDay,
                startTime: data.isFullDay ? null : data.startTime,
                endTime: data.isFullDay ? null : data.endTime,
                notes: data.notes?.trim() || null,
                updatedAt: new Date(),
                updatedBy: user?.id || null,
            })
            .where(eq(staffHolidays.id, id))

        revalidatePath("/management/users")
        revalidatePath("/management/appointments")
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Delete a staff holiday
 */
export async function deleteStaffHoliday(
    id: string,
    branchId: string
): Promise<ActionResult<void>> {
    try {
        await requirePermission("users", "edit", branchId)

        // Verify holiday exists
        const existing = await db.query.staffHolidays.findFirst({
            where: eq(staffHolidays.id, id),
        })

        if (!existing) {
            throw new NotFoundError("Holiday")
        }

        await db.delete(staffHolidays).where(eq(staffHolidays.id, id))

        revalidatePath("/management/users")
        revalidatePath("/management/appointments")
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}
