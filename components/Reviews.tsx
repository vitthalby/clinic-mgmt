'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import SectionHeader from './SectionHeader'

const reviews = [
    {
        name: "Sarah Johnson",
        role: "Marathon Runner",
        rating: 5,
        text: "The physiotherapy team helped me recover from a knee injury faster than I expected. Their personalized approach made all the difference.",
    },
    {
        name: "Michael Chen",
        role: "Office Professional",
        rating: 5,
        text: "After years of chronic back pain from desk work, I finally found relief. The treatment plan has been life-changing.",
    },
    {
        name: "Emma Williams",
        role: "Yoga Instructor",
        rating: 5,
        text: "Professional, caring, and incredibly knowledgeable. They treated my shoulder injury and taught me preventive exercises.",
    },
    {
        name: "David Martinez",
        role: "Construction Worker",
        rating: 5,
        text: "Outstanding service! They helped me get back to work after a serious back injury. Highly recommend their expertise.",
    },
    {
        name: "Lisa Anderson",
        role: "Teacher",
        rating: 5,
        text: "The team is amazing! They helped me overcome neck pain and improve my posture. Very grateful for their care.",
    },
    {
        name: "James Wilson",
        role: "Athlete",
        rating: 5,
        text: "Best physiotherapy experience I've had. They understood my needs as an athlete and got me back in the game quickly.",
    },
    {
        name: "Rachel Green",
        role: "Dancer",
        rating: 5,
        text: "Exceptional care and attention to detail. They helped me recover from a foot injury and return to performing.",
    },
    {
        name: "Tom Harris",
        role: "Senior Citizen",
        rating: 5,
        text: "The staff is patient and understanding. They've helped me maintain mobility and reduce arthritis pain significantly.",
    },
]

const GOOGLE_REVIEWS_URL = "https://www.google.com/search?q=your+clinic+reviews"

export default function Reviews() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const itemsPerPage = 5

    const nextSlide = () => {
        setCurrentIndex((prev) =>
            prev + 1 >= reviews.length - itemsPerPage + 1 ? 0 : prev + 1
        )
    }

    const prevSlide = () => {
        setCurrentIndex((prev) =>
            prev - 1 < 0 ? reviews.length - itemsPerPage : prev - 1
        )
    }

    const visibleReviews = reviews.slice(currentIndex, currentIndex + itemsPerPage)

    return (
        <section className="py-16 relative overflow-hidden" id="reviews">
            <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-lavender/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <SectionHeader
                    title="What Our"
                    highlight="Patients Say"
                    description="Real stories from real people who transformed their lives with our care"
                    className="mb-10"
                />

                <div className="relative group/carousel">
                    {/* Navigation Buttons - Same style as Services */}
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

                    {/* Reviews Grid */}
                    <div className="overflow-hidden -mx-4 px-4 py-4">
                        <motion.div
                            className="flex gap-4"
                            animate={{ x: `-${currentIndex * 20}%` }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            {reviews.map((review, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.05, y: -8 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className="min-w-[100%] md:min-w-[calc(20%-12.8px)] glass-card p-4 rounded-2xl group relative overflow-hidden hover:shadow-[0_20px_60px_rgba(255,61,0,0.15)] transition-shadow duration-500"
                                >
                                    {/* Animated gradient overlay - Same as Services */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange/0 via-orange/0 to-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Header: Avatar Left, Stars Right */}
                                    <div className="relative flex items-start justify-between mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange/20 to-blue/20 flex items-center justify-center text-orange font-bold text-sm shrink-0">
                                            {review.name.split(' ').map(n => n[0]).join('')}
                                        </div>

                                        {/* Star Rating */}
                                        <div className="flex gap-0.5">
                                            {[...Array(review.rating)].map((_, i) => (
                                                <svg key={i} className="w-3.5 h-3.5 text-orange" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Review Text */}
                                    <p className="relative text-white/70 text-xs leading-relaxed mb-3 line-clamp-4 group-hover:text-white/80 transition-colors duration-300">
                                        "{review.text}"
                                    </p>

                                    {/* Author Info */}
                                    <div className="relative pt-3 border-t border-white/5 group-hover:border-white/10 transition-colors duration-300">
                                        <h4 className="text-white font-semibold text-xs">{review.name}</h4>
                                        <p className="text-white/50 text-[10px]">{review.role}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="text-center mt-10"
                >
                    <a
                        href={GOOGLE_REVIEWS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange/30 transition-all duration-300 text-white font-medium group"
                    >
                        Read More Reviews on Google
                        <svg className="w-4 h-4 text-orange transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </motion.div>
            </div>
        </section>
    )
}
