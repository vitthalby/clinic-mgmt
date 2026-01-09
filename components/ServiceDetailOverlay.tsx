'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ServiceData } from '@/types/cards'
import { useEffect } from 'react'

interface ServiceDetailOverlayProps {
    service: ServiceData | null
    onClose: () => void
}

export default function ServiceDetailOverlay({ service, onClose }: ServiceDetailOverlayProps) {
    // Lock body scroll when overlay is open
    useEffect(() => {
        if (service) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [service])

    return (
        <AnimatePresence>
            {service && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto"
                    >
                        {/* This container ensures the modal is centered but allows scrolling if content is tall */}
                        <div className="min-h-full flex items-center justify-center p-4">
                            {/* Modal Card */}
                            <motion.div
                                layoutId={`card-${service.id}`}
                                className="w-full max-w-4xl bg-surface-card rounded-3xl overflow-hidden relative shadow-2xl border border-white/10"
                                onClick={(e) => e.stopPropagation()} // Prevent click from closing
                            >
                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-md"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                <div className="grid md:grid-cols-2 gap-0">
                                    {/* Left: Image */}
                                    <div className="relative h-64 md:h-auto min-h-[300px]">
                                        <img
                                            src={service.largeImage || `/images/${service.id}.png`} // Fallback if largeImage missing
                                            alt={service.title}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent md:bg-gradient-to-r" />
                                    </div>

                                    {/* Right: Content */}
                                    <div className="p-8 flex flex-col">
                                        <div className="mb-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 text-orange">
                                                    {service.icon}
                                                </div>
                                                <span className="text-orange text-sm font-medium tracking-wider uppercase">
                                                    {service.category}
                                                </span>
                                            </div>
                                            <motion.h2 layoutId={`title-${service.id}`} className="text-3xl font-bold text-white mb-2">
                                                {service.title}
                                            </motion.h2>
                                        </div>

                                        <div className="prose prose-invert prose-lg max-w-none text-white/80">
                                            {service.details || service.description}
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-white/10 flex gap-4">
                                            <a
                                                href={service.links?.bookNow || '/contact'}
                                                className="px-6 py-3 bg-orange text-white rounded-xl font-semibold hover:bg-orange/90 transition-colors"
                                            >
                                                Book Appointment
                                            </a>
                                            {/* Optional secondary action */}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
