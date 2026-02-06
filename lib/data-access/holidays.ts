/**
 * Holidays Data Access Layer
 * 
 * Centralized functions for holiday-related database operations
 */

import { db } from "@/lib/db"
import { branchHolidays, staffHolidays, branches, users } from "@/lib/schema"
import { eq, and, gte, lte, desc } from "drizzle-orm"

export type BranchHoliday = typeof branchHolidays.$inferSelect
export type StaffHoliday = typeof staffHolidays.$inferSelect

/**
 * Get branch holidays for a specific date range
 */
export async function getBranchHolidaysForDateRange(
    branchId: string,
    startDate: Date,
    endDate: Date
): Promise<BranchHoliday[]> {
    return db
        .select()
        .from(branchHolidays)
        .where(
            and(
                eq(branchHolidays.branchId, branchId),
                gte(branchHolidays.date, startDate),
                lte(branchHolidays.date, endDate)
            )
        )
        .orderBy(branchHolidays.date)
}

/**
 * Get branch holiday for a specific date
 */
export async function getBranchHolidayForDate(
    branchId: string,
    date: Date
): Promise<BranchHoliday | null> {
    // Normalize date to start of day for comparison
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const result = await db
        .select()
        .from(branchHolidays)
        .where(
            and(
                eq(branchHolidays.branchId, branchId),
                gte(branchHolidays.date, startOfDay),
                lte(branchHolidays.date, endOfDay)
            )
        )
        .limit(1)

    return result.length > 0 ? result[0] : null
}

/**
 * Get all branch holidays for a branch
 */
export async function getBranchHolidays(branchId: string): Promise<BranchHoliday[]> {
    return db
        .select()
        .from(branchHolidays)
        .where(eq(branchHolidays.branchId, branchId))
        .orderBy(desc(branchHolidays.date))
}

/**
 * Get staff holidays for a specific date range
 */
export async function getStaffHolidaysForDateRange(
    userId: string,
    branchId: string,
    startDate: Date,
    endDate: Date
): Promise<StaffHoliday[]> {
    return db
        .select()
        .from(staffHolidays)
        .where(
            and(
                eq(staffHolidays.userId, userId),
                eq(staffHolidays.branchId, branchId),
                gte(staffHolidays.date, startDate),
                lte(staffHolidays.date, endDate)
            )
        )
        .orderBy(staffHolidays.date)
}

/**
 * Get staff holiday for a specific date
 */
export async function getStaffHolidayForDate(
    userId: string,
    branchId: string,
    date: Date
): Promise<StaffHoliday | null> {
    // Normalize date to start of day for comparison
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const result = await db
        .select()
        .from(staffHolidays)
        .where(
            and(
                eq(staffHolidays.userId, userId),
                eq(staffHolidays.branchId, branchId),
                gte(staffHolidays.date, startOfDay),
                lte(staffHolidays.date, endOfDay)
            )
        )
        .limit(1)

    return result.length > 0 ? result[0] : null
}

/**
 * Get all staff holidays for a user at a branch
 */
export async function getStaffHolidays(
    userId: string,
    branchId: string
): Promise<StaffHoliday[]> {
    return db
        .select()
        .from(staffHolidays)
        .where(
            and(
                eq(staffHolidays.userId, userId),
                eq(staffHolidays.branchId, branchId)
            )
        )
        .orderBy(desc(staffHolidays.date))
}

/**
 * Check if a time slot conflicts with a holiday
 * Returns true if the slot is blocked by a holiday
 */
export function isTimeSlotBlockedByHoliday(
    holiday: BranchHoliday | StaffHoliday,
    slotStartTime: string,
    slotEndTime: string
): boolean {
    if (holiday.isFullDay) {
        return true // Full day holiday blocks all slots
    }

    if (!holiday.startTime || !holiday.endTime) {
        return false // Partial holiday without times doesn't block
    }

    // Check if slot overlaps with holiday hours
    const slotStart = parseTimeToMinutes(slotStartTime)
    const slotEnd = parseTimeToMinutes(slotEndTime)
    const holidayStart = parseTimeToMinutes(holiday.startTime)
    const holidayEnd = parseTimeToMinutes(holiday.endTime)

    // Overlap occurs if slot starts before holiday ends AND slot ends after holiday starts
    return slotStart < holidayEnd && slotEnd > holidayStart
}

/**
 * Parse time string "HH:mm" to minutes since midnight
 */
function parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
}
