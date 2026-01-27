import FloatingContact from '@/components/FloatingContact'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="bg-surface text-white">
            <Navbar />
            {children}
            <Footer />
            <FloatingContact />
        </div>
    )
}
