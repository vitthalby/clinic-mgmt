'use client'

import { siteConfig } from '@/config/site'
import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="relative border-t border-white/5 bg-surface-card/30 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="relative w-10 h-10">
                                <Image
                                    src="/images/logo.jpg"
                                    alt="Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-white tracking-tight leading-none">
                                    {siteConfig.name.substring(0, 6)}<span className="text-orange">{siteConfig.name.substring(6)}</span>
                                </span>
                                <span className="text-[10px] text-white/60 font-medium tracking-wide uppercase mt-1">
                                    {siteConfig.category}
                                </span>
                            </div>
                        </div>
                        <p className="text-white/60 max-w-sm mb-8">
                            {siteConfig.description}
                        </p>
                        <div className="flex gap-4">
                            {Object.entries(siteConfig.socials).map(([platform, link]) => {
                                const getIcon = (name: string) => {
                                    switch (name) {
                                        case 'x': return <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                                        case 'linkedin': return <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z" />
                                        case 'instagram': return <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M12 2.5c5.25 0 9.5 4.25 9.5 9.5S17.25 21.5 12 21.5 2.5 17.25 2.5 12 6.75 2.5 12 2.5z" />
                                        case 'facebook': return <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                        default: return <circle cx="12" cy="12" r="10" />
                                    }
                                }
                                return (
                                    <a key={platform} href={link} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white/60 hover:text-white">
                                        <span className="sr-only">{platform}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                                            {getIcon(platform)}
                                        </svg>
                                    </a>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            {['About Us', 'Our Services', 'Specialists', 'Blog', 'Contact'].map((item) => {
                                let href = '#';
                                if (item === 'About Us') href = '#about';
                                if (item === 'Our Services') href = '/services';
                                if (item === 'Specialists') href = '/services';
                                if (item === 'Blog') href = '#blog';
                                if (item === 'Contact') href = '/contact';

                                const isInternalPage = href.startsWith('/');

                                return (
                                    <li key={item}>
                                        {isInternalPage ? (
                                            <Link href={href} className="text-white/60 hover:text-orange transition-colors text-sm">
                                                {item}
                                            </Link>
                                        ) : (
                                            <a href={href} className="text-white/60 hover:text-orange transition-colors text-sm">
                                                {item}
                                            </a>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6">Contact</h4>
                        <ul className="space-y-4 text-sm text-white/60">
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-orange shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span>{siteConfig.contact.address}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-orange shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <span>{siteConfig.contact.email}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-orange shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <span>{siteConfig.contact.phone}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-white/40">
                        © 2025 {siteConfig.name}. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-white/40">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
