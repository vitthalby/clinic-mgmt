"use client"

import { useState, useMemo, useEffect } from "react"
import { createUser, updateUser, deleteUser, getRolesForBranch, getUserDetails, getUsersMinimal, BranchRoleAssignment, getStaffQualifications, getStaffWorkingHours, getStaffServices, saveStaffQualifications, saveStaffWorkingHours, saveStaffServices, getAvailableServicesForStaffBranch, QualificationEntry, WorkingHoursEntry, StaffServiceAssignment, getStaffServiceCategories, saveStaffServiceCategories, getAvailableServiceCategoriesForBranch, ServiceCategoryAssignment } from "@/app/actions/users"
import { getBranchOperatingHours, OperatingHoursEntry } from "@/app/actions/branches"
import { Shield, Building, Edit2, Plus, Trash2, Clock, GraduationCap, Stethoscope, AlertCircle } from "lucide-react"
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
    canTakeAppointments: boolean | null
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

type UserExpandedData = UserFull & {
    qualifications?: QualificationEntry[]
    workingHours?: WorkingHoursEntry[]
    staffServices?: StaffServiceAssignment[]
    staffServiceCategories?: ServiceCategoryAssignment[]
}

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

type BranchService = {
    serviceId: string
    serviceName: string
    serviceCode: string | null
    serviceCategory: string | null
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

const QUALIFICATION_TYPES = [
    { value: "degree", label: "Degree" },
    { value: "certificate", label: "Certificate" },
    { value: "license", label: "License" },
    { value: "specialization", label: "Specialization" },
]

interface UsersClientProps {
    users: User[]
    allBranches: Branch[]
    allRoles: Role[]
    adminRoleName: string
    isSuperUser?: boolean
    currentUserId?: string
    currentBranchId?: string
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
    currentUserId = "",
    currentBranchId
}: UsersClientProps) {
    // Fetch extended user data including qualifications, working hours, and services
    const fetchUserExtendedData = async (userId: string): Promise<UserExpandedData | null> => {
        const [userDetails, qualifications, workingHours, staffServicesData, staffCategoriesData] = await Promise.all([
            getUserDetails(userId),
            getStaffQualifications(userId),
            getStaffWorkingHours(userId),
            getStaffServices(userId),
            getStaffServiceCategories(userId),
        ])
        if (!userDetails) return null
        return {
            ...userDetails,
            qualifications,
            workingHours,
            staffServices: staffServicesData,
            staffServiceCategories: staffCategoriesData,
        }
    }

    const {
        items: users,
        expandedData,
        loadingDetails,
        refreshList: refreshUsers,
        loadExpandedData,
    } = useExpandableTable<User, UserExpandedData>({
        initialData: initialUsers,
        fetchList: () => getUsersMinimal(currentBranchId, isSuperUser),
        fetchExpandedData: fetchUserExtendedData,
    })

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<"details" | "qualifications" | "workingHours" | "services">("details")

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        dob: "",
        isAdmin: false,
        canTakeAppointments: false,
    })

    // Qualifications state
    const [qualifications, setQualifications] = useState<QualificationEntry[]>([])

    // Working hours state
    const [workingHours, setWorkingHours] = useState<WorkingHoursEntry[]>([])

    // Branch operating hours for validation (branchId -> hours)
    const [branchOperatingHoursMap, setBranchOperatingHoursMap] = useState<Record<string, OperatingHoursEntry[]>>({})

    // Staff services state
    const [staffServiceAssignments, setStaffServiceAssignments] = useState<Record<string, string[]>>({}) // branchId -> serviceId[]
    // const [staffCategoryAssignments, setStaffCategoryAssignments] = useState<Record<string, string[]>>({}) // REMOVED: Derived from service assignments
    const [branchServicesMap, setBranchServicesMap] = useState<Record<string, BranchService[]>>({}) // branchId -> available services
    const [branchCategoriesMap, setBranchCategoriesMap] = useState<Record<string, string[]>>({}) // branchId -> available categories

    // Branch-Role assignment state for super user view
    const [branchRoleEntries, setBranchRoleEntries] = useState<BranchRoleFormEntry[]>([])

    // Initialize branch-role entries when modal opens
    const initializeBranchRoleEntries = async (user?: UserExpandedData | null) => {
        const entries: BranchRoleFormEntry[] = []

        for (const branch of allBranches) {
            // Find if user is assigned to this branch
            const existingAssignment = user?.branches?.find(b => b.id === branch.id)

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
            canTakeAppointments: false,
        })
        setBranchRoleEntries([])
        setQualifications([])
        setWorkingHours([])
        setStaffServiceAssignments({})
        // setStaffCategoryAssignments({}) // REMOVED
        setBranchServicesMap({})
        setBranchCategoriesMap({})
        setBranchOperatingHoursMap({})
        setActiveTab("details")
        setError(null)
    }

    const loadBranchServices = async (branchIds: string[]) => {
        const servicesMap: Record<string, BranchService[]> = {}
        const categoriesMap: Record<string, string[]> = {}
        for (const branchId of branchIds) {
            const [services, categories] = await Promise.all([
                getAvailableServicesForStaffBranch(branchId),
                getAvailableServiceCategoriesForBranch(branchId)
            ])
            servicesMap[branchId] = services
            categoriesMap[branchId] = categories
        }
        setBranchServicesMap(servicesMap)
        setBranchCategoriesMap(categoriesMap)
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
        setActiveTab("details")

        // Load full user details - use the returned data directly instead of reading from state
        const fullUser = await loadExpandedData(user.id, true) as UserExpandedData | null

        const isAdmin = user.role === adminRoleName
        setFormData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email,
            mobile: fullUser?.mobile || "",
            dob: fullUser?.dob ? new Date(fullUser.dob).toISOString().split('T')[0] : "",
            isAdmin: isAdmin,
            canTakeAppointments: user.canTakeAppointments ?? false,
        })

        if (!isAdmin && fullUser) {
            await initializeBranchRoleEntries(fullUser)

            // Load qualifications
            if (fullUser.qualifications) {
                setQualifications(fullUser.qualifications)
            }

            // Load working hours
            if (fullUser.workingHours) {
                setWorkingHours(fullUser.workingHours)
            }

            // Load staff services
            if (fullUser.staffServices) {
                const serviceMap: Record<string, string[]> = {}
                fullUser.staffServices.forEach(s => {
                    if (!serviceMap[s.branchId]) serviceMap[s.branchId] = []
                    serviceMap[s.branchId].push(s.serviceId)
                })
                setStaffServiceAssignments(serviceMap)
            }

            // Load staff categories - No longer needed as state, derived from services
            // if (fullUser.staffServiceCategories) { ... }

            // Load available services and operating hours for each branch
            const branchIds = fullUser.branches?.map(b => b.id) || []
            if (branchIds.length > 0) {
                await Promise.all([
                    loadBranchServices(branchIds),
                    loadBranchOperatingHours(branchIds),
                ])
            }
        } else if (!isAdmin) {
            // User has no existing data, initialize empty branch entries
            await initializeBranchRoleEntries(null)
        }

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
                canTakeAppointments: formData.canTakeAppointments,
                branchRoleAssignments: formData.isAdmin ? undefined : branchRoleAssignments,
            }

            let userId: string
            if (editingUser) {
                await updateUser(editingUser.id, userData)
                userId = editingUser.id
            } else {
                const result = await createUser(userData)
                if (!result.success) {
                    throw new Error(result.error || "Failed to create user")
                }
                userId = result.data.id
            }

            // Save qualifications, working hours, and services for non-admin users
            if (!formData.isAdmin && userId) {
                // Save qualifications
                await saveStaffQualifications(userId, qualifications)

                // Save working hours
                await saveStaffWorkingHours(userId, workingHours)

                // Save staff services
                const allStaffServices: { branchId: string; serviceId: string }[] = []
                Object.entries(staffServiceAssignments).forEach(([branchId, serviceIds]) => {
                    serviceIds.forEach(serviceId => {
                        allStaffServices.push({ branchId, serviceId })
                    })
                })
                await saveStaffServices(userId, allStaffServices)

                // NOTE: We no longer save category assignments as they are just UI helpers for selecting services.
                // The booking logic relies solely on specific staff-service assignments.
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

    // Qualification helpers
    const addQualification = () => {
        setQualifications(prev => [...prev, {
            type: "certification",
            name: "",
            institution: "",
            year: new Date().getFullYear(),
        }])
    }

    const updateQualification = (index: number, field: keyof QualificationEntry, value: any) => {
        setQualifications(prev => prev.map((q, i) =>
            i === index ? { ...q, [field]: value } : q
        ))
    }

    const removeQualification = (index: number) => {
        setQualifications(prev => prev.filter((_, i) => i !== index))
    }

    // Working hours helpers
    const addWorkingHourSlot = (branchId: string, dayOfWeek: number) => {
        const existingSlots = workingHours.filter(
            h => h.branchId === branchId && h.dayOfWeek === dayOfWeek
        )
        const maxSlotIndex = existingSlots.length > 0
            ? Math.max(...existingSlots.map(s => s.slotIndex))
            : -1

        setWorkingHours(prev => [...prev, {
            branchId,
            dayOfWeek,
            slotIndex: maxSlotIndex + 1,
            startTime: "09:00",
            endTime: "17:00",
            isOff: false,
        }])
    }

    const removeWorkingHourSlot = (branchId: string, dayOfWeek: number, slotIndex: number) => {
        setWorkingHours(prev => prev.filter(
            h => !(h.branchId === branchId && h.dayOfWeek === dayOfWeek && h.slotIndex === slotIndex)
        ))
    }

    const updateWorkingHourSlot = (branchId: string, dayOfWeek: number, slotIndex: number, field: keyof WorkingHoursEntry, value: any) => {
        setWorkingHours(prev => prev.map(w =>
            w.branchId === branchId && w.dayOfWeek === dayOfWeek && w.slotIndex === slotIndex
                ? { ...w, [field]: value }
                : w
        ))
    }

    const toggleWorkingDayOff = (branchId: string, dayOfWeek: number, isOff: boolean) => {
        const existingSlots = workingHours.filter(
            h => h.branchId === branchId && h.dayOfWeek === dayOfWeek
        )

        if (isOff) {
            // Remove all existing slots for this day and add a single "off" entry
            setWorkingHours(prev => [
                ...prev.filter(h => !(h.branchId === branchId && h.dayOfWeek === dayOfWeek)),
                {
                    branchId,
                    dayOfWeek,
                    slotIndex: 0,
                    startTime: "09:00",
                    endTime: "17:00",
                    isOff: true,
                }
            ])
        } else {
            // If turning off "off" status, set the first slot to not off
            if (existingSlots.length > 0) {
                setWorkingHours(prev => prev.map(h =>
                    h.branchId === branchId && h.dayOfWeek === dayOfWeek && h.slotIndex === 0
                        ? { ...h, isOff: false }
                        : h
                ))
            } else {
                // Add a working slot
                addWorkingHourSlot(branchId, dayOfWeek)
            }
        }
    }

    // Group working hours by branch and day for better UX
    const getWorkingHoursByBranch = () => {
        const enabledBranches = branchRoleEntries.filter(e => e.enabled)
        return enabledBranches.map(entry => {
            const branchName = branchMap.get(entry.branchId) || entry.branchId
            const branchHoursRef = branchOperatingHoursMap[entry.branchId] || []

            const dayData = DAYS_OF_WEEK.map(day => {
                const slots = workingHours
                    .filter(h => h.branchId === entry.branchId && h.dayOfWeek === day.value)
                    .sort((a, b) => a.slotIndex - b.slotIndex)
                const isOff = slots.length > 0 && slots[0].isOff
                const hasSlots = slots.length > 0

                // Get branch hours for this day to show as reference
                const branchDayHours = branchHoursRef.filter(h => h.dayOfWeek === day.value)
                const branchClosed = branchDayHours.length > 0 && branchDayHours[0].isClosed
                const branchHoursDisplay = branchClosed
                    ? "Closed"
                    : branchDayHours.map(h => `${h.openTime}-${h.closeTime}`).join(", ") || "Not set"

                return { day, slots, isOff, hasSlots, branchHoursDisplay, branchClosed }
            })

            return { branchId: entry.branchId, branchName, dayData }
        })
    }

    // Load branch operating hours for validation
    const loadBranchOperatingHours = async (branchIds: string[]) => {
        const newHoursMap: Record<string, OperatingHoursEntry[]> = { ...branchOperatingHoursMap }
        for (const branchId of branchIds) {
            if (!newHoursMap[branchId]) {
                const hours = await getBranchOperatingHours(branchId)
                newHoursMap[branchId] = hours
            }
        }
        setBranchOperatingHoursMap(newHoursMap)
    }

    // Validate if a staff working hour is within branch operating hours
    const validateStaffHourWithinBranch = (staffHour: WorkingHoursEntry): { isValid: boolean; message?: string } => {
        const branchHours = branchOperatingHoursMap[staffHour.branchId]
        if (!branchHours || branchHours.length === 0) {
            return { isValid: true } // Cannot validate if no branch hours
        }

        // Find branch hours for this day
        const branchDayHours = branchHours.filter(h => h.dayOfWeek === staffHour.dayOfWeek)
        if (branchDayHours.length === 0) {
            return { isValid: false, message: "Branch has no hours for this day" }
        }

        // Check if branch is closed this day
        if (branchDayHours[0].isClosed) {
            return { isValid: false, message: "Branch is closed this day" }
        }

        // Check if staff hours fall within any of the branch slots
        const staffStart = parseTimeToMinutes(staffHour.startTime)
        const staffEnd = parseTimeToMinutes(staffHour.endTime)

        const isWithinAnySlot = branchDayHours.some(branchSlot => {
            const branchStart = parseTimeToMinutes(branchSlot.openTime)
            const branchEnd = parseTimeToMinutes(branchSlot.closeTime)
            return staffStart >= branchStart && staffEnd <= branchEnd
        })

        if (!isWithinAnySlot) {
            const availableSlots = branchDayHours
                .map(h => `${h.openTime}-${h.closeTime}`)
                .join(', ')
            return {
                isValid: false,
                message: `Must be within branch hours: ${availableSlots}`
            }
        }

        return { isValid: true }
    }

    // Helper to parse time string to minutes
    const parseTimeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number)
        return hours * 60 + minutes
    }

    // Staff service assignment helpers
    const toggleStaffService = (branchId: string, serviceId: string) => {
        setStaffServiceAssignments(prev => {
            const current = prev[branchId] || []
            const isSelected = current.includes(serviceId)
            return {
                ...prev,
                [branchId]: isSelected
                    ? current.filter(id => id !== serviceId)
                    : [...current, serviceId]
            }
        })
    }

    const toggleStaffCategory = (branchId: string, category: string) => {
        const branchServices = branchServicesMap[branchId] || []
        const servicesInCategory = branchServices.filter(s => s.serviceCategory === category)
        const serviceIdsInCategory = servicesInCategory.map(s => s.serviceId)

        setStaffServiceAssignments(prev => {
            const current = prev[branchId] || []
            // Check if all services in this category are already selected
            const allSelected = serviceIdsInCategory.every(id => current.includes(id))

            let newAssignments: string[]
            if (allSelected) {
                // Deselect all
                newAssignments = current.filter(id => !serviceIdsInCategory.includes(id))
            } else {
                // Select all (union)
                const toAdd = serviceIdsInCategory.filter(id => !current.includes(id))
                newAssignments = [...current, ...toAdd]
            }

            return {
                ...prev,
                [branchId]: newAssignments
            }
        })
    }

    // Handle branch selection change for staff - reload available services and operating hours
    const handleBranchToggle = async (branchId: string) => {
        toggleBranchEnabled(branchId)

        // Load services and operating hours for the branch if enabling
        const entry = branchRoleEntries.find(e => e.branchId === branchId)
        if (entry && !entry.enabled) {
            const promises: Promise<void>[] = []
            if (!branchServicesMap[branchId]) {
                promises.push(loadBranchServices([branchId]))
            }
            if (!branchOperatingHoursMap[branchId]) {
                promises.push(loadBranchOperatingHours([branchId]))
            }
            await Promise.all(promises)
        }
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

                                            {!isAdmin && fullUser?.qualifications && fullUser.qualifications.length > 0 && (
                                                <ExpandedDetailSection title="Qualifications">
                                                    {fullUser.qualifications.map((q, idx) => (
                                                        <ExpandedDetailRow
                                                            key={idx}
                                                            label={q.type.charAt(0).toUpperCase() + q.type.slice(1)}
                                                            value={`${q.name}${q.institution ? ` - ${q.institution}` : ''}${q.year ? ` (${q.year})` : ''}`}
                                                        />
                                                    ))}
                                                </ExpandedDetailSection>
                                            )}

                                            {!isAdmin && fullUser?.staffServices && fullUser.staffServices.length > 0 && (
                                                <ExpandedDetailSection title="Services Offered">
                                                    {(() => {
                                                        const servicesByBranch: Record<string, string[]> = {}
                                                        fullUser.staffServices.forEach(s => {
                                                            const bName = s.branchName || 'Unknown Branch'
                                                            if (!servicesByBranch[bName]) servicesByBranch[bName] = []
                                                            if (s.serviceName) {
                                                                servicesByBranch[bName].push(s.serviceName)
                                                            }
                                                        })
                                                        return Object.entries(servicesByBranch).map(([branchName, services]) => (
                                                            <ExpandedDetailRow
                                                                key={branchName}
                                                                label={branchName}
                                                                value={services.join(', ')}
                                                            />
                                                        ))
                                                    })()}
                                                </ExpandedDetailSection>
                                            )}
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
                    <div className="bg-white rounded-lg p-6 max-w-3xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">{editingUser ? "Edit User" : "Add New User"}</h2>

                        {/* Tab Navigation */}
                        <div className="flex border-b border-gray-200 mb-4">
                            <button
                                type="button"
                                onClick={() => setActiveTab("details")}
                                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === "details"
                                    ? "border-indigo-500 text-indigo-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                Details
                            </button>
                            {!formData.isAdmin && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("qualifications")}
                                        className={`flex items-center gap-1 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === "qualifications"
                                            ? "border-indigo-500 text-indigo-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        <GraduationCap size={16} />
                                        Qualifications
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("workingHours")}
                                        className={`flex items-center gap-1 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === "workingHours"
                                            ? "border-indigo-500 text-indigo-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        <Clock size={16} />
                                        Working Hours
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("services")}
                                        className={`flex items-center gap-1 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === "services"
                                            ? "border-indigo-500 text-indigo-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        <Stethoscope size={16} />
                                        Services
                                    </button>
                                </>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Details Tab */}
                            {activeTab === "details" && (
                                <div className="space-y-4">
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

                                    {/* Appointment Taking Flag */}
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-md border border-blue-100 mb-4">
                                        <input
                                            id="canTakeAppointments"
                                            type="checkbox"
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            checked={formData.canTakeAppointments}
                                            onChange={(e) => setFormData({ ...formData, canTakeAppointments: e.target.checked })}
                                        />
                                        <label htmlFor="canTakeAppointments" className="text-sm font-medium text-blue-800">
                                            Can Take Appointments?
                                        </label>
                                        <span className="text-xs text-blue-600 ml-auto">Show in booking calendar</span>
                                    </div>

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
                                                        const fullUser = editingUser ? expandedData[editingUser.id] : null
                                                        initializeBranchRoleEntries(fullUser)
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
                                                                        onChange={() => handleBranchToggle(branch.id)}
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
                                </div>
                            )}

                            {/* Qualifications Tab */}
                            {activeTab === "qualifications" && !formData.isAdmin && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-gray-700">
                                            <GraduationCap size={16} className="inline mr-1" />
                                            Qualifications, Degrees & Certificates
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addQualification}
                                            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                        >
                                            <Plus size={16} />
                                            Add Qualification
                                        </button>
                                    </div>

                                    {qualifications.length === 0 ? (
                                        <p className="text-gray-500 text-sm italic p-4 bg-gray-50 rounded-md">No qualifications added yet. Click "Add Qualification" to add one.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {qualifications.map((qual, index) => (
                                                <div key={index} className="border rounded-md p-3 bg-gray-50">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-xs font-medium text-gray-500 uppercase">Qualification #{index + 1}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeQualification(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600">Type</label>
                                                            <select
                                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2"
                                                                value={qual.type}
                                                                onChange={(e) => updateQualification(index, 'type', e.target.value)}
                                                            >
                                                                {QUALIFICATION_TYPES.map(t => (
                                                                    <option key={t.value} value={t.value}>{t.label}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600">Name / Title</label>
                                                            <input
                                                                type="text"
                                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2"
                                                                placeholder="e.g., MD, MBBS, Physiotherapy"
                                                                value={qual.name}
                                                                onChange={(e) => updateQualification(index, 'name', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600">Institution</label>
                                                            <input
                                                                type="text"
                                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2"
                                                                placeholder="e.g., University of..."
                                                                value={qual.institution || ""}
                                                                onChange={(e) => updateQualification(index, 'institution', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600">Year</label>
                                                            <input
                                                                type="number"
                                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2"
                                                                min="1950"
                                                                max={new Date().getFullYear()}
                                                                value={qual.year || ""}
                                                                onChange={(e) => updateQualification(index, 'year', parseInt(e.target.value) || undefined)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600">Expiry Date (if applicable)</label>
                                                            <input
                                                                type="date"
                                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2"
                                                                value={qual.expiryDate ? new Date(qual.expiryDate).toISOString().split('T')[0] : ""}
                                                                onChange={(e) => updateQualification(index, 'expiryDate', e.target.value ? new Date(e.target.value) : undefined)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600">Document URL</label>
                                                            <input
                                                                type="url"
                                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2"
                                                                placeholder="https://..."
                                                                value={qual.documentUrl || ""}
                                                                onChange={(e) => updateQualification(index, 'documentUrl', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Working Hours Tab */}
                            {activeTab === "workingHours" && !formData.isAdmin && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock size={16} className="text-gray-600" />
                                        <label className="text-sm font-medium text-gray-700">
                                            Working Hours Schedule
                                        </label>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Set working hours for each branch. Add multiple time slots per day for split schedules (e.g., 9:00-12:00 and 14:00-18:00).
                                    </p>

                                    {branchRoleEntries.filter(e => e.enabled).length === 0 ? (
                                        <p className="text-gray-500 text-sm italic p-4 bg-yellow-50 rounded-md border border-yellow-200">
                                            Please assign at least one branch in the Details tab first.
                                        </p>
                                    ) : (
                                        <div className="space-y-6">
                                            {getWorkingHoursByBranch().map(({ branchId, branchName, dayData }) => (
                                                <div key={branchId} className="border rounded-lg overflow-hidden">
                                                    <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
                                                        <h4 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                                                            <Building size={16} />
                                                            {branchName}
                                                        </h4>
                                                    </div>
                                                    <div className="divide-y divide-gray-100">
                                                        {dayData.map(({ day, slots, isOff, hasSlots, branchHoursDisplay, branchClosed }) => (
                                                            <div key={day.value} className="p-3 bg-white hover:bg-gray-50">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-24 font-medium text-gray-700 text-sm">{day.label}</div>
                                                                        <span className="text-xs text-gray-400" title="Branch operating hours">
                                                                            Branch: {branchHoursDisplay}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <label className="flex items-center gap-2">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isOff}
                                                                                onChange={(e) => toggleWorkingDayOff(branchId, day.value, e.target.checked)}
                                                                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                                                                disabled={branchClosed}
                                                                            />
                                                                            <span className="text-xs text-gray-600">Off</span>
                                                                        </label>
                                                                        {!isOff && !branchClosed && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => addWorkingHourSlot(branchId, day.value)}
                                                                                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                                                            >
                                                                                <Plus size={14} />
                                                                                Add Slot
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {branchClosed ? (
                                                                    <div className="text-xs text-gray-400 italic ml-28">Branch closed</div>
                                                                ) : isOff ? (
                                                                    <div className="text-xs text-red-500 italic ml-28">Day off</div>
                                                                ) : !hasSlots ? (
                                                                    <div className="ml-28">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => addWorkingHourSlot(branchId, day.value)}
                                                                            className="text-xs text-gray-400 hover:text-indigo-600 italic"
                                                                        >
                                                                            Click "Add Slot" to set working hours
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-2 ml-28">
                                                                        {slots.map((slot, idx) => {
                                                                            const validation = validateStaffHourWithinBranch(slot)
                                                                            return (
                                                                                <div key={slot.slotIndex} className={`flex items-center gap-3 p-2 rounded border ${validation.isValid ? 'bg-gray-50 border-gray-100' : 'bg-red-50 border-red-200'}`}>
                                                                                    <span className="text-xs text-gray-400 w-12">Slot {idx + 1}</span>
                                                                                    <input
                                                                                        type="time"
                                                                                        value={slot.startTime}
                                                                                        onChange={(e) => updateWorkingHourSlot(branchId, day.value, slot.slotIndex, 'startTime', e.target.value)}
                                                                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-1.5 w-28"
                                                                                    />
                                                                                    <span className="text-gray-400 text-sm">to</span>
                                                                                    <input
                                                                                        type="time"
                                                                                        value={slot.endTime}
                                                                                        onChange={(e) => updateWorkingHourSlot(branchId, day.value, slot.slotIndex, 'endTime', e.target.value)}
                                                                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-1.5 w-28"
                                                                                    />
                                                                                    {slots.length > 1 && (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => removeWorkingHourSlot(branchId, day.value, slot.slotIndex)}
                                                                                            className="text-red-500 hover:text-red-700 p-1"
                                                                                            title="Remove slot"
                                                                                        >
                                                                                            <Trash2 size={14} />
                                                                                        </button>
                                                                                    )}
                                                                                    {!validation.isValid && (
                                                                                        <div className="flex items-center gap-1 text-xs text-red-600">
                                                                                            <AlertCircle size={12} />
                                                                                            <span className="truncate max-w-xs" title={validation.message}>{validation.message}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Services Tab */}
                            {activeTab === "services" && !formData.isAdmin && (
                                <div className="space-y-4">
                                    <label className="text-sm font-medium text-gray-700">
                                        <Stethoscope size={16} className="inline mr-1" />
                                        Services Offered by Staff
                                    </label>

                                    {branchRoleEntries.filter(e => e.enabled).length === 0 ? (
                                        <p className="text-gray-500 text-sm italic p-4 bg-yellow-50 rounded-md border border-yellow-200">
                                            Please assign at least one branch in the Details tab first.
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {branchRoleEntries.filter(e => e.enabled).map(entry => {
                                                const branchName = branchMap.get(entry.branchId) || entry.branchId
                                                const services = branchServicesMap[entry.branchId] || []
                                                const categoriesMap = branchCategoriesMap
                                                const assignedServices = staffServiceAssignments[entry.branchId] || []

                                                return (
                                                    <div key={entry.branchId} className="border rounded-md p-3 bg-gray-50">
                                                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                                                            <Building size={14} className="inline mr-1" />
                                                            {branchName}
                                                        </h4>

                                                        {/* Service Categories */}
                                                        {categoriesMap[entry.branchId] && categoriesMap[entry.branchId].length > 0 && (
                                                            <div className="mb-4 pb-4 border-b border-gray-200">
                                                                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Service Categories</h5>
                                                                <p className="text-xs text-gray-500 mb-2">Assigning a category allows the staff to perform ALL services in that category.</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {categoriesMap[entry.branchId].map(category => {
                                                                        const branchServices = branchServicesMap[entry.branchId] || []
                                                                        const servicesInCategory = branchServices.filter(s => s.serviceCategory === category)
                                                                        const serviceIdsInCategory = servicesInCategory.map(s => s.serviceId)
                                                                        const currentAssignments = staffServiceAssignments[entry.branchId] || []

                                                                        // Check if all services in this category are selected
                                                                        const isFullySelected = serviceIdsInCategory.length > 0 && serviceIdsInCategory.every(id => currentAssignments.includes(id))

                                                                        // Check if some services are selected (for potential partial state styling, though standard checkbox here)
                                                                        const isPartiallySelected = !isFullySelected && serviceIdsInCategory.some(id => currentAssignments.includes(id))

                                                                        return (
                                                                            <label
                                                                                key={category}
                                                                                className={`flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer transition-colors border ${isFullySelected
                                                                                    ? 'bg-green-100 border-green-300 text-green-800'
                                                                                    : isPartiallySelected
                                                                                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                                                                                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                                                                                    }`}
                                                                            >
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="sr-only"
                                                                                    checked={isFullySelected}
                                                                                    onChange={() => toggleStaffCategory(entry.branchId, category)}
                                                                                />
                                                                                <span className="text-xs font-medium">{category}</span>
                                                                            </label>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Individual Services</h5>

                                                        {services.length === 0 ? (
                                                            <p className="text-gray-500 text-sm italic">No services configured for this branch.</p>
                                                        ) : (
                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                                {services.map(service => (
                                                                    <label
                                                                        key={service.serviceId}
                                                                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${assignedServices.includes(service.serviceId)
                                                                            ? 'bg-indigo-50 border border-indigo-200'
                                                                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                                                                            }`}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                            checked={assignedServices.includes(service.serviceId)}
                                                                            onChange={() => toggleStaffService(entry.branchId, service.serviceId)}
                                                                        />
                                                                        <span className="text-sm text-gray-700">{service.serviceName}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
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

