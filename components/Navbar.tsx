'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className={`rounded-2xl transition-all duration-300 ${scrolled
                    ? 'bg-surface-highlight/80 backdrop-blur-xl border border-surface-border shadow-lg px-6 py-3'
                    : 'bg-transparent px-0 py-0'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            {/* Logo Icon */}
                            <div className="relative w-10 h-10">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange to-blue rounded-xl blur-sm opacity-50" />
                                <div className="relative w-full h-full bg-gradient-to-br from-orange to-blue rounded-xl flex items-center justify-center overflow-hidden">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>

                            <span className="text-xl font-bold text-white tracking-tight">
                                Fit<span className="text-orange">Square</span>
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            {['Services', 'About', 'Blog', 'Contact'].map((item) => (
                                <button
                                    key={item}
                                    onClick={() => scrollToSection(item.toLowerCase())}
                                    className="text-sm font-medium text-white/70 hover:text-white transition-colors relative group"
                                >
                                    {item}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange transition-all group-hover:w-full" />
                                </button>
                            ))}
                        </div>

                        <button className="hidden md:block px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-colors">
                            Book Now
                        </button>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden text-white p-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </motion.nav>
    )
}
