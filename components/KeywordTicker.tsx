'use client'

import { motion } from 'framer-motion'

interface KeywordTickerProps {
    keywords: string[]
}

export default function KeywordTicker({ keywords }: KeywordTickerProps) {
    return (
        <div className="w-full overflow-hidden py-4 mask-linear-fade">
            <motion.div
                className="flex gap-8 whitespace-nowrap"
                animate={{ x: [0, -1000] }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 30
                }}
            >
                {[...keywords, ...keywords, ...keywords].map((keyword, i) => (
                    <span
                        key={i}
                        className="text-lg font-medium text-white/30 hover:text-orange transition-colors cursor-default"
                    >
                        {keyword} •
                    </span>
                ))}
            </motion.div>
        </div>
    )
}
