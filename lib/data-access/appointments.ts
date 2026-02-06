/**
 * Appointments Data Access Layer
 * 
 * Centralized functions for appointment-related database operations
 */

import { db } from "@/lib/db"
import {
    appointments,
    customers,
    services,
    users,
    branches,
    branchServices,
    staffServices,
    staffWorkingHours,
    branchOperatingHours,
    staffServiceCategories,
} from "@/lib/schema"
import { eq, and, gte, lte, desc, or, ilike, inArray, ne } from "drizzle-orm"
import type {
    AppointmentMinimal,
    AppointmentFull,
    AppointmentCalendarItem,
    StaffAvailability,
    ServiceOption,
    StaffOption,
    CustomerSearchResult,
} from "@/types/appointments"

/**
 * Get appointments for a date range (calendar view)
 */
export async function getAppointmentsForCalendar(options: {
    branchId: string
    startDate: Date
    endDate: Date
    staffId?: string
    status?: string[]
}): Promise<AppointmentCalendarItem[]> {
    const { branchId, startDate, endDate, staffId, status } = options

    const conditions = [
        eq(appointments.branchId, branchId),
        gte(appointments.appointmentDate, startDate),
        lte(appointments.appointmentDate, endDate),
    ]

    if (staffId) {
        conditions.push(eq(appointments.staffId, staffId))
    }

    if (status && status.length > 0) {
        conditions.push(inArray(appointments.status, status))
    }

    const result = await db
        .select({
            id: appointments.id,
            startTime: appointments.startTime,
            endTime: appointments.endTime,
            duration: appointments.duration,
            status: appointments.status,
            customerId: appointments.customerId,
            customerFirstName: customers.firstName,
            customerLastName: customers.lastName,
            serviceId: appointments.serviceId,
            serviceName: services.name,
            serviceCategory: services.category,
            staffId: appointments.staffId,
            staffName: users.name,
        })
        .from(appointments)
        .innerJoin(customers, eq(appointments.customerId, customers.id))
        .innerJoin(services, eq(appointments.serviceId, services.id))
        .innerJoin(users, eq(appointments.staffId, users.id))
        .where(and(...conditions))
        .orderBy(appointments.startTime)

    return result.map((row) => ({
        id: row.id,
        startTime: row.startTime,
        endTime: row.endTime,
        duration: row.duration,
        status: row.status as AppointmentCalendarItem["status"],
        customer: {
            id: row.customerId,
            name: `${row.customerFirstName} ${row.customerLastName}`,
        },
        service: {
            id: row.serviceId,
            name: row.serviceName,
            category: row.serviceCategory,
        },
        staff: {
            id: row.staffId,
            name: row.staffName || "Unknown",
        },
    }))
}

/**
 * Get appointments for a specific date (daily view)
 */
export async function getAppointmentsForDate(
    branchId: string,
    date: Date
): Promise<AppointmentMinimal[]> {
    // Create date range for the entire day
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const result = await db
        .select({
            id: appointments.id,
            appointmentDate: appointments.appointmentDate,
            startTime: appointments.startTime,
            endTime: appointments.endTime,
            duration: appointments.duration,
            status: appointments.status,
            customerId: appointments.customerId,
            customerFirstName: customers.firstName,
            customerLastName: customers.lastName,
            serviceId: appointments.serviceId,
            serviceName: services.name,
            staffId: appointments.staffId,
            staffName: users.name,
            notes: appointments.notes,
        })
        .from(appointments)
        .innerJoin(customers, eq(appointments.customerId, customers.id))
        .innerJoin(services, eq(appointments.serviceId, services.id))
        .innerJoin(users, eq(appointments.staffId, users.id))
        .where(
            and(
                eq(appointments.branchId, branchId),
                gte(appointments.appointmentDate, startOfDay),
                lte(appointments.appointmentDate, endOfDay)
            )
        )
        .orderBy(appointments.startTime)

    return result.map((row) => ({
        id: row.id,
        appointmentDate: row.appointmentDate,
        startTime: row.startTime,
        endTime: row.endTime,
        duration: row.duration,
        status: row.status as AppointmentMinimal["status"],
        customerId: row.customerId,
        customerName: `${row.customerFirstName} ${row.customerLastName}`,
        serviceId: row.serviceId,
        serviceName: row.serviceName,
        staffId: row.staffId,
        staffName: row.staffName || "Unknown",
        notes: row.notes,
    }))
}

