'use client'

import SectionHeader from './SectionHeader'
import Card from './Card'
import CardCarousel from './CardCarousel'
import { servicesData } from '@/data/services.data'

export default function Services() {
    return (
        <section id="services" className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <SectionHeader
                    title="Comprehensive"
                    highlight="Care Services"
                    description="Specialized treatments tailored to your specific recovery goals."
                />

                <CardCarousel
                    data={servicesData}
                    cardsToShow={5}
                    renderCard={(service) => (
                        <Card
                            id={service.id}
                            type="service"
                            title={service.title}
                            subtitle={service.category}
                            summary={service.description}
                            topRight={service.icon}
                            actionButton={{
                                label: 'Book Now',
                                onClick: () => window.location.href = service.links?.bookNow || '#contact',
                                variant: 'primary'
                            }}
                        />
                    )}
                />
            </div>
        </section>
    )
}
