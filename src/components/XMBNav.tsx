'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    LayoutDashboard,
    BookOpen,
    Swords,
    Trophy,
    User,
    Shield,
    LogOut,
    Zap,
    Tent,
    Shirt,
    Target,
    ScrollText,
    Crown,
    Palette,
    Home
} from 'lucide-react'
import { cn } from '@/lib/game-engine'
import toast from 'react-hot-toast'

const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/comics', icon: Palette, label: 'Comic Factory' },
    { href: '/premium', icon: Crown, label: 'Upgrade' },
    { href: '/armor', icon: Shirt, label: 'Armor' },
    { href: '/missions', icon: Target, label: 'Bounties' },
    { href: '/chronicles', icon: ScrollText, label: 'Chronicles' },
    { href: '/lessons', icon: BookOpen, label: 'Comic Books' },
    { href: '/battle', icon: Swords, label: 'Boss Fight' },
    { href: '/leaderboard', icon: Trophy, label: 'Leagues' },
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/verify', icon: Shield, label: 'Verify' },
]

export default function XMBNav() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        toast.success('System offline. See you in 2050. ⚡')
        router.push('/login')
        router.refresh()
    }

    return (
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-fit px-4">
            <div className="flex items-center gap-2 md:gap-3 px-6 py-3 glass-card !bg-black/60 !backdrop-blur-3xl !border-white/20 !rounded-full shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-500 overflow-visible">
                {navItems.map((item, index) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className="relative group flex flex-col items-center py-2"
                        >
                            <div className={cn(
                                "xmb-icon scale-90 md:scale-100 transition-all duration-300",
                                isActive && "active",
                                !isActive && hoveredIndex === index && "scale-105 -translate-y-1 border-white/40 shadow-aura"
                            )}>
                                <Icon className={cn(
                                    "w-5 h-5 md:w-6 md:h-6 transition-all duration-300",
                                    isActive ? "text-white scale-110" : "text-white/60 group-hover:text-white"
                                )} />

                                {isActive && (
                                    <div className="absolute inset-0 bg-arc-neon/20 rounded-full animate-ping opacity-20 pointer-events-none" />
                                )}
                            </div>

                            {/* Label that appears on hover/active - moved outside of any overflow-hidden parent if necessary */}
                            <span className={cn(
                                "absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-[9px] tracking-widest uppercase transition-all duration-300 pointer-events-none",
                                (isActive || hoveredIndex === index) ? "opacity-100 -translate-y-1 text-arc-neon" : "opacity-0 translate-y-2 text-white/40"
                            )}>{item.label}
                            </span>
                        </Link>
                    )
                })}

                <div className="w-[1px] h-6 bg-white/10 mx-1 md:mx-2" />

                <button
                    onClick={handleLogout}
                    onMouseEnter={() => setHoveredIndex(99)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="relative group flex flex-col items-center py-2"
                >
                    <div className={cn(
                        "xmb-icon scale-90 md:scale-100 transition-all duration-300",
                        hoveredIndex === 99 && "scale-105 -translate-y-1 border-red-500/40 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    )}>
                        <LogOut className={cn(
                            "w-5 h-5 md:w-6 md:h-6 transition-all duration-300",
                            hoveredIndex === 99 ? "text-red-500" : "text-white/60 group-hover:text-red-400"
                        )} />
                    </div>
                    <span className={cn(
                        "absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-[10px] tracking-widest uppercase transition-all duration-300 pointer-events-none",
                        hoveredIndex === 99 ? "opacity-100 -translate-y-1 text-red-500" : "opacity-0 translate-y-2 text-white/40"
                    )}>Logout
                    </span>
                </button>
            </div>

            {/* Ambient Background Glow */}
            <div className="absolute -inset-10 bg-sony-indigo/10 blur-[60px] -z-10 rounded-full pointer-events-none opacity-40" />
        </nav>
    )
}
