'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { siteConfig } from '@/config/site'
import { appointmentConfig } from '@/config/appointments'
import { getAvailableSlots, getMinDate } from '@/lib/appointment-utils'
import { sendContactEmail } from '@/app/actions/send-email'
import { useFormState, useFormStatus } from 'react-dom'
import Image from 'next/image'

// --- Components ---

function SubmitButton({ label = 'Send Message' }: { label?: string }) {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full relative group overflow-hidden rounded-xl bg-orange px-8 py-4 font-semibold text-white shadow-lg transition-all hover:shadow-orange/25 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative flex items-center justify-center gap-2">
                {pending ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </>
                ) : (
                    <>
                        {label}
                        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </>
                )}
            </span>
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
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            action={formAction}
            ref={formRef}
            className="space-y-5"
        >
            {state.error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-100 text-sm p-4 rounded-xl flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {state.error}
                </div>
            )}
            {state.success && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-100 text-sm p-4 rounded-xl flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Message sent successfully! We'll get back to you soon.
                </div>
            )}

            {/* Hidden Fields for Spam Protection & Type */}
            <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            <input type="hidden" name="formType" value="contact" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <input name="firstName" required type="text" placeholder="First Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-all hover:bg-white/[0.07]" />
                <input name="lastName" type="text" placeholder="Last Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-all hover:bg-white/[0.07]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <input name="email" required type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-all hover:bg-white/[0.07]" />
                <input name="phone" type="tel" placeholder="Phone Number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-all hover:bg-white/[0.07]" />
            </div>

            <textarea name="message" required rows={4} placeholder="How can we help you?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-all hover:bg-white/[0.07] resize-none" />

            <SubmitButton label="Send Message" />
        </motion.form>
    )
}

