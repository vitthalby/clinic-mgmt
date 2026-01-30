"use client"

import { useState, useMemo, useEffect } from "react"
import { createUser, updateUser, deleteUser, getRolesForBranch, getUserDetails, getUsersMinimal, BranchRoleAssignment } from "@/app/actions/users"
import { Shield, Building, Edit2, Plus, Trash2 } from "lucide-react"
import { useExpandableTable } from "@/hooks/useExpandableTable"
import { ExpandableTableRow, ExpandedDetailRow, ExpandedDetailSection } from "@/components/ui"
import type { AuditDisplayInfo } from "@/types/audit"

type UserMinimal = {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    email: string
    role: string | null
}

type UserFull = UserMinimal & {
    mobile: string | null
    dob: Date | null
    image: string | null
    branches: Array<{
        id: string
        name: string
        roleId: string
        roleName: string
    }>
}

type UserExpandedData = UserFull

type User = UserMinimal

type Branch = {
    id: string
    name: string
}

type Role = {
    id: string
    name: string
    description: string | null
    branchId: string | null
}

interface UsersClientProps {
    users: User[]
    allBranches: Branch[]
    allRoles: Role[]
    adminRoleName: string
    isSuperUser?: boolean
    currentUserId?: string
}

type BranchRoleFormEntry = {
    branchId: string
    roleId: string
    enabled: boolean
    availableRoles: Role[]
}

