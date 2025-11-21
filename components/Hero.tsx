'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Image from 'next/image'
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

export default function Hero() {
    const [activeService, setActiveService] = useState(0)
    const { hero } = landingPageData

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveService((prev) => (prev + 1) % hero.services.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [hero.services.length])

    return (
        <section className="relative min-h-screen flex items-center pt-10 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue/10 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="max-w-2xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight"
                        >
                            {hero.headline.prefix} <br />
                            <span className="text-gradient">{hero.headline.highlight}</span>
                            {hero.headline.suffix}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-lg text-white/60 mb-8 leading-relaxed max-w-lg"
                        >
                            {hero.subheadline}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-wrap gap-4"
                        >
                            <button className="btn-primary">
                                {hero.cta.primary}
                            </button>
                            <button className="btn-secondary">
                                {hero.cta.secondary}
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-8 w-full max-w-xl"
                        >
                            <KeywordTicker keywords={hero.keywords} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-6"
                        >
                            <div className="inline-flex items-center gap-4 px-5 py-2.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
                                {hero.stats.map((stat, i) => (
                                    <div key={i} className="flex items-center gap-2.5 px-2 first:pl-0 last:pr-0 border-r border-white/10 last:border-0">
                                        <span className="text-2xl font-bold text-white leading-none">
                                            {stat.value}
                                        </span>
                                        <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider leading-tight max-w-[60px]">
                                            {stat.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Content - 3D Rotating Card */}
                    <div className="relative hidden lg:flex items-center justify-center h-[600px]">
                        <div className="relative w-[400px] h-[500px] perspective-1000">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeService}
                                    initial={{ rotateY: -90, opacity: 0 }}
                                    animate={{ rotateY: 0, opacity: 1 }}
                                    exit={{ rotateY: 90, opacity: 0 }}
                                    transition={{ duration: 0.6, ease: "backOut" }}
                                    className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 group"
                                    style={{
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                    }}
                                >
                                    {/* Background Image */}
                                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                                        <Image
                                            src={hero.services[activeService].image}
                                            alt={hero.services[activeService].imageAlt}
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                    </div>

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent opacity-90" />

                                    {/* Content */}
                                    <div className="relative h-full flex flex-col justify-between p-8 z-10">
                                        <div className="flex justify-between items-start">
                                            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
                                                {SERVICE_ICONS[hero.services[activeService].title]}
                                            </div>
                                            <span className="text-4xl font-bold text-white/10">0{activeService + 1}</span>
                                        </div>

                                        <div>
                                            <h3 className="text-3xl font-bold text-white mb-3">{hero.services[activeService].title}</h3>
                                            <p className="text-white/70 leading-relaxed">{hero.services[activeService].description}</p>

                                            <div className="mt-6 flex items-center gap-2 text-orange text-sm font-medium">
                                                <span>Learn More</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Reflection/Shadow */}
                            <div className="absolute -bottom-12 left-12 right-12 h-4 bg-black/50 blur-xl rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
