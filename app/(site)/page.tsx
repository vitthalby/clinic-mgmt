import Hero from '@/components/Hero'
import Services from '@/components/Services'
import Contact from '@/components/Contact'
import Reviews from '@/components/Reviews'
import SectionHeader from '@/components/SectionHeader'
import BlogSection from '@/components/BlogSection'

export default function Home() {
  return (
    <main className="min-h-screen bg-surface selection:bg-orange/20 selection:text-orange-light">
      <Hero />

      <Services />

      <Contact />



      <BlogSection />

      <Reviews />
    </main>
  )
}
