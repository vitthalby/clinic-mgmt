import { getUsers } from "@/app/actions/users"
import UsersClient from "@/components/management/UsersClient"

export default async function UsersPage() {
    const { users, allBranches, allRoles } = await getUsers()

    return <UsersClient users={users} allBranches={allBranches} allRoles={allRoles} />
}
