"use client"

import { Clock, User } from "lucide-react"
import type { AuditDisplayInfo } from "@/types/audit"

interface AuditInfoProps {
    audit: AuditDisplayInfo | null
    variant?: "inline" | "tooltip" | "detailed"
    className?: string
}

function formatDate(date: Date | null): string {
    if (!date) return "N/A"
    return new Date(date).toLocaleString()
}

function formatShortDate(date: Date | null): string {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString()
}

export function AuditInfo({ audit, variant = "inline", className = "" }: AuditInfoProps) {
    if (!audit) return null

    if (variant === "inline") {
        return (
            <div className={`text-xs text-gray-400 ${className}`}>
                {audit.createdAt && (
                    <span title={`Created: ${formatDate(audit.createdAt)}${audit.createdByName ? ` by ${audit.createdByName}` : ""}`}>
                        Created {formatShortDate(audit.createdAt)}
                    </span>
                )}
                {audit.updatedAt && audit.updatedAt !== audit.createdAt && (
                    <span title={`Updated: ${formatDate(audit.updatedAt)}${audit.updatedByName ? ` by ${audit.updatedByName}` : ""}`}>
                        {" · "}Modified {formatShortDate(audit.updatedAt)}
                    </span>
                )}
            </div>
        )
    }

    if (variant === "tooltip") {
        const tooltipContent = [
            audit.createdAt ? `Created: ${formatDate(audit.createdAt)}${audit.createdByName ? ` by ${audit.createdByName}` : ""}` : null,
            audit.updatedAt ? `Updated: ${formatDate(audit.updatedAt)}${audit.updatedByName ? ` by ${audit.updatedByName}` : ""}` : null,
        ].filter(Boolean).join("\n")

        return (
            <span 
                className={`cursor-help text-gray-400 hover:text-gray-600 ${className}`}
                title={tooltipContent}
            >
                <Clock size={14} />
            </span>
        )
    }

    // detailed variant
    return (
        <div className={`text-xs text-gray-500 space-y-1 border-t pt-3 mt-3 ${className}`}>
            <div className="flex items-center gap-4">
                {audit.createdAt && (
                    <div className="flex items-center gap-1">
                        <Clock size={12} className="text-gray-400" />
                        <span>Created: {formatDate(audit.createdAt)}</span>
                        {audit.createdByName && (
                            <>
                                <User size={12} className="text-gray-400 ml-2" />
                                <span>{audit.createdByName}</span>
                            </>
                        )}
                    </div>
                )}
            </div>
            {audit.updatedAt && audit.updatedAt !== audit.createdAt && (
                <div className="flex items-center gap-1">
                    <Clock size={12} className="text-gray-400" />
                    <span>Updated: {formatDate(audit.updatedAt)}</span>
                    {audit.updatedByName && (
                        <>
                            <User size={12} className="text-gray-400 ml-2" />
                            <span>{audit.updatedByName}</span>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export function AuditBadge({ audit, className = "" }: { audit: AuditDisplayInfo | null; className?: string }) {
    if (!audit) return null

    return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-50 text-xs text-gray-500 ${className}`}>
            <Clock size={12} />
            <span suppressHydrationWarning>{formatShortDate(audit.updatedAt || audit.createdAt)}</span>
            {(audit.updatedByName || audit.createdByName) && (
                <>
                    <span className="text-gray-300">|</span>
                    <User size={12} />
                    <span>{audit.updatedByName || audit.createdByName}</span>
                </>
            )}
        </div>
    )
}

export default AuditInfo
