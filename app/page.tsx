'use client'

import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-surface selection:bg-orange/20 selection:text-orange-light">
      <Navbar />

      <Hero />

      <Services />

      <Contact />

      {/* Blog Preview Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lavender/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Latest <span className="text-gradient">Insights</span></h2>
              <p className="text-white/60 text-lg">Expert advice for your health journey</p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-orange hover:text-orange-light transition-colors font-medium">
              View all articles
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Understanding Chronic Back Pain',
                category: 'Pain Management',
                date: 'Mar 15, 2024',
                image: 'linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%)'
              },
              {
                title: 'Top 5 Exercises for Runners',
                category: 'Sports Therapy',
                date: 'Mar 12, 2024',
                image: 'linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%)'
              },
              {
                title: 'Ergonomics for Remote Workers',
                category: 'Wellness',
                date: 'Mar 10, 2024',
                image: 'linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%)'
              }
            ].map((post, i) => (
              <article key={i} className="group cursor-pointer">
                <div className="aspect-[4/3] rounded-2xl mb-6 overflow-hidden border border-white/10 relative">
                  <div className="absolute inset-0 bg-surface-card transition-transform duration-500 group-hover:scale-105" style={{ background: post.image }} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-medium text-white/80">
                    {post.category}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/40 mb-3">
                  <span>{post.date}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span>5 min read</span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-orange transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-white/60 line-clamp-2 text-sm leading-relaxed">
                  Discover effective strategies and professional insights to improve your physical well-being and recovery process.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative rounded-[2.5rem] overflow-hidden bg-surface-highlight border border-white/10 p-12 md:p-24 text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-orange/10 to-transparent opacity-50" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to start your <br /><span className="text-gradient">recovery journey?</span></h2>
              <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
                Book your consultation today and take the first step towards a pain-free life.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="btn-primary min-w-[160px]">
                  Book Now
                </button>
                <button className="btn-secondary min-w-[160px]">
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
