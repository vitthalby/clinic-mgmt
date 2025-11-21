'use client'

import { motion } from 'framer-motion'

interface SectionHeaderProps {
    title: string
    highlight: string
    description: string
    className?: string
}

export default function SectionHeader({ title, highlight, description, className = '' }: SectionHeaderProps) {
    return (
        <div className={`mb-16 text-center ${className}`}>
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-bold mb-4"
            >
                {title} <span className="text-gradient">{highlight}</span>
            </motion.h2>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-white/60 text-lg max-w-2xl mx-auto"
            >
                {description}
            </motion.p>
        </div>
    )
}
