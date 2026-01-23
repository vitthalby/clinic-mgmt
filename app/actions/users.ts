"use server"

import { db } from "@/lib/db"
import { users, userBranches, branches, roles } from "@/lib/schema"
import { eq, inArray, desc } from "drizzle-orm"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getUsers() {
    const session = await auth()
    if (!session || !session.user) {
        throw new Error("Unauthorized")
    }

    const allUsers = await db.query.users.findMany({
        orderBy: [desc(users.firstName)],
    })

    // Fetch mappings
    const userIds = allUsers.map(u => u.id);
    let mappings: { userId: string, branchId: string }[] = [];

    if (userIds.length > 0) {
        mappings = await db.select({
            userId: userBranches.userId,
            branchId: userBranches.branchId
        })
            .from(userBranches)
            .where(inArray(userBranches.userId, userIds));
    }

    // All branches
    const allBranches = await db.query.branches.findMany();

    const allRoles = await db.select().from(roles).orderBy(desc(roles.createdAt))

    // Map branchId to Name for display
    const branchMap = new Map(allBranches.map(b => [b.id, b.name]));

    // Attach branches to users
    const usersWithBranches = allUsers.map(user => {
        const userBranchIds = mappings.filter(m => m.userId === user.id).map(m => m.branchId);
        return {
            ...user,
            branches: userBranchIds.map(id => ({ id, name: branchMap.get(id) || "Unknown" }))
        }
    });

    return { users: usersWithBranches, allBranches: allBranches, allRoles: allRoles };
}

export async function createUser(data: any) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized");

    // Check email
    const existing = await db.query.users.findFirst({ where: eq(users.email, data.email) })
    if (existing) throw new Error("User with this email already exists")

    // Insert User
    const [newUser] = await db.insert(users).values({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        mobile: data.mobile,
        dob: data.dob ? new Date(data.dob) : null,
        role: data.roleName,
    }).returning()

    // Assign Branches if not Admin
    if (data.roleName !== 'ADMIN' && data.branchIds && data.branchIds.length > 0) {
        await db.insert(userBranches).values(
            data.branchIds.map((bid: string) => ({ userId: newUser.id, branchId: bid }))
        )
    }

    revalidatePath("/management/users");
}

export async function updateUser(id: string, data: any) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized");

    await db.update(users).set({
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        mobile: data.mobile,
        dob: data.dob ? new Date(data.dob) : null,
        role: data.roleName,
    }).where(eq(users.id, id))

    // Update branches
    await db.transaction(async (tx) => {
        await tx.delete(userBranches).where(eq(userBranches.userId, id));
        // Only if not admin
        if (data.roleName !== 'ADMIN' && data.branchIds && data.branchIds.length > 0) {
            await tx.insert(userBranches).values(
                data.branchIds.map((bid: string) => ({ userId: id, branchId: bid }))
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
