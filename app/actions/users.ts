"use server"

import { db } from "@/lib/db"
import { users, userBranchRoles, branches, roles, staffWorkingHours, staffQualifications, staffServices, services, branchServices, staffServiceCategories } from "@/lib/schema"
import { eq, inArray, desc, and, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireAuth, requirePermission, getAdminRoleName } from "@/lib/auth-utils"
import {
    ActionResult,
    success,
    handleActionError,
    ValidationError,
    NotFoundError,
    ConflictError,
} from "@/lib/errors"

export type BranchRoleAssignment = {
    branchId: string
    roleId: string
}

export type WorkingHoursEntry = {
    branchId: string
    dayOfWeek: number // 0-6 (Sunday-Saturday)
    slotIndex: number // 0, 1, 2... for multiple slots per day
    startTime: string  // "09:00" format
    endTime: string   // "17:00" format
    isOff: boolean
}

export type QualificationEntry = {
    id?: string       // For updates
    type: string      // "degree", "certificate", "license", "specialization"
    name: string      // e.g., "MBBS", "MD Cardiology"
    institution?: string
    year?: number
    expiryDate?: string
    documentUrl?: string
    isVerified?: boolean
}

export type StaffServiceAssignment = {
    branchId: string
    serviceId: string
    branchName?: string
    serviceName?: string
}

export type ServiceCategoryAssignment = {
    branchId: string
    category: string
    branchName?: string
}

export type UserMinimal = Pick<typeof users.$inferSelect, 'id' | 'name' | 'firstName' | 'lastName' | 'email' | 'role' | 'canTakeAppointments'>

export type UserFull = UserMinimal & Pick<typeof users.$inferSelect, 'mobile' | 'dob' | 'image'> & {
    branches: Array<{
        id: string
        name: string
        roleId: string
        roleName: string
    }>
}

/**
 * Get users minimal data for list view
 * Only includes basic user info and audit fields
 */
export async function getUsersMinimal(branchId?: string, isSuperUser?: boolean): Promise<UserMinimal[]> {
    try {
        await requireAuth()
        const adminRoleName = getAdminRoleName()

        let allUsers: UserMinimal[] = []

        if (isSuperUser) {
            // Super users always see all users regardless of branch context
            allUsers = await db
                .select({
                    id: users.id,
                    name: users.name,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    email: users.email,
                    role: users.role,
                    canTakeAppointments: users.canTakeAppointments,
                })
                .from(users)
                .orderBy(desc(users.email))
        } else if (branchId) {
            // Non-super users only see non-admin users in their branch
            const branchUsers = await db
                .select({
                    id: users.id,
                    name: users.name,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    email: users.email,
                    role: users.role,
                    canTakeAppointments: users.canTakeAppointments,
                })
                .from(users)
                .innerJoin(userBranchRoles, eq(users.id, userBranchRoles.userId))
                .where(
                    and(
                        eq(userBranchRoles.branchId, branchId),
                        isNull(users.role) // Exclude global admins
                    )
                )
                .orderBy(desc(users.email))

            allUsers = branchUsers
        }

        return allUsers
    } catch (error) {
        console.error("getUsersMinimal error:", error)
        throw error
    }
}

/**
 * Get full user details for expanded view
 */
export async function getUserDetails(userId: string): Promise<UserFull | null> {
    try {
        await requireAuth()

        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                email: true,
                mobile: true,
                dob: true,
                image: true,
                role: true,
                canTakeAppointments: true,
            }
        })

        if (!user) return null

        // Get branch-role assignments
        const mappings = await db
            .select({
                branchId: userBranchRoles.branchId,
                roleId: userBranchRoles.roleId,
                branchName: branches.name,
                roleName: roles.name,
            })
            .from(userBranchRoles)
            .innerJoin(branches, eq(userBranchRoles.branchId, branches.id))
            .innerJoin(roles, eq(userBranchRoles.roleId, roles.id))
            .where(eq(userBranchRoles.userId, userId))

        return {
            ...user,
            branches: mappings.map(m => ({
                id: m.branchId,
                name: m.branchName,
                roleId: m.roleId,
                roleName: m.roleName,
            }))
        }
    } catch (error) {
        console.error("getUserDetails error:", error)
        return null
    }
}

/**
 * Get users with their branch-role assignments
 * Optimized to batch fetch related data
 */
