'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { siteConfig } from '@/config/site'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const pathname = usePathname()
    const isHome = pathname === '/'

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
            setIsMobileMenuOpen(false)
        }
    }

    const menuItems = ['Services', 'About', 'Blog', 'Contact']

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isMobileMenuOpen ? 'py-4' : 'py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className={`rounded-2xl transition-all duration-300 ${scrolled || isMobileMenuOpen
                    ? 'bg-surface-highlight/80 backdrop-blur-xl border border-surface-border shadow-lg px-6 py-3'
                    : 'bg-transparent px-0 py-0'
                    }`}>
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
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
                        </Link>

                        <div className="hidden md:flex items-center gap-8">
                            {menuItems.map((item) => {
                                const targetId = item.toLowerCase()
                                const isDedicatedPage = ['Services', 'Contact'].includes(item)

                                if (isDedicatedPage) {
                                    const href = `/${targetId}`
                                    return (
                                        <Link
                                            key={item}
                                            href={href}
                                            className={`text-sm font-medium transition-colors relative group ${pathname === href ? 'text-white' : 'text-white/70 hover:text-white'}`}
                                        >
                                            {item}
                                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-orange transition-all ${pathname === href ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                                        </Link>
                                    )
                                }

                                return (
                                    <button
                                        key={item}
                                        onClick={() => {
                                            if (isHome) {
                                                scrollToSection(targetId)
                                            } else {
                                                window.location.href = `/#${targetId}`
                                            }
                                        }}
                                        className="text-sm font-medium text-white/70 hover:text-white transition-colors relative group"
                                    >
                                        {item}
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange transition-all group-hover:w-full" />
                                    </button>
                                )
                            })}
                        </div>

                        {/* Call & WhatsApp Buttons */}
                        <div className="flex items-center gap-4">
                            <Link href="/contact" className="hidden md:block px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-colors">
                                Book Now
                            </Link>

                            {/* Mobile Menu Button */}
                            <button
                                className="md:hidden text-white p-2"
                                onClick={toggleMobileMenu}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden mt-2 bg-surface-highlight/95 backdrop-blur-xl border border-surface-border rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="flex flex-col p-6 gap-4">
                                {menuItems.map((item) => {
                                    const targetId = item.toLowerCase()
                                    const isDedicatedPage = ['Services', 'Contact'].includes(item)

                                    if (isDedicatedPage) {
                                        const href = `/${targetId}`
                                        return (
                                            <Link
                                                key={item}
                                                href={href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`text-lg font-medium transition-colors ${pathname === href ? 'text-orange' : 'text-white/70 hover:text-white'}`}
                                            >
                                                {item}
                                            </Link>
                                        )
                                    }

                                    return (
                                        <button
                                            key={item}
                                            onClick={() => {
                                                if (isHome) {
                                                    scrollToSection(targetId)
                                                } else {
                                                    window.location.href = `/#${targetId}`
                                                }
                                            }}
                                            className="text-lg font-medium text-white/70 hover:text-white transition-colors text-left"
                                        >
                                            {item}
                                        </button>
                                    )
                                })}
                                <Link
                                    href="/contact"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="mt-4 w-full py-4 rounded-xl bg-orange text-white text-center font-bold hover:bg-orange/90 transition-all"
                                >
                                    Book Now
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.nav>
    )
}
