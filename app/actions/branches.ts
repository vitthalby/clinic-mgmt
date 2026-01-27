"use server"

import { db } from "@/lib/db"
import { branches, userBranchRoles } from "@/lib/schema"
import { eq, desc, inArray, and } from "drizzle-orm"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function selectBranch(branchId: string) {
    cookies().set("clinic-branch-id", branchId)
}

export async function getAvailableBranches() {
    const session = await auth()
    if (!session || !session.user) {
        return []
    }

    const adminRoleName = process.env.ADMIN_ROLE || "ADMIN"

    // Role check logic. 
    if (session.user.role === adminRoleName) {
        return db.query.branches.findMany({
            orderBy: [desc(branches.createdAt)],
        })
    }

    if (!session.user.id) return []

    // Get branches from userBranchRoles table
    const mappings = await db.select({ branchId: userBranchRoles.branchId })
        .from(userBranchRoles)
        .where(eq(userBranchRoles.userId, session.user.id))
    const branchIds = mappings.map(m => m.branchId)

    if (branchIds.length === 0) return []

    return db.query.branches.findMany({
        where: inArray(branches.id, branchIds),
        orderBy: [desc(branches.createdAt)],
    })
}

export async function getBranches() {
    return db.query.branches.findMany({
        orderBy: [desc(branches.createdAt)],
    })
}

export async function createBranch(data: { name: string; address?: string; phone?: string; email?: string; pinCode?: string; state?: string }) {
    const session = await auth()
    if (!session?.user) {
        throw new Error("Unauthorized")
    }

    await db.insert(branches).values({
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        pinCode: data.pinCode,
        state: data.state,
    })

    revalidatePath("/management/branches")
}

export async function updateBranch(id: string, data: { name?: string; address?: string; phone?: string; email?: string; pinCode?: string; state?: string; isActive?: boolean }) {
    const session = await auth()
    if (!session?.user) {
        throw new Error("Unauthorized")
    }

    await db.update(branches).set(data).where(eq(branches.id, id))

    revalidatePath("/management/branches")
}