function AppointmentForm() {
    // Reusing the same action but we manipulate form data on submission if needed.
    // Ideally we would have a separate action, but for now we will bundle the extra fields into the message or handle it similarly.
    // For this quick implementation, I will just rename fields to be caught by 'message' or let them fall through if not handled, 
    // BUT since the server action reads specific fields, I need to be careful.
    // The server action reads: firstName, lastName, phone, email, message.
    // So I will inject Date/Time/Service INTO the message area using a hidden input or handling submission via client handler.
    // However, simplest way using `useFormState` is to just let the user type them or rely on an updated server action.
    // I will stick to the visual implementation primarily. 
    // Let's create a hidden textarea that gets populated with all details before submit? No, that's hacky.
    // I will assume for now the server action is generic enough OR I will just use standard fields + explicit slots.

    // To make it work with the current 'sendContactEmail', I'll just use the fields it expects and perhaps 
    // concat the extra info into 'message' in a follow-up step or just ask user to fill it. 
    // Wait, let's just make it look good. I'll add the fields visually.

    const [state, formAction] = useFormState(async (prev: any, formData: FormData) => {
        // Intercept to format message
        const service = formData.get('service')
        const date = formData.get('date')
        const time = formData.get('time')
        const originalMessage = formData.get('message')

        const combinedMessage = `
APPOINTMENT REQUEST:
Service: ${service}
Preferred Date: ${date}
Preferred Time: ${time}

Additional Notes:
${originalMessage}
        `
        formData.set('message', combinedMessage)
        formData.set('formType', 'appointment')
        return sendContactEmail(prev, formData)
    }, { success: false, error: '' })

    const formRef = useRef<HTMLFormElement>(null)
    const [selectedDate, setSelectedDate] = useState<string>('')

    useEffect(() => {
        if (state.success && formRef.current) {
            formRef.current.reset()
            setSelectedDate('')
        }
    }, [state.success])

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            action={formAction}
            ref={formRef}
            className="space-y-5"
        >
            {state.error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-100 text-sm p-4 rounded-xl flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {state.error}
                </div>
            )}
            {state.success && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-100 text-sm p-4 rounded-xl flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Appointment request sent! We will confirm with you shortly.
                </div>
            )}

            {/* Hidden Fields for Spam Protection */}
            <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

            {/* Disclaimer */}
            <div className="bg-orange/10 border border-orange/20 rounded-xl p-4 flex gap-3 text-orange-light mb-4">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-xs leading-relaxed opacity-90">
                    <strong>Note:</strong> This is an appointment request only. Our team will contact you shortly to confirm availability and finalize your booking.
                </p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <input name="firstName" required type="text" placeholder="First Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-all hover:bg-white/[0.07]" />
                    <input name="lastName" type="text" placeholder="Last Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-all hover:bg-white/[0.07]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <input name="email" required type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-all hover:bg-white/[0.07]" />
                    <input name="phone" type="tel" placeholder="Phone Number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-all hover:bg-white/[0.07]" />
                </div>

                {/* Appointment Specific Fields */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Type of Service</label>
                    <div className="relative group">
                        <select
                            name="service"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-all hover:bg-white/[0.07] appearance-none cursor-pointer"
                        >
                            {siteConfig.pages.contact.services.map((service) => (
                                <option key={service} className="bg-zinc-900 text-white" value={service}>
                                    {service}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 group-hover:text-orange transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Preferred Date</label>
                        <input
                            name="date"
                            type="date"
                            required
                            min={getMinDate()}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-all hover:bg-white/[0.07] [color-scheme:dark]"
                        />
                        {selectedDate && !appointmentConfig.businessDays.includes(new Date(selectedDate + 'T00:00:00').getDay()) && (
                            <p className="text-[10px] text-red-400 ml-1">Closed on this day. Please choose another day.</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Preferred Time</label>
                        <div className="relative group">
                            <select
                                name="time"
                                required
                                disabled={!selectedDate || !appointmentConfig.businessDays.includes(new Date(selectedDate + 'T00:00:00').getDay())}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-all hover:bg-white/[0.07] appearance-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <option value="" className="bg-zinc-900">Select a slot</option>
                                {selectedDate && getAvailableSlots(selectedDate).map((slot) => (
                                    <option key={slot} value={slot} className="bg-zinc-900">
                                        {slot}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 group-hover:text-orange transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Additional Notes</label>
                <textarea name="message" rows={2} placeholder="Any specific concerns?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 focus:border-orange focus:ring-1 focus:ring-orange outline-none transition-all hover:bg-white/[0.07] resize-none" />
            </div>

            <SubmitButton label="Request Appointment" />
        </motion.form>
    )
}

// --- Main Page Component ---

export default function ContactPage() {
    const [activeTab, setActiveTab] = useState<'contact' | 'appointment'>('contact')

    return (
        <main className="min-h-screen bg-black relative selection:bg-orange/30 selection:text-orange">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue/10 rounded-full blur-[100px] mix-blend-screen opacity-50" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange/10 rounded-full blur-[100px] mix-blend-screen opacity-50" />
            </div>

            <div className="pt-32 pb-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="mb-16 md:mb-24 text-center max-w-2xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-orange mb-6"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange"></span>
                            </span>
                            We are Open & Accepting Patients
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
                        >
                            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange to-red-500">Touch</span>
                        </motion.h1>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-4"
                        >
                            <p className="text-lg text-white/60">
                                {siteConfig.description} We specialize in clear, evidence-based physiotherapy to help you recover faster. Our clinic is equipped with state-of-the-art facilities and staffed by experienced professionals dedicated to your well-being.
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {siteConfig.pages.contact.hashtags.map((tag) => (
                                    <span key={tag} className="px-3 py-1 bg-white/5 rounded-lg text-xs font-medium text-white/60 border border-white/5 transition-all">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">

                        {/* LEFT COLUMN: Info */}
                        {/* LEFT COLUMN: Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col gap-6 h-full"
                        >
                            {/* Combined Contact Card */}
                            <div className="bg-surface-card/30 border border-white/10 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
                                {/* Email (Left) */}
                                <a href={`mailto:${siteConfig.contact.email}`} className="flex items-center gap-4 group w-full sm:w-auto justify-start">
                                    <div className="w-12 h-12 rounded-full bg-orange/10 flex items-center justify-center text-orange group-hover:bg-orange/20 group-hover:scale-110 transition-all shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-0.5">Email Us</h4>
                                        <p className="text-white font-medium truncate group-hover:text-orange transition-colors">{siteConfig.contact.email}</p>
                                    </div>
                                </a>

                                {/* Vertical Divider (Desktop) */}
                                <div className="hidden sm:block w-px h-12 bg-white/10 shrink-0" />

                                {/* Phone Layout: Buttons + Number (Right) */}
                                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                                    <div className="flex items-center gap-3 shrink-0">
                                        <a
                                            href={`tel:${siteConfig.contact.phone}`}
                                            className="w-12 h-12 rounded-full bg-blue/10 flex items-center justify-center text-blue hover:bg-blue/20 hover:scale-110 transition-all"
                                            title="Call Us"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        </a>
                                        <a
                                            href={`https://wa.me/${siteConfig.contact.phone.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 hover:bg-green-500/20 hover:scale-110 transition-all"
                                            title="Chat on WhatsApp"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                        </a>
                                    </div>
                                    <div className="overflow-hidden text-right">
                                        <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-0.5">Call or Chat</h4>
                                        <p className="text-white font-medium truncate">{siteConfig.contact.phone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Address Card */}
                            <a href={siteConfig.contact.mapEmbedUrl} target="_blank" rel="noopener noreferrer" className="bg-surface-card/30 border border-white/10 rounded-3xl p-6 hover:bg-white/5 transition-all group flex items-start gap-4 shrink-0">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white/20 transition-colors shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-0.5">Visit Us</h4>
                                    <p className="text-white font-medium leading-relaxed">{siteConfig.contact.address}</p>
                                </div>
                            </a>

                            {/* Map Card */}
                            <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 group flex-1 min-h-[250px]">
                                <iframe
                                    src={siteConfig.contact.mapEmbedUrl}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, filter: 'grayscale(100%) invert(90%)' }}
                                    allowFullScreen
                                    loading="lazy"
                                    className="opacity-60 group-hover:opacity-100 transition-opacity duration-500 absolute inset-0"
                                />
                            </div>
                        </motion.div>


                        {/* RIGHT COLUMN: Interactive Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-surface-card/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-2 overflow-hidden shadow-2xl h-full flex flex-col"
                        >
                            {/* Toggle Switch */}
                            <div className="bg-black/40 rounded-3xl p-1.5 flex mb-2 relative">
                                <button
                                    onClick={() => setActiveTab('contact')}
                                    className={`flex-1 py-3 text-sm font-semibold rounded-2xl relative z-10 transition-colors ${activeTab === 'contact' ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
                                >
                                    Contact Us
                                    {activeTab === 'contact' && (
                                        <motion.div
                                            layoutId="tab-bg"
                                            className="absolute inset-0 bg-white/10 border border-white/10 rounded-2xl -z-10 shadow-sm"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('appointment')}
                                    className={`flex-1 py-3 text-sm font-semibold rounded-2xl relative z-10 transition-colors ${activeTab === 'appointment' ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
                                >
                                    Book Appointment
                                    {activeTab === 'appointment' && (
                                        <motion.div
                                            layoutId="tab-bg"
                                            className="absolute inset-0 bg-white/10 border border-white/10 rounded-2xl -z-10 shadow-sm"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </button>
                            </div>

                            {/* Form Container */}
                            <div className="bg-white/[0.02] rounded-[1.7rem] px-6 py-8 sm:px-8 border border-white/5">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        {activeTab === 'contact' ? 'Send a Message' : 'Request Appointment'}
                                    </h2>
                                    <p className="text-sm text-white/50">
                                        {activeTab === 'contact'
                                            ? 'Fill out the form below and we will get back to you shortly.'
                                            : 'Choose a preferred time and we will confirm your slot.'}
                                    </p>
                                </div>

                                <AnimatePresence mode='wait'>
                                    {activeTab === 'contact' ? (
                                        <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <ContactForm />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="appointment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <AppointmentForm />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    )
}
