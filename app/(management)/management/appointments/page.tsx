import { auth } from "@/auth"
import { db } from "@/lib/db"
import { users, branches } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { getUserPermissions } from "@/lib/permissions"
import { redirect } from "next/navigation"
import AppointmentsClient from "@/components/management/AppointmentsClient"

export default async function AppointmentsPage() {
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

    // Appointments require a branch to be selected
    if (!currentBranchId && !isSuperUser) {
        redirect('/select-branch')
    }

    // Get user permissions
    const permissions = userId ? await getUserPermissions(userId, currentBranchId) : {}

    // Get branch name
    let branchName = "All Branches"
    if (currentBranchId) {
        const branch = await db.query.branches.findFirst({
            where: eq(branches.id, currentBranchId),
            columns: { name: true },
        })
        branchName = branch?.name || "Unknown Branch"
    }

    // If super user without branch selected, prompt them to select one
    if (!currentBranchId) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                <div className="bg-white shadow rounded-lg p-6 text-center">
                    <p className="text-gray-500 mb-4">
                        Please select a branch to view and manage appointments.
                    </p>
                    <a 
                        href="/select-branch"
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                        Select Branch
                    </a>
                </div>
            </div>
        )
    }

    return (
        <AppointmentsClient
            branchId={currentBranchId}
            branchName={branchName}
            permissions={permissions}
        />
    )
}
