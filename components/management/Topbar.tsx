"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Bell, Search, ChevronDown, Building2, Check } from "lucide-react"
import { selectBranch } from "@/app/actions/branches"
import { useRouter } from "next/navigation"

interface TopbarProps {
    branchName?: string
    currentBranchId?: string
    role?: string | null
    availableBranches?: { id: string, name: string }[]
    isSuperUser?: boolean
}

export default function Topbar({ branchName, currentBranchId, role, availableBranches = [], isSuperUser = false }: TopbarProps) {
    const { data: session } = useSession()
    const [isBranchOpen, setIsBranchOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const handleBranchChange = async (id: string) => {
        if (id === currentBranchId) return
        await selectBranch(id)
        setIsBranchOpen(false)
        window.location.reload()
    }


    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsBranchOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
            <div className="flex h-16 justify-between items-center px-4 sm:px-6 lg:px-8">
                <div className="flex-1 flex items-center">
                    {/* Display Branch Name if available */}
                    {branchName && (
                        <div className="relative">
                            {isSuperUser ? (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 cursor-default hidden md:flex">
                                    <Building2 size={16} />
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Branch</span>
                                        <span className="text-sm font-semibold">{branchName}</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => (availableBranches.length > 1) && setIsBranchOpen(!isBranchOpen)}
                                        className={`flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 transition-all ${availableBranches.length > 1 ? 'hover:bg-indigo-100 cursor-pointer' : 'cursor-default'} hidden md:flex`}
                                    >
                                        <Building2 size={16} />
                                        <div className="flex flex-col items-start leading-none">
                                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Active Branch</span>
                                            <span className="text-sm font-semibold">{branchName}</span>
                                        </div>
                                        {availableBranches.length > 1 && (
                                            <ChevronDown size={14} className={`ml-1 transition-transform ${isBranchOpen ? 'rotate-180' : ''}`} />
                                        )}
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isBranchOpen && availableBranches.length > 1 && (
                                        <div ref={dropdownRef} className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Switch Branch</span>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto py-1">
                                                {availableBranches.map((branch) => (
                                                    <button
                                                        key={branch.id}
                                                        onClick={() => handleBranchChange(branch.id)}
                                                        className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-indigo-50 transition-colors ${branch.id === currentBranchId ? 'bg-indigo-50/30 text-indigo-700' : 'text-gray-700'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${branch.id === currentBranchId ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                                <Building2 size={14} />
                                                            </div>
                                                            <span className="text-sm font-medium">{branch.name}</span>
                                                        </div>
                                                        {branch.id === currentBranchId && <Check size={16} className="text-indigo-600" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <div className="max-w-md w-full relative hidden lg:block text-gray-400 focus-within:text-gray-600 ml-6">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all"
                        />
                    </div>
                </div>

                <div className="ml-4 flex items-center md:ml-6 gap-4">
                    <button className="bg-white p-2 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all focus:outline-none">
                        <span className="sr-only">View notifications</span>
                        <Bell className="h-5 w-5" aria-hidden="true" />
                    </button>

                    <div className="flex items-center gap-3 border-l border-gray-100 pl-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-gray-900 leading-tight">
                                {session?.user?.name || "User"}
                            </div>
                            <div className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">
                                {role || session?.user?.role || "Role"}
                                {branchName && <span className="md:hidden"> • {branchName}</span>}
                            </div>
                        </div>
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-200">
                            {session?.user?.name?.charAt(0) || "U"}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
