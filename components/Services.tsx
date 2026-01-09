'use client'

import Link from 'next/link'
import SectionHeader from './SectionHeader'
import Card from './Card'
import CardCarousel from './CardCarousel'
import { servicesData } from '@/data/services.data'

export default function Services() {
    return (
        <section id="services" className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <SectionHeader
                        title="Comprehensive"
                        highlight="Care Services"
                        description="Specialized treatments tailored to your specific recovery goals."
                        className="mb-0 text-left !mx-0"
                    />
                    <Link
                        href="/services"
                        className="px-6 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all text-sm font-medium shrink-0 flex items-center gap-2 group"
                    >
                        View All Services
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>

                <CardCarousel
                    cardsToShow={5}
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
                                label: 'Book Now',
                                href: service.links?.bookNow || '/contact',
                                variant: 'primary'
                            }}
                        />
                    ))}
                />
            </div>
        </section>
    )
}
