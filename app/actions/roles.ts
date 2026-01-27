"use server"

import { db } from "@/lib/db"
import { roles, features, roleFeaturePermissions } from "@/lib/schema"
import { eq, desc } from "drizzle-orm"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getRoles() {
    const session = await auth()
    if (!session?.user) return []

    return db.select().from(roles).orderBy(desc(roles.createdAt))
}

export type PermissionInput = {
    featureId: string;
    canView: boolean;
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean
}

export async function createRole(data: { name: string; description?: string }, permissions?: PermissionInput[]) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    const newRole = await db.insert(roles).values({
        name: data.name.toUpperCase(),
        description: data.description,
    }).returning({ id: roles.id })

    const roleId = newRole[0]?.id

    if (roleId && permissions && permissions.length > 0) {
        await updateRolePermissions(roleId, permissions)
    }

    revalidatePath("/management/roles")
}

export async function updateRole(id: string, data: { name?: string; description?: string }, permissions?: PermissionInput[]) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    await db.update(roles).set(data).where(eq(roles.id, id))

    if (permissions) {
        await updateRolePermissions(id, permissions)
    }

    revalidatePath("/management/roles")
}

export async function deleteRole(id: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    // Check if role is in use? (Optional safety)


    // Check if role is in use? (Optional safety)

    await db.delete(roles).where(eq(roles.id, id))
    revalidatePath("/management/roles")
}

export async function getFeatures() {
    return db.query.features.findMany()
}

export async function getRolePermissions(roleId: string) {
    return db.query.roleFeaturePermissions.findMany({
        where: eq(roleFeaturePermissions.roleId, roleId),
    })
}

export async function updateRolePermissions(
    roleId: string,
    permissions: {
        featureId: string;
        canView: boolean;
        canAdd: boolean;
        canEdit: boolean;
        canDelete: boolean
    }[]
) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    // We can loop and upsert
    for (const p of permissions) {
        await db.insert(roleFeaturePermissions).values({
            roleId,
            featureId: p.featureId,
            canView: p.canView,
            canAdd: p.canAdd,
            canEdit: p.canEdit,
            canDelete: p.canDelete,
        }).onConflictDoUpdate({
            target: [roleFeaturePermissions.roleId, roleFeaturePermissions.featureId],
            set: {
                canView: p.canView,
                canAdd: p.canAdd,
                canEdit: p.canEdit,
                canDelete: p.canDelete,
                updatedAt: new Date(),
            }
        })
    }

    revalidatePath(`/management/roles/${roleId}`)
    revalidatePath("/management/roles")
}
