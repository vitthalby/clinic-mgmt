'use client'

import { motion } from 'framer-motion'

interface KeywordTickerProps {
    keywords: string[]
}

export default function KeywordTicker({ keywords }: KeywordTickerProps) {
    return (
        <div className="w-full overflow-hidden py-1 mask-linear-fade">
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
                        className="text-xl font-light tracking-wide text-white/40 hover:text-white transition-colors cursor-default flex items-center gap-8"
                    >
                        {keyword}
                        <span className="text-orange/50 text-sm">✦</span>
                    </span>
                ))}
            </motion.div>
        </div>
    )
}
