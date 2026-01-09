'use client'

import { useState } from 'react'
import Card from '@/components/Card' // Update Card to accept layoutId if possible or wrap it
import ServiceDetailOverlay from '@/components/ServiceDetailOverlay'
import { servicesData } from '@/data/services.data'
import { motion } from 'framer-motion'

import Pagination from '@/components/Pagination'

export default function ServicesGrid() {
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 9

    const totalPages = Math.ceil(servicesData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const displayedServices = servicesData.slice(startIndex, startIndex + itemsPerPage)

    const selectedService = servicesData.find(s => s.id === selectedServiceId) || null

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <section className="py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedServices.map((service) => (
                    <div
                        key={service.id}
                        onClick={() => setSelectedServiceId(service.id)}
                        className="cursor-pointer h-full"
                    >
                        <Card
                            id={service.id}
                            layoutId={`card-${service.id}`}
                            type="service"
                            title={service.title}
                            subtitle={service.category}
                            summary={service.description}
                            topRight={service.icon}
                            actionButton={{
                                label: 'Learn More',
                                onClick: () => setSelectedServiceId(service.id),
                                variant: 'secondary'
                            }}
                            className="h-full hover:border-orange/30 transition-colors"
                        />
                    </div>
                ))}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            <ServiceDetailOverlay
                service={selectedService}
                onClose={() => setSelectedServiceId(null)}
            />
        </section>
    )
}