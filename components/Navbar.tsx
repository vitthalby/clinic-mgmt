'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { siteConfig } from '@/config/site'
import Image from 'next/image'


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
                            {/* Logo Image */}
                            <motion.div
                                className="relative w-10 h-10"
                                animate={{ rotate: 0, rotateY: [0, 45, 0, -45, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Image
                                    src="/images/logo.jpg"
                                    alt="Logo"
                                    fill
                                    className="object-contain"
                                />
                            </motion.div>

                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-white tracking-tight leading-none">
                                    {siteConfig.name.substring(0, 3)}<span className="text-orange">{siteConfig.name.substring(3)}</span>
                                </span>
                                <span className="text-[10px] text-white/60 font-medium tracking-wide uppercase">
                                    {siteConfig.category}
                                </span>
                            </div>
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

                        {/* Call & WhatsApp Buttons */}
                        <div className="flex items-center gap-4">
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
            </div>
        </motion.nav>
    )
}
