'use client'

import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'

import { siteConfig } from '@/config/site'
import { useFormState, useFormStatus } from 'react-dom'
import { sendContactEmail } from '@/app/actions/send-email'
import { useEffect, useRef } from 'react'

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
                        <ContactForm />
                    </motion.div>

                    {/* Map & Info Overlay */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative rounded-2xl overflow-hidden border border-white/10 min-h-[400px] lg:min-h-[300px] group"
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
                                    className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:bg-white/15 transition-colors group/card relative overflow-hidden pr-10 sm:pr-12"
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
                                    className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:bg-white/15 transition-colors group/card relative overflow-hidden pr-10 sm:pr-12"
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

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full btn-primary py-3 text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {pending ? (
                <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                </>
            ) : (
                'Send Message'
            )}
        </button>
    )
}

function ContactForm() {
    const [state, formAction] = useFormState(sendContactEmail, { success: false, error: '' })
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state.success && formRef.current) {
            formRef.current.reset()
        }
    }, [state.success])

    return (
        <form action={formAction} ref={formRef} className="space-y-4">
            {state.error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg">
                    {state.error}
                </div>
            )}
            {state.success && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 text-sm p-3 rounded-lg">
                    Message sent successfully! We'll get back to you soon.
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60">First Name</label>
                    <input name="firstName" required type="text" className="w-full bg-surface-highlight border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-colors" placeholder="John" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60">Last Name</label>
                    <input name="lastName" type="text" className="w-full bg-surface-highlight border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-colors" placeholder="Doe" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60">Phone</label>
                    <input name="phone" type="tel" className="w-full bg-surface-highlight border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-colors" placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60">Email</label>
                    <input name="email" required type="email" className="w-full bg-surface-highlight border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-colors" placeholder="john@example.com" />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">Message</label>
                <textarea name="message" required rows={3} className="w-full bg-surface-highlight border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-colors resize-none" placeholder="How can we help?" />
            </div>

            <SubmitButton />
        </form>
    )
}