/**
 * Get full appointment details
 */
export async function getAppointmentDetails(
    id: string
): Promise<AppointmentFull | null> {
    const result = await db
        .select({
            id: appointments.id,
            branchId: appointments.branchId,
            branchName: branches.name,
            customerId: appointments.customerId,
            customerFirstName: customers.firstName,
            customerLastName: customers.lastName,
            customerMobile: customers.mobile,
            serviceId: appointments.serviceId,
            serviceName: services.name,
            serviceCategory: services.category,
            staffId: appointments.staffId,
            staffName: users.name,
            staffImage: users.image,
            appointmentDate: appointments.appointmentDate,
            startTime: appointments.startTime,
            endTime: appointments.endTime,
            duration: appointments.duration,
            status: appointments.status,
            notes: appointments.notes,
            cancellationReason: appointments.cancellationReason,
            servicePrice: appointments.servicePrice,
            createdAt: appointments.createdAt,
            updatedAt: appointments.updatedAt,
            createdBy: appointments.createdBy,
            updatedBy: appointments.updatedBy,
        })
        .from(appointments)
        .innerJoin(branches, eq(appointments.branchId, branches.id))
        .innerJoin(customers, eq(appointments.customerId, customers.id))
        .innerJoin(services, eq(appointments.serviceId, services.id))
        .innerJoin(users, eq(appointments.staffId, users.id))
        .where(eq(appointments.id, id))
        .limit(1)

    if (result.length === 0) return null

    const row = result[0]

    // Resolve audit user names
    let createdByName: string | null = null
    let updatedByName: string | null = null

    if (row.createdBy || row.updatedBy) {
        const userIds = [row.createdBy, row.updatedBy].filter(Boolean) as string[]
        const auditUsers = await db
            .select({ id: users.id, name: users.name })
            .from(users)
            .where(inArray(users.id, userIds))

        const userMap = new Map(auditUsers.map((u) => [u.id, u.name]))
        createdByName = row.createdBy ? userMap.get(row.createdBy) || null : null
        updatedByName = row.updatedBy ? userMap.get(row.updatedBy) || null : null
    }

    return {
        id: row.id,
        branchId: row.branchId,
        branchName: row.branchName,
        customerId: row.customerId,
        customerName: `${row.customerFirstName} ${row.customerLastName}`,
        customerMobile: row.customerMobile,
        serviceId: row.serviceId,
        serviceName: row.serviceName,
        serviceCategory: row.serviceCategory,
        staffId: row.staffId,
        staffName: row.staffName || "Unknown",
        staffImage: row.staffImage,
        appointmentDate: row.appointmentDate,
        startTime: row.startTime,
        endTime: row.endTime,
        duration: row.duration,
        status: row.status as AppointmentFull["status"],
        notes: row.notes,
        cancellationReason: row.cancellationReason,
        servicePrice: row.servicePrice,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        createdByName,
        updatedByName,
    }
}

/**
 * Get services available at a branch
 */
export async function getBranchServicesForBooking(
    branchId: string
): Promise<ServiceOption[]> {
    const result = await db
        .select({
            id: services.id,
            name: services.name,
            category: services.category,
            defaultDuration: services.defaultDuration,
            defaultPrice: services.defaultPrice,
            branchDuration: branchServices.duration,
            branchPrice: branchServices.price,
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
        .orderBy(services.category, services.name)

    return result.map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        duration: row.branchDuration ?? row.defaultDuration ?? 30,
        price: row.branchPrice ?? row.defaultPrice,
    }))
}

/**
 * Get staff qualified for a service at a branch
 */
