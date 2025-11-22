'use client'

import SectionHeader from './SectionHeader'
import Card from './Card'
import CardCarousel from './CardCarousel'
import { reviewsData } from '@/data/reviews.data'
import { siteConfig } from '@/config/site'

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

                <div className="flex justify-end -mt-8 mb-8">
                    <a
                        href={siteConfig.links.googleReviews}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden md:flex items-center gap-2 text-orange hover:text-orange-light transition-colors font-medium"
                    >
                        Read all reviews
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </a>
                </div>

                <CardCarousel
                    cardsToShow={5}
                    items={reviewsData.map((review) => (
                        <Card
                            key={review.id}
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
                    ))}
                />
            </div>
        </section>
    )
}
