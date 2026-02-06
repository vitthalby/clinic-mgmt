"use server"

import { db } from "@/lib/db"
import { appointments } from "@/lib/schema"
import { eq } from "drizzle-orm"
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
import {
    getAppointmentsForDate,
    getAppointmentsForCalendar,
    getAppointmentDetails as getAppointmentDetailsFromDB,
    getBranchServicesForBooking as getBranchServicesFromDB,
    getQualifiedStaffForService as getQualifiedStaffFromDB,
    getAvailableSlots as getAvailableSlotsFromDB,
    searchCustomersForBooking as searchCustomersFromDB,
    addMinutesToTime,
    getStaffForBranch as getStaffForBranchFromDB,
    getStaffAppointmentsForDate,
} from "@/lib/data-access/appointments"
import type {
    AppointmentMinimal,
    AppointmentFull,
    AppointmentCalendarItem,
    StaffAvailability,
    ServiceOption,
    StaffOption,
    CustomerSearchResult,
    CreateAppointmentData,
    UpdateAppointmentData,
} from "@/types/appointments"

// Re-export types for client use
export type {
    AppointmentMinimal,
    AppointmentFull,
    AppointmentCalendarItem,
    StaffAvailability,
    ServiceOption,
    StaffOption,
    CustomerSearchResult,
    CreateAppointmentData,
    UpdateAppointmentData,
}

/**
 * Get appointments for calendar view
 */
export async function getAppointments(options: {
    branchId: string
    startDate: Date
    endDate: Date
    staffId?: string
    status?: string[]
}): Promise<AppointmentCalendarItem[]> {
    try {
        await requirePermission("appointments", "view", options.branchId)
        return await getAppointmentsForCalendar(options)
    } catch (error) {
        console.error("getAppointments error:", error)
        return []
    }
}

/**
 * Get appointments for a specific date (daily view)
 */
export async function getAppointmentsForDay(
    branchId: string,
    date: Date
): Promise<AppointmentMinimal[]> {
    try {
        await requirePermission("appointments", "view", branchId)
        return await getAppointmentsForDate(branchId, date)
    } catch (error) {
        console.error("getAppointmentsForDay error:", error)
        return []
    }
}

/**
 * Get full appointment details
 */
export async function getAppointmentById(
    id: string,
    branchId: string
): Promise<AppointmentFull | null> {
    try {
        await requirePermission("appointments", "view", branchId)
        return await getAppointmentDetailsFromDB(id)
    } catch (error) {
        console.error("getAppointmentById error:", error)
        return null
    }
}

/**
 * Get services available at a branch for booking
 */
export async function getBranchServicesForBooking(
    branchId: string
): Promise<ServiceOption[]> {
    try {
        await requireAuth()
        return await getBranchServicesFromDB(branchId)
    } catch (error) {
        console.error("getBranchServicesForBooking error:", error)
        return []
    }
}

/**
 * Get staff qualified for a service
 */
export async function getQualifiedStaff(
    branchId: string,
    serviceId: string
): Promise<StaffOption[]> {
    try {
        await requireAuth()
        return await getQualifiedStaffFromDB(branchId, serviceId)
    } catch (error) {
        console.error("getQualifiedStaff error:", error)
        return []
    }
}

/**
 * Get available time slots for booking
 */
export async function getAvailableSlots(options: {
    branchId: string
    serviceId: string
    date: Date
    excludeAppointmentId?: string
}): Promise<StaffAvailability[]> {
    try {
        await requireAuth()
        return await getAvailableSlotsFromDB(options)
    } catch (error) {
        console.error("getAvailableSlots error:", error)
        return []
    }
}

/**
 * Search customers for booking
 */
export async function searchCustomers(options: {
    branchId?: string
    query: string
}): Promise<CustomerSearchResult[]> {
    try {
        await requireAuth()
        return await searchCustomersFromDB(options)
    } catch (error) {
        console.error("searchCustomers error:", error)
        return []
    }
}

/**
 * Get staff members for a branch (for filtering)
 */
export async function getStaffForBranch(
    branchId: string
): Promise<StaffOption[]> {
    try {
        await requireAuth()
        return await getStaffForBranchFromDB(branchId)
    } catch (error) {
        console.error("getStaffForBranch error:", error)
        return []
    }
}

