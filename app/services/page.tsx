import ServicesGrid from '@/components/ServicesGrid'
import SectionHeader from '@/components/SectionHeader'

export default function ServicesPage() {
    return (
        <main className="min-h-screen bg-background pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <SectionHeader
                    title="Our"
                    highlight="Services"
                    description="Explore our wide range of physiotherapy and rehabilitation treatments designed to help you recover and perform at your best."
                    className="mb-12"
                />

                <ServicesGrid />
            </div>
        </main>
    )
}
