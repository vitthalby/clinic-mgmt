"use client"

import { useSession } from "next-auth/react"
import { Bell, Search } from "lucide-react"

export default function Topbar() {
    const { data: session } = useSession()

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
            <div className="flex h-16 justify-between items-center px-4 sm:px-6 lg:px-8">
                <div className="flex-1 flex items-center">
                    <div className="max-w-md w-full relative hidden sm:block text-gray-400 focus-within:text-gray-600">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div className="ml-4 flex items-center md:ml-6 gap-4">
                    <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                        <span className="sr-only">View notifications</span>
                        <Bell className="h-6 w-6" aria-hidden="true" />
                    </button>

                    <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium text-gray-900">
                                {session?.user?.name || "User"}
                            </div>
                            <div className="text-xs text-gray-500">
                                {session?.user?.role || "Role"}
                            </div>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                            {session?.user?.name?.charAt(0) || "U"}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