/**
 * Create a new appointment
 */
export async function createAppointment(
    data: CreateAppointmentData
): Promise<ActionResult<{ id: string }>> {
    try {
        // Validate branchId first since it's needed for permission check
        if (!data.branchId) throw new ValidationError("Branch is required")

        const user = await requirePermission("appointments", "add", data.branchId)

        // Validation
        if (!data.customerId) throw new ValidationError("Customer is required")
        if (!data.serviceId) throw new ValidationError("Service is required")
        if (!data.staffId) throw new ValidationError("Staff is required")
        if (!data.appointmentDate) throw new ValidationError("Date is required")
        if (!data.startTime) throw new ValidationError("Time is required")

        const appointmentDate = new Date(data.appointmentDate)
        if (isNaN(appointmentDate.getTime())) {
            throw new ValidationError("Invalid appointment date")
        }

        // Validate time format
        if (!/^\d{2}:\d{2}$/.test(data.startTime)) {
            throw new ValidationError("Invalid time format")
        }

        // Get service duration
        const branchServices = await getBranchServicesFromDB(data.branchId)
        const service = branchServices.find((s) => s.id === data.serviceId)
        if (!service) {
            throw new ValidationError("Service not available at this branch")
        }

        const duration = service.duration
        const endTime = addMinutesToTime(data.startTime, duration)

        // Check for conflicts
        const existingAppts = await getStaffAppointmentsForDate(
            data.staffId,
            appointmentDate
        )

        const startMinutes = parseTimeToMinutes(data.startTime)
        const endMinutes = startMinutes + duration

        const hasConflict = existingAppts.some((appt) => {
            const apptStart = parseTimeToMinutes(appt.startTime)
            const apptEnd = parseTimeToMinutes(appt.endTime)
            return startMinutes < apptEnd && endMinutes > apptStart
        })

        if (hasConflict) {
            throw new ConflictError("This time slot is no longer available")
        }

        // Create appointment
        const result = await db
            .insert(appointments)
            .values({
                branchId: data.branchId,
                customerId: data.customerId,
                serviceId: data.serviceId,
                staffId: data.staffId,
                appointmentDate,
                startTime: data.startTime,
                endTime,
                duration,
                servicePrice: service.price,
                notes: data.notes || null,
                status: "SCHEDULED",
                createdBy: user.id,
                updatedBy: user.id,
            })
            .returning({ id: appointments.id })

        revalidatePath("/management/appointments")
        revalidatePath("/management/customers")

        return success({ id: result[0].id })
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Update an appointment
 */
export async function updateAppointment(
    id: string,
    data: UpdateAppointmentData
): Promise<ActionResult> {
    try {
        // Check if appointment exists first to get branchId
        const existing = await getAppointmentDetailsFromDB(id)
        if (!existing) {
            throw new NotFoundError("Appointment not found")
        }

        const user = await requirePermission("appointments", "edit", existing.branchId)

        // Build update object
        const updateData: Record<string, unknown> = {
            updatedAt: new Date(),
            updatedBy: user.id,
        }

        if (data.notes !== undefined) {
            updateData.notes = data.notes
        }

        if (data.status !== undefined) {
            updateData.status = data.status
            if (data.status === "CANCELLED" && data.cancellationReason) {
                updateData.cancellationReason = data.cancellationReason
            }
        }

        // Handle rescheduling or service change
        if (data.appointmentDate || data.startTime || data.staffId || data.serviceId) {
            const newDate = data.appointmentDate
                ? new Date(data.appointmentDate)
                : existing.appointmentDate
            const newStartTime = data.startTime || existing.startTime
            const newStaffId = data.staffId || existing.staffId

            // Calculate duration and price if service changes
            let duration = existing.duration
            let servicePrice = existing.servicePrice

            if (data.serviceId && data.serviceId !== existing.serviceId) {
                // Fetch new service details
                const branchServices = await getBranchServicesFromDB(existing.branchId)
                const newService = branchServices.find((s) => s.id === data.serviceId)

                if (!newService) {
                    throw new ValidationError("Service not available at this branch")
                }

                duration = newService.duration
                servicePrice = newService.price
                updateData.serviceId = data.serviceId
                updateData.duration = duration
                updateData.servicePrice = servicePrice
            }

            // Check for conflicts
            const existingAppts = await getStaffAppointmentsForDate(
                newStaffId,
                newDate,
                id // Exclude current appointment
            )

            const startMinutes = parseTimeToMinutes(newStartTime)
            const endMinutes = startMinutes + duration

            const hasConflict = existingAppts.some((appt) => {
                const apptStart = parseTimeToMinutes(appt.startTime)
                const apptEnd = parseTimeToMinutes(appt.endTime)
                return startMinutes < apptEnd && endMinutes > apptStart
            })

            if (hasConflict) {
                throw new ConflictError("This time slot is not available")
            }

            // Apply updates
            if (data.startTime || data.serviceId) {
                updateData.startTime = newStartTime
                updateData.endTime = addMinutesToTime(newStartTime, duration)
            }

            if (data.appointmentDate) {
                updateData.appointmentDate = newDate
            }

            if (data.staffId) {
                updateData.staffId = newStaffId
            }
        }

        await db.update(appointments).set(updateData).where(eq(appointments.id, id))

        revalidatePath("/management/appointments")

        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(
    id: string,
    reason?: string
): Promise<ActionResult> {
    try {
        // Check if appointment exists first to get branchId
        const existing = await getAppointmentDetailsFromDB(id)
        if (!existing) {
            throw new NotFoundError("Appointment not found")
        }

        const user = await requirePermission("appointments", "edit", existing.branchId)

        if (existing.status === "CANCELLED") {
            throw new ValidationError("Appointment is already cancelled")
        }

        if (existing.status === "COMPLETED") {
            throw new ValidationError("Cannot cancel a completed appointment")
        }

        await db
            .update(appointments)
            .set({
                status: "CANCELLED",
                cancellationReason: reason || null,
                updatedAt: new Date(),
                updatedBy: user.id,
            })
            .where(eq(appointments.id, id))

        revalidatePath("/management/appointments")

        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Delete an appointment (hard delete - use with caution)
 */
export async function deleteAppointment(id: string): Promise<ActionResult> {
    try {
        // Check if appointment exists first to get branchId
        const existing = await getAppointmentDetailsFromDB(id)
        if (!existing) {
            throw new NotFoundError("Appointment not found")
        }

        await requirePermission("appointments", "delete", existing.branchId)

        await db.delete(appointments).where(eq(appointments.id, id))

        revalidatePath("/management/appointments")

        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Get staff working hours for calendar display
 */
export async function getStaffWorkingHoursForCalendar(
    branchId: string,
    date: Date
): Promise<Record<string, { startTime: string; endTime: string }[]>> {
    try {
        await requirePermission("appointments", "view", branchId)

        const { getStaffHoursForDay } = await import("@/lib/data-access/appointments")
        const { getBranchHoursForDay } = await import("@/lib/data-access/appointments")

        const dayOfWeek = date.getDay()
        const staff = await getStaffForBranchFromDB(branchId)
        const branchHours = await getBranchHoursForDay(branchId, dayOfWeek)

        const workingHours: Record<string, { startTime: string; endTime: string }[]> = {}

        for (const staffMember of staff) {
            const staffHours = await getStaffHoursForDay(staffMember.id, branchId, dayOfWeek)

            if (staffHours.length > 0 && staffHours[0].isOff) {
                // Staff is off this day
                workingHours[staffMember.id] = []
            } else if (staffHours.length > 0) {
                // Staff has custom hours
                workingHours[staffMember.id] = staffHours
                    .filter(h => !h.isOff)
                    .map(h => ({ startTime: h.startTime, endTime: h.endTime }))
            } else {
                // Staff uses branch hours
                workingHours[staffMember.id] = branchHours
                    .filter(h => !h.isClosed)
                    .map(h => ({ startTime: h.openTime, endTime: h.closeTime }))
            }
        }

        return workingHours
    } catch (error) {
        console.error("getStaffWorkingHoursForCalendar error:", error)
        return {}
    }
}

// Helper function
function parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
}