export async function getQualifiedStaffForService(
    branchId: string,
    serviceId: string
): Promise<StaffOption[]> {
    // 1. Get staff with direct service assignment
    // We strictly use the explicit assignments now (Staff -> Service)
    const directStaff = await db
        .select({
            id: users.id,
            name: users.name,
            image: users.image,
            canTakeAppointments: users.canTakeAppointments
        })
        .from(staffServices)
        .innerJoin(users, eq(staffServices.userId, users.id))
        .where(
            and(
                eq(staffServices.branchId, branchId),
                eq(staffServices.serviceId, serviceId)
            )
        )

    // 2. Filter by ability to take appointments
    const qualifiedStaff = directStaff.filter(s => s.canTakeAppointments === true)

    // 3. Transform to return type
    const staffMap = new Map<string, StaffOption>()
    qualifiedStaff.forEach(s => {
        staffMap.set(s.id, {
            id: s.id,
            name: s.name || "Unknown",
            image: s.image
        })
    })

    return Array.from(staffMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Get branch operating hours for a specific day
 */
export async function getBranchHoursForDay(
    branchId: string,
    dayOfWeek: number
): Promise<{ openTime: string; closeTime: string; isClosed: boolean }[]> {
    const result = await db
        .select({
            openTime: branchOperatingHours.openTime,
            closeTime: branchOperatingHours.closeTime,
            isClosed: branchOperatingHours.isClosed,
            slotIndex: branchOperatingHours.slotIndex,
        })
        .from(branchOperatingHours)
        .where(
            and(
                eq(branchOperatingHours.branchId, branchId),
                eq(branchOperatingHours.dayOfWeek, dayOfWeek)
            )
        )
        .orderBy(branchOperatingHours.slotIndex)

    // If slotIndex 0 has isClosed = true, branch is closed for the day
    if (result.length > 0 && result[0].isClosed) {
        return [{ openTime: "", closeTime: "", isClosed: true }]
    }

    return result.map((r) => ({
        openTime: r.openTime,
        closeTime: r.closeTime,
        isClosed: r.isClosed ?? false,
    }))
}

/**
 * Get staff working hours for a specific day at a branch
 */
export async function getStaffHoursForDay(
    staffId: string,
    branchId: string,
    dayOfWeek: number
): Promise<{ startTime: string; endTime: string; isOff: boolean }[]> {
    const result = await db
        .select({
            startTime: staffWorkingHours.startTime,
            endTime: staffWorkingHours.endTime,
            isOff: staffWorkingHours.isOff,
            slotIndex: staffWorkingHours.slotIndex,
        })
        .from(staffWorkingHours)
        .where(
            and(
                eq(staffWorkingHours.userId, staffId),
                eq(staffWorkingHours.branchId, branchId),
                eq(staffWorkingHours.dayOfWeek, dayOfWeek)
            )
        )
        .orderBy(staffWorkingHours.slotIndex)

    // If slotIndex 0 has isOff = true, staff is off for the day
    if (result.length > 0 && result[0].isOff) {
        return [{ startTime: "", endTime: "", isOff: true }]
    }

    return result.map((r) => ({
        startTime: r.startTime,
        endTime: r.endTime,
        isOff: r.isOff ?? false,
    }))
}

/**
 * Get existing appointments for a staff member on a specific date
 */
export async function getStaffAppointmentsForDate(
    staffId: string,
    date: Date,
    excludeAppointmentId?: string
): Promise<{ startTime: string; endTime: string }[]> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const conditions = [
        eq(appointments.staffId, staffId),
        gte(appointments.appointmentDate, startOfDay),
        lte(appointments.appointmentDate, endOfDay),
        ne(appointments.status, "CANCELLED"),
    ]

    if (excludeAppointmentId) {
        conditions.push(ne(appointments.id, excludeAppointmentId))
    }

    const result = await db
        .select({
            startTime: appointments.startTime,
            endTime: appointments.endTime,
        })
        .from(appointments)
        .where(and(...conditions))
        .orderBy(appointments.startTime)

    return result
}

/**
 * Search customers for appointment booking
 */
export async function searchCustomersForBooking(options: {
    branchId?: string
    query: string
    limit?: number
}): Promise<CustomerSearchResult[]> {
    const { branchId, query, limit = 10 } = options

    if (!query || query.trim().length < 2) return []

    const searchTerm = `%${query.trim()}%`
    const conditions = [
        eq(customers.isActive, true),
        or(
            ilike(customers.firstName, searchTerm),
            ilike(customers.lastName, searchTerm),
            ilike(customers.mobile, searchTerm),
            ilike(customers.email, searchTerm)
        ),
    ]

    if (branchId) {
        conditions.push(eq(customers.branchId, branchId))
    }

    const result = await db
        .select({
            id: customers.id,
            firstName: customers.firstName,
            lastName: customers.lastName,
            mobile: customers.mobile,
            email: customers.email,
        })
        .from(customers)
        .where(and(...conditions))
        .limit(limit)
        .orderBy(customers.firstName, customers.lastName)

    return result.map((row) => ({
        id: row.id,
        name: `${row.firstName} ${row.lastName}`,
        mobile: row.mobile,
        email: row.email,
    }))
}

/**
 * Calculate available time slots for a staff member on a specific date
 */
export async function getAvailableSlots(options: {
    branchId: string
    serviceId: string
    date: Date
    excludeAppointmentId?: string
}): Promise<StaffAvailability[]> {
    const { branchId, serviceId, date, excludeAppointmentId } = options
    const dayOfWeek = date.getDay()

    // 1. Check for branch holiday on this date
    const { getBranchHolidayForDate } = await import("./holidays")
    const branchHoliday = await getBranchHolidayForDate(branchId, date)
    if (branchHoliday && branchHoliday.isFullDay) {
        return [] // Branch is closed for the entire day
    }

    // 2. Get branch hours for this day
    const branchHours = await getBranchHoursForDay(branchId, dayOfWeek)
    if (branchHours.length === 0 || branchHours[0].isClosed) {
        return [] // Branch is closed
    }

    // 3. Get service duration
    const serviceResult = await db
        .select({
            defaultDuration: services.defaultDuration,
            branchDuration: branchServices.duration,
        })
        .from(services)
        .leftJoin(
            branchServices,
            and(
                eq(branchServices.serviceId, services.id),
                eq(branchServices.branchId, branchId)
            )
        )
        .where(eq(services.id, serviceId))
        .limit(1)

    if (serviceResult.length === 0) return []

    const duration =
        serviceResult[0].branchDuration ??
        serviceResult[0].defaultDuration ??
        30

    // 4. Get qualified staff
    const qualifiedStaff = await getQualifiedStaffForService(branchId, serviceId)
    if (qualifiedStaff.length === 0) return []

    // 5. For each staff member, calculate available slots
    const availability: StaffAvailability[] = []
    const { getStaffHolidayForDate, isTimeSlotBlockedByHoliday } = await import("./holidays")

    for (const staff of qualifiedStaff) {
        // Check for staff holiday on this date
        const staffHoliday = await getStaffHolidayForDate(staff.id, branchId, date)
        if (staffHoliday && staffHoliday.isFullDay) {
            continue // Staff is off for the entire day
        }

        // Get staff working hours
        const staffHours = await getStaffHoursForDay(staff.id, branchId, dayOfWeek)

        // Check if staff is explicitly off for this day
        if (staffHours.length > 0 && staffHours[0].isOff) continue

        // Determine effective working hours:
        // - If staff has custom hours defined, use those
        // - If staff has NO custom hours, fall back to branch operating hours
        let effectiveStaffHours: { startTime: string; endTime: string }[]

        if (staffHours.length > 0) {
            // Staff has custom working hours - use them
            effectiveStaffHours = staffHours
                .filter((h) => !h.isOff)
                .map((h) => ({ startTime: h.startTime, endTime: h.endTime }))
        } else {
            // No custom hours defined - default to branch operating hours
            effectiveStaffHours = branchHours
                .filter((h) => !h.isClosed)
                .map((h) => ({ startTime: h.openTime, endTime: h.closeTime }))
        }

        // Skip if no effective working hours
        if (effectiveStaffHours.length === 0) continue

        // Get existing appointments
        const existingAppts = await getStaffAppointmentsForDate(
            staff.id,
            date,
            excludeAppointmentId
        )

        // Calculate free slots
        const slots = calculateFreeSlots(
            effectiveStaffHours,
            branchHours.filter((h) => !h.isClosed),
            existingAppts,
            duration,
            date
        )

        // Filter out slots that conflict with holidays
        let filteredSlots = slots
        if (branchHoliday && !branchHoliday.isFullDay) {
            filteredSlots = filteredSlots.filter(
                (slot) => !isTimeSlotBlockedByHoliday(branchHoliday, slot.time, slot.endTime)
            )
        }
        if (staffHoliday && !staffHoliday.isFullDay) {
            filteredSlots = filteredSlots.filter(
                (slot) => !isTimeSlotBlockedByHoliday(staffHoliday, slot.time, slot.endTime)
            )
        }

        if (filteredSlots.length > 0) {
            availability.push({
                staff: {
                    id: staff.id,
                    name: staff.name,
                    image: staff.image,
                },
                slots: filteredSlots,
            })
        }
    }

    return availability
}

/**
 * Calculate free slots given working hours, existing appointments, and duration
 */
function calculateFreeSlots(
    staffHours: { startTime: string; endTime: string }[],
    branchHours: { openTime: string; closeTime: string }[],
    existingAppts: { startTime: string; endTime: string }[],
    duration: number,
    date: Date
): string[] {
    // Find intersection of staff and branch hours
    const effectivePeriods = intersectTimePeriods(staffHours, branchHours)
    if (effectivePeriods.length === 0) return []

    // Generate all possible slots at 15-min intervals
    const allSlots: string[] = []
    for (const period of effectivePeriods) {
        let current = parseTimeToMinutes(period.start)
        const end = parseTimeToMinutes(period.end)

        while (current + duration <= end) {
            allSlots.push(minutesToTimeString(current))
            current += 15 // 15-minute intervals
        }
    }

    // Filter out past slots if date is today
    const now = new Date()
    const isToday =
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()

    let filteredSlots = allSlots
    if (isToday) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes()
        filteredSlots = allSlots.filter(
            (slot) => parseTimeToMinutes(slot) > currentMinutes
        )
    }

    // Remove slots that conflict with existing appointments
    const freeSlots = filteredSlots.filter((slot) => {
        const slotStart = parseTimeToMinutes(slot)
        const slotEnd = slotStart + duration

        return !existingAppts.some((appt) => {
            const apptStart = parseTimeToMinutes(appt.startTime)
            const apptEnd = parseTimeToMinutes(appt.endTime)
            // Check for overlap
            return slotStart < apptEnd && slotEnd > apptStart
        })
    })

    return freeSlots
}

