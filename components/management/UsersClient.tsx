"use client"

import { useState, useMemo } from "react"
import { createUser, updateUser, deleteUser } from "@/app/actions/users"
import { Shield, Building, Edit2, Plus, Trash2 } from "lucide-react"

type UserBranch = {
    id: string
    name: string
}

type User = {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    email: string
    mobile: string | null
    dob: Date | null
    role: string | null
    image: string | null
    branches: UserBranch[]
}

type Branch = {
    id: string
    name: string
}

type Role = {
    id: string
    name: string
    description: string | null
}

export default function UsersClient({ users, allBranches, allRoles }: { users: User[], allBranches: Branch[], allRoles: Role[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        dob: "",
        roleName: "STAFF",
        branchIds: [] as string[]
    })

    const resetForm = () => {
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            mobile: "",
            dob: "",
            roleName: "STAFF",
            branchIds: []
        })
    }

    const openCreate = () => {
        setEditingUser(null)
        resetForm()
        setIsModalOpen(true)
    }

    const openEdit = (user: User) => {
        setEditingUser(user)
        setFormData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email,
            mobile: user.mobile || "",
            dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
            roleName: user.role || "STAFF",
            branchIds: user.branches.map(b => b.id)
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingUser) {
                await updateUser(editingUser.id, formData)
            } else {
                await createUser(formData)
            }
            setIsModalOpen(false)
            setEditingUser(null)
            resetForm()
        } catch (error) {
            console.error(error)
            alert("Failed to save user")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return
        try {
            await deleteUser(id)
        } catch (error) {
            console.error(error)
            alert("Failed to delete user")
        }
    }

    const toggleBranchSelection = (branchId: string) => {
        const current = formData.branchIds
        if (current.includes(branchId)) {
            setFormData({ ...formData, branchIds: current.filter(id => id !== branchId) })
        } else {
            setFormData({ ...formData, branchIds: [...current, branchId] })
        }
    }

    const isAdminSelected = formData.roleName === 'ADMIN'

    const availableRoles = useMemo(() => {
        // Ensure standard roles exist if DB is empty or just use DB roles
        // We expect DB to have roles, but if "Legacy" strings are used, we might need to handle manual entry or mapping.
        // If allRoles is empty, fallback to hardcoded
        if (allRoles.length === 0) return [{ id: 'admin', name: 'ADMIN' }, { id: 'staff', name: 'STAFF' }]
        return allRoles
    }, [allRoles])

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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branches</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            {user.image ? (
                                                <img className="h-10 w-10 rounded-full" src={user.image} alt="" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                    {(user.firstName && user.firstName[0]) || (user.name && user.name[0]) || user.email[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.name}</div>
                                            <div className="text-xs text-gray-500">Born: {user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{user.email}</div>
                                    <div className="text-sm text-gray-500">{user.mobile || '-'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.role === 'ADMIN' ? (
                                        <span className="text-gray-400 italic">All Branches (Admin)</span>
                                    ) : user.branches.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {user.branches.map(b => (
                                                <span key={b.id} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                                    {b.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-red-400 italic">No Branch</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openEdit(user)} className="text-indigo-600 hover:text-indigo-900 mr-4" title="Edit">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900" title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
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

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                    value={formData.roleName}
                                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                                >
                                    {availableRoles.map(role => (
                                        <option key={role.id} value={role.name}>{role.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Admins have full access to all branches.
                                </p>
                            </div>

                            {/* Branch Selection */}
                            <div className={`transition-opacity ${isAdminSelected ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Branches {isAdminSelected && '(Not required for Admin)'}</label>
                                <div className="border rounded-md p-3 max-h-40 overflow-y-auto bg-gray-50">
                                    {allBranches.map(branch => (
                                        <div key={branch.id} className="flex items-center mb-2">
                                            <input
                                                id={`branch-${branch.id}`}
                                                type="checkbox"
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                checked={formData.branchIds.includes(branch.id)}
                                                onChange={() => toggleBranchSelection(branch.id)}
                                            />
                                            <label htmlFor={`branch-${branch.id}`} className="ml-2 block text-sm text-gray-900 cursor-pointer">
                                                {branch.name}
                                            </label>
                                        </div>
                                    ))}
                                    {allBranches.length === 0 && <p className="text-gray-500 italic">No branches available.</p>}
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
                                    {editingUser ? "Save Changes" : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
