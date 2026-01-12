'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { siteConfig } from '@/config/site'
import { landingPageData } from '@/data/landing-page'
import { servicesData } from '@/data/services.data'
import SectionHeader from '@/components/SectionHeader'
import CardCarousel from '@/components/CardCarousel'
import Card from '@/components/Card'
import Contact from '@/components/Contact'
import StatsCard from '@/components/StatsCard'
import { linkConfig } from '@/config/links'

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-surface-dark pt-24 pb-12">

            {/* Section 1: Overview */}
            <section className="container mx-auto px-4 mb-24">
                <div className="grid lg:grid-cols-2 gap-12 items-stretch">
                    {/* Left: Horizontal Media Slider */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/50 aspect-video lg:aspect-auto lg:h-full group"
                    >
                        {/* Scroll Container */}
                        <div
                            id="media-gallery"
                            className="flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
                        >
                            {/* Slide 1: Video */}
                            <div className="flex-none w-full h-full snap-center relative">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={linkConfig.youtube.clinic_about}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full"
                                ></iframe>
                            </div>

                            {/* Slide 2: Image 1 */}
                            <div className="flex-none w-full h-full snap-center relative">
                                <Image
                                    src="/images/upper-back.png"
                                    alt="Clinic Interior"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                                    <p className="text-white text-lg font-bold">Advanced Physiotherapy Center</p>
                                    <p className="text-white/70 text-sm">State-of-the-art equipment for modern recovery.</p>
                                </div>
                            </div>

                            {/* Slide 3: Image 2 */}
                            <div className="flex-none w-full h-full snap-center relative">
                                <Image
                                    src="/images/knee-rehab.png"
                                    alt="Treatment Session"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                                    <p className="text-white text-lg font-bold">Personalized Rehabilitation</p>
                                    <p className="text-white/70 text-sm">One-on-one sessions tailored to your needs.</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Overlay Buttons */}
                        <button
                            onClick={() => document.getElementById('media-gallery')?.scrollBy({ left: -document.getElementById('media-gallery')!.clientWidth, behavior: 'smooth' })}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100 shadow-lg"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>

                        <button
                            onClick={() => document.getElementById('media-gallery')?.scrollBy({ left: document.getElementById('media-gallery')!.clientWidth, behavior: 'smooth' })}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100 shadow-lg"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </motion.div>

                    {/* Right: Overview Text */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col justify-center"
                    >
                        <SectionHeader
                            title="Welcome to "
                            highlight={siteConfig.name}
                            description={`${siteConfig.category}, ${siteConfig.location} `}
                            className="!items-start !text-left mb-6 !mx-0"
                        />
                        <div className="prose prose-invert max-w-none text-white/80 leading-relaxed">
                            <p className="text-lg mb-6">
                                At {siteConfig.name} {siteConfig.category} in {siteConfig.location}, we provide comprehensive physiotherapy services designed to meet a wide range of patient needs.
                            </p>
                            <p className="mb-4">
                                Our expert team specializes in musculoskeletal physiotherapy, neurological rehabilitation, and sports injury treatment, delivering personalized care for faster and long-lasting recovery.
                            </p>
                            <p>
                                Using advanced physiotherapy techniques, we help restore mobility, improve strength, relieve pain, and enhance overall physical well-being, making us a trusted {siteConfig.category.toLowerCase()} in {siteConfig.location} for complete rehabilitation and pain management.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Section 2: Brief Services */}
            <section className="container mx-auto px-4 mb-24">
                <SectionHeader
                    title="Our"
                    highlight="Services"
                    description="Expert care for all your physiotherapy needs."
                    className="mb-12"
                />

                <CardCarousel
                    cardsToShow={4}
                    items={servicesData.map((service) => (
                        <Card
                            key={service.id}
                            id={service.id}
                            type="service"
                            title={service.title}
                            subtitle={service.category}
                            summary={service.description}
                            topRight={service.icon}
                            actionButton={{
                                label: 'Learn More',
                                href: '/services', // Directing to main services page for details as requested "Brief about the services"
                                variant: 'secondary'
                            }}
                        />
                    ))}
                />
            </section>

            {/* Section 3: Large Stats Cards */}
            <section className="container mx-auto px-4 mb-24 relative">
                {/* Background Decorations */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                    <SectionHeader
                        title="Why"
                        highlight="Choose Us"
                        description="Proven results and dedicated care."
                        className="mb-12"
                    />

                    <div className="w-full">
                        <StatsCard
                            stats={landingPageData.hero.stats}
                            variant="horizontal"
                            size="lg" // Using the new Large size
                            className="w-full"
                        />
                    </div>
                </div>
            </section>

            {/* Section 4: Appointment/Message */}
            <Contact />

        </main>
    )
}
