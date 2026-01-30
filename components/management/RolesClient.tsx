"use client"

import { useState, useEffect } from "react"
import { createRole, updateRole, deleteRole, getRolePermissions, getRoleDetails, getRolesMinimal } from "@/app/actions/roles"
import { getEnabledFeaturesForBranch } from "@/app/actions/branches"
import { Plus, Edit2, Trash2, Building, AlertCircle } from "lucide-react"
import { useFeaturePermissions } from "@/components/providers/PermissionsProvider"
import { useExpandableTable } from "@/hooks/useExpandableTable"
import PermissionsMatrix, { Feature, Permission } from "@/components/management/PermissionsMatrix"
import { ExpandableTableRow, ExpandedDetailRow, ExpandedDetailSection } from "@/components/ui"
import type { AuditDisplayInfo } from "@/types/audit"

type RoleMinimal = {
    id: string
    name: string
    branchId: string | null
    createdAt: Date | null
    updatedAt: Date | null
} & Partial<AuditDisplayInfo>

type RoleFull = RoleMinimal & {
    description: string | null
}

type RoleExpandedData = RoleFull

type Role = RoleMinimal

type Branch = {
    id: string
    name: string
}

interface RolesClientProps {
    roles: Role[]
    features: Feature[]
    adminRoleName: string
    isSuperUser: boolean
    currentBranchId?: string
    allBranches: Branch[]
    currentRoleId?: string
}

