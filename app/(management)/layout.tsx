import { Outfit } from 'next/font/google'
import Sidebar from '@/components/management/Sidebar'
import Topbar from '@/components/management/Topbar'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { cookies, headers } from 'next/headers'
import { db } from "@/lib/db"
import { users } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { getAvailableBranches } from '@/app/actions/branches'
import { getUserPermissions } from "@/lib/permissions"
import { PermissionsProvider } from "@/components/providers/PermissionsProvider"

const outfit = Outfit({ subsets: ['latin'] })

export default async function ManagementLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session || !session.user?.email) {
        redirect('/login')
    }

    // Fetch user directly from DB to ensure freshest role data
    const dbUser = await db.query.users.findFirst({
        where: eq(users.email, session.user.email)
    })

    const adminRoleName = process.env.ADMIN_ROLE || "ADMIN"
    const role = dbUser?.role || session.user.role
    const isSuperUser = role === adminRoleName

    let branchId = isSuperUser ? 'head-office' : cookies().get('clinic-branch-id')?.value

    // Determine current path to avoid infinite redirect loop
    const xUrl = headers().get('x-url') || ""
    const isSelectBranchPage = xUrl.includes('/select-branch')

    // Branch Access Verification for non-SuperUsers
    if (!isSuperUser && dbUser) {
        // Get branches from userBranchRoles table
        const userBranchMappings = await db.query.userBranchRoles.findMany({
            where: (ubr, { eq }) => eq(ubr.userId, dbUser.id)
        })
        const allowedBranchIds = userBranchMappings.map(m => m.branchId)

        // If a branch is selected, verify it's still assigned to this user
        if (branchId && !allowedBranchIds.includes(branchId)) {
            // Instead of deleting cookie immediately, redirect to branch selection
            // This avoids cookie modification issues during login flow
            redirect('/select-branch')
        }

        // If no branch selected (or was just cleared), redirect to selection
        if (!branchId && !isSelectBranchPage) {
            redirect('/select-branch')
        }
    } else if (isSuperUser && branchId && branchId !== 'head-office') {
        const branchExist = await db.query.branches.findFirst({
            where: (branches, { eq }) => eq(branches.id, branchId as string)
        })
        if (!branchExist) {
            branchId = undefined
        }
    }

    const permissions = dbUser?.id ? await getUserPermissions(dbUser.id, branchId) : {};

    const availableBranches = await getAvailableBranches()

    let branchName = ""
    let displayedRole = role

    if (isSuperUser) {
        branchName = "Head Office"
        displayedRole = adminRoleName
    } else if (branchId && dbUser) {
        // Fetch specific branch name and user's role in that branch
        const branch = await db.query.branches.findFirst({
            where: (branches, { eq }) => eq(branches.id, branchId as string)
        })
        branchName = branch?.name || ""

        // Fetch user's role for this branch
        const userBranchMapping = await db.query.userBranchRoles.findFirst({
            where: (ubr, { eq, and }) => and(
                eq(ubr.userId, dbUser.id),
                eq(ubr.branchId, branchId as string)
            )
        })

        if (userBranchMapping) {
            const userRole = await db.query.roles.findFirst({
                where: (r, { eq }) => eq(r.id, userBranchMapping.roleId)
            })
            if (userRole) {
                displayedRole = userRole.name
            }
        }
    }


    return (
        <AuthProvider>
            <PermissionsProvider permissions={permissions}>
                <div className={`min-h-screen bg-gray-50 flex ${outfit.className}`}>
                    {/* Sidebar - Visible on Desktop */}
                    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 shadow-lg z-50">
                        <Sidebar permissions={permissions} />
                    </div>

                    {/* Main Content Area */}
                    <div className="flex flex-col flex-1 md:pl-64">
                        <Topbar
                            branchName={branchName}
                            currentBranchId={branchId}
                            role={displayedRole}
                            availableBranches={availableBranches}
                            isSuperUser={isSuperUser}
                        />
                        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
                            {children}
                        </main>
                    </div>
                </div>
            </PermissionsProvider>
        </AuthProvider>
    )
}
