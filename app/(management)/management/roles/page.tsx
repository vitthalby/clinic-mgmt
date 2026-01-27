import { getFeatures, getRoles, getAllBranches } from "@/app/actions/roles"
import RolesClient from "@/components/management/RolesClient"
import { auth } from "@/auth"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { users } from "@/lib/schema"
import { eq } from "drizzle-orm"

export default async function RolesPage() {
    const session = await auth()
    const adminRoleName = process.env.ADMIN_ROLE || "ADMIN"

    // Determine if current user is super user
    let isSuperUser = false
    if (session?.user?.email) {
        const dbUser = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        })
        isSuperUser = dbUser?.role === adminRoleName
    }

    // Get current branch from cookie
    const branchId = isSuperUser ? undefined : cookies().get('clinic-branch-id')?.value

    // Determine current user's role in this branch
    let currentRoleId = ""
    if (session?.user?.email && branchId) {
        const dbUser = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        })
        if (dbUser) {
            const userBranchMapping = await db.query.userBranchRoles.findFirst({
                where: (ubr, { eq, and }) => and(
                    eq(ubr.userId, dbUser.id),
                    eq(ubr.branchId, branchId)
                )
            })
            currentRoleId = userBranchMapping?.roleId || ""
        }
    }

    const roles = await getRoles(branchId, isSuperUser)
    const features = await getFeatures()
    const allBranches = isSuperUser ? await getAllBranches() : []

    return (
        <RolesClient
            roles={roles}
            features={features}
            adminRoleName={adminRoleName}
            isSuperUser={isSuperUser}
            currentBranchId={branchId}
            allBranches={allBranches}
            currentRoleId={currentRoleId}
        />
    )
}


