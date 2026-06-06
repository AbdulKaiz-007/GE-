'use client'
// DUOSHINKI v2.1.0 - Refined Alignment & Branding

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import {
    LayoutDashboard,
    BookOpen,
    Swords,
    Trophy,
    User,
    Shield,
    LogOut,
    Zap,
    ChevronLeft,
    ChevronRight,
    Tent,
    Shirt,
    Target,
    ScrollText,
    Crown,
    Palette,
    Menu,
    X,
    Home,
    Cpu
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/game-engine'
import toast from 'react-hot-toast'
import { ThemeToggle } from './ThemeToggle'

const navItems = [
    { href: '/', icon: Home, label: 'Landing Page' },
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/holo-tutor', icon: BookOpen, label: 'Holo Tutor' },
    { href: '/premium', icon: Crown, label: 'Upgrade' },
    { href: '/armor', icon: Shirt, label: 'Armor' },
    { href: '/missions', icon: Target, label: 'Bounty Boards' },
    { href: '/chronicles', icon: ScrollText, label: 'Chronicles' },
    { href: '/lab', icon: Cpu, label: 'Labs' },
    { href: '/battle', icon: Swords, label: 'Boss Fight' },
    { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/verify', icon: Shield, label: 'Verify ID' },
]

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [collapsed, setCollapsed] = useState(true)
    const [mobileOpen, setMobileOpen] = useState(false)

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        toast.success('Logged out! See you in the arena ⚡')
        router.push('/login')
        router.refresh()
    }

    const DesktopSidebar = (
        <aside
            className={cn(
                'hidden md:flex relative flex-col h-full transition-all duration-300 flex-shrink-0 z-50 bg-arc-surface border-r-4 border-arc-border shadow-lg',
                collapsed ? 'w-20' : 'w-64'
            )}
        >
            {/* Desktop Logo */}
            <div
                className={cn(
                    'flex items-center gap-3 p-4 h-20 border-b-4 border-gb-darkest relative overflow-hidden',
                    collapsed ? 'justify-center' : 'pr-4'
                )}
            >
                <div className="flex-shrink-0 w-10 h-10 biometric-frame overflow-hidden relative">
                    <Image
                        src="/images/gamma_edison_logo.png"
                        alt="Gamma Edison Logo"
                        fill
                        className="object-cover p-1.5 brightness-110"
                    />
                </div>
                {!collapsed && (
                    <div className="flex flex-col">
                        <span className="font-display text-gb-darkest tracking-[0.1em] text-lg whitespace-nowrap drop-shadow-[1px_1px_0px_#8bac0f] pt-1 uppercase leading-none">DUOSHINKI</span>
                        <span className="font-display text-[8px] text-gb-dark tracking-[0.2em] uppercase mt-1 opacity-70">BY GAMMA EDISON</span>
                    </div>
                )}
            </div>

            {/* Desktop Nav */}
            <nav className="flex-1 px-3 py-6 space-y-3 overflow-y-auto no-scrollbar">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href || pathname.startsWith(href + '/')
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 transition-none group border-2 relative',
                                collapsed ? 'justify-center border-transparent' : (active ? 'border-gb-darkest bg-gb-light shadow-[2px_2px_0px_#0f380f]' : 'border-transparent hover:border-gb-dark hover:border-dashed')
                            )}
                        >
                            <Icon
                                className={cn(
                                    "w-5 h-5 flex-shrink-0 transition-none",
                                    active ? "text-gb-darkest" : "text-gb-dark group-hover:text-gb-darkest"
                                )}
                            />
                            {!collapsed && (
                                <span className={cn(
                                    "font-sans text-lg font-bold uppercase relative z-10 pt-1",
                                    active ? "text-gb-darkest drop-shadow-[1px_1px_0px_#8bac0f]" : "text-gb-dark group-hover:text-gb-darkest"
                                )}>{label}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Desktop Bottom */}
            <div className="p-4 border-t-4 border-arc-border space-y-4">
                <ThemeToggle collapsed={collapsed} />
                <button
                    onClick={handleLogout}
                    className={cn(
                        'flex items-center gap-3 w-full px-3 py-2.5 transition-none border-2 border-transparent hover:border-arc-neon/30 hover:bg-arc-surface/80 group',
                        collapsed && 'justify-center'
                    )}
                    title={collapsed ? 'Logout' : undefined}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0 text-arc-text group-hover:text-arc-neon" />
                    {!collapsed && <span className="font-sans text-lg font-bold uppercase pt-1 text-arc-text group-hover:text-arc-neon">LOGOUT</span>}
                </button>

                {!collapsed && (
                    <div className="pt-2 text-center border-t-2 border-gb-darkest border-dashed mt-2 bg-gb-dark/5 p-1">
                        <span className="text-[10px] font-display text-gb-darkest tracking-[0.25em] uppercase leading-none opacity-90">GAMMA EDISON
                        </span>
                    </div>
                )}
            </div>

            {/* Desktop Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-6 w-6 h-6 flex items-center justify-center z-50 rounded-full bg-gb-light border-2 border-gb-darkest hover:bg-gb-dark transition-all shadow-[2px_2px_0px_#0f380f]"
            >
                {collapsed ? (
                    <ChevronRight className="w-3 h-3 text-gb-darkest" />
                ) : (
                    <ChevronLeft className="w-3 h-3 text-gb-darkest" />
                )}
            </button>
        </aside>
    )

    const MobileTopBar = (
        <div className="md:hidden flex items-center justify-between p-4 bg-gb-lightest border-b-4 border-gb-darkest z-40 sticky top-0">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 biometric-frame overflow-hidden relative">
                    <Image
                        src="/images/gamma_edison_logo.png"
                        alt="Logo"
                        fill
                        className="object-cover p-1.5"
                    />
                </div>
                <span className="font-display text-gb-darkest tracking-widest text-lg pt-1">DUOSHINKI</span>
            </div>
            <button
                onClick={() => setMobileOpen(true)}
                className="p-2 border-2 border-gb-darkest bg-gb-light shadow-[2px_2px_0px_#0f380f]"
            >
                <Menu className="w-6 h-6 text-gb-darkest" />
            </button>
        </div>
    )

    const MobileDrawer = (
        <>
            {/* Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-gb-darkest/50 z-50 md:hidden backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Drawer */}
            <aside
                className={cn(
                    'fixed top-0 left-0 bottom-0 w-64 bg-gb-lightest border-r-4 border-gb-darkest z-[60] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex items-center justify-between p-4 border-b-4 border-gb-darkest">
                    <span className="font-display text-gb-darkest tracking-widest text-lg pt-1">MENU</span>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="p-2 border-2 border-gb-darkest bg-gb-light hover:bg-gb-dark transition-colors"
                    >
                        <X className="w-5 h-5 text-gb-darkest" />
                    </button>
                </div>

                <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
                    {navItems.map(({ href, icon: Icon, label }) => {
                        const active = pathname === href || pathname.startsWith(href + '/')
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-3 border-2 transition-colors',
                                    active ? 'border-gb-darkest bg-gb-light shadow-[2px_2px_0px_#0f380f]' : 'border-transparent hover:border-gb-dark hover:border-dashed'
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "w-5 h-5 flex-shrink-0",
                                        active ? "text-gb-darkest" : "text-gb-dark"
                                    )}
                                />
                                <span className={cn(
                                    "font-sans text-lg font-bold uppercase relative z-10 pt-1",
                                    active ? "text-gb-darkest drop-shadow-[1px_1px_0px_#8bac0f]" : "text-gb-dark"
                                )}>{label}
                                </span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t-4 border-gb-darkest space-y-4">
                    <ThemeToggle />
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-3 border-2 border-transparent hover:border-gb-darkest hover:bg-gb-dark text-gb-dark hover:text-gb-lightest transition-colors font-sans text-lg font-bold uppercase transition-group"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <span className="pt-1">LOGOUT</span>
                    </button>

                    <div className="pt-4 text-center border-t-2 border-gb-darkest border-dashed mt-2 bg-gb-dark/5 p-1">
                        <span className="text-[10px] font-display text-gb-darkest tracking-[0.25em] uppercase leading-none opacity-90">GAMMA EDISON
                        </span>
                    </div>
                </div>
            </aside>
        </>
    )

    return (
        <>
            {DesktopSidebar}
            {MobileTopBar}
            {MobileDrawer}
        </>
    )
}
