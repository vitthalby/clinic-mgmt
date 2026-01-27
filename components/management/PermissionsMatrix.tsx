"use client"

import { useEffect, useState } from "react"

export type Feature = {
    id: string
    name: string
    key: string
    description: string | null
    availableActions: string[] | null
}

export type Permission = {
    featureId: string
    canView: boolean
    canAdd: boolean
    canEdit: boolean
    canDelete: boolean
}

interface PermissionsMatrixProps {
    features: Feature[]
    value: Permission[]
    onChange: (permissions: Permission[]) => void
}

export default function PermissionsMatrix({ features, value, onChange }: PermissionsMatrixProps) {
    // Helper to get current permission state for a feature from value prop
    const getPerm = (featureId: string) => value.find(p => p.featureId === featureId) || {
        featureId,
        canView: false,
        canAdd: false,
        canEdit: false,
        canDelete: false
    }

    const handleToggle = (featureId: string, field: keyof Omit<Permission, 'featureId'>) => {
        const current = getPerm(featureId)
        const updated = { ...current, [field]: !current[field] }

        // Update value array
        const newValue = value.filter(p => p.featureId !== featureId).concat(updated)
        onChange(newValue)
    }

    // Toggle all for a feature
    const toggleRow = (featureId: string, toggleValue: boolean) => {
        const updated = {
            featureId,
            canView: toggleValue,
            canAdd: toggleValue,
            canEdit: toggleValue,
            canDelete: toggleValue
        }
        const newValue = value.filter(p => p.featureId !== featureId).concat(updated)
        onChange(newValue)
    }

    return (
        <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Add</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Edit</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Delete</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {features.map((feature) => {
                        const perm = getPerm(feature.id)
                        const allowed = feature.availableActions || ["view", "add", "edit", "delete"] // Fallback

                        return (
                            <tr key={feature.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {feature.name}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-center">
                                    {allowed.includes("view") && (
                                        <input
                                            type="checkbox"
                                            checked={perm.canView}
                                            onChange={() => handleToggle(feature.id, 'canView')}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    )}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-center">
                                    {allowed.includes("add") && (
                                        <input
                                            type="checkbox"
                                            checked={perm.canAdd}
                                            onChange={() => handleToggle(feature.id, 'canAdd')}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    )}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-center">
                                    {allowed.includes("edit") && (
                                        <input
                                            type="checkbox"
                                            checked={perm.canEdit}
                                            onChange={() => handleToggle(feature.id, 'canEdit')}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    )}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-center">
                                    {allowed.includes("delete") && (
                                        <input
                                            type="checkbox"
                                            checked={perm.canDelete}
                                            onChange={() => handleToggle(feature.id, 'canDelete')}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    )}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-center text-sm">
                                    <button
                                        type="button"
                                        onClick={() => toggleRow(feature.id, true)}
                                        className="text-blue-600 hover:text-blue-900 mr-2 text-xs"
                                    >
                                        All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleRow(feature.id, false)}
                                        className="text-gray-600 hover:text-gray-900 text-xs"
                                    >
                                        None
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
