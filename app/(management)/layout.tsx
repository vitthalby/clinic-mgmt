import { Outfit } from 'next/font/google'
import Sidebar from '@/components/management/Sidebar'
import Topbar from '@/components/management/Topbar'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AuthProvider } from '@/components/providers/AuthProvider'

const outfit = Outfit({ subsets: ['latin'] })

export default async function ManagementLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session) {
        redirect('/login')
    }

    return (
        <AuthProvider>
            <div className={`min-h-screen bg-gray-100 flex ${outfit.className}`}>
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                    <Topbar />
                    <main className="flex-1 p-6 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </AuthProvider>
    )
}
