"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
    getAppointmentsForDay,
    getStaffForBranch,
    AppointmentMinimal,
    StaffOption,
    cancelAppointment,
} from "@/app/actions/appointments"
import AppointmentPreviewModal from "./AppointmentPreviewModal"
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar,
    List,
    Clock,
    User,
    Filter,
} from "lucide-react"
import { managementStyles } from "@/lib/design-tokens"
import { appointmentStatusConfig } from "@/types/appointments"
import type { PermissionMap } from "@/lib/permissions"
import AppointmentBookingModal from "./AppointmentBookingModal"

interface AppointmentsClientProps {
    branchId: string
    branchName: string
    permissions: PermissionMap
}

type ViewMode = "day" | "week" | "list"

export default function AppointmentsClient({
    branchId,
    branchName,
    permissions,
}: AppointmentsClientProps) {
    const canAdd = permissions.appointments?.canAdd ?? false
    const canEdit = permissions.appointments?.canEdit ?? false

    // State
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [viewMode, setViewMode] = useState<ViewMode>("day")
    const [appointments, setAppointments] = useState<AppointmentMinimal[]>([])
    const [staff, setStaff] = useState<StaffOption[]>([])
    const [selectedStaffId, setSelectedStaffId] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
    const [previewAppointment, setPreviewAppointment] = useState<AppointmentMinimal | null>(null)
    const [editAppointmentData, setEditAppointmentData] = useState<{ id: string, data: any } | null>(null)
    const [isCancelling, setIsCancelling] = useState(false)
    const [showCancelled, setShowCancelled] = useState(false)
    const [workingHours, setWorkingHours] = useState<Record<string, { startTime: string; endTime: string }[]>>({})
    const [branchHoliday, setBranchHoliday] = useState<{ name: string; isFullDay: boolean; startTime?: string; endTime?: string } | null>(null)

    // Handlers
    const handleEdit = (appt: AppointmentMinimal) => {
        setEditAppointmentData({
            id: appt.id,
            data: {
                customerId: appt.customerId,
                customerName: appt.customerName,
                serviceId: appt.serviceId,
                staffId: appt.staffId,
                startTime: appt.startTime,
                notes: appt.notes
            }
        })
        setPreviewAppointment(null)
        setIsBookingModalOpen(true)
    }

    const handleCancel = async (appointmentId: string) => {
        setIsCancelling(true)
        try {
            await cancelAppointment(appointmentId)
            setPreviewAppointment(null)
            fetchAppointments()
        } catch (error) {
            console.error("Failed to cancel appointment:", error)
        } finally {
            setIsCancelling(false)
        }
    }

    // Time slots for the day view (7 AM to 9 PM)
    const timeSlots = useMemo(() => {
        const slots: string[] = []
        for (let hour = 7; hour <= 21; hour++) {
            slots.push(`${hour.toString().padStart(2, "0")}:00`)
        }
        return slots
    }, [])

    // Fetch staff for filter
    useEffect(() => {
        async function loadStaff() {
            const staffList = await getStaffForBranch(branchId)
            setStaff(staffList)
        }
        loadStaff()
    }, [branchId])

    // Fetch appointments, working hours, and holidays
    const fetchAppointments = useCallback(async () => {
        setIsLoading(true)
        try {
            const [appointmentsData, workingHoursData, holidayData] = await Promise.all([
                getAppointmentsForDay(branchId, selectedDate),
                import("@/app/actions/appointments").then(m => m.getStaffWorkingHoursForCalendar(branchId, selectedDate)),
                import("@/app/actions/holidays").then(m => m.getBranchHolidaysAction(branchId))
            ])

            setAppointments(appointmentsData)
            setWorkingHours(workingHoursData)

            // Check if there's a holiday on the selected date
            const dateStr = selectedDate.toISOString().split('T')[0]
            const holiday = holidayData.find(h => {
                const holidayDateStr = new Date(h.date).toISOString().split('T')[0]
                return holidayDateStr === dateStr
            })

            if (holiday) {
                setBranchHoliday({
                    name: holiday.name,
                    isFullDay: holiday.isFullDay ?? true,
                    startTime: holiday.startTime ?? undefined,
                    endTime: holiday.endTime ?? undefined,
                })
            } else {
                setBranchHoliday(null)
            }
        } catch (error) {
            console.error("Failed to fetch appointments:", error)
        } finally {
            setIsLoading(false)
        }
    }, [branchId, selectedDate])

    useEffect(() => {
        fetchAppointments()
    }, [fetchAppointments])

    // Navigation
    const goToToday = () => setSelectedDate(new Date())

    const goToPreviousDay = () => {
        const prev = new Date(selectedDate)
        prev.setDate(prev.getDate() - 1)
        setSelectedDate(prev)
    }

    const goToNextDay = () => {
        const next = new Date(selectedDate)
        next.setDate(next.getDate() + 1)
        setSelectedDate(next)
    }

    // Filter appointments by staff and cancelled status
    const filteredAppointments = useMemo(() => {
        let filtered = appointments

        // Filter by cancelled status
        if (!showCancelled) {
            filtered = filtered.filter(a => a.status !== 'CANCELLED')
        }

        // Filter by staff
        if (selectedStaffId) {
            filtered = filtered.filter(a => a.staffId === selectedStaffId)
        }

        return filtered
    }, [appointments, selectedStaffId, showCancelled])

    // Group appointments by staff for day view
    const appointmentsByStaff = useMemo(() => {
        const grouped: Record<string, AppointmentMinimal[]> = {}

        // Initialize with all staff or just filtered staff
        const displayStaff = selectedStaffId
            ? staff.filter((s) => s.id === selectedStaffId)
            : staff

        displayStaff.forEach((s) => {
            grouped[s.id] = []
        })

        filteredAppointments.forEach((appt) => {
            if (grouped[appt.staffId]) {
                grouped[appt.staffId].push(appt)
            } else {
                grouped[appt.staffId] = [appt]
            }
        })

        return grouped
    }, [filteredAppointments, staff, selectedStaffId])

    // Format date for display
    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const isToday = (date: Date) => {
        const today = new Date()
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        )
    }

    // Get appointment position in grid
    const getAppointmentStyle = (appt: AppointmentMinimal) => {
        const [startHour, startMin] = appt.startTime.split(":").map(Number)
        const startOffset = (startHour - 7) * 60 + startMin // 7 AM is offset 0
        const top = (startOffset / 60) * 64 // 64px per hour
        const height = (appt.duration / 60) * 64

        return {
            top: `${top}px`,
            height: `${Math.max(height, 24)}px`, // Minimum 24px height
        }
    }

    // Handle booking success
    const handleBookingSuccess = () => {
        setIsBookingModalOpen(false)
        fetchAppointments()
    }

    return (
        <div className={managementStyles.pageContainer}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className={managementStyles.pageTitle}>Appointments</h1>
                    <p className="text-sm text-gray-500 mt-1">{branchName}</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode("day")}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === "day"
                                ? "bg-white shadow text-gray-900"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            <Calendar className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === "list"
                                ? "bg-white shadow text-gray-900"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    {canAdd && (
                        <button
                            onClick={() => setIsBookingModalOpen(true)}
                            className={managementStyles.buttonPrimary}
                        >
                            <Plus className="w-4 h-4" />
                            Book Appointment
                        </button>
                    )}
                </div>
            </div>

            {/* Date Navigation & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={goToPreviousDay}
                        className="p-2 hover:bg-gray-100 rounded-md"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="text-center min-w-[200px]">
                        <p className="font-semibold text-gray-900">
                            {formatDate(selectedDate)}
                        </p>
                        {isToday(selectedDate) && (
                            <span className="text-xs text-indigo-600">Today</span>
                        )}
                    </div>

                    <button
                        onClick={goToNextDay}
                        className="p-2 hover:bg-gray-100 rounded-md"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {!isToday(selectedDate) && (
                        <button
                            onClick={goToToday}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            Today
                        </button>
                    )}
                </div>

                {/* Filters Group */}
                <div className="flex items-center gap-4">
                    {/* Show Cancelled Toggle */}
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={showCancelled}
                            onChange={(e) => setShowCancelled(e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        Show Cancelled
                    </label>

                    {/* Staff Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={selectedStaffId}
                            onChange={(e) => setSelectedStaffId(e.target.value)}
                            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">All Staff</option>
                            {staff.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Calendar/List Content */}

            {/* Holiday Banner */}
            {branchHoliday && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                    <div className="flex-shrink-0">
                        <Calendar className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-amber-900">
                            {branchHoliday.name}
                        </h3>
                        <p className="text-xs text-amber-700">
                            {branchHoliday.isFullDay
                                ? "Branch closed all day"
                                : `Closed from ${branchHoliday.startTime} to ${branchHoliday.endTime}`}
                        </p>
                    </div>
                </div>
            )}

            {/* Calendar/List Content */}
            {isLoading ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
                    <p className="text-gray-500 mt-4">Loading appointments...</p>
                </div>
            ) : viewMode === "day" ? (
                <DayView
                    timeSlots={timeSlots}
                    staff={selectedStaffId ? staff.filter(s => s.id === selectedStaffId) : staff}
                    appointmentsByStaff={appointmentsByStaff}
                    workingHours={workingHours}
                    branchHoliday={branchHoliday}
                    getAppointmentStyle={getAppointmentStyle}
                    canEdit={canEdit}
                    onAppointmentClick={setPreviewAppointment}
                />
            ) : (
                <ListView
                    appointments={filteredAppointments}
                    canEdit={canEdit}
                    onAppointmentClick={setPreviewAppointment}
                />
            )}

            {/* Booking Modal */}
            <AppointmentBookingModal
                isOpen={isBookingModalOpen}
                onClose={() => {
                    setIsBookingModalOpen(false)
                    setEditAppointmentData(null)
                }}
                onSuccess={handleBookingSuccess}
                branchId={branchId}
                initialDate={selectedDate}
                appointmentId={editAppointmentData?.id}
                initialData={editAppointmentData?.data}
            />

            <AppointmentPreviewModal
                isOpen={!!previewAppointment}
                onClose={() => setPreviewAppointment(null)}
                appointment={previewAppointment}
                onEdit={handleEdit}
                onCancel={handleCancel}
                isCancelling={isCancelling}
            />
        </div>
    )
}

