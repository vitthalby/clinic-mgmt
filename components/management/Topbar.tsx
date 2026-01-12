"use client"

import { useSession } from "next-auth/react"

export default function Topbar() {
    const { data: session } = useSession()

    return (
        <header className="bg-white shadow">
            <div className="flex h-16 justify-between items-center px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">
                    Dashboard
                </h2>
                <div className="flex items-center">
                    <span className="text-sm text-gray-500">
                        {session?.user?.name ? `Welcome, ${session.user.name}` : "Welcome, User"}
                    </span>
                    {/* Avatar placeholder or user image */}
                    {session?.user?.image ? (
                        <img
                            src={session.user.image}
                            alt=""
                            className="ml-4 h-8 w-8 rounded-full border"
                        />
                    ) : (
                        <div className="ml-4 h-8 w-8 rounded-full bg-gray-200"></div>
                    )}
                </div>
            </div>
        </header>
    )
}
