"use client"

import { useState } from "react"
import { createRole, updateRole, deleteRole, getRolePermissions } from "@/app/actions/roles"
import { Plus, Edit2, Trash2 } from "lucide-react" // Removed ShieldCheck
import { useFeaturePermissions } from "@/components/providers/PermissionsProvider"
import PermissionsMatrix, { Feature, Permission } from "@/components/management/PermissionsMatrix"

type Role = {
    id: string
    name: string
    description: string | null
    createdAt: Date | null
}

export default function RolesClient({ roles, features, adminRoleName }: { roles: Role[], features: Feature[], adminRoleName: string }) {
    const { canAdd, canEdit, canDelete } = useFeaturePermissions("roles")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<Role | null>(null)
    const [formData, setFormData] = useState({ name: "", description: "" })
    const [permissions, setPermissions] = useState<Permission[]>([])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingRole) {
                // For update, we pass permissions
                await updateRole(editingRole.id, formData, permissions)
            } else {
                // For create, we pass permissions
                await createRole(formData, permissions)
            }
            setIsModalOpen(false)
            setEditingRole(null)
            setFormData({ name: "", description: "" })
            setPermissions([])
        } catch (error) {
            console.error(error)
            alert("Failed to save role")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this role?")) return
        try {
            await deleteRole(id)
        } catch (error) {
            console.error(error)
            alert("Failed to delete role")
        }
    }

    const openEdit = async (role: Role) => {
        setEditingRole(role)
        setFormData({
            name: role.name,
            description: role.description || ""
        })

        // Fetch current permissions for this role
        // Ideally this should be optimized, but client-side fetch on open is okay for admin panel
        try {
            const rolePerms = await getRolePermissions(role.id)
            const sanitized: Permission[] = rolePerms.map(p => ({
                featureId: p.featureId,
                canView: p.canView ?? false,
                canAdd: p.canAdd ?? false,
                canEdit: p.canEdit ?? false,
                canDelete: p.canDelete ?? false,
            }))
            // Merge with all features to ensure we have entries for new features
            // Actually PermissionsMatrix handles "missing" entries if we just pass what we have? 
            // The PermissionsMatrix `getPerm` handles defaults. But `value` prop is state.
            // If I set `permissions` state to just what's in DB, the Matrix will show defaults for others BUT
            // if I toggle one, the state update logic in Matrix needs to be robust. 
            // My Matrix component concats new values. It's safe.
            setPermissions(sanitized)
        } catch (e) {
            console.error("Failed to load permissions", e)
            setPermissions([])
        }

        setIsModalOpen(true)
    }

    const openCreate = () => {
        setEditingRole(null)
        setFormData({ name: "", description: "" })
        setPermissions([])
        setIsModalOpen(true)
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage user roles and configure their access permissions for each feature.</p>
                </div>
                {canAdd && (
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                        <Plus size={20} />
                        Add Role
                    </button>
                )}
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {roles.map((role) => {
                            const isSystemAdmin = role.name === adminRoleName;
                            return (
                                <tr key={role.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            {/* Removed standalone Permissions button as requested, integrated into Edit */}
                                            {canEdit && !isSystemAdmin && (
                                                <button onClick={() => openEdit(role)} className="text-indigo-600 hover:text-indigo-900 mx-2" title="Edit Role & Permissions">
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                            {canDelete && !isSystemAdmin && (
                                                <button onClick={() => handleDelete(role.id)} className="text-red-600 hover:text-red-900" title="Delete Role">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            {isSystemAdmin && (
                                                <span className="text-xs text-gray-400 italic px-2">System Reserved</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full shadow-xl my-8">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">{editingRole ? "Edit Role & Permissions" : "Add Role & Permissions"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Role Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Feature Access</h3>
                                <div className="max-h-[60vh] overflow-y-auto">
                                    <PermissionsMatrix
                                        features={features}
                                        value={permissions}
                                        onChange={setPermissions}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                                >
                                    {editingRole ? "Save All Changes" : "Create Role"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
