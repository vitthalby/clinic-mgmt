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
            whileHover={{ scale: 1.05, y: -8 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`glass-card p-4 rounded-2xl group relative overflow-hidden hover:shadow-[0_20px_60px_rgba(255,61,0,0.15)] transition-shadow duration-500 aspect-square flex flex-col ${className}`}
        >
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange/0 via-orange/0 to-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Header: Image Left, TopRight Content Right */}
            <div className="relative flex items-start justify-between mb-3">
                {/* Circular Image/Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange/20 to-blue/20 flex items-center justify-center text-orange font-bold text-sm shrink-0 overflow-hidden">
                    {type === 'review' ? (
                        // For reviews, show initials if no image
                        <span>{title.split(' ').map(n => n[0]).join('')}</span>
                    ) : type === 'service' && topRight ? (
                        // For services, if topRight has the icon, show it here in the left circle
                        <div className="w-full h-full flex items-center justify-center scale-75 text-white/80 group-hover:text-orange transition-colors duration-300">
                            {topRight}
                        </div>
                    ) : image ? (
                        // For other types with images, show the image
                        <img src={imagePath} alt={title} className="w-full h-full object-cover" />
                    ) : (
                        // Fallback: show first letter
                        <span>{title[0]}</span>
                    )}
                </div>

                {/* Top Right Slot - Only show if not a service (since services use it for icon on left) */}
                {topRight && type !== 'service' && (
                    <div className="flex-shrink-0">
                        {topRight}
                    </div>
                )}
            </div>

            {/* Summary Text - Grows to fill space */}
            <div className="flex-grow relative mb-3">
                <p className="text-white/70 text-xs leading-relaxed line-clamp-4 group-hover:text-white/80 transition-colors duration-300">
                    "{summary}"
                </p>
            </div>

            {/* Footer: Title/Subtitle Left, Action Button Right */}
            <div className="relative pt-3 border-t border-white/5 group-hover:border-white/10 transition-colors duration-300 mt-auto">
                <div className="flex items-end justify-between">
                    <div className="flex-1">
                        <h4 className="text-white font-semibold text-xs">{title}</h4>
                        {subtitle && (
                            <p className="text-white/50 text-[10px]">{subtitle}</p>
                        )}
                    </div>

                    {/* Action Button */}
                    {actionButton && (
                        <button
                            onClick={actionButton.onClick}
                            className={`ml-2 px-3 py-1.5 rounded-full text-[10px] font-medium transition-all duration-200 shrink-0 ${actionButton.variant === 'primary'
                                ? 'bg-orange text-white hover:bg-orange/80 hover:scale-105'
                                : 'border border-white/10 text-white/80 hover:bg-white/5 hover:border-white/20'
                                }`}
                        >
                            {actionButton.label}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
