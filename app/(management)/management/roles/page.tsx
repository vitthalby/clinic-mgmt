import { getRoles } from "@/app/actions/roles"
import RolesClient from "@/components/management/RolesClient"

export default async function RolesPage() {
    const roles = await getRoles()

    return <RolesClient roles={roles} />
}
