'use client'

import { motion } from 'framer-motion'
import { useState, ReactNode } from 'react'

interface CardCarouselProps {
    items: ReactNode[]
    cardsToShow?: number
}

export default function CardCarousel({
    items,
    cardsToShow = 5,
}: CardCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    const nextSlide = () => {
        setCurrentIndex((prev) => {
            const maxIndex = Math.max(0, items.length - cardsToShow)
            return prev >= maxIndex ? 0 : prev + 1
        })
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => {
            const maxIndex = Math.max(0, items.length - cardsToShow)
            return prev <= 0 ? maxIndex : prev - 1
        })
    }

    // Calculate card width: percentage-based but with max constraint
    const cardWidthPercent = 100 / cardsToShow
    const maxCardWidth = 280 // Maximum card width in pixels
    const gap = 16 // gap-4 in pixels

    return (
        <div className="relative group/carousel">
            {/* Navigation Buttons - Absolute Positioned */}
            <button
                onClick={prevSlide}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-surface-card/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg opacity-0 group-hover/carousel:opacity-100 -translate-x-4 group-hover/carousel:translate-x-0"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={nextSlide}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-surface-card/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg opacity-0 group-hover/carousel:opacity-100 translate-x-4 group-hover/carousel:translate-x-0"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Carousel Container */}
            <div className="overflow-hidden -mx-4 px-4 py-4">
                <motion.div
                    className="flex gap-4 justify-center md:justify-start"
                    animate={{ x: `-${currentIndex * (maxCardWidth + gap)}px` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0"
                            style={{
                                width: `min(${cardWidthPercent}%, ${maxCardWidth}px)`,
                            }}
                        >
                            {item}
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}
