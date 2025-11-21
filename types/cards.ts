import { ReactNode } from 'react'

export interface CardProps {
    id: string | number
    type: 'review' | 'service' | 'blog'
    image?: string
    topRight?: ReactNode
    summary: string
    title: string
    subtitle?: string
    actionButton?: {
        label: string
        onClick: () => void
        variant: 'primary' | 'secondary'
    }
    className?: string
}

export interface CardCarouselProps<T> {
    data: T[]
    renderCard: (item: T) => ReactNode
    cardsToShow?: number
}

export interface ReviewData {
    id: number
    name: string
    role: string
    rating: number
    text: string
}

export interface ServiceData {
    id: string
    title: string
    description: string
    category: string
    icon: ReactNode
    links?: {
        bookNow?: string
        learnMore?: string
    }
}

export interface BlogData {
    id: string
    title: string
    summary: string
    date: string
    author?: string
    image?: string
    link?: string
}
