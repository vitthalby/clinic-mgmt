
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ShieldBan, ArrowRight, Lock } from "lucide-react"

interface AccessDeniedContentProps {
    redirectPath: string
    redirectSeconds: number
}

export default function AccessDeniedContent({ redirectPath, redirectSeconds }: AccessDeniedContentProps) {
    const router = useRouter()
    const [countdown, setCountdown] = useState(redirectSeconds)

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    router.push(redirectPath)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [router, redirectPath])

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
            >
                {/* Header Decoration */}
                <div className="h-2 bg-indigo-600" />

                <div className="p-8 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <motion.div
                                initial={{ rotate: -10 }}
                                animate={{ rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                className="h-20 w-20 rounded-2xl bg-indigo-50 flex items-center justify-center"
                            >
                                <Lock className="h-10 w-10 text-indigo-600" />
                            </motion.div>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        Access Denied
                    </h1>

                    <p className="text-gray-600 mb-8 leading-relaxed">
                        You do not have permission to access this application.
                        Please contact the System Administrator for support.
                    </p>

                    <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100">
                        <p className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">
                            Auto redirecting
                        </p>
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <span className="text-3xl font-bold text-indigo-600">{countdown}</span>
                            <span className="text-gray-400 font-medium">seconds</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: redirectSeconds, ease: "linear" }}
                                className="bg-indigo-600 h-full"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => router.push(redirectPath)}
                        className="w-full group inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-600/20"
                    >
                        Return to Login
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
                    <p className="text-xs text-center text-gray-400">
                        If you believe this is an error, please reach out to your IT department.
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
