'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { landingPageData } from '@/data/landing-page'
import KeywordTicker from './KeywordTicker'

const SERVICE_ICONS: Record<string, React.ReactNode> = {
    'Manual Therapy': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>,
    'Sports Rehab': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    'Post-Op Care': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    'Pain Relief': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    'Matrix Rhythm Therapy': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    'Cupping Therapy': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>,
    'Dry Needling': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
    'Geriatric Physio': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
}

// Helper Component for Stats
function StatsCard({ className, variant = "vertical", stats }: { className?: string, variant?: "vertical" | "horizontal", stats: typeof landingPageData.hero.stats }) {
    if (variant === 'vertical') {
        return (
            <div className={`bg-surface-highlight/70 backdrop-blur-md border border-white/10 rounded-xl shadow-xl ${className}`}>
                <div className="flex flex-col gap-2 p-3">
                    {stats.map((stat, i) => (
                        <div key={i} className="flex items-center gap-3 border-b border-white/5 last:border-0 pb-2 last:pb-0">
                            <div className="w-8 h-8 rounded-full bg-orange/10 flex items-center justify-center text-orange shrink-0">
                                {i === 0 && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                )}
                                {i === 1 && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                )}
                                {i === 2 && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                )}
                            </div>
                            <div>
                                <p className="text-base font-bold text-white leading-none">{stat.value}</p>
                                <p className="text-[10px] text-white/50 mt-0.5 whitespace-nowrap">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
    return null
}

export default function Hero() {
    const [activeService, setActiveService] = useState(0)
    const [activeStat, setActiveStat] = useState(0)
    const { hero } = landingPageData

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveService((prev) => (prev + 1) % hero.services.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [hero.services.length])

    // Cycle stats every 2.5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStat((prev) => (prev + 1) % hero.stats.length)
        }, 2500)
        return () => clearInterval(interval)
    }, [hero.stats.length])

    return (
        <section className="relative min-h-[105svh] lg:min-h-screen flex flex-col lg:flex-row lg:items-center pt-0 lg:pt-10 overflow-hidden">
            {/* Mobile Background Image (Absolute) */}
            <div className="absolute left-0 right-0 bottom-0 top-0 z-0 lg:hidden">
                <Image
                    src={hero.services[activeService].image}
                    alt={hero.services[activeService].imageAlt}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black" />
            </div>

            {/* Background Elements (Desktop Only) */}
            <div className="absolute inset-0 pointer-events-none hidden lg:block">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
            </div>

            <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center h-full lg:h-auto flex-grow lg:flex-grow-0 justify-between lg:justify-center pb-12 lg:pb-0 pt-28 lg:pt-0">
                {/* Left Content */}
                <div className="w-full lg:w-1/2 mb-0 lg:mb-0 text-center lg:text-left flex flex-col lg:block flex-grow lg:flex-grow-0 justify-between lg:justify-start">
                    {/* Top Text Group */}
                    <div className="relative mt-0 lg:mt-0">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl md:text-7xl font-bold leading-[1.1] mb-4 md:mb-6 tracking-tight"
                        >
                            {hero.headline.prefix} <br />
                            <span className="text-gradient">{hero.headline.highlight}</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-base md:text-lg text-white/80 md:text-white/60 mb-6 md:mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0"
                        >
                            {hero.subheadline}
                        </motion.p>
                    </div>

                    {/* Bottom Action Group */}
                    <div className="relative">
                        {/* Active Service Info (Mobile Only - Bottom above ticker) */}
                        <div className="lg:hidden flex flex-col justify-center items-center px-4 mb-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeService}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-center"
                                >
                                    <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                                        {hero.services[activeService].title}
                                    </h3>
                                    <p className="text-white/90 text-sm max-w-[280px] mx-auto drop-shadow-md line-clamp-3 bg-black/20 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                                        {hero.services[activeService].description}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.25 }}
                            className="mb-4 lg:mb-8 w-full relative"
                        >
                            {/* Innovative 'Stream' Look */}
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                            <div className="py-3">
                                <KeywordTicker keywords={hero.keywords} />
                            </div>
                        </motion.div>

                        {/* Mobile Single Stat Rotator */}
                        <div className="lg:hidden h-14 mb-4 flex justify-center items-center overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeStat}
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-surface-highlight/60 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 flex items-center gap-3 shadow-xl"
                                >
                                    <div className="w-8 h-8 rounded-full bg-orange/20 flex items-center justify-center text-orange shrink-0">
                                        {activeStat === 0 && (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        )}
                                        {activeStat === 1 && (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        )}
                                        {activeStat === 2 && (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-base font-bold text-white leading-none">{hero.stats[activeStat].value}</span>
                                        <span className="text-[10px] text-white/80 leading-none">{hero.stats[activeStat].label}</span>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>



                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start"
                        >
                            <Link
                                href="/book"
                                className="w-full sm:w-auto px-8 py-3 bg-orange text-white rounded-full font-semibold hover:bg-orange/90 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-orange/25"
                            >
                                {hero.cta.primary}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                            <Link
                                href="/services"
                                className="w-full sm:w-auto px-8 py-3 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-full font-semibold hover:bg-white/10 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                            >
                                {hero.cta.secondary}
                            </Link>
                        </motion.div>

                        {/* Stats - Compact Overlay for Mobile */}

                    </div>
                </div>

                {/* Right Content - 3D Rotating Card (Desktop Only) */}
                <div className="hidden lg:block w-1/2 relative h-[600px] perspective-1000">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeService}
                            initial={{ opacity: 0, rotateY: -90, x: 100 }}
                            animate={{ opacity: 1, rotateY: 0, x: 0 }}
                            exit={{ opacity: 0, rotateY: 90, x: -100 }}
                            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                            className="relative w-full h-full preserve-3d"
                        >
                            {/* Main Image Card */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                                <Image
                                    src={hero.services[activeService].image}
                                    alt={hero.services[activeService].imageAlt}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        {hero.services[activeService].title}
                                    </h3>
                                    <p className="text-white/70 line-clamp-2">
                                        {hero.services[activeService].description}
                                    </p>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            {/* Floating Stats Card */}
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-24 -right-2 z-10"
                            >
                                <StatsCard
                                    variant="vertical"
                                    stats={hero.stats}
                                    className="max-w-[180px]"
                                />
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section >
    )
}
