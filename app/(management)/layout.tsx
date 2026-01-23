import { Outfit } from 'next/font/google'
import Sidebar from '@/components/management/Sidebar'
import Topbar from '@/components/management/Topbar'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { cookies } from 'next/headers'
import { db } from "@/lib/db"
import { users } from "@/lib/schema"
import { eq } from "drizzle-orm"

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

    const role = dbUser?.role || session.user.role
    const branchId = cookies().get('clinic-branch-id')?.value

    // If no branch selected, only allow ADMIN users to proceed
    if (!branchId && role !== 'ADMIN') {
        redirect('/select-branch')
    }

    return (
        <AuthProvider>
            <div className={`min-h-screen bg-gray-50 flex ${outfit.className}`}>
                {/* Sidebar - Visible on Desktop */}
                <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 shadow-lg z-50">
                    <Sidebar />
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col flex-1 md:pl-64">
                    <Topbar />
                    <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
                        {children}
                    </main>
                </div>
            </div>
        </AuthProvider>
    )
}
