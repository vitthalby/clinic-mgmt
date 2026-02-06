"use client"

import { useState, useEffect } from "react"
import {
    X,
    Search,
    User,
    Calendar,
    Clock,
    Stethoscope,
    UserCheck,
    ChevronRight,
    Phone,
    Loader2,
    AlertCircle,
    Check,
} from "lucide-react"
import {
    searchCustomers,
    getBranchServicesForBooking,
    getAvailableSlots,
    createAppointment,
    CustomerSearchResult,
    ServiceOption,
    StaffAvailability,
} from "@/app/actions/appointments"
import { managementStyles } from "@/lib/design-tokens"

interface AppointmentBookingModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    branchId: string
    initialDate?: Date
    preSelectedCustomer?: {
        id: string
        name: string
        mobile: string
    }
}

type BookingStep = "customer" | "service" | "datetime"

export default function AppointmentBookingModal({
    isOpen,
    onClose,
    onSuccess,
    branchId,
    initialDate,
    preSelectedCustomer,
}: AppointmentBookingModalProps) {
    // Current step
    const [step, setStep] = useState<BookingStep>("customer")
    
    // Customer
    const [customerSearch, setCustomerSearch] = useState("")
    const [customers, setCustomers] = useState<CustomerSearchResult[]>([])
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    
    // Service
    const [services, setServices] = useState<ServiceOption[]>([])
    const [selectedService, setSelectedService] = useState<ServiceOption | null>(null)
    const [loadingServices, setLoadingServices] = useState(false)
    
    // Date & Time
    const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date())
    const [availability, setAvailability] = useState<StaffAvailability[]>([])
    const [selectedStaffId, setSelectedStaffId] = useState<string>("")
    const [selectedTime, setSelectedTime] = useState<string>("")
    const [loadingSlots, setLoadingSlots] = useState(false)
    
    // Notes
    const [notes, setNotes] = useState("")
    
    // Submission
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            if (preSelectedCustomer) {
                setSelectedCustomer({
                    id: preSelectedCustomer.id,
                    name: preSelectedCustomer.name,
                    mobile: preSelectedCustomer.mobile,
                    email: null,
                })
                setStep("service")
            } else {
                setStep("customer")
                setSelectedCustomer(null)
            }
            setCustomerSearch("")
            setCustomers([])
            setSelectedService(null)
            setSelectedDate(initialDate || new Date())
            setAvailability([])
            setSelectedStaffId("")
            setSelectedTime("")
            setNotes("")
            setError(null)
        }
    }, [isOpen, preSelectedCustomer, initialDate])

    // Load services when branch changes or when reaching service step
    useEffect(() => {
        if (isOpen && branchId && step === "service") {
            loadServices()
        }
    }, [isOpen, branchId, step])

    // Load slots when service or date changes
    useEffect(() => {
        if (step === "datetime" && selectedService && selectedDate) {
            loadAvailableSlots()
        }
    }, [step, selectedService, selectedDate])

    // Search customers with debounce
    useEffect(() => {
        if (customerSearch.length < 2) {
            setCustomers([])
            return
        }

        const timer = setTimeout(async () => {
            setIsSearching(true)
            try {
                const results = await searchCustomers({
                    branchId,
                    query: customerSearch,
                })
                setCustomers(results)
            } catch (err) {
                console.error("Search error:", err)
            } finally {
                setIsSearching(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [customerSearch, branchId])

    const loadServices = async () => {
        setLoadingServices(true)
        try {
            const result = await getBranchServicesForBooking(branchId)
            setServices(result)
        } catch (err) {
            console.error("Failed to load services:", err)
        } finally {
            setLoadingServices(false)
        }
    }

    const loadAvailableSlots = async () => {
        if (!selectedService) return
        
        setLoadingSlots(true)
        setSelectedStaffId("")
        setSelectedTime("")
        try {
            const result = await getAvailableSlots({
                branchId,
                serviceId: selectedService.id,
                date: selectedDate,
            })
            setAvailability(result)
        } catch (err) {
            console.error("Failed to load slots:", err)
        } finally {
            setLoadingSlots(false)
        }
    }

    // Select customer and move to next step
    const handleSelectCustomer = (customer: CustomerSearchResult) => {
        setSelectedCustomer(customer)
        setStep("service")
    }

    // Select service and move to next step
    const handleSelectService = (service: ServiceOption) => {
        setSelectedService(service)
        setStep("datetime")
    }

    // Select time slot
    const handleSelectSlot = (staffId: string, time: string) => {
        setSelectedStaffId(staffId)
        setSelectedTime(time)
    }

    // Submit booking
    const handleSubmit = async () => {
        if (!selectedCustomer || !selectedService || !selectedStaffId || !selectedTime) {
            setError("Please complete all required selections")
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const result = await createAppointment({
                branchId,
                customerId: selectedCustomer.id,
                serviceId: selectedService.id,
                staffId: selectedStaffId,
                appointmentDate: selectedDate.toISOString(),
                startTime: selectedTime,
                notes: notes || undefined,
            })

            if (result.success) {
                onSuccess()
            } else {
                setError(typeof result.error === "string" ? result.error : "Failed to book appointment")
            }
        } catch (err) {
            setError("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Navigate back
    const goBack = () => {
        if (step === "datetime") setStep("service")
        else if (step === "service" && !preSelectedCustomer) setStep("customer")
    }

    // Format date for input
    const formatDateForInput = (date: Date) => {
        return date.toISOString().split("T")[0]
    }

    // Format price
    const formatPrice = (price: number | null) => {
        if (!price) return ""
        return `₹${(price / 100).toFixed(0)}`
    }

    // Get selected staff name
    const getSelectedStaffName = () => {
        const staffAvail = availability.find((a) => a.staff.id === selectedStaffId)
        return staffAvail?.staff.name || ""
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Book Appointment
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Indicator */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-sm">
                        <StepIndicator
                            label="Customer"
                            isActive={step === "customer"}
                            isComplete={!!selectedCustomer}
                            icon={<User className="w-4 h-4" />}
                        />
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                        <StepIndicator
                                            label="Service"
                                            isActive={step === "service"}
                                            isComplete={!!selectedService}
                                            icon={<Stethoscope className="w-4 h-4" />}
                                        />
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                        <StepIndicator
                                            label="Date & Time"
                                            isActive={step === "datetime"}
                                            isComplete={!!selectedTime}
                                            icon={<Clock className="w-4 h-4" />}
                                        />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
                                    {/* Summary of selections */}
                                    {(selectedCustomer || selectedService) && step !== "customer" && (
                                        <div className="mb-4 p-3 bg-indigo-50 rounded-lg text-sm">
                                            <div className="flex flex-wrap gap-4">
                                                {selectedCustomer && (
                                                    <div>
                                                        <span className="text-gray-500">Customer: </span>
                                                        <span className="font-medium text-gray-900">
                                                            {selectedCustomer.name}
                                                        </span>
                                                    </div>
                                                )}
                                                {selectedService && (
                                                    <div>
                                                        <span className="text-gray-500">Service: </span>
                                                        <span className="font-medium text-gray-900">
                                                            {selectedService.name} ({selectedService.duration} min)
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Error Display */}
                                    {error && (
                                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}

                                    {/* Step Content */}
                                    {step === "customer" && (
                                        <CustomerStep
                                            search={customerSearch}
                                            onSearchChange={setCustomerSearch}
                                            customers={customers}
                                            isSearching={isSearching}
                                            onSelect={handleSelectCustomer}
                                        />
                                    )}

                                    {step === "service" && (
                                        <ServiceStep
                                            services={services}
                                            loading={loadingServices}
                                            onSelect={handleSelectService}
                                            formatPrice={formatPrice}
                                        />
                                    )}

                                    {step === "datetime" && (
                                        <DateTimeStep
                                            selectedDate={selectedDate}
                                            onDateChange={setSelectedDate}
                                            availability={availability}
                                            loading={loadingSlots}
                                            selectedStaffId={selectedStaffId}
                                            selectedTime={selectedTime}
                                            onSelectSlot={handleSelectSlot}
                                            formatDateForInput={formatDateForInput}
                                            notes={notes}
                                            onNotesChange={setNotes}
                                        />
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                                    <div>
                                        {step !== "customer" && !preSelectedCustomer && (
                                            <button
                                                onClick={goBack}
                                                className={managementStyles.buttonSecondary}
                                            >
                                                Back
                                            </button>
                                        )}
                                        {step === "service" && preSelectedCustomer && (
                                            <button
                                                onClick={onClose}
                                                className={managementStyles.buttonSecondary}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        {step === "datetime" && selectedTime && (
                                            <button
                                                onClick={handleSubmit}
                                                disabled={isSubmitting}
                                                className={managementStyles.buttonPrimary}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Booking...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        Confirm Booking
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
    )
}

// Step Indicator Component
function StepIndicator({
    label,
    isActive,
    isComplete,
    icon,
}: {
    label: string
    isActive: boolean
    isComplete: boolean
    icon: React.ReactNode
}) {
    return (
        <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
                isActive
                    ? "bg-indigo-100 text-indigo-700"
                    : isComplete
                    ? "text-green-600"
                    : "text-gray-400"
            }`}
        >
            {isComplete && !isActive ? (
                <Check className="w-4 h-4" />
            ) : (
                icon
            )}
            <span className={isActive ? "font-medium" : ""}>{label}</span>
        </div>
    )
}

// Customer Selection Step
function CustomerStep({
    search,
    onSearchChange,
    customers,
    isSearching,
    onSelect,
}: {
    search: string
    onSearchChange: (v: string) => void
    customers: CustomerSearchResult[]
    isSearching: boolean
    onSelect: (c: CustomerSearchResult) => void
}) {
    return (
        <div>
            <label className={managementStyles.label}>Search Customer</label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search by name, mobile, or email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    autoFocus
                />
                {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}
            </div>

            <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
                {search.length < 2 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                        Type at least 2 characters to search
                    </p>
                ) : customers.length === 0 && !isSearching ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                        No customers found
                    </p>
                ) : (
                    customers.map((customer) => (
                        <button
                            key={customer.id}
                            onClick={() => onSelect(customer)}
                            className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900">
                                        {customer.name}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Phone className="w-3 h-3" />
                                        {customer.mobile}
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    )
}

// Service Selection Step
function ServiceStep({
    services,
    loading,
    onSelect,
    formatPrice,
}: {
    services: ServiceOption[]
    loading: boolean
    onSelect: (s: ServiceOption) => void
    formatPrice: (p: number | null) => string
}) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            </div>
        )
    }

    if (services.length === 0) {
        return (
            <div className="text-center py-12">
                <Stethoscope className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-gray-500 mt-4">No services available at this branch</p>
            </div>
        )
    }

    // Group by category
    const grouped = services.reduce((acc, service) => {
        const cat = service.category || "Other"
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(service)
        return acc
    }, {} as Record<string, ServiceOption[]>)

    return (
        <div className="space-y-6">
            {Object.entries(grouped).map(([category, categoryServices]) => (
                <div key={category}>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                        {category}
                    </h3>
                    <div className="space-y-2">
                        {categoryServices.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => onSelect(service)}
                                className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {service.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {service.duration} minutes
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {service.price && (
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatPrice(service.price)}
                                            </span>
                                        )}
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

// Date & Time Selection Step
function DateTimeStep({
    selectedDate,
    onDateChange,
    availability,
    loading,
    selectedStaffId,
    selectedTime,
    onSelectSlot,
    formatDateForInput,
    notes,
    onNotesChange,
}: {
    selectedDate: Date
    onDateChange: (d: Date) => void
    availability: StaffAvailability[]
    loading: boolean
    selectedStaffId: string
    selectedTime: string
    onSelectSlot: (staffId: string, time: string) => void
    formatDateForInput: (d: Date) => string
    notes: string
    onNotesChange: (n: string) => void
}) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return (
        <div className="space-y-4">
            {/* Date Picker */}
            <div>
                <label className={managementStyles.label}>Select Date</label>
                <input
                    type="date"
                    value={formatDateForInput(selectedDate)}
                    min={formatDateForInput(today)}
                    onChange={(e) => onDateChange(new Date(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            {/* Time Slots by Staff */}
            <div>
                <label className={managementStyles.label}>Select Staff & Time</label>
                
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                    </div>
                ) : availability.length === 0 ? (
                    <div className="text-center py-8 border border-gray-200 rounded-lg">
                        <Calendar className="w-10 h-10 text-gray-300 mx-auto" />
                        <p className="text-gray-500 mt-2">No available slots on this date</p>
                        <p className="text-sm text-gray-400">Try a different date</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[250px] overflow-y-auto">
                        {availability.map((staffAvail) => (
                            <div key={staffAvail.staff.id} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <UserCheck className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium text-gray-900">
                                        {staffAvail.staff.name}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {staffAvail.slots.map((time) => {
                                        const isSelected =
                                            selectedStaffId === staffAvail.staff.id &&
                                            selectedTime === time
                                        return (
                                            <button
                                                key={time}
                                                onClick={() => onSelectSlot(staffAvail.staff.id, time)}
                                                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                                                    isSelected
                                                        ? "bg-indigo-600 text-white border-indigo-600"
                                                        : "border-gray-300 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
                                                }`}
                                            >
                                                {time}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Notes */}
            {selectedTime && (
                <div>
                    <label className={managementStyles.label}>Notes (Optional)</label>
                    <textarea
                        value={notes}
                        onChange={(e) => onNotesChange(e.target.value)}
                        placeholder="Any special instructions..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            )}
        </div>
    )
}
