/**
 * Appointment Types
 */

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

// Minimal data for calendar/list views
export type AppointmentMinimal = {
    id: string
    appointmentDate: Date
    startTime: string
    endTime: string
    duration: number
    status: AppointmentStatus
    customerName: string
    customerId: string
    serviceName: string
    serviceId: string
    staffName: string
    staffId: string
}

// Full appointment details
export type AppointmentFull = {
    id: string
    branchId: string
    branchName: string
    customerId: string
    customerName: string
    customerMobile: string
    serviceId: string
    serviceName: string
    serviceCategory: string | null
    staffId: string
    staffName: string
    staffImage: string | null
    appointmentDate: Date
    startTime: string
    endTime: string
    duration: number
    status: AppointmentStatus
    notes: string | null
    cancellationReason: string | null
    servicePrice: number | null
    createdAt: Date | null
    updatedAt: Date | null
    createdByName: string | null
    updatedByName: string | null
}

// Calendar item for rendering
export type AppointmentCalendarItem = {
    id: string
    startTime: string
    endTime: string
    duration: number
    status: AppointmentStatus
    customer: {
        id: string
        name: string
    }
    service: {
        id: string
        name: string
        category: string | null
    }
    staff: {
        id: string
        name: string
    }
}

// Staff availability for slot picker
export type StaffAvailability = {
    staff: {
        id: string
        name: string
        image: string | null
    }
    slots: string[] // ["09:00", "09:30", "10:00", ...]
}

// Service option for dropdown
export type ServiceOption = {
    id: string
    name: string
    category: string | null
    duration: number
    price: number | null
}

// Staff option for dropdown
export type StaffOption = {
    id: string
    name: string
    image: string | null
}

// Customer search result
export type CustomerSearchResult = {
    id: string
    name: string
    mobile: string
    email: string | null
}

// Form data for creating appointment
export type CreateAppointmentData = {
    branchId: string
    customerId: string
    serviceId: string
    staffId: string
    appointmentDate: string // ISO date string
    startTime: string // HH:mm
    notes?: string
}

// Form data for updating appointment
export type UpdateAppointmentData = {
    appointmentDate?: string
    startTime?: string
    staffId?: string
    notes?: string
    status?: AppointmentStatus
    cancellationReason?: string
}

// Status colors for UI
export const appointmentStatusConfig: Record<AppointmentStatus, {
    label: string
    bgColor: string
    textColor: string
    dotColor: string
}> = {
    SCHEDULED: {
        label: 'Scheduled',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        dotColor: 'bg-blue-500',
    },
    COMPLETED: {
        label: 'Completed',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        dotColor: 'bg-green-500',
    },
    CANCELLED: {
        label: 'Cancelled',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        dotColor: 'bg-gray-500',
    },
    NO_SHOW: {
        label: 'No Show',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        dotColor: 'bg-red-500',
    },
}
