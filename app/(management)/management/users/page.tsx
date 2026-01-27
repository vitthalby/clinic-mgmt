import { getUsers } from "@/app/actions/users"
import UsersClient from "@/components/management/UsersClient"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"

export default async function UsersPage() {
    const session = await auth()
    const adminRoleName = process.env.ADMIN_ROLE || "ADMIN"

    // Determine current user info
    let currentUserId = ""
    let isSuperUser = false
    if (session?.user?.email) {
        const dbUser = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        })
        isSuperUser = dbUser?.role === adminRoleName
        currentUserId = dbUser?.id || ""
    }

    // Get current branch from cookie
    const currentBranchId = cookies().get('clinic-branch-id')?.value

    const { users: allUsers, allBranches, allRoles } = await getUsers(currentBranchId, isSuperUser)

    return (
        <UsersClient
            users={allUsers}
            allBranches={allBranches}
            allRoles={allRoles}
            adminRoleName={adminRoleName}
            isSuperUser={isSuperUser}
            currentUserId={currentUserId}
        />
    )
}


