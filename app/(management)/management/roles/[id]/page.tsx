import { getFeatures, getRolePermissions } from "@/app/actions/roles"
import RolePermissionsForm from "@/components/management/RolePermissionsForm"
import { db } from "@/lib/db"
import { roles } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"

export default async function RolePermissionsPage({ params }: { params: { id: string } }) {
    const roleId = params.id
    const role = await db.query.roles.findFirst({
        where: eq(roles.id, roleId)
    })

    if (!role) notFound()

    const features = await getFeatures()
    const permissions = await getRolePermissions(roleId)

    const sanitizedPermissions = permissions.map(p => ({
        featureId: p.featureId,
        canView: p.canView ?? false,
        canAdd: p.canAdd ?? false,
        canEdit: p.canEdit ?? false,
        canDelete: p.canDelete ?? false,
    }))

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Manage Permissions: {role.name}</h1>
            <RolePermissionsForm
                roleId={roleId}
                features={features}
                initialPermissions={sanitizedPermissions}
            />
        </div>
    )
}
