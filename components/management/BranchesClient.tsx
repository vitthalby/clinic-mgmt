"use client"

import { useState, useEffect } from "react"
import { createBranch, updateBranch, deleteBranch, getBranchFeatures, getBranchDetails, getBranchesMinimal } from "@/app/actions/branches"
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react"
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
}

type Branch = BranchMinimal

type FeatureAssignment = {
    featureId: string
    isEnabled: boolean
}

type Props = {
    branches: Branch[]
    allFeatures: Feature[]
}

export default function BranchesClient({ branches: initialBranches, allFeatures }: Props) {
    const fetchBranchExpandedData = async (id: string): Promise<BranchExpandedData | null> => {
        const [details, features] = await Promise.all([
            getBranchDetails(id),
            getBranchFeatures(id)
        ])
        if (!details) return null
        return { details: details as BranchFull, features }
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
    const [loadingFeatures, setLoadingFeatures] = useState(false)
    const { execute, isLoading, error, clearError } = useActionState<{ id: string } | void>()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Convert feature assignments to array format
        const featureAssignmentArray: FeatureAssignment[] = Object.entries(featureAssignments).map(
            ([featureId, isEnabled]) => ({ featureId, isEnabled })
        )

        const submitData = {
            ...formData,
            featureAssignments: featureAssignmentArray,
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
        
        // Load all expanded data (details + features)
        await loadExpandedData(branch.id)
        const expanded = expandedData[branch.id]
        
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

    const enabledCount = Object.values(featureAssignments).filter(Boolean).length

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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ExpandedDetailSection title="Contact Information">
                                                <ExpandedDetailRow label="Email" value={expanded?.details.email} />
                                                <ExpandedDetailRow label="Phone" value={expanded?.details.phone} />
                                                <ExpandedDetailRow label="Address" value={expanded?.details.address} />
                                                <ExpandedDetailRow label="Pin Code" value={expanded?.details.pinCode} />
                                                <ExpandedDetailRow label="State" value={expanded?.details.state} />
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
                    <div className="bg-white rounded-lg p-6 max-w-3xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">{editingBranch ? "Edit Branch" : "Add Branch"}</h2>
                        
                        <ActionError error={error} onDismiss={clearError} className="mb-4" />
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Branch Details Section */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">Branch Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Branch Name</label>
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

                            {/* Features Section */}
                            <div>
                                <div className="flex items-center justify-between mb-3 pb-2 border-b">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Enabled Features
                                        <span className="ml-2 text-xs font-normal text-gray-500">
                                            ({enabledCount} of {allFeatures.length} selected)
                                        </span>
                                    </h3>
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
                                                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                    featureAssignments[feature.id]
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
