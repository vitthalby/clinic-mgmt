import { getFeatures, getRoles } from "@/app/actions/roles"
import RolesClient from "@/components/management/RolesClient"

export default async function RolesPage() {
    const roles = await getRoles()
    const features = await getFeatures()
    const adminRoleName = process.env.ADMIN_ROLE || "ADMIN"

    return <RolesClient roles={roles} features={features} adminRoleName={adminRoleName} />
}
