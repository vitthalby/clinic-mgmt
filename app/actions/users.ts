"use server"

import { db } from "@/lib/db"
import { users, userBranchRoles, branches, roles } from "@/lib/schema"
import { eq, inArray, desc, and, isNull } from "drizzle-orm"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export type BranchRoleAssignment = {
    branchId: string;
    roleId: string;
}

export async function getUsers(branchId?: string, isSuperUser?: boolean) {
    const session = await auth()
    if (!session || !session.user) {
        throw new Error("Unauthorized")
    }

    const adminRoleName = process.env.ADMIN_ROLE || "ADMIN"

    let allUsers: (typeof users.$inferSelect)[] = []

    if (isSuperUser && !branchId) {
        // Super users see all users if no branch filter
        allUsers = await db.query.users.findMany({
            orderBy: [desc(users.firstName)],
        })
    } else if (branchId) {
        if (isSuperUser) {
            // Super user viewing a specific branch sees all users assigned to that branch
            const branchUsers = await db.select({ user: users })
                .from(users)
                .innerJoin(userBranchRoles, eq(users.id, userBranchRoles.userId))
                .where(eq(userBranchRoles.branchId, branchId))
                .orderBy(desc(users.firstName))

            allUsers = branchUsers.map(r => r.user)
        } else {
            // Non-super users only see non-admin users assigned to their SPECIFIC branch
            const branchUsers = await db.select({ user: users })
                .from(users)
                .innerJoin(userBranchRoles, eq(users.id, userBranchRoles.userId))
                .where(
                    and(
                        eq(userBranchRoles.branchId, branchId),
                        isNull(users.role) // Exclude global admins
                    )
                )
                .orderBy(desc(users.firstName))

            allUsers = branchUsers.map(r => r.user)
        }
    } else {
        // Fallback for non-super users with no branch (session fallback)
        if (isSuperUser) {
            allUsers = await db.query.users.findMany({
                orderBy: [desc(users.firstName)],
            })
        }
    }

    // Fetch branch-role mappings for these filtered users
    const userIds = allUsers.map(u => u.id);
    let mappings: { userId: string, branchId: string, roleId: string }[] = [];

    if (userIds.length > 0) {
        let mappingQuery = db.select({
            userId: userBranchRoles.userId,
            branchId: userBranchRoles.branchId,
            roleId: userBranchRoles.roleId,
        })
            .from(userBranchRoles)
            .where(inArray(userBranchRoles.userId, userIds));

        // Scope mappings to the current branch if not super user
        if (!isSuperUser && branchId) {
            // Filter mappings to only show assignments for this branch
            mappings = await db.select({
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
                );
        } else {
            mappings = await mappingQuery;
        }
    }



    // Scoped branches for UI
    let scopedBranches: (typeof branches.$inferSelect)[] = []
    if (isSuperUser) {
        scopedBranches = await db.query.branches.findMany();
    } else if (branchId) {
        scopedBranches = await db.query.branches.findMany({
            where: eq(branches.id, branchId)
        });
    }

    // All roles (including branch-specific ones)
    const allRoles = await db.select().from(roles).orderBy(desc(roles.createdAt))

    // Create lookup maps
    const branchMap = new Map((isSuperUser ? await db.query.branches.findMany() : scopedBranches).map(b => [b.id, b.name]));
    const roleMap = new Map(allRoles.map(r => [r.id, r.name]));

    // Attach branch-role assignments to users
    const usersWithBranchRoles = allUsers.map(user => {
        const userBranchRoleData = mappings
            .filter(m => m.userId === user.id)
            .map(m => ({
                branchId: m.branchId,
                branchName: branchMap.get(m.branchId) || "Unknown",
                roleId: m.roleId,
                roleName: roleMap.get(m.roleId) || "Unknown"
            }));
        return {
            ...user,
            branchRoles: userBranchRoleData,
            // Keep legacy branches field for backward compatibility in display
            branches: userBranchRoleData.map(br => ({
                id: br.branchId,
                name: br.branchName,
                roleId: br.roleId,
                roleName: br.roleName
            }))
        }
    });

    return { users: usersWithBranchRoles, allBranches: scopedBranches, allRoles };
}


export async function createUser(data: {
    email: string;
    firstName?: string;
    lastName?: string;
    mobile?: string;
    dob?: string;
    roleName?: string; // For ADMIN users only
    branchRoleAssignments?: BranchRoleAssignment[]; // For non-admin users
}) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized");

    const adminRoleName = process.env.ADMIN_ROLE || "ADMIN"
    const isAdmin = data.roleName === adminRoleName

    // Validation: Non-ADMIN users MUST have at least one branch-role assignment
    if (!isAdmin && (!data.branchRoleAssignments || data.branchRoleAssignments.length === 0)) {
        throw new Error("Please assign at least one branch with a role for this user.")
    }

    // Check email
    const existing = await db.query.users.findFirst({ where: eq(users.email, data.email) })
    if (existing) throw new Error("User with this email already exists")

    // Insert User
    // For ADMIN users, store role in users.role field
    // For non-admin users, role is stored per-branch in userBranchRoles
    const [newUser] = await db.insert(users).values({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email,
        mobile: data.mobile,
        dob: data.dob ? new Date(data.dob) : null,
        role: isAdmin ? adminRoleName : null, // Only set role for admin users
    }).returning()

    // Assign Branch-Roles if not Admin
    if (!isAdmin && data.branchRoleAssignments && data.branchRoleAssignments.length > 0) {
        await db.insert(userBranchRoles).values(
            data.branchRoleAssignments.map(ba => ({
                userId: newUser.id,
                branchId: ba.branchId,
                roleId: ba.roleId
            }))
        )
    }

    revalidatePath("/management/users");
}