export default function UsersClient({
    users: initialUsers,
    allBranches,
    allRoles,
    adminRoleName,
    isSuperUser = false,
    currentUserId = ""
}: UsersClientProps) {
    const {
        items: users,
        expandedData,
        loadingDetails,
        refreshList: refreshUsers,
        loadExpandedData,
    } = useExpandableTable<User, UserExpandedData>({
        initialData: initialUsers,
        fetchList: () => getUsersMinimal(undefined, isSuperUser), // TODO: Add branch filtering
        fetchExpandedData: getUserDetails,
    })

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        dob: "",
        isAdmin: false,
    })

    // Branch-Role assignment state for super user view
    const [branchRoleEntries, setBranchRoleEntries] = useState<BranchRoleFormEntry[]>([])

    // Initialize branch-role entries when modal opens
    const initializeBranchRoleEntries = async (user?: User) => {
        const entries: BranchRoleFormEntry[] = []

        for (const branch of allBranches) {
            // Find if user is assigned to this branch
            const existingAssignment = user?.branches.find(b => b.id === branch.id)

            // Get roles available for this branch
            const branchRoles = allRoles.filter(r =>
                r.branchId === branch.id || (r.branchId === null && r.name !== adminRoleName)
            )

            entries.push({
                branchId: branch.id,
                roleId: existingAssignment?.roleId || "",
                enabled: !!existingAssignment || (!isSuperUser && allBranches.length === 1),
                availableRoles: branchRoles
            })
        }

        setBranchRoleEntries(entries)
    }

    const resetForm = () => {
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            mobile: "",
            dob: "",
            isAdmin: false,
        })
        setBranchRoleEntries([])
        setError(null)
    }

    const openCreate = () => {
        setEditingUser(null)
        resetForm()
        initializeBranchRoleEntries()
        setIsModalOpen(true)
    }

    const openEdit = async (user: User) => {
        setEditingUser(user)
        setIsModalOpen(true)
        
        // Load full user details if not already loaded
        await loadExpandedData(user.id)
        const fullUser = expandedData[user.id]
        
        const isAdmin = user.role === adminRoleName
        setFormData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email,
            mobile: fullUser?.mobile || "",
            dob: fullUser?.dob ? new Date(fullUser.dob).toISOString().split('T')[0] : "",
            isAdmin: isAdmin,
        })
        if (!isAdmin) {
            initializeBranchRoleEntries(fullUser || user)
        }
        setIsModalOpen(true)
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Build branch-role assignments from enabled entries
        const branchRoleAssignments: BranchRoleAssignment[] = branchRoleEntries
            .filter(entry => entry.enabled && entry.roleId)
            .map(entry => ({
                branchId: entry.branchId,
                roleId: entry.roleId
            }))

        // Validation: Non-Admin must have at least one branch-role assignment
        if (!formData.isAdmin && branchRoleAssignments.length === 0) {
            setError("Please assign at least one branch with a role for this user.")
            return
        }

        // Check for branches enabled without role selection
        const incompleteAssignments = branchRoleEntries.filter(entry => entry.enabled && !entry.roleId)
        if (incompleteAssignments.length > 0) {
            setError("Please select a role for all enabled branches.")
            return
        }

        setIsSubmitting(true)
        try {
            const userData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                mobile: formData.mobile,
                dob: formData.dob,
                roleName: formData.isAdmin ? adminRoleName : undefined,
                branchRoleAssignments: formData.isAdmin ? undefined : branchRoleAssignments,
            }

            if (editingUser) {
                await updateUser(editingUser.id, userData)
            } else {
                await createUser(userData)
            }
            
            // Refresh users list
            await refreshUsers()
            setIsModalOpen(false)
            setEditingUser(null)
            resetForm()

        } catch (error: any) {
            console.error(error)
            setError(error.message || "Failed to save user")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return
        try {
            await deleteUser(id)
            // Refresh users list
            await refreshUsers()
        } catch (error) {
            console.error(error)
            alert("Failed to delete user")
        }
    }

    const toggleBranchEnabled = (branchId: string) => {
        setBranchRoleEntries(prev =>
            prev.map(entry =>
                entry.branchId === branchId
                    ? { ...entry, enabled: !entry.enabled, roleId: entry.enabled ? "" : entry.roleId }
                    : entry
            )
        )
    }

    const updateBranchRole = (branchId: string, roleId: string) => {
        setBranchRoleEntries(prev =>
            prev.map(entry =>
                entry.branchId === branchId
                    ? { ...entry, roleId }
                    : entry
            )
        )
    }

    const branchMap = new Map(allBranches.map(b => [b.id, b.name]))

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    <Plus size={20} />
                    Add Staff
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="w-12"></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => {
                            const fullUser = expandedData[user.id]
                            const isAdmin = user.role === adminRoleName
                            
                            return (
                                <ExpandableTableRow
                                    key={user.id}
                                    onExpand={() => loadExpandedData(user.id)}
                                    isLoading={loadingDetails[user.id]}
                                    columns={[
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                {fullUser?.image ? (
                                                    <img className="h-10 w-10 rounded-full" src={fullUser.image} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                        {(user.firstName && user.firstName[0]) || (user.name && user.name[0]) || user.email[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.name}</div>
                                                <div className="text-xs text-gray-500" suppressHydrationWarning>Born: {fullUser?.dob ? new Date(fullUser.dob).toLocaleDateString() : 'N/A'}</div>
                                            </div>
                                        </div>,
                                        <div className="text-sm text-gray-900">{user.email}</div>,
                                        isAdmin ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                {user.role}
                                            </span>
                                        ) : (
                                            <div className="flex flex-col gap-1">
                                                {isSuperUser ? (
                                                    // Super users see first 2 branch roles
                                                    fullUser?.branches && fullUser.branches.length > 0 ? (
                                                        fullUser.branches.slice(0, 2).map(b => (
                                                            <span key={b.id} className="text-xs text-gray-600">
                                                                {b.roleName || 'No Role'}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">No assignments</span>
                                                    )
                                                ) : (
                                                    // Non-super users only see role for CURRENT branch
                                                    fullUser?.branches && fullUser.branches.length > 0 ? (
                                                        <span className="text-xs text-gray-900 font-medium">
                                                            {fullUser.branches[0].roleName || 'No Role'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">No assignment</span>
                                                    )
                                                )}
                                                {isSuperUser && fullUser?.branches && fullUser.branches.length > 2 && (
                                                    <span className="text-xs text-gray-400">+{fullUser.branches.length - 2} more</span>
                                                )}
                                            </div>
                                        ),
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openEdit(user); }}
                                                className={`${user.id === currentUserId ? 'text-gray-300 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-900'}`}
                                                disabled={user.id === currentUserId}
                                                title={user.id === currentUserId ? "You cannot edit yourself" : "Edit"}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(user.id); }}
                                                className={`${user.id === currentUserId ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:text-red-900'}`}
                                                disabled={user.id === currentUserId}
                                                title={user.id === currentUserId ? "You cannot delete yourself" : "Delete"}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ].filter(Boolean)}
                                    expandedContent={
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ExpandedDetailSection title="Personal Information">
                                                <ExpandedDetailRow label="Full Name" value={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name} />
                                                <ExpandedDetailRow label="Email" value={user.email} />
                                                <ExpandedDetailRow label="Mobile" value={fullUser?.mobile || '—'} />
                                                <ExpandedDetailRow label="Date of Birth" value={fullUser?.dob ? new Date(fullUser.dob).toLocaleDateString() : '—'} />
                                            </ExpandedDetailSection>
                                            
                                            <ExpandedDetailSection title="Branch Assignments">
                                                {fullUser?.branches && fullUser.branches.length > 0 ? (
                                                    fullUser.branches.map(branch => (
                                                        <ExpandedDetailRow 
                                                            key={branch.id}
                                                            label={branch.name} 
                                                            value={branch.roleName} 
                                                        />
                                                    ))
                                                ) : (
                                                    <ExpandedDetailRow label="Assignments" value="No branch assignments" />
                                                )}
                                            </ExpandedDetailSection>
                                        </div>
                                    }
                                />
                            )
                        })}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">{editingUser ? "Edit User" : "Add New User"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Personal Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Email (Login ID)</label>
                                    <input
                                        type="email"
                                        required
                                        disabled={!!editingUser}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 ${editingUser ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mobile</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <input
                                        type="date"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                    />
                                </div>
                            </div>

                            <hr className="my-4" />

                            {/* Admin Toggle (Super User Only) */}
                            {isSuperUser && (
                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-md border border-purple-100">
                                    <input
                                        id="isAdmin"
                                        type="checkbox"
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                        checked={formData.isAdmin}
                                        onChange={(e) => {
                                            setFormData({ ...formData, isAdmin: e.target.checked })
                                            if (e.target.checked) {
                                                setBranchRoleEntries([])
                                            } else {
                                                initializeBranchRoleEntries(editingUser || undefined)
                                            }
                                        }}
                                    />
                                    <label htmlFor="isAdmin" className="text-sm font-medium text-purple-800">
                                        <Shield size={16} className="inline mr-1" />
                                        Grant Super Admin Access
                                    </label>
                                    <span className="text-xs text-purple-600 ml-auto">Full access to all branches</span>
                                </div>
                            )}

                            {/* Branch-Role Assignment (Super User Matrix or Simple Dropdown) */}
                            {!formData.isAdmin && (
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        {isSuperUser ? <Building size={16} className="mr-1" /> : <Shield size={16} className="mr-1" />}
                                        {isSuperUser ? "Assign Branches & Roles" : "Assign Role"}
                                        <span className="ml-1 text-red-500 text-xs font-bold">*Required</span>
                                    </label>

                                    {isSuperUser ? (
                                        <div className={`border rounded-md p-3 bg-gray-50 space-y-2 ${branchRoleEntries.filter(e => e.enabled).length === 0 ? 'border-red-200 ring-1 ring-red-100' : ''}`}>
                                            {allBranches.length === 0 ? (
                                                <p className="text-gray-500 italic">No branches available.</p>
                                            ) : (
                                                allBranches.map(branch => {
                                                    const entry = branchRoleEntries.find(e => e.branchId === branch.id)
                                                    if (!entry) return null

                                                    return (
                                                        <div key={branch.id} className={`flex items-center gap-3 p-2 rounded ${entry.enabled ? 'bg-white border border-indigo-100' : ''}`}>
                                                            <input
                                                                id={`branch-${branch.id}`}
                                                                type="checkbox"
                                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                checked={entry.enabled}
                                                                onChange={() => toggleBranchEnabled(branch.id)}
                                                            />
                                                            <label htmlFor={`branch-${branch.id}`} className="text-sm text-gray-900 font-medium w-32 cursor-pointer">
                                                                {branch.name}
                                                            </label>
                                                            <select
                                                                className={`flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2 ${!entry.enabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                                value={entry.roleId}
                                                                onChange={(e) => updateBranchRole(branch.id, e.target.value)}
                                                                disabled={!entry.enabled}
                                                            >
                                                                <option value="">Select Role...</option>
                                                                {entry.availableRoles.map(role => (
                                                                    <option key={role.id} value={role.id}>{role.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>
                                    ) : (
                                        // Simple dropdown for non-super users
                                        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                            {allBranches.length > 0 && branchRoleEntries[0] ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">For Branch: {allBranches[0].name}</span>
                                                    <select
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                                        value={branchRoleEntries[0].roleId}
                                                        onChange={(e) => updateBranchRole(branchRoleEntries[0].branchId, e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select Role...</option>
                                                        {branchRoleEntries[0].availableRoles.map(role => (
                                                            <option key={role.id} value={role.id}>{role.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No branch context available.</p>
                                            )}
                                        </div>
                                    )}

                                    {branchRoleEntries.filter(e => e.enabled).length === 0 && (
                                        <p className="text-xs text-red-500 mt-1">Staff must be assigned a role.</p>
                                    )}
                                </div>
                            )}


                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
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
                                    ) : (
                                        editingUser ? "Save Changes" : "Create User"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

