"use client"

import { useState, useEffect } from "react"
import { createBranch, updateBranch, deleteBranch, getBranchFeatures, getBranchDetails, getBranchesMinimal, getBranchOperatingHours, getBranchServices, OperatingHoursEntry, BranchServiceAssignment } from "@/app/actions/branches"
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Clock, Stethoscope, Calendar } from "lucide-react"
import { useActionState } from "@/hooks/useActionState"
import { useExpandableTable } from "@/hooks/useExpandableTable"
import { ActionError, ExpandableTableRow, ExpandedDetailRow, ExpandedDetailSection } from "@/components/ui"
import type { AuditDisplayInfo } from "@/types/audit"

type Feature = {
    id: string
    name: string
    key: string
    description: string | null
}

type ServiceOption = {
    id: string
    name: string
    code: string | null
    category: string | null
    defaultDuration: number | null
    defaultPrice: number | null
}

type BranchMinimal = {
    id: string
    name: string
    state: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
} & Partial<AuditDisplayInfo>

type BranchFull = BranchMinimal & {
    address: string | null
    phone: string | null
    email: string | null
    pinCode: string | null
}

type BranchExpandedData = {
    details: BranchFull
    features: any[]
    operatingHours: OperatingHoursEntry[]
    branchServices: any[]
}

type Branch = BranchMinimal

type FeatureAssignment = {
    featureId: string
    isEnabled: boolean
}

type Props = {
    branches: Branch[]
    allFeatures: Feature[]
    allServices: ServiceOption[]
}

const DAYS_OF_WEEK = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
]

const DEFAULT_OPERATING_HOURS: OperatingHoursEntry[] = DAYS_OF_WEEK.map((day) => ({
    dayOfWeek: day.value,
    slotIndex: 0,
    openTime: "09:00",
    closeTime: "18:00",
    isClosed: day.value === 0, // Sunday closed by default
}))

