import { landingPageData } from '@/data/landing-page'

interface StatsCardProps {
    className?: string;
    variant?: "vertical" | "horizontal";
    size?: "md" | "lg";
    stats: typeof landingPageData.hero.stats;
}

export default function StatsCard({ className, variant = "vertical", size = "md", stats }: StatsCardProps) {
    // Icons mapping based on index for simplicity as per original design, or we could pass icons in data
    // For now reusing the specific SVGs from Hero as they were hardcoded there.

    // Scale classes based on size
    const containerClasses = size === "lg"
        ? "p-6 gap-4"
        : "p-3 gap-2";

    const iconContainerClasses = size === "lg"
        ? "w-16 h-16"
        : "w-8 h-8";

    const iconSizeClasses = size === "lg"
        ? "w-8 h-8"
        : "w-4 h-4";

    const statValueClasses = size === "lg"
        ? "text-3xl mb-1"
        : "text-base";

    const statLabelClasses = size === "lg"
        ? "text-sm"
        : "text-[10px]";

    if (variant === 'vertical') {
        return (
            <div className={`bg-surface-highlight/70 backdrop-blur-md border border-white/10 rounded-xl shadow-xl ${className}`}>
                <div className={`flex flex-col ${containerClasses}`}>
                    {stats.map((stat, i) => (
                        <div key={i} className="flex items-center gap-3 border-b border-white/5 last:border-0 pb-2 last:pb-0 last:border-b-0">
                            <div className={`${iconContainerClasses} rounded-full bg-orange/10 flex items-center justify-center text-orange shrink-0`}>
                                {i === 0 && (
                                    <svg className={iconSizeClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                )}
                                {i === 1 && (
                                    <svg className={iconSizeClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                )}
                                {i === 2 && (
                                    <svg className={iconSizeClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                )}
                            </div>
                            <div>
                                <p className={`${statValueClasses} font-bold text-white leading-none`}>{stat.value}</p>
                                <p className={`${statLabelClasses} text-white/50 mt-0.5 whitespace-nowrap`}>{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
    if (variant === 'horizontal') {
        return (
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 w-full ${className}`}>
                {stats.map((stat, i) => (
                    <div key={i} className={`bg-surface-highlight/70 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl flex flex-col items-center text-center group hover:bg-white/5 transition-all duration-300 hover:-translate-y-1`}>
                        <div className={`${iconContainerClasses} rounded-2xl bg-orange/10 flex items-center justify-center text-orange mb-6 group-hover:scale-110 transition-transform duration-300`}>
                            {i === 0 && (
                                <svg className={iconSizeClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            )}
                            {i === 1 && (
                                <svg className={iconSizeClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            )}
                            {i === 2 && (
                                <svg className={iconSizeClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                            )}
                        </div>
                        <div>
                            <p className="text-4xl font-black text-white mb-2 tracking-tight group-hover:text-orange transition-colors">
                                {stat.value}
                            </p>
                            <p className="text-white/60 font-medium uppercase tracking-widest text-xs">
                                {stat.label}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )
    }
    return null
}
