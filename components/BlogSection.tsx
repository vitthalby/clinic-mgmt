import SectionHeader from './SectionHeader'
import Card from './Card'
import CardCarousel from './CardCarousel'
import { getAllPosts } from '@/lib/blog'
import { BlogData } from '@/types/cards'

export default async function BlogSection() {
    const posts = getAllPosts()

    return (
        <section className="py-24 relative overflow-hidden" id="blog">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lavender/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <SectionHeader
                    title="Latest"
                    highlight="Insights"
                    description="Expert advice for your health journey"
                />
                <div className="flex justify-end -mt-8 mb-8">
                    <button className="hidden md:flex items-center gap-2 text-orange hover:text-orange-light transition-colors font-medium">
                        View all articles
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </button>
                </div>

                <CardCarousel
                    cardsToShow={3}
                    items={posts.map((post: BlogData) => (
                        <Card
                            key={post.id}
                            id={post.id}
                            type="blog"
                            image={post.image}
                            title={post.title}
                            subtitle={`By ${post.author} • ${post.date}`}
                            summary={post.summary}
                            topRight={
                                <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-medium text-white/80">
                                    {post.category}
                                </div>
                            }
                            actionButton={{
                                label: 'Read More',
                                href: `/blog/${post.id}`,
                                variant: 'secondary'
                            }}
                        />
                    ))}
                />
            </div>
        </section>
    )
}
