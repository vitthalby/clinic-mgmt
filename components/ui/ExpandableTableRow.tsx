"use client"

import { useState, ReactNode } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

interface ExpandableTableRowProps {
    columns: ReactNode[]
    expandedContent: ReactNode
    onExpand?: () => void
    isLoading?: boolean
}

export function ExpandableTableRow({ 
    columns, 
    expandedContent, 
    onExpand,
    isLoading = false 
}: ExpandableTableRowProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const handleToggle = () => {
        if (!isExpanded && onExpand) {
            onExpand()
        }
        setIsExpanded(!isExpanded)
    }

    return (
        <>
            <tr className="hover:bg-gray-50 cursor-pointer" onClick={handleToggle}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                        className="focus:outline-none"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleToggle()
                        }}
                    >
                        {isExpanded ? (
                            <ChevronDown size={18} className="text-gray-600" />
                        ) : (
                            <ChevronRight size={18} className="text-gray-400" />
                        )}
                    </button>
                </td>
                {columns.map((column, idx) => (
                    <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm">
                        {column}
                    </td>
                ))}
            </tr>
            {isExpanded && (
                <tr>
                    <td colSpan={columns.length + 1} className="px-6 py-4 bg-gray-50 border-t border-b border-gray-200">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {expandedContent}
                            </div>
                        )}
                    </td>
                </tr>
            )}
        </>
    )
}

interface ExpandedDetailRowProps {
    label: string
    value: ReactNode
}

export function ExpandedDetailRow({ label, value }: ExpandedDetailRowProps) {
    return (
        <div className="flex py-2 border-b border-gray-200 last:border-b-0">
            <dt className="text-sm font-medium text-gray-500 w-1/3">{label}</dt>
            <dd className="text-sm text-gray-900 w-2/3">{value || "—"}</dd>
        </div>
    )
}

interface ExpandedDetailSectionProps {
    title: string
    children: ReactNode
}

export function ExpandedDetailSection({ title, children }: ExpandedDetailSectionProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>
            <dl className="space-y-0">
                {children}
            </dl>
        </div>
    )
}