export default function RolesClient({
    roles: initialRoles,
    features: initialFeatures,
    adminRoleName,
    isSuperUser,
    currentBranchId,
    allBranches,
    currentRoleId = ""
}: RolesClientProps) {
    const { canAdd, canEdit, canDelete } = useFeaturePermissions("roles")
    const [filterBranchId, setFilterBranchId] = useState<string>(currentBranchId || "")
    
    const {
        items: roles,
        expandedData,
        loadingDetails,
        refreshList: refreshRoles,
        loadExpandedData,
    } = useExpandableTable<Role, RoleExpandedData>({
        initialData: initialRoles,
        fetchList: () => getRolesMinimal(filterBranchId || currentBranchId, isSuperUser),
        fetchExpandedData: getRoleDetails,
    })

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<Role | null>(null)
    const [formData, setFormData] = useState({ name: "", description: "", branchId: "" })
    const [permissions, setPermissions] = useState<Permission[]>([])
    
    // Branch-specific features for the modal
    const [modalFeatures, setModalFeatures] = useState<Feature[]>(initialFeatures)
    const [loadingFeatures, setLoadingFeatures] = useState(false)

    // Create a branch lookup map
    const branchMap = new Map(allBranches.map(b => [b.id, b.name]))


    // Load branch-specific features when branch selection changes in modal
    const loadBranchFeatures = async (branchId: string) => {
        if (!branchId) {
            setModalFeatures([])
            return
        }
        
        setLoadingFeatures(true)
        try {
            const branchFeatures = await getEnabledFeaturesForBranch(branchId)
            setModalFeatures(branchFeatures)
            
            // Filter existing permissions to only include features enabled for this branch
            const enabledFeatureIds = new Set(branchFeatures.map(f => f.id))
            setPermissions(prev => prev.filter(p => enabledFeatureIds.has(p.featureId)))
        } catch (error) {
            console.error("Failed to load branch features:", error)
            setModalFeatures([])
        } finally {
            setLoadingFeatures(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const roleData = {
                name: formData.name,
                description: formData.description,
                branchId: isSuperUser ? (formData.branchId || null) : (currentBranchId || null)
            }

            if (editingRole) {
                await updateRole(editingRole.id, roleData, permissions)
            } else {
                await createRole(roleData, permissions)
            }

            // Refresh roles list
            await refreshRoles()
            setIsModalOpen(false)
            setEditingRole(null)
            setFormData({ name: "", description: "", branchId: "" })
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
            // Refresh roles list
            await refreshRoles()
        } catch (error) {
            console.error(error)
            alert("Failed to delete role")
        }
    }

    const openEdit = async (role: Role) => {
        setEditingRole(role)
        setIsModalOpen(true)
        
        // Load full role details if not already loaded
        await loadExpandedData(role.id)
        const fullRole = expandedData[role.id]
        
        setFormData({
            name: role.name,
            description: fullRole?.description || "",
            branchId: role.branchId || ""
        })

        // Load branch-specific features first
        const branchId = role.branchId || currentBranchId || ""
        let enabledFeatureIds: Set<string> = new Set()
        
        if (branchId) {
            setLoadingFeatures(true)
            try {
                const branchFeatures = await getEnabledFeaturesForBranch(branchId)
                setModalFeatures(branchFeatures)
                enabledFeatureIds = new Set(branchFeatures.map(f => f.id))
            } catch (error) {
                console.error("Failed to load branch features:", error)
                setModalFeatures([])
            } finally {
                setLoadingFeatures(false)
            }
        } else {
            setModalFeatures(initialFeatures)
            enabledFeatureIds = new Set(initialFeatures.map(f => f.id))
        }

        // Load role permissions and filter by branch-enabled features
        try {
            const rolePerms = await getRolePermissions(role.id)
            const sanitized: Permission[] = rolePerms
                .filter(p => enabledFeatureIds.has(p.featureId)) // Only include permissions for enabled features
                .map(p => ({
                    featureId: p.featureId,
                    canView: p.canView ?? false,
                    canAdd: p.canAdd ?? false,
                    canEdit: p.canEdit ?? false,
                    canDelete: p.canDelete ?? false,
                }))
            setPermissions(sanitized)
        } catch (e) {
            console.error("Failed to load permissions", e)
            setPermissions([])
        }

        setIsModalOpen(true)
    }

    const openCreate = async () => {
        setEditingRole(null)
        const branchId = currentBranchId || ""
        setFormData({ name: "", description: "", branchId })
        setPermissions([])
        
        // Load branch-specific features for the default branch
        if (branchId) {
            await loadBranchFeatures(branchId)
        } else {
            setModalFeatures([])
        }
        
        setIsModalOpen(true)
    }
    
    // Handle branch change in the modal form
    const handleBranchChange = async (branchId: string) => {
        setFormData(prev => ({ ...prev, branchId }))
        await loadBranchFeatures(branchId)
    }

    const handleBranchFilterChange = async (branchId: string) => {
        setFilterBranchId(branchId)
        // Refresh page to reload with new filter
        window.location.href = window.location.pathname
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isSuperUser
                            ? "Manage roles across all branches. Use the filter to view branch-specific roles."
                            : "Manage roles for your current branch."}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Branch Filter for Super Users */}
                    {isSuperUser && allBranches.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Building size={16} className="text-gray-400" />
                            <select
                                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2"
                                value={filterBranchId}
                                onChange={(e) => handleBranchFilterChange(e.target.value)}
                            >
                                <option value="">All Branches</option>
                                {allBranches.map(branch => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

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
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="w-12"></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                            {isSuperUser && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                            )}
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {roles.map((role) => {
                            const fullRole = expandedData[role.id]
                            const isSystemAdmin = role.name === adminRoleName && role.branchId === null
                            

                            return (
                                <ExpandableTableRow
                                    key={role.id}
                                    onExpand={() => loadExpandedData(role.id)}
                                    isLoading={loadingDetails[role.id]}
                                    columns={[
                                        <div className="font-medium text-gray-900">{role.name}</div>,
                                        isSuperUser ? (
                                            role.branchId ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                                    {branchMap.get(role.branchId) || "Unknown"}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                                                    Global
                                                </span>
                                            )
                                        ) : null,
                                        <div className="flex justify-end gap-2">
                                            {canEdit && !isSystemAdmin && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openEdit(role); }}
                                                    className={`${role.id === currentRoleId ? 'text-gray-300 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-900'}`}
                                                    disabled={role.id === currentRoleId}
                                                    title={role.id === currentRoleId ? "You cannot edit your own role" : "Edit Role & Permissions"}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                            {canDelete && !isSystemAdmin && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(role.id); }}
                                                    className={`${role.id === currentRoleId ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:text-red-900'}`}
                                                    disabled={role.id === currentRoleId}
                                                    title={role.id === currentRoleId ? "You cannot delete your own role" : "Delete Role"}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            {isSystemAdmin && (
                                                <span className="text-xs text-gray-400 italic">
                                                    System Reserved
                                                </span>
                                            )}
                                        </div>
                                    ].filter(Boolean)}
                                    expandedContent={
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ExpandedDetailSection title="Role Information">
                                                <ExpandedDetailRow label="Name" value={role.name} />
                                                <ExpandedDetailRow label="Description" value={fullRole?.description} />
                                                <ExpandedDetailRow 
                                                    label="Branch" 
                                                    value={role.branchId ? branchMap.get(role.branchId) || "Unknown" : "Global"} 
                                                />
                                            </ExpandedDetailSection>
                                            

                                            <ExpandedDetailSection title="Audit Information">
                                                <ExpandedDetailRow 
                                                    label="Created" 
                                                    value={fullRole?.createdAt ? `${new Date(fullRole.createdAt).toLocaleDateString()} by ${fullRole.createdByName || 'Unknown'}` : '—'} 
                                                />
                                                <ExpandedDetailRow 
                                                    label="Last Updated" 
                                                    value={fullRole?.updatedAt ? `${new Date(fullRole.updatedAt).toLocaleDateString()} by ${fullRole.updatedByName || 'Unknown'}` : '—'} 
                                                />
                                            </ExpandedDetailSection>
                                        </div>
                                    }
                                />
                            )
                        })}
                        {roles.length === 0 && (
                            <tr>
                                <td colSpan={isSuperUser ? 4 : 3} className="px-6 py-8 text-center text-gray-500">
                                    No roles found. {filterBranchId ? "Try selecting a different branch filter." : "Click 'Add Role' to create one."}
                                </td>
                            </tr>
                        )}
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

                                {/* Branch Selection for Super Users */}
                                {isSuperUser && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Branch</label>
                                        <select
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900"
                                            value={formData.branchId}
                                            onChange={(e) => handleBranchChange(e.target.value)}
                                            required
                                            disabled={!!editingRole}
                                        >
                                            <option value="">Select Branch (Required)</option>
                                            {allBranches.map(branch => (
                                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {editingRole 
                                                ? "Branch cannot be changed after role creation."
                                                : "Role will be available only in this branch. Features shown below are based on branch enablement."}
                                        </p>
                                    </div>
                                )}

                                <div className={isSuperUser ? "col-span-2" : ""}>
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
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-medium text-gray-900">Feature Access</h3>
                                    {loadingFeatures && (
                                        <span className="text-sm text-gray-500">Loading features...</span>
                                    )}
                                </div>
                                
                                {!formData.branchId && isSuperUser ? (
                                    <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                                        <AlertCircle size={20} />
                                        <span className="text-sm">Please select a branch first to see available features.</span>
                                    </div>
                                ) : modalFeatures.length === 0 && !loadingFeatures ? (
                                    <div className="flex items-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                                        <AlertCircle size={20} />
                                        <span className="text-sm">No features are enabled for this branch. Please enable features in Branch settings first.</span>
                                    </div>
                                ) : (
                                    <div className="max-h-[60vh] overflow-y-auto">
                                        <PermissionsMatrix
                                            features={modalFeatures}
                                            value={permissions}
                                            onChange={setPermissions}
                                        />
                                    </div>
                                )}
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

