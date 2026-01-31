"use client"

import { useState } from "react"
import { createService, updateService, deleteService, getServiceDetails, getServicesMinimal, getServiceCategories } from "@/app/actions/services"
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Clock, DollarSign, Tag } from "lucide-react"
import { useActionState } from "@/hooks/useActionState"
import { useExpandableTable } from "@/hooks/useExpandableTable"
import { ActionError, ExpandableTableRow, ExpandedDetailRow, ExpandedDetailSection } from "@/components/ui"
import type { AuditDisplayInfo } from "@/types/audit"

type ServiceMinimal = {
    id: string
    name: string
    code: string | null
    category: string | null
    defaultDuration: number | null
    defaultPrice: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
}

type ServiceFull = ServiceMinimal & {
    description: string | null
    createdByName?: string | null
    updatedByName?: string | null
}

type Props = {
    services: ServiceMinimal[]
    categories: string[]
}

const SERVICE_CATEGORIES = [
    "Consultation",
    "Diagnostic",
    "Treatment",
    "Therapy",
    "Surgery",
    "Lab Test",
    "Imaging",
    "Other",
]

export default function ServicesClient({ services: initialServices, categories: initialCategories }: Props) {
    const {
        items: servicesList,
        expandedData,
        loadingDetails,
        refreshList: refreshServices,
        loadExpandedData,
    } = useExpandableTable<ServiceMinimal, ServiceFull>({
        initialData: initialServices,
        fetchList: getServicesMinimal,
        fetchExpandedData: getServiceDetails,
    })

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingService, setEditingService] = useState<ServiceMinimal | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
        category: "",
        defaultDuration: 30,
        defaultPrice: "",
        isActive: true,
    })
    const { execute, isLoading, error, clearError } = useActionState<{ id: string } | void>()

    // Merge existing categories with standard ones
    const allCategories = Array.from(new Set([...SERVICE_CATEGORIES, ...initialCategories])).sort()

    const resetForm = () => {
        setFormData({
            name: "",
            code: "",
            description: "",
            category: "",
            defaultDuration: 30,
            defaultPrice: "",
            isActive: true,
        })
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingService(null)
        resetForm()
        clearError()
    }

    const openCreate = () => {
        setEditingService(null)
        resetForm()
        clearError()
        setIsModalOpen(true)
    }

    const openEdit = async (service: ServiceMinimal) => {
        setEditingService(service)
        setIsModalOpen(true)

        // Load full details
        await loadExpandedData(service.id)
        const full = expandedData[service.id]

        setFormData({
            name: service.name,
            code: service.code || "",
            description: full?.description || "",
            category: service.category || "",
            defaultDuration: service.defaultDuration || 30,
            defaultPrice: service.defaultPrice ? String(service.defaultPrice / 100) : "",
            isActive: service.isActive !== false,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const submitData = {
            name: formData.name,
            code: formData.code || undefined,
            description: formData.description || undefined,
            category: formData.category || undefined,
            defaultDuration: formData.defaultDuration,
            defaultPrice: formData.defaultPrice ? Math.round(parseFloat(formData.defaultPrice) * 100) : undefined,
            isActive: formData.isActive,
        }

        if (editingService) {
            const result = await execute(updateService(editingService.id, submitData))
            if (result?.success) {
                await refreshServices()
                closeModal()
            }
        } else {
            const result = await execute(createService(submitData))
            if (result?.success) {
                await refreshServices()
                closeModal()
            }
        }
    }

    const handleDelete = async (service: ServiceMinimal) => {
        if (!confirm(`Are you sure you want to delete "${service.name}"? This will also remove it from all branches and staff assignments.`)) {
            return
        }
        const result = await execute(deleteService(service.id))
        if (result?.success) {
            await refreshServices()
        }
    }

    const formatPrice = (priceInCents: number | null) => {
        if (!priceInCents) return "—"
        return `₹${(priceInCents / 100).toFixed(2)}`
    }

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return "—"
        if (minutes < 60) return `${minutes} min`
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Services</h1>
                    <p className="text-sm text-gray-500 mt-1">Master catalog of services offered by the clinic</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    <Plus size={20} />
                    Add Service
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="w-12"></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {servicesList.map((service) => {
                            const expanded = expandedData[service.id]

                            return (
                                <ExpandableTableRow
                                    key={service.id}
                                    onExpand={() => loadExpandedData(service.id)}
                                    isLoading={loadingDetails[service.id]}
                                    columns={[
                                        <div>
                                            <div className="font-medium text-gray-900">{service.name}</div>
                                            {service.code && (
                                                <div className="text-xs text-gray-500">Code: {service.code}</div>
                                            )}
                                        </div>,
                                        <div className="text-gray-500">
                                            {service.category ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                                                    <Tag size={12} className="mr-1" />
                                                    {service.category}
                                                </span>
                                            ) : "—"}
                                        </div>,
                                        <div className="text-gray-500 flex items-center gap-1">
                                            <Clock size={14} />
                                            {formatDuration(service.defaultDuration)}
                                        </div>,
                                        <div className="text-gray-900 font-medium">
                                            {formatPrice(service.defaultPrice)}
                                        </div>,
                                        service.isActive ? (
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
                                                onClick={(e) => { e.stopPropagation(); openEdit(service); }}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Edit Service"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(service); }}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete Service"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ]}
                                    expandedContent={
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ExpandedDetailSection title="Service Details">
                                                <ExpandedDetailRow label="Name" value={service.name} />
                                                <ExpandedDetailRow label="Code" value={service.code || "—"} />
                                                <ExpandedDetailRow label="Category" value={service.category || "—"} />
                                                <ExpandedDetailRow label="Description" value={expanded?.description || "—"} />
                                            </ExpandedDetailSection>

                                            <ExpandedDetailSection title="Pricing & Duration">
                                                <ExpandedDetailRow label="Default Duration" value={formatDuration(service.defaultDuration)} />
                                                <ExpandedDetailRow label="Default Price" value={formatPrice(service.defaultPrice)} />
                                                <ExpandedDetailRow label="Status" value={service.isActive ? "Active" : "Inactive"} />
                                            </ExpandedDetailSection>

                                            <ExpandedDetailSection title="Audit Information">
                                                <ExpandedDetailRow
                                                    label="Created"
                                                    value={expanded?.createdAt ? `${new Date(expanded.createdAt).toLocaleDateString()} by ${expanded.createdByName || 'Unknown'}` : '—'}
                                                />
                                                <ExpandedDetailRow
                                                    label="Last Updated"
                                                    value={expanded?.updatedAt ? `${new Date(expanded.updatedAt).toLocaleDateString()} by ${expanded.updatedByName || 'Unknown'}` : '—'}
                                                />
                                            </ExpandedDetailSection>
                                        </div>
                                    }
                                />
                            )
                        })}
                        {servicesList.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No services found. Add one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">
                            {editingService ? "Edit Service" : "Add Service"}
                        </h2>

                        <ActionError error={error} onDismiss={clearError} className="mb-4" />

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Service Name *</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., General Consultation"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Service Code</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900 uppercase"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g., GC01"
                                        maxLength={10}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Optional short code for quick reference</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="">Select category...</option>
                                        {allCategories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900"
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description of the service..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Default Duration (minutes)</label>
                                    <input
                                        type="number"
                                        min="5"
                                        max="480"
                                        step="5"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900"
                                        value={formData.defaultDuration}
                                        onChange={(e) => setFormData({ ...formData, defaultDuration: parseInt(e.target.value) || 30 })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Default Price (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900"
                                        value={formData.defaultPrice}
                                        onChange={(e) => setFormData({ ...formData, defaultPrice: e.target.value })}
                                        placeholder="0.00"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Can be overridden per branch</p>
                                </div>

                                <div className="col-span-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Active</span>
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1 ml-6">Inactive services won't appear in branch/staff assignments</p>
                                </div>
                            </div>

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
                                    {isLoading ? "Saving..." : editingService ? "Save Changes" : "Create Service"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
