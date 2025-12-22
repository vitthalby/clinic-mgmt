'use client'

import { motion } from 'framer-motion'
import { useState, ReactNode } from 'react'
import useWindowSize from '@/hooks/useWindowSize'

interface CardCarouselProps {
    items: ReactNode[]
    cardsToShow?: number
}

export default function CardCarousel({
    items,
    cardsToShow: defaultCardsToShow = 5,
}: CardCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const { width } = useWindowSize()

    // Determine cards to show based on screen width
    const cardsToShow = width ? (
        width < 640 ? 1 : // Mobile
            width < 1024 ? 2 : // Tablet
                width < 1280 ? 3 : // Small Desktop
                    defaultCardsToShow // Desktop
    ) : defaultCardsToShow

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
    // Adjust max width based on screen size to ensure they fill space nicely
    const maxCardWidth = width && width < 640 ? 1000 : 280
    const gap = 16 // gap-4 in pixels

    return (
        <div className="relative group/carousel">
            {/* Navigation Buttons - Absolute Positioned */}
            {/* Hide on mobile, show on larger screens */}
            <button
                onClick={prevSlide}
                className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-surface-card/80 backdrop-blur-md border border-white/10 items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg opacity-0 group-hover/carousel:opacity-100 -translate-x-4 group-hover/carousel:translate-x-0"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={nextSlide}
                className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-surface-card/80 backdrop-blur-md border border-white/10 items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg opacity-0 group-hover/carousel:opacity-100 translate-x-4 group-hover/carousel:translate-x-0"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Carousel Container */}
            <div className="overflow-hidden -mx-4 px-4 py-4">
                <motion.div
                    className="flex gap-4"
                    animate={{
                        x: width && width < 640
                            ? `-${currentIndex * ((width * 0.75) + gap) - ((width - (width * 0.75)) / 2)}px`
                            : `-${currentIndex * (maxCardWidth + gap)}px`
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    // Reset index when screen size changes to avoid empty space
                    onLayoutAnimationComplete={() => {
                        const maxIndex = Math.max(0, items.length - cardsToShow)
                        if (currentIndex > maxIndex) {
                            setCurrentIndex(maxIndex)
                        }
                    }}
                >
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0"
                            style={{
                                width: width && width < 640
                                    ? width * 0.75 // 75% of window width
                                    : `min(${cardWidthPercent}%, ${maxCardWidth}px)`,
                            }}
                        >
                            {item}
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Mobile Navigation Dots */}
            <div className="flex md:hidden justify-center gap-2 mt-4">
                {Array.from({ length: Math.ceil(items.length / cardsToShow) }).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx * cardsToShow)}
                        className={`w-2 h-2 rounded-full transition-colors ${Math.floor(currentIndex / cardsToShow) === idx
                            ? 'bg-orange'
                            : 'bg-white/20'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}
