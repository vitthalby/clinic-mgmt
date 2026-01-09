import { ServiceData } from '@/types/cards'

export const servicesData: ServiceData[] = [
    {
        id: 'matrix-rhythm',
        title: 'Matrix Rhythm Therapy',
        description: 'Cellular level regeneration and micro-massage for deep tissue healing.',
        category: 'Advanced Therapy',
        details: (
            <div className="space-y-4">
                <p>Matrix Rhythm Therapy is a revolutionary approach that works at the cellular level to restore the body's natural rhythm. It effectively treats pain, stiffness, and restricted mobility by re-establishing normal cellular pulsations.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Restores elasticity to muscles and tissues.</li>
                    <li>Improves microcirculation and lymphatic drainage.</li>
                    <li>Accelerates regeneration of nerves and tissues.</li>
                    <li>Effective for chronic pain, sports injuries, and post-operative recovery.</li>
                </ul>
            </div>
        ),
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 17l3-3m0 0l3 3m-3-3v12M21 7l-3 3m0 0l-3-3m3 3V-2M9 3h6m-6 4h6m-6 4h6" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 12h4m4 0h4m4 0h4" />
            </svg>
        ),
        largeImage: '/images/matrix-rhythm.png',
        links: {
            bookNow: '/contact',
            learnMore: '#services/matrix-rhythm'
        }
    },
    {
        id: 'cupping',
        title: 'Cupping Therapy',
        description: 'Ancient technique using suction to stimulate blood flow and relieve muscle tension.',
        category: 'Traditional Therapy',
        details: (
            <div className="space-y-4">
                <p>Cupping Therapy is an ancient form of alternative medicine in which a therapist puts special cups on your skin for a few minutes to create suction. People get it for many purposes, including to help with pain, inflammation, blood flow, relaxation and well-being, and as a type of deep-tissue massage.</p>
                <p>The suction and negative pressure provided by cupping can loosen muscles, encourage blood flow, and sedate the nervous system (which makes it an excellent treatment for high blood pressure).</p>
            </div>
        ),
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                <circle cx="8" cy="8" r="3" strokeWidth={1.5} />
                <circle cx="16" cy="8" r="3" strokeWidth={1.5} />
                <circle cx="8" cy="16" r="3" strokeWidth={1.5} />
                <circle cx="16" cy="16" r="3" strokeWidth={1.5} />
            </svg>
        ),
        largeImage: '/images/cupping.png',
        links: {
            bookNow: '/contact',
            learnMore: '#services/cupping'
        }
    },
    {
        id: 'pain-management',
        title: 'Pain Management',
        description: 'Comprehensive strategies to manage and reduce chronic and acute pain conditions.',
        category: 'Core Service',
        details: (
            <div className="space-y-4">
                <p>Our Pain Management program focuses on diagnosing the root cause of your pain and developing a personalized treatment plan. We use a combination of physical therapy, manual techniques, and advanced modalities to reduce pain and prevent recurrence.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Assessment of musculoskeletal imbalances.</li>
                    <li>Manual therapy for joint mobilization.</li>
                    <li>Therapeutic exercises to strengthen weak areas.</li>
                    <li>Education on posture and ergonomics.</li>
                </ul>
            </div>
        ),
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6M12 9v6" />
            </svg>
        ),
        largeImage: '/images/pain-relief.png',
        links: {
            bookNow: '/contact',
            learnMore: '#services/pain-management'
        }
    },
    {
        id: 'kinesiology-taping',
        title: 'Kinesiology Taping',
        description: 'Supportive taping to stabilize muscles and joints without restricting range of motion.',
        category: 'Sports Therapy',
        details: (
            <div className="space-y-4">
                <p>Kinesiology Taping involves applying a specialized elastic tape to the skin. It lifts the skin slightly to create space between the skin and underlying tissues, which improves circulation and lymphatic drainage. It provides support to muscles and joints without restricting their range of motion.</p>
                <p>Used by athletes and active individuals to prevent injuries, manage edema, and enhance performance.</p>
            </div>
        ),
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 2v20M16 2v20" />
            </svg>
        ),
        largeImage: '/images/sports-rehab.png',
        links: {
            bookNow: '/contact',
            learnMore: '#services/kinesiology-taping'
        }
    },
    {
        id: 'post-surgical',
        title: 'Post-Surgical Rehab',
        description: 'Guided rehabilitation protocols to ensure safe and effective recovery after surgery.',
        category: 'Rehabilitation',
        details: (
            <div className="space-y-4">
                <p>Post-surgical rehabilitation is crucial for a full recovery. We work closely with your surgeon to design a protocol that restores strength, flexibility, and function while protecting the surgical site.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Hip and Knee Replacements</li>
                    <li>Ligament Repairs (ACL, MCL)</li>
                    <li>Shoulder Arthroscopy</li>
                    <li>Spinal Surgeries</li>
                </ul>
            </div>
        ),
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6" />
            </svg>
        ),
        largeImage: '/images/knee-rehab.png',
        links: {
            bookNow: '/contact',
            learnMore: '#services/post-surgical'
        }
    },
    {
        id: 'dry-needling',
        title: 'Dry Needling',
        description: 'Targeted release of trigger points to alleviate muscle pain and improve function.',
        category: 'Advanced Therapy',
        details: (
            <div className="space-y-4">
                <p>Dry Needling is a technique physical therapists use for the treatment of pain and movement impairments. It uses a "dry" needle, one without medication or injection, inserted through the skin into areas of the muscle.</p>
                <p>It targets myofascial trigger points (hyperirritable spots in skeletal muscle) to relieve pain and improve range of motion.</p>
            </div>
        ),
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v20M12 2l-2 2m2-2l2 2" />
                <circle cx="12" cy="18" r="2" strokeWidth={1.5} />
            </svg>
        ),
        largeImage: '/images/dry-needling.png',
        links: {
            bookNow: '/contact',
            learnMore: '#services/dry-needling'
        }
    },
    {
        id: 'ultrasound',
        title: 'Ultrasound Therapy',
        description: 'Deep heat therapy to promote tissue healing and reduce inflammation.',
        category: 'Therapeutic Modality',
        details: (
            <div className="space-y-4">
                <p>Ultrasound therapy uses sound waves to penetrate soft tissues. It increases blood flow, relaxes muscles, and promotes tissue healing. It is often used to treat chronic inflammation, tendonitis, and muscle spasms.</p>
            </div>
        ),
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l2-2 2 2v13a2 2 0 01-2 2 2 2 0 01-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 9c0 4 2 7 4 7M19 9c0 4-2 7-4 7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9c0 5 3 9 6 9M21 9c0 5-3 9-6 9" />
            </svg>
        ),
        largeImage: '/images/manual-therapy.png',
        links: {
            bookNow: '/contact',
            learnMore: '#services/ultrasound'
        }
    },
    {
        id: 'manual-therapy',
        title: 'Manual Therapy',
        description: 'Hands-on techniques to mobilize joints and soft tissues for pain relief.',
        category: 'Core Service',
        details: (
            <div className="space-y-4">
                <p>Manual therapy is a specialized area of physical therapy that utilizes specific hands-on techniques, including manipulation and mobilization, used by the physical therapist to diagnose and treat soft tissue and joint structures.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Joint mobilization and manipulation</li>
                    <li>Soft tissue mobilization (massage)</li>
                    <li>Muscle energy techniques</li>
                    <li>Myofascial release</li>
                </ul>
            </div>
        ),
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11" />
            </svg>
        ),
        largeImage: '/images/manual-therapy.png',
        links: {
            bookNow: '/contact',
            learnMore: '#services/manual-therapy'
        }
    },
    {
        id: 'sports-injury',
        title: 'Sports Injury Rehab',
        description: 'Accelerated recovery programs for athletes of all levels.',
        category: 'Sports Therapy',
        details: (
            <div className="space-y-4">
                <p>Our sports injury rehabilitation programs are designed to get you back to your sport safely and as quickly as possible. We focus on not just healing the injury, but also improving performance and preventing future issues.</p>
                <p>We treat everything from sprains and strains to post-operative ligament repairs and fractures.</p>
            </div>
        ),
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        largeImage: '/images/sports-rehab.png',
        links: {
            bookNow: '/contact',
            learnMore: '#services/sports-injury'
        }
    },
    {
        id: 'geriatric-care',
        title: 'Geriatric Care',
        description: 'Specialized physiotherapy for elderly patients to improve mobility and balance.',
        category: 'Rehabilitation',
        details: (
            <div className="space-y-4">
                <p>As we age, maintaining mobility and independence becomes increasingly important. Our geriatric care programs focus on balance training, fall prevention, and managing age-related conditions like arthritis and osteoporosis.</p>
            </div>
        ),
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
        largeImage: '/images/dry-needling.png',
        links: {
            bookNow: '/contact',
            learnMore: '#services/geriatric-care'
        }
    },
    {
        id: 'vestibular-rehab',
        title: 'Vestibular Rehab',
        description: 'Treatment for dizziness, vertigo, and balance disorders.',
        category: 'Advanced Therapy',
        details: (
            <div className="space-y-4">
                <p>Vestibular rehabilitation is a specialized form of therapy intended to alleviate both the primary and secondary problems caused by vestibular disorders. It is an exercise-based program primarily designed to reduce vertigo and dizziness, gaze instability, and/or imbalance and falls.</p>
            </div>
        ),
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12a7.5 7.5 0 0015 0 7.5 7.5 0 00-15 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9" />
            </svg>
        ),
        largeImage: '/images/matrix-rhythm.png',
        links: {
            bookNow: '/contact',
            learnMore: '#services/vestibular-rehab'
        }
    },
    {
        id: 'orthopedic-rehab',
        title: 'Orthopedic Rehab',
        description: 'Recovery from bone, joint, and muscle conditions.',
        category: 'Core Service',
        details: (
            <div className="space-y-4">
                <p>Orthopedic rehabilitation is a therapeutic approach to recovery, the purpose of which is to correct musculoskeletal limitations and alleviate pain from trauma, illness, or surgery.</p>
            </div>
        ),
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.022.547l-2.387 2.387a2 2 0 000 2.828l.414.414a2 2 0 002.828 0L8.71 18.56a2 2 0 011.022-.547l2.387-.477a6 6 0 013.86-.517l.318.158a6 6 0 003.86-.517l2.533.506a2 2 0 011.022.547l2.387 2.387a2 2 0 010 2.828l-.414.414a2 2 0 01-2.828 0l-2.827-2.828a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.022.547l-2.387 2.387a2 2 0 000 2.828l.414.414a2 2 0 002.828 0L8.71 18.56a2 2 0 011.022-.547l2.387-.477a6 6 0 013.86-.517l.318.158" />
            </svg>
        ),
        largeImage: '/images/upper-back.png',
        links: {
            bookNow: '/contact',
            learnMore: '#services/orthopedic-rehab'
        }
    }
]
