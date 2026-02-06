"use client"

import {
    X,
    Clock,
    User,
    Stethoscope,
    UserCheck,
    Edit2,
    Trash2,
    AlertCircle
} from "lucide-react"
import { AppointmentMinimal, appointmentStatusConfig } from "@/types/appointments"
import { useState, useEffect } from "react"

interface AppointmentPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    appointment: AppointmentMinimal | null
    onEdit: (appointment: AppointmentMinimal) => void
    onCancel: (appointmentId: string) => void
    isCancelling?: boolean
}

export default function AppointmentPreviewModal({
    isOpen,
    onClose,
    appointment,
    onEdit,
    onCancel,
    isCancelling = false,
}: AppointmentPreviewModalProps) {
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)

    // Reset state when closed
    useEffect(() => {
        if (!isOpen) {
            setShowCancelConfirm(false)
        }
    }, [isOpen])

    if (!isOpen || !appointment) return null

    const statusConfig = appointmentStatusConfig[appointment.status]

    const handleCancelClick = () => {
        setShowCancelConfirm(true)
    }

    const confirmCancel = () => {
        onCancel(appointment.id)
        setShowCancelConfirm(false)
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
                onClick={onClose}
            ></div>

            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    {/* Header */}
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 flex items-center justify-between border-b border-gray-200">
                        <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                            Appointment Details
                        </h3>
                        <div className="flex items-center gap-2">
                            {!showCancelConfirm && appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                                <>
                                    <button
                                        onClick={() => onEdit(appointment)}
                                        className="p-1 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50"
                                        title="Edit Appointment"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleCancelClick}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                                        title="Cancel Appointment"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                            <button
                                type="button"
                                className="ml-2 rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                                onClick={onClose}
                            >
                                <span className="sr-only">Close</span>
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-4 py-5 sm:p-6 space-y-6">
                        {/* Status Badge */}
                        <div className="flex justify-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                                <span className={`w-2 h-2 rounded-full mr-2 ${statusConfig.dotColor}`} />
                                {statusConfig.label}
                            </span>
                        </div>

                        {/* Main Info Grid */}
                        <div className="grid gap-4">
                            <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50">
                                <User className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Customer</p>
                                    <p className="text-base font-semibold text-gray-900">{appointment.customerName}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50">
                                <Stethoscope className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Service</p>
                                    <p className="text-base font-semibold text-gray-900">{appointment.serviceName}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50">
                                <Clock className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Time</p>
                                    <p className="text-base font-semibold text-gray-900">
                                        {appointment.startTime} - {appointment.endTime}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {appointment.duration} minutes
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50">
                                <UserCheck className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Staff</p>
                                    <p className="text-base font-semibold text-gray-900">{appointment.staffName}</p>
                                </div>
                            </div>

                            {/* Notes Section - New */}
                            {appointment.notes && (
                                <div className="flex items-start gap-4 p-3 rounded-lg bg-gray-50">
                                    <AlertCircle className="w-5 h-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Notes</p>
                                        <p className="text-sm text-gray-900 mt-1">{appointment.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cancel Confirmation */}
                        {showCancelConfirm && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-100">
                                <div className="flex pb-3">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Cancel Appointment?</h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>Are you sure you want to cancel this appointment? This action cannot be undone.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-2">
                                    <button
                                        onClick={() => setShowCancelConfirm(false)}
                                        className="px-3 py-1.5 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={confirmCancel}
                                        className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700"
                                    >
                                        Confirm Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-start border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