export async function getUsers(branchId?: string, isSuperUser?: boolean) {
    try {
        await requireAuth()
        const adminRoleName = getAdminRoleName()

        let allUsers: (typeof users.$inferSelect)[] = []

        if (isSuperUser && !branchId) {
            // Super users see all users if no branch filter
            allUsers = await db.query.users.findMany({
                orderBy: [desc(users.firstName)],
            })
        } else if (branchId) {
            if (isSuperUser) {
                // Super user viewing a specific branch
                const branchUsers = await db
                    .select({ user: users })
                    .from(users)
                    .innerJoin(userBranchRoles, eq(users.id, userBranchRoles.userId))
                    .where(eq(userBranchRoles.branchId, branchId))
                    .orderBy(desc(users.firstName))

                allUsers = branchUsers.map((r) => r.user)
            } else {
                // Non-super users only see non-admin users in their branch
                const branchUsers = await db
                    .select({ user: users })
                    .from(users)
                    .innerJoin(userBranchRoles, eq(users.id, userBranchRoles.userId))
                    .where(
                        and(
                            eq(userBranchRoles.branchId, branchId),
                            isNull(users.role) // Exclude global admins
                        )
                    )
                    .orderBy(desc(users.firstName))

                allUsers = branchUsers.map((r) => r.user)
            }
        } else if (isSuperUser) {
            allUsers = await db.query.users.findMany({
                orderBy: [desc(users.firstName)],
            })
        }

        // Batch fetch branch-role mappings
        const userIds = allUsers.map((u) => u.id)
        let mappings: { userId: string; branchId: string; roleId: string }[] = []

        if (userIds.length > 0) {
            if (!isSuperUser && branchId) {
                // Scope mappings to current branch for non-super users
                mappings = await db
                    .select({
                        userId: userBranchRoles.userId,
                        branchId: userBranchRoles.branchId,
                        roleId: userBranchRoles.roleId,
                    })
                    .from(userBranchRoles)
                    .where(
                        and(
                            inArray(userBranchRoles.userId, userIds),
                            eq(userBranchRoles.branchId, branchId)
                        )
                    )
            } else {
                mappings = await db
                    .select({
                        userId: userBranchRoles.userId,
                        branchId: userBranchRoles.branchId,
                        roleId: userBranchRoles.roleId,
                    })
                    .from(userBranchRoles)
                    .where(inArray(userBranchRoles.userId, userIds))
            }
        }

        // Fetch branches and roles for lookups
        let scopedBranches: (typeof branches.$inferSelect)[] = []
        if (isSuperUser) {
            scopedBranches = await db.query.branches.findMany()
        } else if (branchId) {
            scopedBranches = await db.query.branches.findMany({
                where: eq(branches.id, branchId),
            })
        }

        const allRoles = await db.select().from(roles).orderBy(desc(roles.createdAt))

        // Create lookup maps
        const branchMap = new Map(scopedBranches.map((b) => [b.id, b.name]))
        const roleMap = new Map(allRoles.map((r) => [r.id, r.name]))

        // Attach branch-role assignments to users
        const usersWithBranchRoles = allUsers.map((user) => {
            const userBranchRoleData = mappings
                .filter((m) => m.userId === user.id)
                .map((m) => ({
                    branchId: m.branchId,
                    branchName: branchMap.get(m.branchId) || "Unknown",
                    roleId: m.roleId,
                    roleName: roleMap.get(m.roleId) || "Unknown",
                }))

            return {
                ...user,
                branchRoles: userBranchRoleData,
                branches: userBranchRoleData.map((br) => ({
                    id: br.branchId,
                    name: br.branchName,
                    roleId: br.roleId,
                    roleName: br.roleName,
                })),
            }
        })

        return { users: usersWithBranchRoles, allBranches: scopedBranches, allRoles }
    } catch (error) {
        console.error("getUsers error:", error)
        throw error
    }
}


/**
 * Create a new user
 */
