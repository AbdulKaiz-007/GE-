'use client'

import { createClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { getXPProgress, getRankFromLevel, formatXP } from '@/lib/game-engine'
import { User, Zap, Swords, Trophy, Flame, Shield, Star, Activity, Cpu, Layers, ChevronRight, Award } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { cn } from '@/lib/game-engine'

function ProfileContent() {
    const [profile, setProfile] = useState<any>(null)
    const [stats, setStats] = useState<any>(null)
    const [userData, setUserData] = useState<any>(null)
    const [recentBattles, setRecentBattles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            // Mock Data for Guest Mode
            const mockProfile = { display_name: 'Guest Warrior', username: 'guest', subscription: 'free' }
            const mockStats = { xp: 1250, level: 5, battles_won: 15, total_battles: 20, streak_days: 3 }
            const mockUserData = { is_verified: false, college_name: 'ARC Academy', role: 'user' }
            const mockRecentBattles = [
                { id: 'b1', outcome: 'victory', xp_earned: 150, difficulty: 'elite', started_at: new Date(Date.now() - 86400000).toISOString() },
                { id: 'b2', outcome: 'victory', xp_earned: 100, difficulty: 'minion', started_at: new Date(Date.now() - 172800000).toISOString() }
            ]

            if (user) {
                const [p, s, u, rb] = await Promise.all([
                    supabase.from('profiles').select('*').eq('id', user.id).single(),
                    supabase.from('player_stats').select('*').eq('user_id', user.id).single(),
                    supabase.from('users').select('is_verified, college_name, role').eq('id', user.id).single(),
                    supabase.from('boss_battles').select('id, outcome, xp_earned, difficulty, started_at').eq('user_id', user.id).order('started_at', { ascending: false }).limit(5),
                ])
                setProfile(p.data)
                setStats(s.data)
                setUserData(u.data)
                setRecentBattles(rb.data || [])
            } else {
                setProfile(mockProfile)
                setStats(mockStats)
                setUserData(mockUserData)
                setRecentBattles(mockRecentBattles)
            }
            setLoading(false)
        }
        loadData()
    }, [])

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 min-h-[50vh] space-y-6">
            <div className="relative">
                <div className="absolute inset-0 bg-arc-neon/20 blur-[40px] animate-pulse rounded-full" />
                <Activity className="w-16 h-16 text-arc-neon animate-pulse relative z-10" />
            </div>
            <div className="text-arc-neon font-display tracking-[0.4em] uppercase animate-pulse">Syncing Biometrics v2...</div>
        </div>
    )

    const xpData = stats ? getXPProgress(stats.xp) : { level: 1, currentXP: 0, requiredXP: 500, percent: 0 }
    const rank = stats ? getRankFromLevel(stats.level) : 'Novice'
    const winRate = stats && stats.total_battles > 0
        ? Math.round((stats.battles_won / stats.total_battles) * 100)
        : 0

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 font-sans animate-motion-blur-in pb-32">
            {/* Profile Header HUD */}
            <div className="glass-card p-8 md:p-12 relative overflow-hidden group">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                    <User className="w-64 h-64" />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    {/* Avatar HUD */}
                    <div className="w-32 h-32 biometric-frame p-1 group-hover:scale-110 transition-transform duration-700">
                        <div className="w-full h-full bg-sony-nebula-deep flex items-center justify-center relative overflow-hidden">
                            <span className="text-6xl font-display text-arc-neon drop-shadow-glow opacity-60">{(profile?.display_name || profile?.username || 'U').charAt(0).toUpperCase()}
                            </span>
                            {/* Scanning line */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-arc-neon/20 to-transparent animate-scanline h-[200%] pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 text-center md:text-left space-y-4">
                        <div className="flex flex-col md:flex-row items-center gap-4 flex-wrap">
                            <h1 className="text-4xl md:text-5xl font-display text-white tracking-[0.2em] uppercase chromatic-text">{profile?.display_name || profile?.username}
                            </h1>
                            <div className="flex gap-3">
                                {userData?.is_verified && (
                                    <div className="glass-card px-3 py-1 border-arc-neon/40 bg-arc-neon/10 text-arc-neon font-display text-[8px] tracking-[0.2em] uppercase shadow-aura flex items-center gap-2">
                                        <Shield className="w-3 h-3" />
                                        Verified Node
                                    </div>
                                )}
                                {userData?.role === 'admin' && (
                                    <div className="glass-card px-3 py-1 border-sony-violet/40 bg-sony-violet/10 text-sony-violet font-display text-[8px] tracking-[0.2em] uppercase flex items-center gap-2">
                                        <Award className="w-3 h-3 animate-pulse" />
                                        System Architect
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-[10px] font-display tracking-[0.4em] uppercase text-white/40">
                            <span className="text-white">@{profile?.username}</span>
                            <span className="opacity-20">|</span>
                            {userData?.college_name && (
                                <>
                                    <span>{userData.college_name}</span>
                                    <span className="opacity-20">|</span>
                                </>
                            )}
                            <span className="text-sony-indigo">{rank}</span>
                        </div>
                    </div>

                    <div className="text-center md:text-right flex-shrink-0 glass-card bg-black/40 p-6 border-white/10 group-hover:border-arc-neon/40 transition-colors">
                        <div className="text-4xl font-display text-arc-neon drop-shadow-glow">{formatXP(stats?.xp ?? 0)}</div>
                        <div className="text-[9px] font-display tracking-[0.5em] text-white/20 uppercase mt-2">TOTAL XP YIELD</div>
                    </div>
                </div>

                {/* Progress HUD */}
                <div className="mt-12 space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-4">
                            <div className="font-display text-xs text-arc-neon tracking-[0.2em]">SEC LEVEL {xpData.level}</div>
                            <div className="h-px w-8 bg-white/10" />
                            <div className="font-display text-[10px] text-white/20 tracking-[0.1em] uppercase">NEBULA ASCENSION</div>
                        </div>
                        <div className="font-display text-[10px] text-white/40 tracking-[0.1em]">
                            {xpData.currentXP} <span className="text-white/10">/</span> {xpData.requiredXP} <span className="ml-2">NODES</span>
                        </div>
                    </div>
                    <div className="h-1.5 bg-white/5 overflow-hidden rounded-full border border-white/10 p-[1px]">
                        <div className="h-full bg-arc-neon transition-all duration-1000 shadow-glow" style={{ width: `${xpData.percent}%` }} />
                    </div>
                </div>
            </div>

            {/* Performance Modules */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { icon: Swords, label: 'ENGAGEMENTS', value: stats?.total_battles ?? 0, color: 'text-white' },
                    { icon: Trophy, label: 'CONFIRMATIONS', value: stats?.battles_won ?? 0, color: 'text-sony-indigo' },
                    { icon: Zap, label: 'PRECISION RATE', value: `${winRate}%`, color: 'text-arc-neon' },
                    { icon: Flame, label: 'CONTINUITY', value: `${stats?.streak_days ?? 0}D`, color: 'text-sony-violet' },
                ].map((stat, i) => (
                    <div key={stat.label} className="glass-card p-6 text-center border-white/5 hover:bg-white/5 transition-all group">
                        <stat.icon className={cn("w-6 h-6 mx-auto mb-4 opacity-40 group-hover:opacity-100 transition-all group-hover:scale-110", stat.color)} />
                        <div className="text-3xl font-display text-white tracking-widest">{stat.value}</div>
                        <div className="text-[9px] font-display tracking-[0.4em] text-white/20 uppercase mt-3">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Battle Intelligence Log */}
            <div className="glass-card border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="font-display text-sm text-white/60 tracking-[0.4em] uppercase flex items-center gap-3">
                        <Activity className="w-4 h-4 text-arc-neon opacity-50" />
                        BATTLE LOG v2.0
                    </h2>
                    <span className="text-[8px] font-display text-white/20 tracking-widest uppercase">REAL TIME STREAM ACTIVE</span>
                </div>
                {recentBattles && recentBattles.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {recentBattles.map((battle: any) => (
                            <div key={battle.id} className="flex items-center gap-6 p-6 hover:bg-white/[0.02] transition-colors group">
                                <div className={cn(
                                    "w-12 h-12 rounded-sm border biometric-frame flex items-center justify-center text-lg",
                                    battle.outcome === 'victory' ? 'border-arc-neon/40 bg-arc-neon/5 text-arc-neon shadow-aura' :
                                        battle.outcome === 'defeat' ? 'border-sony-violet/40 bg-sony-violet/5 text-sony-violet' :
                                            'border-white/10 bg-white/5 text-white/40'
                                )}>
                                    {battle.outcome === 'victory' ? <Trophy className="w-5 h-5" /> :
                                        battle.outcome === 'defeat' ? <Shield className="w-5 h-5" /> :
                                            <Activity className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="text-sm font-display text-white tracking-widest uppercase group-hover:text-arc-neon transition-colors">
                                        {battle.outcome || 'ABANDONED'}
                                    </div>
                                    <div className="text-[10px] font-display text-white/20 tracking-[0.2em] uppercase">
                                        THREAT LEVEL: {battle.difficulty?.toUpperCase()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-display text-white tracking-widest group-hover:chromatic-text">+{battle.xp_earned}</div>
                                    <div className="text-[8px] font-display text-white/10 tracking-[0.2em] uppercase">NODES SYNCED</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center space-y-6">
                        <Cpu className="w-16 h-16 text-white/5 mx-auto animate-pulse" />
                        <p className="font-display text-[10px] text-white/20 tracking-[0.6em] uppercase">NO RECORDS FOUND. INITIATE COMBAT SEQUENCE.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center p-20 min-h-screen space-y-6">
                <Activity className="w-12 h-12 text-arc-neon animate-pulse" />
                <div className="text-arc-neon font-display text-[10px] tracking-[0.5em] uppercase animate-pulse">Syncing Identity...</div>
            </div>
        }>
            <ProfileContent />
        </Suspense>
    )
}
