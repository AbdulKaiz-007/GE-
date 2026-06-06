'use client'

import { createClient } from '@/lib/supabase/client'
import { getXPProgress, getRankFromLevel, formatXP } from '@/lib/game-engine'
import { Zap, Swords, Trophy, Flame, BookOpen, Shield, TrendingUp, Star, Bot, Cpu, Network, ScanLine, Radar, Activity, ChevronRight, Layers, Palette } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { cn } from '@/lib/game-engine'

function DashboardContent() {
    const [profile, setProfile] = useState<any>(null)
    const [stats, setStats] = useState<any>(null)
    const [recentLessons, setRecentLessons] = useState<any[]>([])
    const [leaderboardPos, setLeaderboardPos] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            const mockProfile = { display_name: 'Guest Warrior', username: 'guest', subscription: 'free' }
            const mockStats = { xp: 1250, level: 5, battles_won: 15, total_battles: 20, streak_days: 3 }
            const mockLessons = [
                { id: 'demo-1', topic: 'The Quantum Realm Explained', difficulty: 'intermediate', subject_tag: 'Physics', created_at: new Date().toISOString() },
                { id: 'demo-2', topic: 'Calculus: Derivatives', difficulty: 'beginner', subject_tag: 'Math', created_at: new Date().toISOString() }
            ]
            const mockLeaderboard = { rank_position: 42, score: 1250 }

            try {
                if (user) {
                    const [p, s, rl, lp] = await Promise.all([
                        supabase.from('profiles').select('*').eq('id', user.id).single(),
                        supabase.from('player_stats').select('*').eq('user_id', user.id).single(),
                        supabase.from('user_library').select('created_at, lessons(id, topic, difficulty, subject_tag)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(4),
                        supabase.from('leaderboard').select('rank_position, score').eq('user_id', user.id).single(),
                    ])
                    setProfile(p.data)
                    setStats(s.data)
                    
                    // Map the nested lessons object to flat array for rendering
                    const mappedLessons = rl.data ? rl.data.map((item: any) => ({
                        ...item.lessons,
                        created_at: item.created_at
                    })).filter((l: any) => l.id) : [] // filter out any null lessons
                    
                    setRecentLessons(mappedLessons)
                    setLeaderboardPos(lp.data)
                } else {
                    setProfile(mockProfile)
                    setStats(mockStats)
                    setRecentLessons(mockLessons)
                    setLeaderboardPos(mockLeaderboard)
                }
            } catch (error) {
                console.error('Core Sync Failure:', error)
                setProfile(mockProfile)
                setStats(mockStats)
                setRecentLessons(mockLessons)
                setLeaderboardPos(mockLeaderboard)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 min-h-[50vh]">
            <div className="w-16 h-16 biometric-frame flex items-center justify-center animate-pulse mb-6">
                <Radar className="w-8 h-8 text-arc-neon animate-spin" />
            </div>
            <div className="text-arc-neon font-display text-[10px] tracking-[0.4em] uppercase animate-pulse">Initializing Neural Link...</div>
        </div>
    )

    const xpData = stats ? getXPProgress(stats.xp) : { level: 1, currentXP: 0, requiredXP: 500, percent: 0 }
    const rank = stats ? getRankFromLevel(stats.level) : 'INITIATE'
    const winRate = stats && stats.total_battles > 0
        ? Math.round((stats.battles_won / stats.total_battles) * 100)
        : 0

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 relative z-10 pt-8 font-sans animate-motion-blur-in">
            {/* Header / Profile Summary */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/10">
                <div className="flex items-center gap-8">
                    <div className="w-24 h-24 biometric-frame animate-neural-pulse overflow-hidden p-2 bg-sony-nebula-deep/50 relative group">
                        <div className="absolute inset-0 bg-arc-neon/10 animate-pulse group-hover:opacity-100 transition-opacity rounded-full blur-xl opacity-50" />
                        <div className="relative z-10 w-full h-full rounded-full border border-arc-neon/30 flex items-center justify-center bg-black/40 overflow-hidden">
                            <img
                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile?.username || 'warrior'}`}
                                alt="Avatar"
                                className="w-full h-full object-cover grayscale brightness-125"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <span className="font-display text-[10px] text-arc-neon tracking-[0.3em] uppercase opacity-70">Authenticated User</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-arc-neon animate-pulse" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display tracking-[0.1em] chromatic-text uppercase animate-chromatic-glitch">{profile?.display_name || profile?.username || 'PLAYER ONE'}
                        </h1>
                        <p className="font-display text-[10px] text-white/40 mt-4 tracking-[0.3em] uppercase">
                            Spatial Encryption Active ∙ v2050.4
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="glass-card px-6 py-3 flex items-center gap-3 border-arc-neon/30">
                        <Star className="w-4 h-4 text-arc-neon drop-shadow-glow" />
                        <span className="font-display text-xs text-white tracking-widest">{rank}</span>
                    </div>
                    {stats?.streak_days > 0 && (
                        <div className="glass-card px-6 py-3 flex items-center gap-3 border-sony-violet/30">
                            <Flame className="w-4 h-4 text-sony-violet animate-pulse" />
                            <span className="font-display text-xs text-white tracking-widest">{stats.streak_days} DAY STREAK</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Level & XP Module */}
            <div className="glass-card p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Activity className="w-32 h-32" />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full border-2 border-arc-neon/50 flex items-center justify-center bg-arc-neon/10 relative">
                            <div className="absolute inset-0 bg-arc-neon/20 animate-ping rounded-full" />
                            <span className="font-display text-2xl text-arc-neon drop-shadow-glow">{stats?.level || 0}</span>
                        </div>
                        <div>
                            <h3 className="font-display text-2xl tracking-widest text-white uppercase">Neural Tier {stats?.level || 0}</h3>
                            <p className="font-display text-[10px] text-white/40 tracking-[0.3em] uppercase mt-2">To Next Convergence: {formatXP(xpData.requiredXP - xpData.currentXP)} XP</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="font-display text-3xl tracking-tighter text-arc-neon drop-shadow-glow">{formatXP(stats?.xp ?? 0)}
                        </span>
                        <span className="font-display text-[10px] text-white/30 tracking-[0.3em] uppercase ml-4">Total Sync</span>
                    </div>
                </div>

                <div className="h-2 w-full bg-white/5 rounded-full relative z-10 overflow-hidden border border-white/10 p-[1px]">
                    <div
                        className="h-full bg-gradient-to-r from-arc-neon via-sony-indigo to-sony-violet transition-all duration-1000 ease-out shadow-glow"
                        style={{ width: `${xpData.percent}%` }}
                    />
                </div>

                <div className="flex justify-between mt-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-0.5 bg-arc-neon" />
                        <span className="font-display text-[9px] text-white/40 tracking-[0.2em] uppercase">{xpData.percent}% SYNCED</span>
                    </div>
                    <span className="font-display text-[9px] text-white/40 tracking-[0.2em] uppercase">{formatXP(xpData.currentXP)} / {formatXP(xpData.requiredXP)} TO TIER {stats?.level + 1}</span>
                </div>
            </div>

            {/* Statistics Bento */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { Icon: Swords, label: 'BATTLES WON', value: `${stats?.battles_won ?? 0}`, sub: `/ ${stats?.total_battles ?? 0}` },
                    { Icon: TrendingUp, label: 'EFFICIENCY', value: `${winRate}`, sub: '%' },
                    { Icon: Trophy, label: 'GLOBAL RANK', value: leaderboardPos?.rank_position ? `#${leaderboardPos.rank_position}` : '---', sub: '' },
                    { Icon: Zap, label: 'STREAK ACTIVE', value: `${stats?.streak_days ?? 0}`, sub: ' DAYS' },
                ].map((stat, i) => (
                    <div key={stat.label} className="glass-card p-8 flex flex-col justify-between group hover:border-white/30 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <stat.Icon className="w-5 h-5 text-arc-neon group-hover:scale-110 transition-transform" />
                            <span className="font-display text-[8px] text-white/20 tracking-widest uppercase">STAT 0{i + 1}</span>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-display tracking-widest text-white">{stat.value}</span>
                                <span className="text-xs font-display text-white/30">{stat.sub}</span>
                            </div>
                            <h4 className="font-display text-[9px] tracking-[0.3em] text-white/40 mt-4 uppercase">{stat.label}
                            </h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Primary Operations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { href: '/lessons', Icon: Palette, title: 'COMIC FACTORY', sub: 'NEURAL CREATION', desc: 'Master any subject through AI-generated comic books and narratives.', color: 'arc-neon' },
                    { href: '/lab', Icon: Cpu, title: 'CREATIVE LABS', sub: 'INTERACTIVE LEARNING', desc: 'Master concepts dynamically using force-directed graphs and interactive visualizers.', color: 'arc-neon' },
                    { href: '/oracle', Icon: ScanLine, title: 'EXAM ORACLE', sub: 'SYSTEM AUDIT', desc: 'Feed the Oracle your syllabus to decrypt high-tier exam protocols.', color: 'arc-neon' },
                    { href: '/leaderboard', Icon: Network, title: 'GLOBAL NET', sub: 'TOP WARRIORS', desc: 'Access the global sector standings and monitor top performers.', color: 'sony-violet' },
                ].map(action => (
                    <Link
                        key={action.href}
                        href={action.href}
                        className="glass-card p-10 flex flex-col justify-between group h-full hover:bg-white/5 border-white/10"
                    >
                        <div>
                            <div className={cn(
                                "w-14 h-14 biometric-frame flex items-center justify-center mb-10 transition-all group-hover:bg-white/5",
                                action.color === 'arc-neon' ? 'text-arc-neon' : action.color === 'sony-indigo' ? 'text-sony-indigo' : 'text-sony-violet'
                            )}>
                                <action.Icon className="w-7 h-7 group-hover:scale-110 transition-transform" />
                            </div>
                            <h3 className="font-display text-2xl tracking-[0.1em] text-white mb-2">{action.title}</h3>
                            <p className="font-display text-[9px] text-arc-neon tracking-[0.3em] mb-6 uppercase opacity-60">{action.sub}</p>
                            <p className="text-white/50 text-sm leading-relaxed font-sans mb-10">
                                {action.desc}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-display tracking-widest text-white/30 group-hover:text-white transition-colors uppercase">
                            Initialize <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Mission Records */}
            {recentLessons && recentLessons.length > 0 && (
                <div className="pt-10 border-t border-white/10">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-arc-neon animate-pulse" />
                            <h2 className="font-display text-2xl tracking-[0.2em] text-white uppercase">COMIC ARCHIVES</h2>
                        </div>
                        <Link href="/lessons" className="text-[10px] font-display text-white/40 tracking-[0.3em] uppercase hover:text-white transition-colors">
                            Access Archives
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {recentLessons.map((lesson, i) => (
                            <Link
                                key={lesson.id}
                                href={`/comic-book/${lesson.id}?topic=${encodeURIComponent(lesson.topic)}`}
                                className="glass-card p-6 flex items-center gap-6 group hover:bg-white/5 transition-all"
                            >
                                <div className="w-14 h-14 biometric-frame flex items-center justify-center bg-sony-nebula-deep/50 text-white group-hover:text-arc-neon transition-colors">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-display text-[8px] text-arc-neon tracking-widest uppercase">{lesson.subject_tag || 'GENERAL'}</span>
                                        <span className="font-display text-[8px] text-white/20 tracking-widest uppercase">{new Date(lesson.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="text-lg font-display tracking-wider text-white group-hover:text-arc-neon transition-colors truncate mb-3">{lesson.topic}
                                    </h4>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-sony-indigo opacity-50" />
                                            <span className="font-display text-[8px] text-white/40 uppercase tracking-widest">{lesson.difficulty}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Status Panel / CTA */}
            {(!profile?.subscription || profile.subscription === 'free') && (
                <div className="glass-card p-12 relative overflow-hidden mt-12 group border-arc-neon/30">
                    <div className="absolute inset-0 bg-gradient-to-r from-arc-neon/5 via-transparent to-sony-violet/5 animate-pulse" />
                    <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                        <div className="w-24 h-24 biometric-frame flex items-center justify-center bg-black/40 text-arc-neon shadow-aura border-arc-neon/30">
                            <Shield className="w-10 h-10 animate-pulse" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="font-display text-3xl tracking-[0.1em] text-white mb-4">SECURITY CLEARANCE REQUIRED</h3>
                            <p className="text-white/50 font-sans text-lg max-w-2xl leading-relaxed">
                                Universal sector access is currently restricted. Initialize SheerID verification to unlock advanced neural modules and global leaderboards.
                            </p>
                        </div>
                        <Link
                            href="/verify"
                            className="btn-hardware !px-10 !py-5"
                        >
                            <span className="flex items-center gap-3 font-display tracking-widest relative z-10">
                                UPLINK NOW <Layers className="w-5 h-5" />
                            </span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center p-20 min-h-screen bg-sony-nebula-deep">
                <Radar className="w-12 h-12 text-arc-neon animate-spin mb-4" />
                <div className="text-arc-neon font-display text-[10px] tracking-[0.4em] uppercase animate-pulse">Establishing Connection...</div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    )
}

