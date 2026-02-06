"use client"

import { useState, useEffect, useCallback } from "react"
import {
    getCustomers,
    getCustomerDetails,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    toggleCustomerStatus,
    CustomerMinimal,
    CustomerFull,
    CustomerFormData,
} from "@/app/actions/customers"
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Phone,
    Mail,
    MapPin,
    Calendar,
    CalendarPlus,
    Heart,
    AlertCircle,
    User,
    ChevronLeft,
    ChevronRight,
    X,
    UserCheck,
    UserX,
    Droplet,
    Globe,
    Tag,
    FileText,
} from "lucide-react"
import { ExpandableTableRow, ExpandedDetailRow, ExpandedDetailSection } from "@/components/ui"
import { PermissionMap } from "@/lib/permissions"
import AppointmentBookingModal from "./AppointmentBookingModal"

// Constants
const GENDER_OPTIONS = ["Male", "Female", "Other"]
const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
const SOURCE_OPTIONS = ["Walk-in", "Referral", "Website", "Social Media", "Advertisement", "Other"]
const LANGUAGE_OPTIONS = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi", "Bengali", "Gujarati", "Other"]
const TAG_OPTIONS = ["VIP", "Senior Citizen", "Insurance", "Corporate", "Regular", "New Patient"]

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh"
]

type Branch = {
    id: string
    name: string
}

interface CustomersClientProps {
    initialCustomers: CustomerMinimal[]
    initialTotal: number
    branches: Branch[]
    currentBranchId?: string
    permissions: PermissionMap
}

