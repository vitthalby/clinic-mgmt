"use client"

import { useState, useEffect } from "react"
import { createBranch, updateBranch, getBranchFeatures } from "@/app/actions/branches"
import { Plus, Edit2, CheckCircle, XCircle, Settings } from "lucide-react"
import { useActionState } from "@/hooks/useActionState"
import { ActionError } from "@/components/ui"

type Feature = {
    id: string
    name: string
    key: string
    description: string | null
}

type Branch = {
    id: string
    name: string
    address: string | null
    phone: string | null
    email: string | null
    pinCode: string | null
    state: string | null
    isActive: boolean | null
    enabledFeaturesCount?: number
}

type FeatureAssignment = {
    featureId: string
    isEnabled: boolean
}

type Props = {
    branches: Branch[]
    allFeatures: Feature[]
}

export default function BranchesClient({ branches, allFeatures }: Props) {
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
                closeModal()
            }
        } else {
            const result = await execute(createBranch(submitData))
            if (result?.success) {
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

    const openEdit = async (branch: Branch) => {
        setEditingBranch(branch)
        setFormData({
            name: branch.name,
            address: branch.address || "",
            phone: branch.phone || "",
            email: branch.email || "",
            pinCode: branch.pinCode || "",
            state: branch.state || ""
        })
        
        // Load existing feature assignments
        setLoadingFeatures(true)
        try {
            const existingFeatures = await getBranchFeatures(branch.id)
            const assignments: Record<string, boolean> = {}
            existingFeatures.forEach((f) => {
                assignments[f.featureId] = f.isEnabled ?? true
            })
            setFeatureAssignments(assignments)
        } catch (err) {
            console.error("Failed to load branch features:", err)
        } finally {
            setLoadingFeatures(false)
        }
        
        setIsModalOpen(true)
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {branches.map((branch) => (
                            <tr key={branch.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {branch.name}
                                    <div className="text-xs text-gray-400">{branch.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div>{branch.phone}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="max-w-xs truncate">{branch.address}</div>
                                    <div className="text-xs">{branch.state} - {branch.pinCode}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                        <Settings size={12} />
                                        {branch.enabledFeaturesCount ?? 0} / {allFeatures.length}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {branch.isActive ? (
                                        <span className="flex items-center text-green-600 gap-1"><CheckCircle size={16} /> Active</span>
                                    ) : (
                                        <span className="flex items-center text-red-600 gap-1"><XCircle size={16} /> Inactive</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openEdit(branch)} className="text-indigo-600 hover:text-indigo-900">
                                        <Edit2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {branches.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
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
