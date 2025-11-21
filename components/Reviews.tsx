'use client'

import SectionHeader from './SectionHeader'
import Card from './Card'
import CardCarousel from './CardCarousel'
import { reviewsData, GOOGLE_REVIEWS_URL } from '@/data/reviews.data'

export default function Reviews() {
    return (
        <section className="py-16 relative overflow-hidden" id="reviews">
            <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-lavender/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative">
                <SectionHeader
                    title="Patient"
                    highlight="Success Stories"
                    description="Real experiences from our patients on their journey to recovery."
                />

                <CardCarousel
                    data={reviewsData}
                    cardsToShow={5}
                    renderCard={(review) => (
                        <Card
                            id={review.id}
                            type="review"
                            title={review.name}
                            subtitle={review.role}
                            summary={review.text}
                            topRight={
                                <div className="flex gap-0.5">
                                    {[...Array(review.rating)].map((_, i) => (
                                        <svg key={i} className="w-3.5 h-3.5 text-orange" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            }
                        />
                    )}
                />

                {/* CTA Button */}
                <div className="mt-12 text-center">
                    <a
                        href={GOOGLE_REVIEWS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange to-orange/80 text-white rounded-full font-semibold hover:shadow-[0_0_30px_rgba(255,61,0,0.3)] transition-all duration-300 hover:scale-105"
                    >
                        <span>Read More Reviews on Google</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    )
}
