'use client'

import { motion } from 'framer-motion'
import { CardProps } from '@/types/cards'

export default function Card({
    id,
    type,
    image,
    topRight,
    summary,
    title,
    subtitle,
    actionButton,
    className = '',
}: CardProps) {
    // Generate default image path if not provided
    const imagePath = image || `/images/${type}/cards/${id}.png`

    return (
        <motion.div
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`glass-card p-0 md:p-4 rounded-2xl group relative overflow-hidden hover:shadow-[0_20px_60px_rgba(255,61,0,0.15)] transition-shadow duration-500 h-full flex flex-col ${className}`}
        >
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange/0 via-orange/0 to-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Mobile First Content Structure */}
            <div className="flex flex-col h-full">
                {/* Header / Image Area */}
                <div className="relative p-4 pb-0 md:p-0 md:mb-3 flex items-start justify-between shrink-0">
                    {/* Circular Image/Avatar */}
                    <div className="w-10 h-10 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-orange/20 to-blue/20 flex items-center justify-center text-orange font-bold text-sm shrink-0 overflow-hidden">
                        {type === 'review' ? (
                            <span>{title.split(' ').map(n => n[0]).join('')}</span>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                {/* Icon placeholder or actual icon */}
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                        )}
                    </div>

                    {/* Top Right Slot */}
                    {topRight && type !== 'service' && (
                        <div className="flex-shrink-0">
                            {topRight}
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="p-4 md:p-0 flex flex-col flex-grow">
                    <div className="mb-2">
                        <h4 className="text-white font-semibold text-sm md:text-xs line-clamp-1">{title}</h4>
                        {subtitle && (
                            <p className="text-white/50 text-[10px] line-clamp-1">{subtitle}</p>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="flex-grow relative mb-3">
                        <p className="text-white/70 text-xs leading-relaxed line-clamp-3 md:line-clamp-4 group-hover:text-white/80 transition-colors duration-300">
                            "{summary}"
                        </p>
                    </div>

                    {/* Footer / Action */}
                    <div className="mt-auto pt-3 border-t border-white/5 group-hover:border-white/10 transition-colors duration-300">
                        {actionButton && (
                            actionButton.href ? (
                                <a
                                    href={actionButton.href}
                                    className={`w-full md:w-auto px-3 py-1.5 md:py-1.5 rounded-lg md:rounded-full text-[10px] font-medium transition-all duration-200 inline-block text-center ${actionButton.variant === 'primary'
                                        ? 'bg-orange text-white hover:bg-orange/80'
                                        : 'border border-white/10 text-white/80 hover:bg-white/5'
                                        }`}
                                >
                                    {actionButton.label}
                                </a>
                            ) : (
                                <button
                                    onClick={actionButton.onClick}
                                    className={`w-full md:w-auto px-3 py-1.5 md:py-1.5 rounded-lg md:rounded-full text-[10px] font-medium transition-all duration-200 ${actionButton.variant === 'primary'
                                        ? 'bg-orange text-white hover:bg-orange/80'
                                        : 'border border-white/10 text-white/80 hover:bg-white/5'
                                        }`}
                                >
                                    {actionButton.label}
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