export default function CustomersClient({
    initialCustomers,
    initialTotal,
    branches,
    currentBranchId,
    permissions,
}: CustomersClientProps) {
    // Get permissions for customers feature
    const canView = permissions.customers?.canView ?? false
    const canAdd = permissions.customers?.canAdd ?? false
    const canEdit = permissions.customers?.canEdit ?? false
    const canDelete = permissions.customers?.canDelete ?? false
    const canBookAppointment = permissions.appointments?.canAdd ?? false
    
    // List state
    const [customers, setCustomers] = useState<CustomerMinimal[]>(initialCustomers)
    const [total, setTotal] = useState(initialTotal)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [includeInactive, setIncludeInactive] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Expanded row state
    const [expandedData, setExpandedData] = useState<Record<string, CustomerFull>>({})
    const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({})

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<CustomerMinimal | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<"basic" | "address" | "medical" | "emergency" | "other">("basic")
    
    // Appointment booking modal state
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
    const [bookingCustomer, setBookingCustomer] = useState<CustomerMinimal | null>(null)

    // Form state
    const [formData, setFormData] = useState<CustomerFormData>({
        firstName: "",
        lastName: "",
        mobile: "",
        email: "",
        dob: "",
        gender: "",
        bloodGroup: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        medicalHistory: "",
        allergies: "",
        currentMedications: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelation: "",
        preferredLanguage: "English",
        source: "",
        referredBy: "",
        tags: [],
        notes: "",
        branchId: currentBranchId || "",
        isActive: true,
    })

    const limit = 10
    const totalPages = Math.ceil(total / limit)

    // Fetch customers
    const fetchCustomers = useCallback(async () => {
        setIsLoading(true)
        try {
            const result = await getCustomers({
                branchId: currentBranchId,
                search,
                page,
                limit,
                includeInactive,
            })
            setCustomers(result.customers)
            setTotal(result.total)
        } catch (err) {
            console.error("Failed to fetch customers:", err)
        } finally {
            setIsLoading(false)
        }
    }, [currentBranchId, search, page, includeInactive])

    // Debounced search and filter changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1)
            fetchCustomers()
        }, 300)
        return () => clearTimeout(timer)
    }, [search, includeInactive])

    useEffect(() => {
        fetchCustomers()
    }, [page])

    // Load expanded data
    const loadExpandedData = async (customerId: string) => {
        if (expandedData[customerId] || loadingDetails[customerId]) return

        setLoadingDetails((prev) => ({ ...prev, [customerId]: true }))
        try {
            const details = await getCustomerDetails(customerId)
            if (details) {
                setExpandedData((prev) => ({ ...prev, [customerId]: details }))
            }
        } catch (err) {
            console.error("Failed to load customer details:", err)
        } finally {
            setLoadingDetails((prev) => ({ ...prev, [customerId]: false }))
        }
    }

    // Form handlers
    const resetForm = () => {
        setFormData({
            firstName: "",
            lastName: "",
            mobile: "",
            email: "",
            dob: "",
            gender: "",
            bloodGroup: "",
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            pincode: "",
            medicalHistory: "",
            allergies: "",
            currentMedications: "",
            emergencyContactName: "",
            emergencyContactPhone: "",
            emergencyContactRelation: "",
            preferredLanguage: "English",
            source: "",
            referredBy: "",
            tags: [],
            notes: "",
            branchId: currentBranchId || "",
            isActive: true,
        })
        setActiveTab("basic")
        setError(null)
    }

    const openCreate = () => {
        setEditingCustomer(null)
        resetForm()
        setIsModalOpen(true)
    }

    const openEdit = async (customer: CustomerMinimal) => {
        setEditingCustomer(customer)
        setIsModalOpen(true)
        setActiveTab("basic")
        setError(null)

        // Load full details
        await loadExpandedData(customer.id)
        const fullCustomer = expandedData[customer.id]

        if (fullCustomer) {
            setFormData({
                firstName: fullCustomer.firstName,
                lastName: fullCustomer.lastName,
                mobile: fullCustomer.mobile,
                email: fullCustomer.email || "",
                dob: fullCustomer.dob ? new Date(fullCustomer.dob).toISOString().split("T")[0] : "",
                gender: fullCustomer.gender || "",
                bloodGroup: fullCustomer.bloodGroup || "",
                addressLine1: fullCustomer.addressLine1 || "",
                addressLine2: fullCustomer.addressLine2 || "",
                city: fullCustomer.city || "",
                state: fullCustomer.state || "",
                pincode: fullCustomer.pincode || "",
                medicalHistory: fullCustomer.medicalHistory || "",
                allergies: fullCustomer.allergies || "",
                currentMedications: fullCustomer.currentMedications || "",
                emergencyContactName: fullCustomer.emergencyContactName || "",
                emergencyContactPhone: fullCustomer.emergencyContactPhone || "",
                emergencyContactRelation: fullCustomer.emergencyContactRelation || "",
                preferredLanguage: fullCustomer.preferredLanguage || "English",
                source: fullCustomer.source || "",
                referredBy: fullCustomer.referredBy || "",
                tags: fullCustomer.tags || [],
                notes: fullCustomer.notes || "",
                branchId: fullCustomer.branchId || currentBranchId || "",
                isActive: fullCustomer.isActive ?? true,
            })
        } else {
            // Basic info while loading
            setFormData((prev) => ({
                ...prev,
                firstName: customer.firstName,
                lastName: customer.lastName,
                mobile: customer.mobile,
                email: customer.email || "",
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            if (editingCustomer) {
                const result = await updateCustomer(editingCustomer.id, formData)
                if (!result.success) {
                    setError(result.error || "Failed to update customer")
                    return
                }
            } else {
                const result = await createCustomer(formData)
                if (!result.success) {
                    setError(result.error || "Failed to create customer")
                    return
                }
            }

            setIsModalOpen(false)
            resetForm()
            fetchCustomers()
            // Clear expanded data to force refresh
            setExpandedData({})
        } catch (err: any) {
            setError(err.message || "An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this customer? This action cannot be undone.")) return

        try {
            const result = await deleteCustomer(id, currentBranchId)
            if (!result.success) {
                alert(result.error || "Failed to delete customer")
                return
            }
            fetchCustomers()
            setExpandedData((prev) => {
                const newData = { ...prev }
                delete newData[id]
                return newData
            })
        } catch (err) {
            console.error("Delete error:", err)
            alert("Failed to delete customer")
        }
    }

    const handleToggleStatus = async (id: string) => {
        try {
            const result = await toggleCustomerStatus(id, currentBranchId)
            if (!result.success) {
                alert(result.error || "Failed to update status")
                return
            }
            fetchCustomers()
            setExpandedData((prev) => {
                const newData = { ...prev }
                delete newData[id]
                return newData
            })
        } catch (err) {
            console.error("Toggle status error:", err)
        }
    }

    const handleTagToggle = (tag: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags?.includes(tag)
                ? prev.tags.filter((t) => t !== tag)
                : [...(prev.tags || []), tag],
        }))
    }

    // Calculate age from DOB
    const calculateAge = (dob: Date | string | null): string => {
        if (!dob) return "—"
        const birthDate = new Date(dob)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return `${age} years`
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        {total} total
                    </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search by name or mobile..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-72 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    {/* Show Inactive Toggle */}
                    <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:bg-gray-50">
                        <input
                            type="checkbox"
                            checked={includeInactive}
                            onChange={(e) => setIncludeInactive(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Show Inactive</span>
                    </label>
                    {canAdd && (
                        <button
                            onClick={openCreate}
                            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Plus size={20} />
                            Add Customer
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="w-12"></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center">
                                    <div className="flex items-center justify-center gap-2 text-gray-500">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                                        Loading...
                                    </div>
                                </td>
                            </tr>
                        ) : customers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    {search ? "No customers found matching your search." : "No customers yet. Add your first customer!"}
                                </td>
                            </tr>
                        ) : (
                            customers.map((customer) => {
                                const fullCustomer = expandedData[customer.id]

                                return (
                                    <ExpandableTableRow
                                        key={customer.id}
                                        onExpand={() => loadExpandedData(customer.id)}
                                        isLoading={loadingDetails[customer.id]}
                                        columns={[
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {customer.firstName} {customer.lastName}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {customer.gender || "—"}
                                                </div>
                                            </div>,
                                            <div>
                                                <div className="flex items-center gap-1 text-sm text-gray-900">
                                                    <Phone size={14} className="text-gray-400" />
                                                    {customer.mobile}
                                                </div>
                                                {customer.email && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                        <Mail size={12} className="text-gray-400" />
                                                        {customer.email}
                                                    </div>
                                                )}
                                            </div>,
                                            <span
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    customer.isActive
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {customer.isActive ? "Active" : "Inactive"}
                                            </span>,
                                            <div className="flex justify-end gap-2">
                                                {canBookAppointment && customer.isActive && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setBookingCustomer(customer)
                                                            setIsBookingModalOpen(true)
                                                        }}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Book Appointment"
                                                    >
                                                        <CalendarPlus size={16} />
                                                    </button>
                                                )}
                                                {canEdit && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            openEdit(customer)
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                                {canEdit && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleToggleStatus(customer.id)
                                                        }}
                                                        className={customer.isActive ? "text-amber-600 hover:text-amber-900" : "text-green-600 hover:text-green-900"}
                                                        title={customer.isActive ? "Deactivate" : "Activate"}
                                                    >
                                                        {customer.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDelete(customer.id)
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>,
                                        ]}
                                        expandedContent={
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <ExpandedDetailSection title="Personal Information">
                                                    <ExpandedDetailRow
                                                        label="Full Name"
                                                        value={`${customer.firstName} ${customer.lastName}`}
                                                    />
                                                    <ExpandedDetailRow label="Gender" value={fullCustomer?.gender || "—"} />
                                                    <ExpandedDetailRow
                                                        label="Age"
                                                        value={calculateAge(fullCustomer?.dob)}
                                                    />
                                                    <ExpandedDetailRow
                                                        label="DOB"
                                                        value={
                                                            fullCustomer?.dob
                                                                ? new Date(fullCustomer.dob).toLocaleDateString()
                                                                : "—"
                                                        }
                                                    />
                                                    <ExpandedDetailRow
                                                        label="Blood Group"
                                                        value={fullCustomer?.bloodGroup || "—"}
                                                    />
                                                </ExpandedDetailSection>

                                                <ExpandedDetailSection title="Contact & Address">
                                                    <ExpandedDetailRow label="Mobile" value={customer.mobile} />
                                                    <ExpandedDetailRow label="Email" value={customer.email || "—"} />
                                                    <ExpandedDetailRow
                                                        label="Address"
                                                        value={
                                                            [
                                                                fullCustomer?.addressLine1,
                                                                fullCustomer?.addressLine2,
                                                                fullCustomer?.city,
                                                                fullCustomer?.state,
                                                                fullCustomer?.pincode,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(", ") || "—"
                                                        }
                                                    />
                                                </ExpandedDetailSection>

                                                <ExpandedDetailSection title="Medical & Emergency">
                                                    <ExpandedDetailRow
                                                        label="Medical History"
                                                        value={fullCustomer?.medicalHistory || "—"}
                                                    />
                                                    <ExpandedDetailRow
                                                        label="Allergies"
                                                        value={fullCustomer?.allergies || "—"}
                                                    />
                                                    <ExpandedDetailRow
                                                        label="Emergency Contact"
                                                        value={
                                                            fullCustomer?.emergencyContactName
                                                                ? `${fullCustomer.emergencyContactName} (${fullCustomer.emergencyContactRelation || "—"}) - ${fullCustomer.emergencyContactPhone || "—"}`
                                                                : "—"
                                                        }
                                                    />
                                                </ExpandedDetailSection>
                                            </div>
                                        }
                                    />
                                )
                            })
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} customers
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-3 py-1 text-sm">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingCustomer ? "Edit Customer" : "Add New Customer"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="px-6 border-b border-gray-200">
                            <nav className="flex gap-4 -mb-px">
                                {[
                                    { key: "basic", label: "Basic Info", icon: User },
                                    { key: "address", label: "Address", icon: MapPin },
                                    { key: "medical", label: "Medical", icon: Heart },
                                    { key: "emergency", label: "Emergency", icon: AlertCircle },
                                    { key: "other", label: "Other", icon: FileText },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                        className={`flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                                            activeTab === tab.key
                                                ? "border-indigo-600 text-indigo-600"
                                                : "border-transparent text-gray-500 hover:text-gray-700"
                                        }`}
                                    >
                                        <tab.icon size={16} />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                            <div className="p-6 space-y-4">
                                {/* Basic Info Tab */}
                                {activeTab === "basic" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                First Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Last Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Mobile <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.mobile}
                                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                                placeholder="10-digit mobile number"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                            <input
                                                type="date"
                                                value={formData.dob}
                                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Gender</label>
                                            <select
                                                value={formData.gender}
                                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            >
                                                <option value="">Select...</option>
                                                {GENDER_OPTIONS.map((g) => (
                                                    <option key={g} value={g}>
                                                        {g}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                                            <select
                                                value={formData.bloodGroup}
                                                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            >
                                                <option value="">Select...</option>
                                                {BLOOD_GROUP_OPTIONS.map((bg) => (
                                                    <option key={bg} value={bg}>
                                                        {bg}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {branches.length > 1 && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Branch</label>
                                                <select
                                                    value={formData.branchId}
                                                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                                >
                                                    <option value="">Select Branch...</option>
                                                    {branches.map((b) => (
                                                        <option key={b.id} value={b.id}>
                                                            {b.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Address Tab */}
                                {activeTab === "address" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                                            <input
                                                type="text"
                                                value={formData.addressLine1}
                                                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                                                placeholder="House/Flat No., Building Name"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                                            <input
                                                type="text"
                                                value={formData.addressLine2}
                                                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                                                placeholder="Street, Locality"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">City</label>
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">State</label>
                                            <select
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            >
                                                <option value="">Select State...</option>
                                                {INDIAN_STATES.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Pincode</label>
                                            <input
                                                type="text"
                                                value={formData.pincode}
                                                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                                placeholder="6-digit pincode"
                                                maxLength={6}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Medical Tab */}
                                {activeTab === "medical" && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Medical History</label>
                                            <textarea
                                                value={formData.medicalHistory}
                                                onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                                                rows={3}
                                                placeholder="Any chronic conditions, past surgeries, ongoing treatments..."
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Allergies</label>
                                            <textarea
                                                value={formData.allergies}
                                                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                                rows={2}
                                                placeholder="Drug allergies, food allergies, environmental allergies..."
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Current Medications</label>
                                            <textarea
                                                value={formData.currentMedications}
                                                onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                                                rows={2}
                                                placeholder="List of current medications with dosage..."
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Emergency Tab */}
                                {activeTab === "emergency" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Emergency Contact Name</label>
                                            <input
                                                type="text"
                                                value={formData.emergencyContactName}
                                                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Emergency Contact Phone</label>
                                            <input
                                                type="tel"
                                                value={formData.emergencyContactPhone}
                                                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Relationship</label>
                                            <input
                                                type="text"
                                                value={formData.emergencyContactRelation}
                                                onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                                                placeholder="e.g., Spouse, Parent, Sibling"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Other Tab */}
                                {activeTab === "other" && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Preferred Language</label>
                                                <select
                                                    value={formData.preferredLanguage}
                                                    onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                                >
                                                    {LANGUAGE_OPTIONS.map((l) => (
                                                        <option key={l} value={l}>
                                                            {l}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">How did they find us?</label>
                                                <select
                                                    value={formData.source}
                                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                                >
                                                    <option value="">Select...</option>
                                                    {SOURCE_OPTIONS.map((s) => (
                                                        <option key={s} value={s}>
                                                            {s}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {formData.source === "Referral" && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Referred By</label>
                                                    <input
                                                        type="text"
                                                        value={formData.referredBy}
                                                        onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                                                        placeholder="Name of the person who referred"
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                            <div className="flex flex-wrap gap-2">
                                                {TAG_OPTIONS.map((tag) => (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => handleTagToggle(tag)}
                                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                                            formData.tags?.includes(tag)
                                                                ? "bg-indigo-600 text-white"
                                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                        }`}
                                                    >
                                                        {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Internal Notes</label>
                                            <textarea
                                                value={formData.notes}
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                rows={3}
                                                placeholder="Any internal notes about this customer..."
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                            />
                                        </div>

                                        {editingCustomer && (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                                                <input
                                                    id="isActive"
                                                    type="checkbox"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                                    Customer is Active
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Error */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                        {error}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center gap-2 disabled:bg-indigo-400"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Saving...
                                        </>
                                    ) : editingCustomer ? (
                                        "Save Changes"
                                    ) : (
                                        "Add Customer"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Appointment Booking Modal */}
            {currentBranchId && (
                <AppointmentBookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => {
                        setIsBookingModalOpen(false)
                        setBookingCustomer(null)
                    }}
                    onSuccess={() => {
                        setIsBookingModalOpen(false)
                        setBookingCustomer(null)
                    }}
                    branchId={currentBranchId}
                    preSelectedCustomer={
                        bookingCustomer
                            ? {
                                  id: bookingCustomer.id,
                                  name: `${bookingCustomer.firstName} ${bookingCustomer.lastName}`,
                                  mobile: bookingCustomer.mobile,
                              }
                            : undefined
                    }
                />
            )}
        </div>
    )
}