export default function BranchesClient({ branches: initialBranches, allFeatures, allServices }: Props) {
    const fetchBranchExpandedData = async (id: string): Promise<BranchExpandedData | null> => {
        const [details, features, operatingHours, branchServicesData] = await Promise.all([
            getBranchDetails(id),
            getBranchFeatures(id),
            getBranchOperatingHours(id),
            getBranchServices(id),
        ])
        if (!details) return null
        return {
            details: details as BranchFull,
            features,
            operatingHours,
            branchServices: branchServicesData,
        }
    }

    const {
        items: branches,
        expandedData,
        loadingDetails,
        refreshList: refreshBranches,
        loadExpandedData,
    } = useExpandableTable<Branch, BranchExpandedData>({
        initialData: initialBranches,
        fetchList: getBranchesMinimal,
        fetchExpandedData: fetchBranchExpandedData,
    })

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
    const [formData, setFormData] = useState({ name: "", address: "", phone: "", email: "", pinCode: "", state: "" })
    const [featureAssignments, setFeatureAssignments] = useState<Record<string, boolean>>({})
    const [operatingHours, setOperatingHours] = useState<OperatingHoursEntry[]>(DEFAULT_OPERATING_HOURS)
    const [branchServiceAssignments, setBranchServiceAssignments] = useState<Record<string, { enabled: boolean; price: string; duration: string }>>({})
    const [activeTab, setActiveTab] = useState<"details" | "hours" | "features" | "services" | "holidays">("details")
    const [loadingFeatures, setLoadingFeatures] = useState(false)
    const [holidays, setHolidays] = useState<any[]>([])
    const [isAddingHoliday, setIsAddingHoliday] = useState(false)
    const [holidayForm, setHolidayForm] = useState({
        date: "",
        name: "",
        isFullDay: true,
        startTime: "09:00",
        endTime: "18:00",
        notes: "",
    })
    const { execute, isLoading, error, clearError } = useActionState<{ id: string } | void>()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Convert feature assignments to array format
        const featureAssignmentArray: FeatureAssignment[] = Object.entries(featureAssignments).map(
            ([featureId, isEnabled]) => ({ featureId, isEnabled })
        )

        // Convert service assignments to array format
        const branchServicesArray: BranchServiceAssignment[] = Object.entries(branchServiceAssignments)
            .filter(([, data]) => data.enabled)
            .map(([serviceId, data]) => ({
                serviceId,
                price: data.price ? Math.round(parseFloat(data.price) * 100) : null,
                duration: data.duration ? parseInt(data.duration) : null,
                isActive: true,
            }))

        const submitData = {
            ...formData,
            featureAssignments: featureAssignmentArray,
            operatingHours: operatingHours,
            branchServices: branchServicesArray,
        }

        if (editingBranch) {
            const result = await execute(updateBranch(editingBranch.id, submitData))
            if (result?.success) {
                await refreshBranches()
                closeModal()
            }
        } else {
            const result = await execute(createBranch(submitData))
            if (result?.success) {
                await refreshBranches()
                closeModal()
            }
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingBranch(null)
        setFormData({ name: "", address: "", phone: "", email: "", pinCode: "", state: "" })
        setFeatureAssignments({})
        setOperatingHours(DEFAULT_OPERATING_HOURS)
        setBranchServiceAssignments({})
        setHolidays([])
        setIsAddingHoliday(false)
        setHolidayForm({
            date: "",
            name: "",
            isFullDay: true,
            startTime: "09:00",
            endTime: "18:00",
            notes: "",
        })
        setActiveTab("details")
        clearError()
    }

    const handleDelete = async (branch: Branch) => {
        if (!confirm(`Are you sure you want to delete "${branch.name}"? This action cannot be undone.`)) {
            return
        }
        const result = await execute(deleteBranch(branch.id))
        if (result?.success) {
            await refreshBranches()
        }
    }


    const openEdit = async (branch: Branch) => {
        setEditingBranch(branch)
        setIsModalOpen(true)
        setActiveTab("details")

        // Load all expanded data - use returned data directly instead of reading from state
        const expanded = await loadExpandedData(branch.id, true) as BranchExpandedData | null

        setFormData({
            name: branch.name,
            address: expanded?.details.address || "",
            phone: expanded?.details.phone || "",
            email: expanded?.details.email || "",
            pinCode: expanded?.details.pinCode || "",
            state: branch.state || ""
        })

        // Set feature assignments from expanded data
        if (expanded?.features) {
            const assignments: Record<string, boolean> = {}
            expanded.features.forEach((f) => {
                assignments[f.featureId] = f.isEnabled ?? true
            })
            setFeatureAssignments(assignments)
        }

        // Set operating hours from expanded data
        if (expanded?.operatingHours && expanded.operatingHours.length > 0) {
            // Use the saved hours directly - they may have multiple slots per day
            // Ensure each day has at least one entry
            const hoursFromDb = expanded.operatingHours
            const daysWithHours = new Set(hoursFromDb.map(h => h.dayOfWeek))

            // Add default entries for days without any hours
            const missingDays = DAYS_OF_WEEK
                .filter(d => !daysWithHours.has(d.value))
                .map(d => ({
                    dayOfWeek: d.value,
                    slotIndex: 0,
                    openTime: "09:00",
                    closeTime: "18:00",
                    isClosed: d.value === 0, // Sunday closed by default
                }))

            setOperatingHours([...hoursFromDb, ...missingDays])
        } else {
            setOperatingHours(DEFAULT_OPERATING_HOURS)
        }

        // Set branch service assignments from expanded data
        if (expanded?.branchServices) {
            const serviceAssignments: Record<string, { enabled: boolean; price: string; duration: string }> = {}
            expanded.branchServices.forEach((bs: any) => {
                serviceAssignments[bs.serviceId] = {
                    enabled: true,
                    price: bs.branchPrice ? String(bs.branchPrice / 100) : "",
                    duration: bs.branchDuration ? String(bs.branchDuration) : "",
                }
            })
            setBranchServiceAssignments(serviceAssignments)
        }

        // Load holidays
        const holidaysData = await import("@/app/actions/holidays").then(m => m.getBranchHolidaysAction(branch.id))
        setHolidays(holidaysData)
    }

    const openCreate = () => {
        setEditingBranch(null)
        setFormData({ name: "", address: "", phone: "", email: "", pinCode: "", state: "" })
        // Default all features to enabled for new branches
        const defaultAssignments: Record<string, boolean> = {}
        allFeatures.forEach((f) => {
            defaultAssignments[f.id] = true
        })
        setFeatureAssignments(defaultAssignments)
        setOperatingHours(DEFAULT_OPERATING_HOURS)
        setBranchServiceAssignments({})
        setActiveTab("details")
        clearError()
        setIsModalOpen(true)
    }

    const toggleFeature = (featureId: string) => {
        setFeatureAssignments((prev) => ({
            ...prev,
            [featureId]: !prev[featureId],
        }))
    }

    const toggleAllFeatures = (enabled: boolean) => {
        const newAssignments: Record<string, boolean> = {}
        allFeatures.forEach((f) => {
            newAssignments[f.id] = enabled
        })
        setFeatureAssignments(newAssignments)
    }

    const updateOperatingHour = (dayOfWeek: number, slotIndex: number, field: keyof OperatingHoursEntry, value: string | boolean) => {
        setOperatingHours(prev => prev.map(hour =>
            hour.dayOfWeek === dayOfWeek && hour.slotIndex === slotIndex
                ? { ...hour, [field]: value }
                : hour
        ))
    }

    const addTimeSlot = (dayOfWeek: number) => {
        const existingSlots = operatingHours.filter(h => h.dayOfWeek === dayOfWeek)
        const maxSlotIndex = Math.max(...existingSlots.map(s => s.slotIndex), -1)
        setOperatingHours(prev => [...prev, {
            dayOfWeek,
            slotIndex: maxSlotIndex + 1,
            openTime: "09:00",
            closeTime: "18:00",
            isClosed: false,
        }])
    }

    const removeTimeSlot = (dayOfWeek: number, slotIndex: number) => {
        setOperatingHours(prev => prev.filter(h =>
            !(h.dayOfWeek === dayOfWeek && h.slotIndex === slotIndex)
        ))
    }

    const toggleDayClosed = (dayOfWeek: number, isClosed: boolean) => {
        if (isClosed) {
            // When closing a day, keep only slot 0 and mark it as closed
            setOperatingHours(prev => {
                const otherDays = prev.filter(h => h.dayOfWeek !== dayOfWeek)
                return [...otherDays, {
                    dayOfWeek,
                    slotIndex: 0,
                    openTime: "09:00",
                    closeTime: "18:00",
                    isClosed: true,
                }]
            })
        } else {
            // When opening a day, set first slot to open
            setOperatingHours(prev => prev.map(h =>
                h.dayOfWeek === dayOfWeek && h.slotIndex === 0
                    ? { ...h, isClosed: false }
                    : h
            ))
        }
    }

    // Group operating hours by day for easier rendering
    const hoursByDay = DAYS_OF_WEEK.map(day => {
        const slots = operatingHours
            .filter(h => h.dayOfWeek === day.value)
            .sort((a, b) => a.slotIndex - b.slotIndex)
        const isClosed = slots.length > 0 && slots[0].isClosed
        return { day, slots, isClosed }
    })

    const toggleServiceAssignment = (serviceId: string) => {
        setBranchServiceAssignments(prev => {
            if (prev[serviceId]?.enabled) {
                const { [serviceId]: removed, ...rest } = prev
                return { ...rest, [serviceId]: { ...removed, enabled: false } }
            }
            return {
                ...prev,
                [serviceId]: { enabled: true, price: "", duration: "" }
            }
        })
    }

    const updateServiceAssignment = (serviceId: string, field: "price" | "duration", value: string) => {
        setBranchServiceAssignments(prev => ({
            ...prev,
            [serviceId]: { ...prev[serviceId], [field]: value }
        }))
    }

    const enabledCount = Object.values(featureAssignments).filter(Boolean).length
    const enabledServicesCount = Object.values(branchServiceAssignments).filter(s => s.enabled).length

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    <Plus size={20} />
                    Add Branch
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="w-12"></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {branches.map((branch) => {
                            const expanded = expandedData[branch.id]
                            const branchFeatures = expanded?.features || []
                            const enabledFeatures = branchFeatures.filter((f: any) => f.isEnabled)

                            return (
                                <ExpandableTableRow
                                    key={branch.id}
                                    onExpand={() => loadExpandedData(branch.id)}
                                    isLoading={loadingDetails[branch.id]}
                                    columns={[
                                        <div className="font-medium text-gray-900">{branch.name}</div>,
                                        <div className="text-gray-500">{branch.state || "—"}</div>,
                                        branch.isActive ? (
                                            <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                                                <CheckCircle size={14} /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-red-600 text-xs">
                                                <XCircle size={14} /> Inactive
                                            </span>
                                        ),
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openEdit(branch); }}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Edit Branch"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(branch); }}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete Branch"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ]}
                                    expandedContent={
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <ExpandedDetailSection title="Contact Information">
                                                <ExpandedDetailRow label="Email" value={expanded?.details.email} />
                                                <ExpandedDetailRow label="Phone" value={expanded?.details.phone} />
                                                <ExpandedDetailRow label="Address" value={expanded?.details.address} />
                                                <ExpandedDetailRow label="Pin Code" value={expanded?.details.pinCode} />
                                                <ExpandedDetailRow label="State" value={expanded?.details.state} />
                                            </ExpandedDetailSection>

                                            <ExpandedDetailSection title="Operating Hours">
                                                {expanded?.operatingHours && expanded.operatingHours.length > 0 ? (
                                                    // Group by day and display multiple slots
                                                    DAYS_OF_WEEK.map(day => {
                                                        const daySlots = expanded.operatingHours
                                                            .filter((h: OperatingHoursEntry) => h.dayOfWeek === day.value)
                                                            .sort((a: OperatingHoursEntry, b: OperatingHoursEntry) => a.slotIndex - b.slotIndex)

                                                        if (daySlots.length === 0) return null

                                                        const isClosed = daySlots[0].isClosed
                                                        const slotsDisplay = isClosed
                                                            ? 'Closed'
                                                            : daySlots.map((h: OperatingHoursEntry) => `${h.openTime} - ${h.closeTime}`).join(', ')

                                                        return (
                                                            <ExpandedDetailRow
                                                                key={day.value}
                                                                label={day.label}
                                                                value={slotsDisplay}
                                                            />
                                                        )
                                                    })
                                                ) : (
                                                    <ExpandedDetailRow label="Hours" value="Not configured" />
                                                )}
                                            </ExpandedDetailSection>

                                            <ExpandedDetailSection title="Services Offered">
                                                <ExpandedDetailRow
                                                    label="Active Services"
                                                    value={`${expanded?.branchServices?.length || 0} services`}
                                                />
                                                {expanded?.branchServices && expanded.branchServices.length > 0 && (
                                                    <div className="mt-2">
                                                        <div className="flex flex-wrap gap-1">
                                                            {expanded.branchServices.slice(0, 5).map((bs: any) => (
                                                                <span key={bs.serviceId} className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                                                                    {bs.serviceName}
                                                                </span>
                                                            ))}
                                                            {expanded.branchServices.length > 5 && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                                                                    +{expanded.branchServices.length - 5} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </ExpandedDetailSection>

                                            <ExpandedDetailSection title="Features">
                                                <ExpandedDetailRow
                                                    label="Enabled Features"
                                                    value={`${enabledFeatures.length} / ${allFeatures.length}`}
                                                />
                                                {branchFeatures.length > 0 && (
                                                    <div className="mt-2">
                                                        <div className="flex flex-wrap gap-1">
                                                            {enabledFeatures.map((f: any) => {
                                                                const feature = allFeatures.find(af => af.id === f.featureId)
                                                                return (
                                                                    <span key={f.featureId} className="inline-flex items-center px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-800">
                                                                        {feature?.name}
                                                                    </span>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </ExpandedDetailSection>

                                            <ExpandedDetailSection title="Audit Information">
                                                <ExpandedDetailRow
                                                    label="Created"
                                                    value={expanded?.details.createdAt ? `${new Date(expanded.details.createdAt).toLocaleDateString()} by ${expanded.details.createdByName || 'Unknown'}` : '—'}
                                                />
                                                <ExpandedDetailRow
                                                    label="Last Updated"
                                                    value={expanded?.details.updatedAt ? `${new Date(expanded.details.updatedAt).toLocaleDateString()} by ${expanded.details.updatedByName || 'Unknown'}` : '—'}
                                                />
                                            </ExpandedDetailSection>
                                        </div>
                                    }
                                />
                            )
                        })}
                        {branches.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No branches found. Add one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">{editingBranch ? "Edit Branch" : "Add Branch"}</h2>

                        <ActionError error={error} onDismiss={clearError} className="mb-4" />

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 mb-6">
                            {[
                                { key: "details", label: "Details" },
                                { key: "hours", label: "Operating Hours", icon: Clock },
                                { key: "services", label: `Services (${enabledServicesCount})`, icon: Stethoscope },
                                { key: "features", label: `Features (${enabledCount})` },
                                { key: "holidays", label: `Holidays (${holidays.length})`, icon: Calendar },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1 ${activeTab === tab.key
                                        ? "border-indigo-500 text-indigo-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                >
                                    {tab.icon && <tab.icon size={14} />}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Branch Details Tab */}
                            {activeTab === "details" && (
                                <div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Branch Name *</label>
                                            <input
                                                type="text"
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input
                                                type="email"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Address</label>
                                            <textarea
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900"
                                                rows={2}
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">State</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900"
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Pin Code</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900"
                                                value={formData.pinCode}
                                                onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Operating Hours Tab */}
                            {activeTab === "hours" && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Configure when this branch is open for business. Add multiple time slots per day for breaks (e.g., 9:00-12:00 and 18:00-21:00).
                                    </p>
                                    <div className="space-y-4">
                                        {hoursByDay.map(({ day, slots, isClosed }) => (
                                            <div key={day.value} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-24 font-medium text-gray-700">{day.label}</div>
                                                        <label className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={isClosed}
                                                                onChange={(e) => toggleDayClosed(day.value, e.target.checked)}
                                                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                                            />
                                                            <span className="text-sm text-gray-600">Closed</span>
                                                        </label>
                                                    </div>
                                                    {!isClosed && (
                                                        <button
                                                            type="button"
                                                            onClick={() => addTimeSlot(day.value)}
                                                            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                                        >
                                                            <Plus size={14} />
                                                            Add Slot
                                                        </button>
                                                    )}
                                                </div>

                                                {!isClosed && (
                                                    <div className="space-y-2">
                                                        {slots.map((slot, idx) => (
                                                            <div key={slot.slotIndex} className="flex items-center gap-3 bg-white p-2 rounded border border-gray-100">
                                                                <span className="text-xs text-gray-400 w-16">Slot {idx + 1}</span>
                                                                <input
                                                                    type="time"
                                                                    value={slot.openTime}
                                                                    onChange={(e) => updateOperatingHour(day.value, slot.slotIndex, "openTime", e.target.value)}
                                                                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2 text-gray-900"
                                                                />
                                                                <span className="text-gray-400">to</span>
                                                                <input
                                                                    type="time"
                                                                    value={slot.closeTime}
                                                                    onChange={(e) => updateOperatingHour(day.value, slot.slotIndex, "closeTime", e.target.value)}
                                                                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2 text-gray-900"
                                                                />
                                                                {slots.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeTimeSlot(day.value, slot.slotIndex)}
                                                                        className="text-red-500 hover:text-red-700 p-1"
                                                                        title="Remove slot"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Services Tab */}
                            {activeTab === "services" && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-4">Select services offered at this branch. You can override pricing and duration for each service.</p>
                                    {allServices.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            No services available. Please add services from the Services menu first.
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {allServices.map((service) => {
                                                const assignment = branchServiceAssignments[service.id]
                                                const isEnabled = assignment?.enabled
                                                return (
                                                    <div
                                                        key={service.id}
                                                        className={`p-3 rounded-lg border transition-colors ${isEnabled ? "border-green-500 bg-green-50" : "border-gray-200"
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={isEnabled || false}
                                                                onChange={() => toggleServiceAssignment(service.id)}
                                                                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-gray-900">{service.name}</span>
                                                                    {service.code && (
                                                                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{service.code}</span>
                                                                    )}
                                                                    {service.category && (
                                                                        <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{service.category}</span>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    Default: {service.defaultDuration || 30} min | ₹{((service.defaultPrice || 0) / 100).toFixed(2)}
                                                                </div>
                                                                {isEnabled && (
                                                                    <div className="flex gap-4 mt-2">
                                                                        <div>
                                                                            <label className="text-xs text-gray-500">Price Override (₹)</label>
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                step="0.01"
                                                                                placeholder="Use default"
                                                                                value={assignment?.price || ""}
                                                                                onChange={(e) => updateServiceAssignment(service.id, "price", e.target.value)}
                                                                                className="mt-1 block w-28 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs border p-1.5 text-gray-900"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-xs text-gray-500">Duration Override (min)</label>
                                                                            <input
                                                                                type="number"
                                                                                min="5"
                                                                                step="5"
                                                                                placeholder="Use default"
                                                                                value={assignment?.duration || ""}
                                                                                onChange={(e) => updateServiceAssignment(service.id, "duration", e.target.value)}
                                                                                className="mt-1 block w-28 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs border p-1.5 text-gray-900"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Features Tab */}
                            {activeTab === "features" && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm text-gray-500">Select which features are enabled for this branch.</p>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => toggleAllFeatures(true)}
                                                className="text-xs text-indigo-600 hover:text-indigo-800"
                                            >
                                                Select All
                                            </button>
                                            <span className="text-gray-300">|</span>
                                            <button
                                                type="button"
                                                onClick={() => toggleAllFeatures(false)}
                                                className="text-xs text-indigo-600 hover:text-indigo-800"
                                            >
                                                Deselect All
                                            </button>
                                        </div>
                                    </div>

                                    {loadingFeatures ? (
                                        <div className="text-center py-4 text-gray-500 text-sm">Loading features...</div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {allFeatures.map((feature) => (
                                                <label
                                                    key={feature.id}
                                                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${featureAssignments[feature.id]
                                                        ? "border-indigo-500 bg-indigo-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={featureAssignments[feature.id] || false}
                                                        onChange={() => toggleFeature(feature.id)}
                                                        className="mt-0.5 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-gray-900">{feature.name}</div>
                                                        {feature.description && (
                                                            <div className="text-xs text-gray-500 truncate">{feature.description}</div>
                                                        )}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {allFeatures.length === 0 && !loadingFeatures && (
                                        <div className="text-center py-4 text-gray-500 text-sm">
                                            No features available. Please add features first.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Holidays Tab */}
                            {activeTab === "holidays" && editingBranch && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Manage branch holidays and closures. These will prevent appointment bookings on the specified dates.
                                    </p>

                                    {/* Add Holiday Button */}
                                    {!isAddingHoliday && (
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingHoliday(true)}
                                            className="mb-4 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
                                        >
                                            <Plus size={16} />
                                            Add Holiday
                                        </button>
                                    )}

                                    {/* Add Holiday Form */}
                                    {isAddingHoliday && (
                                        <div className="mb-4 p-4 border border-indigo-200 rounded-lg bg-indigo-50">
                                            <h4 className="text-sm font-medium text-gray-900 mb-3">New Holiday</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
                                                    <input
                                                        type="date"
                                                        value={holidayForm.date}
                                                        onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                                                    <input
                                                        type="text"
                                                        value={holidayForm.name}
                                                        onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                                                        placeholder="e.g., Christmas, Diwali"
                                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={holidayForm.isFullDay}
                                                            onChange={(e) => setHolidayForm({ ...holidayForm, isFullDay: e.target.checked })}
                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                        />
                                                        <span className="text-sm text-gray-700">Full day closure</span>
                                                    </label>
                                                </div>
                                                {!holidayForm.isFullDay && (
                                                    <>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                                                            <input
                                                                type="time"
                                                                value={holidayForm.startTime}
                                                                onChange={(e) => setHolidayForm({ ...holidayForm, startTime: e.target.value })}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                                                            <input
                                                                type="time"
                                                                value={holidayForm.endTime}
                                                                onChange={(e) => setHolidayForm({ ...holidayForm, endTime: e.target.value })}
                                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2"
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                                <div className="col-span-2">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                                                    <textarea
                                                        value={holidayForm.notes}
                                                        onChange={(e) => setHolidayForm({ ...holidayForm, notes: e.target.value })}
                                                        rows={2}
                                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2"
                                                        placeholder="Optional notes about this holiday"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 mt-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsAddingHoliday(false)
                                                        setHolidayForm({
                                                            date: "",
                                                            name: "",
                                                            isFullDay: true,
                                                            startTime: "09:00",
                                                            endTime: "18:00",
                                                            notes: "",
                                                        })
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        if (!holidayForm.date || !holidayForm.name) {
                                                            alert("Please fill in all required fields")
                                                            return
                                                        }
                                                        const { createBranchHoliday } = await import("@/app/actions/holidays")
                                                        const result = await createBranchHoliday(editingBranch.id, holidayForm)
                                                        if (result.success) {
                                                            const { getBranchHolidaysAction } = await import("@/app/actions/holidays")
                                                            const updatedHolidays = await getBranchHolidaysAction(editingBranch.id)
                                                            setHolidays(updatedHolidays)
                                                            setIsAddingHoliday(false)
                                                            setHolidayForm({
                                                                date: "",
                                                                name: "",
                                                                isFullDay: true,
                                                                startTime: "09:00",
                                                                endTime: "18:00",
                                                                notes: "",
                                                            })
                                                        } else {
                                                            alert(result.error?.message || "Failed to add holiday")
                                                        }
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                                                >
                                                    Add Holiday
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Holidays List */}
                                    {holidays.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 text-sm">
                                            No holidays configured. Add one to get started.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {holidays
                                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                .map((holiday) => (
                                                    <div
                                                        key={holiday.id}
                                                        className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-gray-900">{holiday.name}</span>
                                                                    {holiday.isFullDay ? (
                                                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                                                            Full Day
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                                                            {holiday.startTime} - {holiday.endTime}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-sm text-gray-600 mt-1">
                                                                    {new Date(holiday.date).toLocaleDateString('en-US', {
                                                                        weekday: 'long',
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric'
                                                                    })}
                                                                </div>
                                                                {holiday.notes && (
                                                                    <div className="text-xs text-gray-500 mt-1">{holiday.notes}</div>
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    if (!confirm(`Delete holiday "${holiday.name}"?`)) return
                                                                    const { deleteBranchHoliday } = await import("@/app/actions/holidays")
                                                                    const result = await deleteBranchHoliday(holiday.id, editingBranch.id)
                                                                    if (result.success) {
                                                                        const { getBranchHolidaysAction } = await import("@/app/actions/holidays")
                                                                        const updatedHolidays = await getBranchHolidaysAction(editingBranch.id)
                                                                        setHolidays(updatedHolidays)
                                                                    } else {
                                                                        alert(result.error?.message || "Failed to delete holiday")
                                                                    }
                                                                }}
                                                                className="text-red-600 hover:text-red-800"
                                                                title="Delete holiday"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Saving..." : editingBranch ? "Save Changes" : "Create Branch"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
