'use client'

import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'

import { siteConfig } from '@/config/site'

export default function Contact() {
    return (
        <section className="py-12 relative overflow-hidden" id="contact">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <SectionHeader
                    title="Get in"
                    highlight="Touch"
                    description="Have questions? Reach out to us directly or fill out the form below."
                    className="mb-8"
                />

                <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-surface-card border border-white/10 rounded-2xl p-6 flex flex-col justify-center"
                    >
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-white/60">First Name</label>
                                    <input type="text" className="w-full bg-surface-highlight border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-colors" placeholder="John" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-white/60">Last Name</label>
                                    <input type="text" className="w-full bg-surface-highlight border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-colors" placeholder="Doe" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-white/60">Phone</label>
                                    <input type="tel" className="w-full bg-surface-highlight border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-colors" placeholder="+1 (555) 000-0000" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-white/60">Email</label>
                                    <input type="email" className="w-full bg-surface-highlight border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-colors" placeholder="john@example.com" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-white/60">Message</label>
                                <textarea rows={3} className="w-full bg-surface-highlight border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-colors resize-none" placeholder="How can we help?" />
                            </div>

                            <button type="submit" className="w-full btn-primary py-3 text-sm font-medium">
                                Send Message
                            </button>
                        </form>
                    </motion.div>

                    {/* Map & Info Overlay */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative rounded-2xl overflow-hidden border border-white/10 min-h-[300px] group"
                    >
                        {/* Background Map */}
                        <div className="absolute inset-0 z-0">
                            <iframe
                                src={siteConfig.contact.mapEmbedUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 0, filter: 'grayscale(100%) invert(90%)' }}
                                allowFullScreen
                                loading="lazy"
                                className="opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                            />
                        </div>

                        {/* Glass Overlay Content */}
                        <div className="absolute inset-0 z-10 p-6 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                            <div className="grid gap-3 pointer-events-auto">
                                <a
                                    href="/contact"
                                    className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/15 transition-colors group/card relative overflow-hidden pr-12"
                                >
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover/card:bg-orange group-hover/card:text-white transition-all duration-300">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-orange/20 flex items-center justify-center text-orange shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Visit Us</h3>
                                        <p className="text-white/80 text-xs">{siteConfig.contact.address}</p>
                                    </div>
                                </a>

                                <a
                                    href="/contact"
                                    className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/15 transition-colors group/card relative overflow-hidden pr-12"
                                >
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover/card:bg-blue group-hover/card:text-white transition-all duration-300">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-blue/20 flex items-center justify-center text-blue shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Contact</h3>
                                        <p className="text-white/80 text-xs">{siteConfig.contact.email} • {siteConfig.contact.phone}</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
