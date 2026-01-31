"use client"

import Image from "next/image"
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
    ShieldCheck,
    Stethoscope
} from "lucide-react"
import { siteConfig } from "@/config/site"
import { signOut } from "next-auth/react"

import { PermissionMap } from "@/lib/permissions"

const navigation = [
    { name: "Dashboard", href: "/management", icon: LayoutDashboard, key: "dashboard" },
    { name: "Appointments", href: "/management/appointments", icon: Calendar, key: "appointments" },
    { name: "Customers", href: "/management/customers", icon: Users, key: "customers" },
    { name: "Payments", href: "/management/payments", icon: CreditCard, key: "payments" },
    { name: "Branches", href: "/management/branches", icon: Building2, key: "branches" },
    { name: "Staff Management", href: "/management/users", icon: Briefcase, key: "users" },
    { name: "Roles", href: "/management/roles", icon: ShieldCheck, key: "roles" },
    { name: "Services", href: "/management/services", icon: Stethoscope, key: "services" },
    { name: "Settings", href: "/management/settings", icon: Settings, key: "settings" },
]

interface SidebarProps {
    permissions?: PermissionMap
}

export default function Sidebar({ permissions }: SidebarProps) {
    const pathname = usePathname()

    // If no permissions provided (e.g. initial load or error), assume restrictions apply. 
    // Or if we want to be safe, maybe show nothing or just Dashboard?
    // Let's assume passed permissions are authoritative.

    // Helper to check if item is allowed
    const isAllowed = (key: string) => {
        if (!permissions) return false; // Default deny
        // If explicitly set
        if (permissions[key]?.canView) return true;
        // If undefined, maybe allow if it's Dashboard? Or deny?
        // User said "check user -> role -> feature access".
        // Use strict allow.
        return false;
    };

    const allowedNavigation = navigation.filter(item => {
        // If permissions are completely empty but user is logged in (handled by layout), 
        // what should happen? 
        // Maybe valid user but no role assigned?
        // We should probably allow showing the item if the featureKey is not in DB? 
        // No, "Every menu item can be added as feature".

        // Handle "Day-0" case where admin hasn't set up roles yet?
        // We seeded ADMIN user. If we seeded Features, and seeded RolePermissions (which we haven't done yet for Admin),
        // then Admin sees nothing!
        // CRITICAL: We need to Ensure ADMIN sees everything.
        // My `getUserPermissions` relies on DB.
        // I should probably update `getUserPermissions` to return all True for ADMIN role name, 
        // OR ensure I seed the permissions for ADMIN.

        // Better to seed permissions for ADMIN.
        // But for now, let's implement the filter.
        return isAllowed(item.key);
    });

    return (
        <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full min-h-screen">
            <div className="flex items-center px-6 h-16 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 flex-shrink-0">
                        <Image
                            src={siteConfig.logo}
                            alt={siteConfig.name}
                            fill
                            className="object-contain rounded-lg"
                        />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-gray-900 truncate leading-tight">
                            {siteConfig.name}
                        </span>
                        <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-widest truncate">
                            {siteConfig.category}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-3 space-y-1">
                    {allowedNavigation.map((item) => {
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
