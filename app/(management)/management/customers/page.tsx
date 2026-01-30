import { getCustomers } from "@/app/actions/customers"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { users, branches } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { getUserPermissions } from "@/lib/permissions"
import CustomersClient from "@/components/management/CustomersClient"

export default async function CustomersPage() {
    const session = await auth()
    const adminRoleName = process.env.ADMIN_ROLE || "ADMIN"

    // Determine current user info
    let isSuperUser = false
    let userId = ""
    if (session?.user?.email) {
        const dbUser = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        })
        isSuperUser = dbUser?.role === adminRoleName
        userId = dbUser?.id || ""
    }

    // Get current branch from cookie
    const currentBranchId = cookies().get('clinic-branch-id')?.value

    // Get user permissions for customers feature
    const permissions = userId ? await getUserPermissions(userId, currentBranchId) : {}

    // Fetch initial customers
    const { customers, total } = await getCustomers({
        branchId: isSuperUser ? undefined : currentBranchId,
        page: 1,
        limit: 10,
    })

    // Fetch branches for the dropdown
    let allBranches: { id: string; name: string }[] = []
    if (isSuperUser) {
        allBranches = await db
            .select({ id: branches.id, name: branches.name })
            .from(branches)
    } else if (currentBranchId) {
        const branch = await db.query.branches.findFirst({
            where: eq(branches.id, currentBranchId),
            columns: { id: true, name: true },
        })
        if (branch) {
            allBranches = [branch]
        }
    }

    return (
        <CustomersClient
            initialCustomers={customers}
            initialTotal={total}
            branches={allBranches}
            currentBranchId={currentBranchId}
            permissions={permissions}
        />
    )
}
