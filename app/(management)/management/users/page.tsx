import { getUsers } from "@/app/actions/users"
import UsersClient from "@/components/management/UsersClient"

export default async function UsersPage() {
    const { users, allBranches, allRoles } = await getUsers()
    const adminRoleName = process.env.ADMIN_ROLE || "ADMIN"

    return <UsersClient users={users} allBranches={allBranches} allRoles={allRoles} adminRoleName={adminRoleName} />
}