// Day View Component
function DayView({
    timeSlots,
    staff,
    appointmentsByStaff,
    workingHours,
    branchHoliday,
    getAppointmentStyle,
    canEdit,
    onAppointmentClick,
}: {
    timeSlots: string[]
    staff: StaffOption[]
    appointmentsByStaff: Record<string, AppointmentMinimal[]>
    workingHours: Record<string, { startTime: string; endTime: string }[]>
    branchHoliday: { name: string; isFullDay: boolean; startTime?: string; endTime?: string } | null
    getAppointmentStyle: (appt: AppointmentMinimal) => { top: string; height: string }
    canEdit: boolean
    onAppointmentClick: (appt: AppointmentMinimal) => void
}) {
    // Helper function to check if a time is within working hours
    const isWithinWorkingHours = (staffId: string, time: string): boolean => {
        // Check for branch holiday first
        if (branchHoliday) {
            if (branchHoliday.isFullDay) {
                return false // Full day holiday - no working hours
            }

            // Check if time falls within partial holiday hours
            if (branchHoliday.startTime && branchHoliday.endTime) {
                const timeMinutes = parseTimeToMinutes(time)
                const holidayStart = parseTimeToMinutes(branchHoliday.startTime)
                const holidayEnd = parseTimeToMinutes(branchHoliday.endTime)

                // If time is within holiday hours, it's not working time
                if (timeMinutes >= holidayStart && timeMinutes < holidayEnd) {
                    return false
                }
            }
        }

        // Check staff working hours
        const hours = workingHours[staffId]
        if (!hours || hours.length === 0) return false

        const timeMinutes = parseTimeToMinutes(time)
        return hours.some(slot => {
            const startMinutes = parseTimeToMinutes(slot.startTime)
            const endMinutes = parseTimeToMinutes(slot.endTime)
            return timeMinutes >= startMinutes && timeMinutes < endMinutes
        })
    }

    // Helper to parse time to minutes
    const parseTimeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number)
        return hours * 60 + minutes
    }

    if (staff.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <User className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-gray-500 mt-4">No staff members assigned to this branch</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Header Row - Staff Names */}
                    <div className="flex border-b border-gray-200 bg-gray-50">
                        <div className="w-20 flex-shrink-0 p-3 text-xs font-medium text-gray-500 uppercase">
                            Time
                        </div>
                        {staff.map((s) => (
                            <div
                                key={s.id}
                                className="flex-1 min-w-[200px] p-3 text-sm font-medium text-gray-900 border-l border-gray-200"
                            >
                                {s.name}
                            </div>
                        ))}
                    </div>

                    {/* Time Grid */}
                    <div className="relative">
                        {/* Time Labels */}
                        <div className="flex">
                            <div className="w-20 flex-shrink-0">
                                {timeSlots.map((time) => (
                                    <div
                                        key={time}
                                        className="h-16 border-b border-gray-100 px-3 py-1 text-xs text-gray-500"
                                    >
                                        {time}
                                    </div>
                                ))}
                            </div>

                            {/* Staff Columns */}
                            {staff.map((s) => (
                                <div
                                    key={s.id}
                                    className="flex-1 min-w-[200px] relative border-l border-gray-200"
                                >
                                    {/* Hour grid lines with working hours indicators */}
                                    {timeSlots.map((time) => {
                                        const isWorking = isWithinWorkingHours(s.id, time)
                                        return (
                                            <div
                                                key={time}
                                                className={`h-16 border-b border-gray-100 relative ${!isWorking ? 'bg-gray-50' : ''
                                                    }`}
                                            >
                                                {/* Non-working hours overlay */}
                                                {!isWorking && (
                                                    <div
                                                        className="absolute inset-0 opacity-30"
                                                        style={{
                                                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(156, 163, 175, 0.1) 10px, rgba(156, 163, 175, 0.1) 20px)'
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        )
                                    })}

                                    {/* Appointments */}
                                    {appointmentsByStaff[s.id]?.map((appt) => {
                                        const style = getAppointmentStyle(appt)
                                        const statusConfig = appointmentStatusConfig[appt.status]

                                        return (
                                            <div
                                                key={appt.id}
                                                // Outer container: Layout + Positioning (No clipping)
                                                className={`group absolute left-1 right-1 hover:z-50 transition-all`}
                                                style={style}
                                            >
                                                {/* Visual Card + Content (Clipped) */}
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onAppointmentClick(appt)
                                                    }}
                                                    className={`h-full w-full rounded-md px-2 py-1 overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-shadow ${statusConfig.bgColor}`}
                                                    title={`${appt.customerName} - ${appt.serviceName}`}
                                                >
                                                    <p className={`text-xs font-medium truncate ${statusConfig.textColor}`}>
                                                        {appt.customerName}
                                                    </p>
                                                    <p className="text-xs text-gray-600 truncate">
                                                        {appt.serviceName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {appt.startTime} - {appt.endTime}
                                                    </p>
                                                </div>

                                                {/* Hover Card (Unclipped, Light Theme) */}
                                                <div
                                                    className="hidden group-hover:block absolute left-0 bottom-full mb-1 w-56 bg-white text-gray-900 p-3 rounded-lg shadow-xl ring-1 ring-gray-900/5 z-50 pointer-events-none"
                                                    style={{ marginBottom: '4px' }}
                                                >
                                                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                                                        <span className="text-xs font-bold text-gray-700">
                                                            {appt.startTime} - {appt.endTime}
                                                        </span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200`}>
                                                            {appt.duration} min
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {appt.customerName}
                                                        </div>
                                                        <div className="text-xs text-indigo-600 font-medium">
                                                            {appt.serviceName}
                                                        </div>
                                                        <div className="text-[10px] text-gray-500">
                                                            with {appt.staffName}
                                                        </div>
                                                    </div>
                                                    {/* Arrow */}
                                                    <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-white" />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// List View Component
function ListView({
    appointments,
    canEdit,
    onAppointmentClick,
}: {
    appointments: AppointmentMinimal[]
    canEdit: boolean
    onAppointmentClick: (appt: AppointmentMinimal) => void
}) {
    if (appointments.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-gray-500 mt-4">No appointments scheduled for this day</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className={managementStyles.table}>
                <thead className={managementStyles.tableHeader}>
                    <tr>
                        <th className={managementStyles.tableHeaderCell}>Time</th>
                        <th className={managementStyles.tableHeaderCell}>Customer</th>
                        <th className={managementStyles.tableHeaderCell}>Service</th>
                        <th className={managementStyles.tableHeaderCell}>Staff</th>
                        <th className={managementStyles.tableHeaderCell}>Status</th>
                    </tr>
                </thead>
                <tbody className={managementStyles.tableBody}>
                    {appointments.map((appt) => {
                        const statusConfig = appointmentStatusConfig[appt.status]

                        return (
                            <tr
                                key={appt.id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => onAppointmentClick(appt)}
                            >
                                <td className={managementStyles.tableCell}>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">
                                            {appt.startTime} - {appt.endTime}
                                        </span>
                                    </div>
                                </td>
                                <td className={managementStyles.tableCell}>
                                    <span className="font-medium text-gray-900">
                                        {appt.customerName}
                                    </span>
                                </td>
                                <td className={managementStyles.tableCell}>
                                    {appt.serviceName}
                                </td>
                                <td className={managementStyles.tableCell}>
                                    {appt.staffName}
                                </td>
                                <td className={managementStyles.tableCell}>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                                        {statusConfig.label}
                                    </span>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
