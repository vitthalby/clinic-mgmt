"use client"

import { useState, useEffect } from "react"
import { updateRolePermissions } from "@/app/actions/roles"
import { useRouter } from "next/navigation"

type Feature = {
    id: string
    name: string
    key: string
    description: string | null
}

type Permission = {
    featureId: string
    canView: boolean
    canAdd: boolean
    canEdit: boolean
    canDelete: boolean
}

interface RolePermissionsFormProps {
    roleId: string
    features: Feature[]
    initialPermissions: Permission[]
}

export default function RolePermissionsForm({ roleId, features, initialPermissions }: RolePermissionsFormProps) {
    const [permissions, setPermissions] = useState<Record<string, Permission>>({})
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const initial: Record<string, Permission> = {}
        features.forEach(f => {
            const existing = initialPermissions.find(p => p.featureId === f.id)
            initial[f.id] = existing ? {
                featureId: f.id,
                canView: existing.canView ?? false,
                canAdd: existing.canAdd ?? false,
                canEdit: existing.canEdit ?? false,
                canDelete: existing.canDelete ?? false
            } : {
                featureId: f.id,
                canView: false,
                canAdd: false,
                canEdit: false,
                canDelete: false
            }
        })
        setPermissions(initial)
    }, [features, initialPermissions])

    const handleToggle = (featureId: string, field: keyof Omit<Permission, 'featureId'>) => {
        setPermissions(prev => ({
            ...prev,
            [featureId]: {
                ...prev[featureId],
                [field]: !prev[featureId][field]
            }
        }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await updateRolePermissions(roleId, Object.values(permissions))
            alert("Permissions saved successfully")
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Failed to save permissions")
        } finally {
            setIsSaving(false)
        }
    }

    // Toggle all for a feature
    const toggleRow = (featureId: string, value: boolean) => {
        setPermissions(prev => ({
            ...prev,
            [featureId]: {
                featureId,
                canView: value,
                canAdd: value,
                canEdit: value,
                canDelete: value
            }
        }))
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Add</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Edit</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Delete</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {features.map((feature) => {
                            const perm = permissions[feature.id] || { canView: false, canAdd: false, canEdit: false, canDelete: false }
                            return (
                                <tr key={feature.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {feature.name}
                                        <p className="text-xs text-gray-500 font-normal">{feature.description}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <input
                                            type="checkbox"
                                            checked={perm.canView}
                                            onChange={() => handleToggle(feature.id, 'canView')}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <input
                                            type="checkbox"
                                            checked={perm.canAdd}
                                            onChange={() => handleToggle(feature.id, 'canAdd')}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <input
                                            type="checkbox"
                                            checked={perm.canEdit}
                                            onChange={() => handleToggle(feature.id, 'canEdit')}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <input
                                            type="checkbox"
                                            checked={perm.canDelete}
                                            onChange={() => handleToggle(feature.id, 'canDelete')}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                        <button onClick={() => toggleRow(feature.id, true)} className="text-blue-600 hover:text-blue-900 mr-2">All</button>
                                        <button onClick={() => toggleRow(feature.id, false)} className="text-gray-600 hover:text-gray-900">None</button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
