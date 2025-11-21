'use client'

import { motion } from 'framer-motion'

export default function Contact() {
    return (
        <section className="py-12 relative overflow-hidden" id="contact">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="mb-8 text-center max-w-2xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold mb-3"
                    >
                        Get in <span className="text-gradient">Touch</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-white/60 text-sm"
                    >
                        Have questions? Reach out to us directly or fill out the form below.
                    </motion.p>
                </div>

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
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1422937950147!2d-73.98731968482413!3d40.75889497932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
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
                                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/15 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-orange/20 flex items-center justify-center text-orange shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Visit Us</h3>
                                        <p className="text-white/80 text-xs">123 Wellness Street, New York, NY</p>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/15 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-blue/20 flex items-center justify-center text-blue shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Contact</h3>
                                        <p className="text-white/80 text-xs">hello@physiowell.com • +1 (555) 123-4567</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
