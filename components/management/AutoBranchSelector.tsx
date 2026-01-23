"use client"

import { useEffect } from "react"
import { selectBranch } from "@/app/actions/branches"
import { useRouter } from "next/navigation"

export default function AutoBranchSelector({ branchId }: { branchId: string }) {
    const router = useRouter()

    useEffect(() => {
        async function autoSelect() {
            await selectBranch(branchId)
            router.push("/management")
            router.refresh()
        }
        autoSelect()
    }, [branchId, router])

    return (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-500">Redirecting to your branch...</p>
        </div>
    )
}
