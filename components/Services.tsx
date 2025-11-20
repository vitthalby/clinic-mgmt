'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const services = [
    {
        title: 'Matrix Rhythm Therapy',
        description: 'Cellular level regeneration and micro-massage for deep tissue healing.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 17l3-3m0 0l3 3m-3-3v12M21 7l-3 3m0 0l-3-3m3 3V-2M9 3h6m-6 4h6m-6 4h6" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 12h4m4 0h4m4 0h4" />
            </svg>
        )
    },
    {
        title: 'Cupping Therapy',
        description: 'Ancient technique using suction to stimulate blood flow and relieve muscle tension.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="8" cy="8" r="3" strokeWidth={1.5} />
                <circle cx="16" cy="8" r="3" strokeWidth={1.5} />
                <circle cx="8" cy="16" r="3" strokeWidth={1.5} />
                <circle cx="16" cy="16" r="3" strokeWidth={1.5} />
            </svg>
        )
    },
    {
        title: 'Pain Management',
        description: 'Comprehensive strategies to manage and reduce chronic and acute pain conditions.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6M12 9v6" />
            </svg>
        )
    },
    {
        title: 'Kinesiology Taping',
        description: 'Supportive taping to stabilize muscles and joints without restricting range of motion.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 2v20M16 2v20" />
            </svg>
        )
    },
    {
        title: 'Post-Surgical Rehab',
        description: 'Guided rehabilitation protocols to ensure safe and effective recovery after surgery.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6" />
            </svg>
        )
    },
    {
        title: 'Dry Needling',
        description: 'Targeted release of trigger points to alleviate muscle pain and improve function.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v20M12 2l-2 2m2-2l2 2" />
                <circle cx="12" cy="18" r="2" strokeWidth={1.5} />
            </svg>
        )
    },
    {
        title: 'Ultrasound Therapy',
        description: 'Deep heat therapy to promote tissue healing and reduce inflammation.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l2-2 2 2v13a2 2 0 01-2 2 2 2 0 01-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 9c0 4 2 7 4 7M19 9c0 4-2 7-4 7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9c0 5 3 9 6 9M21 9c0 5-3 9-6 9" />
            </svg>
        )
    }
]

export default function Services() {
    const [currentIndex, setCurrentIndex] = useState(0)

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % (services.length - 2))
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + (services.length - 2)) % (services.length - 2))
    }

    return (
        <section id="services" className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold mb-6"
                    >
                        Comprehensive <span className="text-gradient">Care Services</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-white/60 max-w-2xl text-lg"
                    >
                        Specialized treatments tailored to your specific recovery goals.
                    </motion.p>
                </div>

                <div className="relative group/carousel">
                    {/* Navigation Buttons - Absolute Positioned */}
                    <button
                        onClick={prevSlide}
                        className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-surface-card/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg opacity-0 group-hover/carousel:opacity-100 -translate-x-4 group-hover/carousel:translate-x-0"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-surface-card/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg opacity-0 group-hover/carousel:opacity-100 translate-x-4 group-hover/carousel:translate-x-0"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    <div className="overflow-hidden -mx-4 px-4 py-4">
                        <motion.div
                            className="flex gap-6"
                            animate={{ x: `-${currentIndex * 33.33}%` }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            {services.map((service, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.05, y: -8 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className="min-w-[100%] md:min-w-[calc(33.333%-16px)] glass-card p-6 rounded-3xl group relative overflow-hidden hover:shadow-[0_20px_60px_rgba(255,61,0,0.15)] transition-shadow duration-500"
                                >
                                    {/* Animated gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange/0 via-orange/0 to-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <motion.svg
                                            className="w-6 h-6 text-white/20"
                                            animate={{ x: [0, 4, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </motion.svg>
                                    </div>

                                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 flex items-center justify-center mb-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[inset_0_0_20px_rgba(255,61,0,0.2),0_0_30px_rgba(255,61,0,0.1)] transition-all duration-500">
                                        <div className="text-white/80 group-hover:text-orange group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                            {service.icon}
                                        </div>
                                    </div>

                                    <h3 className="relative text-lg font-semibold mb-2 text-white group-hover:text-orange transition-colors duration-300">{service.title}</h3>
                                    <p className="relative text-white/60 text-sm leading-relaxed mb-6 min-h-[60px] group-hover:text-white/80 transition-colors duration-300">
                                        {service.description}
                                    </p>

                                    <div className="relative flex items-center gap-3 pt-4 border-t border-white/5 group-hover:border-white/10 transition-colors duration-300">
                                        <button className="flex-1 py-2 px-4 rounded-full bg-white text-black text-xs font-bold hover:bg-gray-200 hover:scale-105 transition-all duration-200">
                                            Book Now
                                        </button>
                                        <button className="px-4 py-2 rounded-full border border-white/10 text-xs font-medium hover:bg-white/5 hover:border-white/20 transition-all duration-200 text-white/80">
                                            Learn More
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