/**
 * Find intersection of time periods
 */
function intersectTimePeriods(
    periods1: { startTime?: string; endTime?: string; start?: string; end?: string }[],
    periods2: { openTime?: string; closeTime?: string; start?: string; end?: string }[]
): { start: string; end: string }[] {
    const result: { start: string; end: string }[] = []

    for (const p1 of periods1) {
        const start1 = p1.startTime || p1.start || ""
        const end1 = p1.endTime || p1.end || ""

        for (const p2 of periods2) {
            const start2 = p2.openTime || p2.start || ""
            const end2 = p2.closeTime || p2.end || ""

            const start = start1 > start2 ? start1 : start2
            const end = end1 < end2 ? end1 : end2

            if (start < end) {
                result.push({ start, end })
            }
        }
    }

    return result
}

/**
 * Parse time string "HH:mm" to minutes since midnight
 */
function parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
}

/**
 * Convert minutes since midnight to "HH:mm" string
 */
function minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
}

/**
 * Add minutes to a time and return end time string
 */
export function addMinutesToTime(startTime: string, duration: number): string {
    const startMinutes = parseTimeToMinutes(startTime)
    return minutesToTimeString(startMinutes + duration)
}

/**
 * Get staff members for a branch (for filter dropdown)
 */
export async function getStaffForBranch(branchId: string): Promise<StaffOption[]> {
    // Get unique staff members who have working hours or services at this branch
    // AND who have canTakeAppointments = true
    const staffFromServices = await db
        .selectDistinct({
            id: users.id,
            name: users.name,
            image: users.image,
        })
        .from(staffServices)
        .innerJoin(users, eq(staffServices.userId, users.id))
        .where(
            and(
                eq(staffServices.branchId, branchId),
                eq(users.canTakeAppointments, true)
            )
        )
        .orderBy(users.name)

    // Also include staff who have category assignments
    const staffFromCategories = await db
        .selectDistinct({
            id: users.id,
            name: users.name,
            image: users.image,
        })
        .from(staffServiceCategories)
        .innerJoin(users, eq(staffServiceCategories.userId, users.id))
        .where(
            and(
                eq(staffServiceCategories.branchId, branchId),
                eq(users.canTakeAppointments, true)
            )
        )

    // Combine and deduplicate
    const staffMap = new Map<string, StaffOption>()

    staffFromServices.forEach(s => staffMap.set(s.id, {
        id: s.id,
        name: s.name || "Unknown",
        image: s.image
    }))

    staffFromCategories.forEach(s => staffMap.set(s.id, {
        id: s.id,
        name: s.name || "Unknown",
        image: s.image
    }))

    return Array.from(staffMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}
