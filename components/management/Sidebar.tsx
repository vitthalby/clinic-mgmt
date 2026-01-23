"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    Calendar,
    CreditCard,
    Settings,
    LogOut,
    Building2,
    Briefcase,
    ShieldCheck
} from "lucide-react"
import { siteConfig } from "@/config/site"
import { signOut } from "next-auth/react"

const navigation = [
    { name: "Dashboard", href: "/management", icon: LayoutDashboard },
    { name: "Appointments", href: "/management/appointments", icon: Calendar },
    { name: "Customers", href: "/management/customers", icon: Users },
    { name: "Payments", href: "/management/payments", icon: CreditCard },
    { name: "Branches", href: "/management/branches", icon: Building2 },
    { name: "Staff Management", href: "/management/users", icon: Briefcase },
    { name: "Roles", href: "/management/roles", icon: ShieldCheck },
    { name: "Settings", href: "/management/settings", icon: Settings },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full min-h-screen">
            <div className="flex items-center px-6 h-16 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center font-bold text-white">
                        {siteConfig.name.charAt(0)}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{siteConfig.name}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-3 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-500"
                                        }`}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors group"
                >
                    <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
