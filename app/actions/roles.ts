"use server"

import { db } from "@/lib/db"
import { roles } from "@/lib/schema"
import { eq, desc } from "drizzle-orm"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getRoles() {
    const session = await auth()
    if (!session?.user) return []

    return db.select().from(roles).orderBy(desc(roles.createdAt))
}

export async function createRole(data: { name: string; description?: string }) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    await db.insert(roles).values({
        name: data.name.toUpperCase(),
        description: data.description,
    })

    revalidatePath("/management/roles")
}

export async function updateRole(id: string, data: { name?: string; description?: string }) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    await db.update(roles).set(data).where(eq(roles.id, id))

    revalidatePath("/management/roles")
}

export async function deleteRole(id: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    // Check if role is in use? (Optional safety)

    await db.delete(roles).where(eq(roles.id, id))
    revalidatePath("/management/roles")
}
