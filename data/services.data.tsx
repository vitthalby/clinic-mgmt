import { ServiceData } from '@/types/cards'

export const servicesData: ServiceData[] = [
    {
        id: 'matrix-rhythm',
        title: 'Matrix Rhythm Therapy',
        description: 'Cellular level regeneration and micro-massage for deep tissue healing.',
        category: 'Advanced Therapy',
        icon: (
            <svg className= "w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
            <path strokeLinecap="round" strokeLinejoin = "round" strokeWidth={ 1.5} d="M3 17l3-3m0 0l3 3m-3-3v12M21 7l-3 3m0 0l-3-3m3 3V-2M9 3h6m-6 4h6m-6 4h6" />
            <path strokeLinecap="round" strokeLinejoin = "round" strokeWidth={ 1.5} d="M2 12h4m4 0h4m4 0h4" />
            </svg>
        ),
links: {
    bookNow: '#contact',
        learnMore: '#services/matrix-rhythm'
}
    },
{
    id: 'cupping',
        title: 'Cupping Therapy',
            description: 'Ancient technique using suction to stimulate blood flow and relieve muscle tension.',
                category: 'Traditional Therapy',
                    icon: (
                        <svg className= "w-8 h-8" fill = "none" stroke = "currentColor" viewBox = "0 0 24 24" >
                            <circle cx="8" cy = "8" r = "3" strokeWidth = { 1.5} />
                                <circle cx="16" cy = "8" r = "3" strokeWidth = { 1.5} />
                                    <circle cx="8" cy = "16" r = "3" strokeWidth = { 1.5} />
                                        <circle cx="16" cy = "16" r = "3" strokeWidth = { 1.5} />
                                            </svg>
        ),
    links: {
        bookNow: '#contact',
            learnMore: '#services/cupping'
    }
},
{
    id: 'pain-management',
        title: 'Pain Management',
            description: 'Comprehensive strategies to manage and reduce chronic and acute pain conditions.',
                category: 'Core Service',
                    icon: (
                        <svg className= "w-8 h-8" fill = "none" stroke = "currentColor" viewBox = "0 0 24 24" >
                            <path strokeLinecap="round" strokeLinejoin = "round" strokeWidth = { 1.5} d = "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                <path strokeLinecap="round" strokeLinejoin = "round" strokeWidth = { 1.5} d = "M9 12h6M12 9v6" />
                                    </svg>
        ),
    links: {
        bookNow: '#contact',
            learnMore: '#services/pain-management'
    }
},
{
    id: 'kinesiology-taping',
        title: 'Kinesiology Taping',
            description: 'Supportive taping to stabilize muscles and joints without restricting range of motion.',
                category: 'Sports Therapy',
                    icon: (
                        <svg className= "w-8 h-8" fill = "none" stroke = "currentColor" viewBox = "0 0 24 24" >
                            <path strokeLinecap="round" strokeLinejoin = "round" strokeWidth = { 1.5} d = "M4 6h16M4 10h16M4 14h16M4 18h16" />
                                <path strokeLinecap="round" strokeLinejoin = "round" strokeWidth = { 1.5} d = "M8 2v20M16 2v20" />
                                    </svg>
        ),
    links: {
        bookNow: '#contact',
            learnMore: '#services/kinesiology-taping'
    }
},
{
    id: 'post-surgical',
        title: 'Post-Surgical Rehab',
            description: 'Guided rehabilitation protocols to ensure safe and effective recovery after surgery.',
                category: 'Rehabilitation',
                    icon: (
                        <svg className= "w-8 h-8" fill = "none" stroke = "currentColor" viewBox = "0 0 24 24" >
                            <path strokeLinecap="round" strokeLinejoin = "round" strokeWidth = { 1.5} d = "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                <path strokeLinecap="round" strokeLinejoin = "round" strokeWidth = { 1.5} d = "M9 12h6m-6 4h6" />
                                    </svg>
        ),
    links: {
        bookNow: '#contact',
            learnMore: '#services/post-surgical'
    }
},
{
    id: 'dry-needling',
        title: 'Dry Needling',
            description: 'Targeted release of trigger points to alleviate muscle pain and improve function.',
                category: 'Advanced Therapy',
                    icon: (
                        <svg className= "w-8 h-8" fill = "none" stroke = "currentColor" viewBox = "0 0 24 24" >
                            <path strokeLinecap="round" strokeLinejoin = "round" strokeWidth = { 1.5} d = "M12 2v20M12 2l-2 2m2-2l2 2" />
                                <circle cx="12" cy = "18" r = "2" strokeWidth = { 1.5} />
                                    </svg>
        ),
    links: {
        bookNow: '#contact',
            learnMore: '#services/dry-needling'
    }
},
{
    id: 'ultrasound',
        title: 'Ultrasound Therapy',
            description: 'Deep heat therapy to promote tissue healing and reduce inflammation.',
                category: 'Therapeutic Modality',
                    icon: (
                        <svg className= "w-8 h-8" fill = "none" stroke = "currentColor" viewBox = "0 0 24 24" >
                            <path strokeLinecap="round" strokeLinejoin = "round" strokeWidth = { 1.5} d = "M9 19V6l2-2 2 2v13a2 2 0 01-2 2 2 2 0 01-2-2z" />
                                <path strokeLinecap="round" strokeLinejoin = "round" strokeWidth = { 1.5} d = "M5 9c0 4 2 7 4 7M19 9c0 4-2 7-4 7" />
                                    <path strokeLinecap="round" strokeLinejoin = "round" strokeWidth = { 1.5} d = "M3 9c0 5 3 9 6 9M21 9c0 5-3 9-6 9" />
                                        </svg>
        ),
    links: {
        bookNow: '#contact',
            learnMore: '#services/ultrasound'
    }
}
]