export async function createUser(data: {
    email: string
    firstName?: string
    lastName?: string
    mobile?: string
    dob?: string
    roleName?: string
    canTakeAppointments?: boolean
    branchRoleAssignments?: BranchRoleAssignment[]
}): Promise<ActionResult<{ id: string }>> {
    try {
        await requirePermission("users", "add")

        const adminRoleName = getAdminRoleName()
        const isAdmin = data.roleName === adminRoleName

        // Validate email
        if (!data.email?.trim()) {
            throw new ValidationError("Email is required")
        }

        // Validation: Non-ADMIN users MUST have at least one branch-role assignment
        if (!isAdmin && (!data.branchRoleAssignments || data.branchRoleAssignments.length === 0)) {
            throw new ValidationError("Please assign at least one branch with a role for this user.")
        }

        // Check for existing email
        const existing = await db.query.users.findFirst({
            where: eq(users.email, data.email.trim()),
        })
        if (existing) {
            throw new ConflictError("User with this email already exists")
        }

        // Insert User
        const [newUser] = await db
            .insert(users)
            .values({
                email: data.email.trim(),
                firstName: data.firstName?.trim(),
                lastName: data.lastName?.trim(),
                name: `${data.firstName || ""} ${data.lastName || ""}`.trim() || data.email,
                mobile: data.mobile?.trim(),
                dob: data.dob ? new Date(data.dob) : null,
                role: isAdmin ? adminRoleName : null,
                canTakeAppointments: data.canTakeAppointments ?? false,
            })
            .returning()

        // Assign Branch-Roles if not Admin
        if (!isAdmin && data.branchRoleAssignments && data.branchRoleAssignments.length > 0) {
            await db.insert(userBranchRoles).values(
                data.branchRoleAssignments.map((ba) => ({
                    userId: newUser.id,
                    branchId: ba.branchId,
                    roleId: ba.roleId,
                }))
            )
        }

        revalidatePath("/management/users")
        return success({ id: newUser.id })
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Update an existing user
 */
export async function updateUser(
    id: string,
    data: {
        firstName?: string
        lastName?: string
        mobile?: string
        dob?: string
        roleName?: string
        canTakeAppointments?: boolean
        branchRoleAssignments?: BranchRoleAssignment[]
    }
): Promise<ActionResult<void>> {
    try {
        await requirePermission("users", "edit")

        const adminRoleName = getAdminRoleName()
        const isAdmin = data.roleName === adminRoleName

        // Verify user exists
        const existing = await db.query.users.findFirst({
            where: eq(users.id, id),
        })

        if (!existing) {
            throw new NotFoundError("User")
        }

        // Validation: Non-ADMIN users MUST have at least one branch-role assignment
        if (!isAdmin && (!data.branchRoleAssignments || data.branchRoleAssignments.length === 0)) {
            throw new ValidationError("Please assign at least one branch with a role for this user.")
        }

        await db
            .update(users)
            .set({
                firstName: data.firstName?.trim(),
                lastName: data.lastName?.trim(),
                name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
                mobile: data.mobile?.trim(),
                dob: data.dob ? new Date(data.dob) : null,
                role: isAdmin ? adminRoleName : null,
                canTakeAppointments: data.canTakeAppointments ?? false,
            })
            .where(eq(users.id, id))

        // Update branch-role assignments
        await db.transaction(async (tx) => {
            // Remove all existing assignments
            await tx.delete(userBranchRoles).where(eq(userBranchRoles.userId, id))

            // Add new assignments if not admin
            if (!isAdmin && data.branchRoleAssignments && data.branchRoleAssignments.length > 0) {
                await tx.insert(userBranchRoles).values(
                    data.branchRoleAssignments.map((ba) => ({
                        userId: id,
                        branchId: ba.branchId,
                        roleId: ba.roleId,
                    }))
                )
            }
        })

        revalidatePath("/management/users")
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<ActionResult<void>> {
    try {
        const user = await requirePermission("users", "delete")

        // Prevent deleting yourself
        if (user.id === id) {
            throw new ValidationError("You cannot delete yourself")
        }

        // Verify user exists
        const existing = await db.query.users.findFirst({
            where: eq(users.id, id),
        })

        if (!existing) {
            throw new NotFoundError("User")
        }

        await db.delete(users).where(eq(users.id, id))
        revalidatePath("/management/users")
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Get roles available for a specific branch
 * Returns roles that are either global (no branchId) or belong to the specified branch
 */
export async function getRolesForBranch(branchId: string) {
    try {
        await requireAuth()
        const adminRoleName = getAdminRoleName()

        // Get roles for this branch OR global roles (except ADMIN which is special)
        return db.query.roles.findMany({
            where: (r, { eq, or, and, ne }) =>
                or(eq(r.branchId, branchId), and(isNull(r.branchId), ne(r.name, adminRoleName))),
            orderBy: [desc(roles.name)],
        })
    } catch (error) {
        console.error("getRolesForBranch error:", error)
        return []
    }
}

/**
 * Get working hours for a staff member
 */
export async function getStaffWorkingHours(userId: string): Promise<WorkingHoursEntry[]> {
    try {
        await requireAuth()

        const hours = await db
            .select({
                branchId: staffWorkingHours.branchId,
                dayOfWeek: staffWorkingHours.dayOfWeek,
                slotIndex: staffWorkingHours.slotIndex,
                startTime: staffWorkingHours.startTime,
                endTime: staffWorkingHours.endTime,
                isOff: staffWorkingHours.isOff,
            })
            .from(staffWorkingHours)
            .where(eq(staffWorkingHours.userId, userId))
            .orderBy(staffWorkingHours.branchId, staffWorkingHours.dayOfWeek, staffWorkingHours.slotIndex)

        return hours.map(h => ({
            ...h,
            slotIndex: h.slotIndex ?? 0,
            isOff: h.isOff ?? false,
        }))
    } catch (error) {
        console.error("getStaffWorkingHours error:", error)
        return []
    }
}

/**
 * Save working hours for a staff member
 */
export async function saveStaffWorkingHours(userId: string, workingHours: WorkingHoursEntry[]): Promise<ActionResult<void>> {
    try {
        await requirePermission("users", "edit")

        // Delete existing working hours for this user
        await db.delete(staffWorkingHours).where(eq(staffWorkingHours.userId, userId))

        // Insert new working hours (only non-empty entries)
        const validEntries = workingHours.filter(h => h.startTime && h.endTime)
        if (validEntries.length > 0) {
            await db.insert(staffWorkingHours).values(
                validEntries.map(h => ({
                    userId,
                    branchId: h.branchId,
                    dayOfWeek: h.dayOfWeek,
                    slotIndex: h.slotIndex,
                    startTime: h.startTime,
                    endTime: h.endTime,
                    isOff: h.isOff,
                }))
            )
        }

        revalidatePath("/management/users")
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Get qualifications for a staff member
 */
export async function getStaffQualifications(userId: string): Promise<QualificationEntry[]> {
    try {
        await requireAuth()

        const qualifications = await db
            .select({
                id: staffQualifications.id,
                type: staffQualifications.type,
                name: staffQualifications.name,
                institution: staffQualifications.institution,
                year: staffQualifications.year,
                expiryDate: staffQualifications.expiryDate,
                documentUrl: staffQualifications.documentUrl,
                isVerified: staffQualifications.isVerified,
            })
            .from(staffQualifications)
            .where(eq(staffQualifications.userId, userId))
            .orderBy(desc(staffQualifications.year))

        return qualifications.map(q => ({
            ...q,
            expiryDate: q.expiryDate ? q.expiryDate.toISOString().split('T')[0] : undefined,
            isVerified: q.isVerified ?? false,
        }))
    } catch (error) {
        console.error("getStaffQualifications error:", error)
        return []
    }
}

/**
 * Save qualifications for a staff member
 */
export async function saveStaffQualifications(userId: string, qualifications: QualificationEntry[]): Promise<ActionResult<void>> {
    try {
        await requirePermission("users", "edit")

        // Delete existing qualifications for this user
        await db.delete(staffQualifications).where(eq(staffQualifications.userId, userId))

        // Insert new qualifications
        const validQualifications = qualifications.filter(q => q.name?.trim())
        if (validQualifications.length > 0) {
            await db.insert(staffQualifications).values(
                validQualifications.map(q => ({
                    userId,
                    type: q.type,
                    name: q.name.trim(),
                    institution: q.institution?.trim() || null,
                    year: q.year || null,
                    expiryDate: q.expiryDate ? new Date(q.expiryDate) : null,
                    documentUrl: q.documentUrl?.trim() || null,
                    isVerified: q.isVerified ?? false,
                }))
            )
        }

        revalidatePath("/management/users")
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Get services assigned to a staff member
 */
export async function getStaffServices(userId: string): Promise<StaffServiceAssignment[]> {
    try {
        await requireAuth()

        const assignments = await db
            .select({
                branchId: staffServices.branchId,
                serviceId: staffServices.serviceId,
                branchName: branches.name,
                serviceName: services.name,
            })
            .from(staffServices)
            .innerJoin(branches, eq(staffServices.branchId, branches.id))
            .innerJoin(services, eq(staffServices.serviceId, services.id))
            .where(eq(staffServices.userId, userId))

        return assignments
    } catch (error) {
        console.error("getStaffServices error:", error)
        return []
    }
}

/**
 * Get services available for a staff member at a specific branch
 * (Services that are enabled at the branch)
 */
export async function getAvailableServicesForStaffBranch(branchId: string) {
    try {
        await requireAuth()

        const result = await db
            .select({
                serviceId: branchServices.serviceId,
                serviceName: services.name,
                serviceCode: services.code,
                serviceCategory: services.category,
            })
            .from(branchServices)
            .innerJoin(services, eq(branchServices.serviceId, services.id))
            .where(
                and(
                    eq(branchServices.branchId, branchId),
                    eq(branchServices.isActive, true),
                    eq(services.isActive, true)
                )
            )
            .orderBy(services.name)

        return result
    } catch (error) {
        console.error("getAvailableServicesForStaffBranch error:", error)
        return []
    }
}

/**
 * Get service categories available for a staff member at a specific branch
 * (Categories of services that are enabled at the branch)
 */
export async function getAvailableServiceCategoriesForBranch(branchId: string) {
    try {
        await requireAuth()

        const result = await db
            .selectDistinct({
                category: services.category,
            })
            .from(branchServices)
            .innerJoin(services, eq(branchServices.serviceId, services.id))
            .where(
                and(
                    eq(branchServices.branchId, branchId),
                    eq(branchServices.isActive, true),
                    eq(services.isActive, true)
                )
            )
            .orderBy(services.category)

        return result
            .map(r => r.category)
            .filter((c): c is string => c !== null)
    } catch (error) {
        console.error("getAvailableServiceCategoriesForBranch error:", error)
        return []
    }
}

/**
 * Save staff service assignments
 */
export async function saveStaffServices(userId: string, assignments: StaffServiceAssignment[]): Promise<ActionResult<void>> {
    try {
        await requirePermission("users", "edit")

        // Delete existing staff service assignments for this user
        await db.delete(staffServices).where(eq(staffServices.userId, userId))

        // Insert new assignments
        if (assignments.length > 0) {
            await db.insert(staffServices).values(
                assignments.map(a => ({
                    userId,
                    branchId: a.branchId,
                    serviceId: a.serviceId,
                }))
            )
        }

        revalidatePath("/management/users")
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Get service categories assigned to a staff member
 */
export async function getStaffServiceCategories(userId: string): Promise<ServiceCategoryAssignment[]> {
    try {
        await requireAuth()

        const assignments = await db
            .select({
                branchId: staffServiceCategories.branchId,
                category: staffServiceCategories.category,
                branchName: branches.name,
            })
            .from(staffServiceCategories)
            .innerJoin(branches, eq(staffServiceCategories.branchId, branches.id))
            .where(eq(staffServiceCategories.userId, userId))

        return assignments
    } catch (error) {
        console.error("getStaffServiceCategories error:", error)
        return []
    }
}

/**
 * Save staff service category assignments
 */
export async function saveStaffServiceCategories(userId: string, assignments: ServiceCategoryAssignment[]): Promise<ActionResult<void>> {
    try {
        await requirePermission("users", "edit")

        // Delete existing category assignments for this user
        await db.delete(staffServiceCategories).where(eq(staffServiceCategories.userId, userId))

        // Insert new assignments
        if (assignments.length > 0) {
            await db.insert(staffServiceCategories).values(
                assignments.map(a => ({
                    userId,
                    branchId: a.branchId,
                    category: a.category,
                }))
            )
        }

        revalidatePath("/management/users")
        return success(undefined)
    } catch (error) {
        return handleActionError(error)
    }
}

/**
 * Get extended user details including qualifications and services
 */
export async function getUserExtendedDetails(userId: string) {
    try {
        await requireAuth()

        const [user, workingHours, qualifications, serviceAssignments, categoryAssignments] = await Promise.all([
            getUserDetails(userId),
            getStaffWorkingHours(userId),
            getStaffQualifications(userId),
            getStaffServices(userId),
            getStaffServiceCategories(userId),
        ])

        if (!user) return null

        return {
            ...user,
            workingHours,
            qualifications,
            staffServices: serviceAssignments,
            staffServiceCategories: categoryAssignments,
        }
    } catch (error) {
        console.error("getUserExtendedDetails error:", error)
        return null
    }
}