export async function updateUser(id: string, data: {
    firstName?: string;
    lastName?: string;
    mobile?: string;
    dob?: string;
    roleName?: string; // For ADMIN users only
    branchRoleAssignments?: BranchRoleAssignment[]; // For non-admin users
}) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized");

    const adminRoleName = process.env.ADMIN_ROLE || "ADMIN"
    const isAdmin = data.roleName === adminRoleName

    // Validation: Non-ADMIN users MUST have at least one branch-role assignment
    if (!isAdmin && (!data.branchRoleAssignments || data.branchRoleAssignments.length === 0)) {
        throw new Error("Please assign at least one branch with a role for this user.")
    }

    await db.update(users).set({
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        mobile: data.mobile,
        dob: data.dob ? new Date(data.dob) : null,
        role: isAdmin ? adminRoleName : null, // Only set role for admin users
    }).where(eq(users.id, id))

    // Update branch-role assignments
    await db.transaction(async (tx) => {
        // Remove all existing assignments
        await tx.delete(userBranchRoles).where(eq(userBranchRoles.userId, id));

        // Add new assignments if not admin
        if (!isAdmin && data.branchRoleAssignments && data.branchRoleAssignments.length > 0) {
            await tx.insert(userBranchRoles).values(
                data.branchRoleAssignments.map(ba => ({
                    userId: id,
                    branchId: ba.branchId,
                    roleId: ba.roleId
                }))
            );
        }
    });

    revalidatePath("/management/users");
}

export async function deleteUser(id: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized");

    // Prevent deleting yourself?
    if (session.user.id === id) throw new Error("Cannot delete yourself")

    await db.delete(users).where(eq(users.id, id))
    revalidatePath("/management/users");
}

/**
 * Get roles available for a specific branch
 * Returns roles that are either global (no branchId) or belong to the specified branch
 */
export async function getRolesForBranch(branchId: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized");

    const adminRoleName = process.env.ADMIN_ROLE || "ADMIN"

    // Get roles for this branch OR global roles (except ADMIN which is special)
    return db.query.roles.findMany({
        where: (r, { eq, or, and, ne }) => or(
            eq(r.branchId, branchId),
            and(isNull(r.branchId), ne(r.name, adminRoleName))
        ),
        orderBy: [desc(roles.name)],
    })
}

