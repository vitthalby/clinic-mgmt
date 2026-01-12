"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    Calendar,
    CreditCard,
    Settings,
    LogOut
} from "lucide-react"

import { signOut } from "next-auth/react"

const navigation = [
    { name: "Dashboard", href: "/management", icon: LayoutDashboard },
    { name: "Appointments", href: "/management/appointments", icon: Calendar },
    { name: "Customers", href: "/management/customers", icon: Users },
    { name: "Payments", href: "/management/payments", icon: CreditCard },
    { name: "Staff Management", href: "/management/users", icon: Settings }, // Reusing icon for now or add a UserCog icon
    { name: "Settings", href: "/management/settings", icon: Settings },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex flex-col w-64 bg-white border-r h-full min-h-screen">
            <div className="flex items-center justify-center h-16 border-b">
                <h1 className="text-xl font-bold text-gray-800">Clinic Manager</h1>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-2 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                                    ? "bg-indigo-50 text-indigo-600"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 h-6 w-6 flex-shrink-0 ${isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-500"
                                        }`}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="p-4 border-t">
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                >
                    <LogOut className="mr-3 h-6 w-6 text-gray-400" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
