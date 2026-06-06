'use client'

import { createClient } from '@/lib/supabase/client'
import { Trophy, Medal, Crown, Swords, Shield, Search, Flame, Zap, Target, Loader2, Award, User, Star, ChevronRight, Activity } from 'lucide-react'
import { getRankFromLevel, formatXP } from '@/lib/game-engine'
import { useState, useEffect, Suspense } from 'react'
import { cn } from '@/lib/game-engine'

type LeaderboardEntry = {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
    xp: number
    level: number
    battles_won: number
    rank_title: string
    college_name?: string
    is_verified?: boolean
    win_rate?: number
    total_xp?: number
    streak_days?: number
}

function LeaderboardContent() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        async function fetchLeaderboard() {
            const supabase = createClient()

            // Mock Data for Guest/Fallback
            const mockLeaderboard: LeaderboardEntry[] = Array.from({ length: 15 }).map((_, i) => ({
                id: `mock-${i}`,
                username: `operator_0${i + 1}`,
                display_name: `Operator ${i + 1}`,
                avatar_url: null,
                xp: 15000 - (i * 950),
                total_xp: 15000 - (i * 950),
                level: 20 - i,
                battles_won: 50 - i,
                rank_title: getRankFromLevel(20 - i),
                college_name: i % 2 === 0 ? 'Jayanagar Campus' : 'Global Campus',
                is_verified: i < 5,
                win_rate: 60 - i,
                streak_days: 10 - (i % 5)
            }))

            try {
                const { data: stats, error } = await supabase
                    .from('player_stats')
                    .select(`
                        user_id,
                        xp,
                        level,
                        battles_won,
                        total_battles,
                        streak_days,
                        profiles:user_id (username, display_name, avatar_url),
                        users:user_id (college_name, is_verified)
                    `)
                    .order('xp', { ascending: false })
                    .limit(50)

                if (error || !stats) {
                    setLeaderboard(mockLeaderboard)
                } else {
                    const formatted: LeaderboardEntry[] = stats.map((entry: any) => ({
                        id: entry.user_id,
                        username: entry.profiles?.username || 'Unknown',
                        display_name: entry.profiles?.display_name,
                        avatar_url: entry.profiles?.avatar_url,
                        xp: entry.xp,
                        total_xp: entry.xp,
                        level: entry.level,
                        battles_won: entry.battles_won,
                        rank_title: getRankFromLevel(entry.level),
                        college_name: entry.users?.college_name || 'Global Campus',
                        is_verified: entry.users?.is_verified,
                        win_rate: entry.total_battles > 0 ? Math.round((entry.battles_won / entry.total_battles) * 100) : 0,
                        streak_days: entry.streak_days
                    }))
                    setLeaderboard(formatted)
                }
            } catch (e) {
                setLeaderboard(mockLeaderboard)
            } finally {
                setLoading(false)
            }
        }

        fetchLeaderboard()
    }, [])

    const filteredLeaderboard = leaderboard.filter(player =>
        player.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (player.display_name && player.display_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (player.college_name && player.college_name.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 min-h-[50vh] space-y-6">
            <div className="relative">
                <div className="absolute inset-0 bg-arc-neon/20 blur-[40px] animate-pulse rounded-full" />
                <Zap className="w-16 h-16 text-arc-neon animate-pulse relative z-10" />
            </div>
            <div className="text-arc-neon font-display tracking-[0.4em] uppercase animate-pulse">Establishing Sync v4.2...</div>
            <div className="w-64 h-1 bg-white/5 overflow-hidden border border-white/10 rounded-full">
                <div className="h-full bg-arc-neon w-1/2 animate-loading-bar shadow-glow" />
            </div>
        </div>
    )

    const getRankStyle = (pos: number) => {
        if (pos === 1) return 'border-arc-neon bg-arc-neon/10 text-arc-neon shadow-aura'
        if (pos === 2) return 'border-white/20 bg-white/5 text-white shadow-glass'
        if (pos === 3) return 'border-sony-violet/30 bg-sony-violet/5 text-sony-violet'
        return 'border-white/5 bg-transparent text-white/40'
    }

    const rankTextColors: Record<string, string> = {
        Novice: 'text-white/40', Apprentice: 'text-sony-indigo',
        Warrior: 'text-sony-violet', Champion: 'text-arc-neon',
        Legend: 'text-arc-neon drop-shadow-glow', Mythic: 'text-arc-neon drop-shadow-glow animate-pulse',
    }

    return (
        <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-12 relative font-sans animate-motion-blur-in">
            {/* Header HUD */}
            <div className="text-center space-y-6 relative z-10 pt-4">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-arc-neon" />
                    <span className="font-display text-[10px] text-arc-neon tracking-[0.5em] uppercase opacity-70">Sector Rankings Real-Time</span>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-arc-neon" />
                </div>
                <h1 className="text-5xl md:text-8xl font-display tracking-[0.2em] chromatic-text uppercase select-none">HALL OF FAME
                </h1>
                <p className="text-[10px] md:text-xs text-white/40 font-display tracking-[0.5em] uppercase max-w-2xl mx-auto border-b border-white/10 pb-10">
                    Jayanagar Grid vs Global Network Standings
                </p>
            </div>

            {/* Search HUD */}
            <div className="relative max-w-2xl mx-auto z-10 group overflow-hidden">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-white/20 group-focus-within:text-arc-neon transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="INITIATE OPERATOR SCAN..."
                    className="w-full pl-16 pr-8 py-6 glass-card bg-black/40 border-white/10 focus:border-arc-neon/40 focus:bg-white/5 focus:outline-none transition-all font-display text-sm text-white placeholder-white/10 tracking-[0.3em] uppercase"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {/* Accent line */}
                <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-focus-within:via-arc-neon/40 transition-all" />
            </div>

            {/* Leaderboard Grid */}
            <div className="space-y-4 relative z-10 pb-20">
                {filteredLeaderboard.map((player, index) => {
                    const pos = index + 1
                    const isTop3 = pos <= 3

                    return (
                        <div
                            key={player.id}
                            className={cn(
                                "flex flex-col md:flex-row items-center gap-6 p-6 transition-all duration-300 border rounded-sm group relative overflow-hidden",
                                isTop3 ? "glass-card bg-black/40 border-white/20 shadow-aura" : "border-white/5 bg-transparent hover:border-white/10 hover:bg-white/[0.02]"
                            )}
                        >
                            {/* Visual Accents for Top Performers */}
                            {isTop3 && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-arc-neon/40" />
                            )}

                            {/* Position & Identity Section */}
                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className={cn(
                                    "w-16 h-16 flex items-center justify-center font-display tracking-widest text-xl flex-shrink-0 border-sm rounded-full biometric-frame",
                                    getRankStyle(pos)
                                )}>
                                    {pos < 10 ? `0${pos}` : pos}
                                </div>

                                <div className={cn(
                                    "w-20 h-20 biometric-frame p-1 group-hover:scale-110 transition-transform duration-500",
                                    isTop3 ? "border-arc-neon/30" : "border-white/10"
                                )}>
                                    <div className="w-full h-full overflow-hidden bg-sony-nebula-deep flex items-center justify-center relative">
                                        {player.avatar_url ? (
                                            <img src={player.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className={cn(
                                                "font-display text-4xl tracking-widest opacity-40 uppercase",
                                                isTop3 ? "text-arc-neon" : "text-white"
                                            )}>{(player.display_name || player.username).charAt(0)}
                                            </span>
                                        )}
                                        {/* Scanline overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 animate-pulse pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 min-w-0 w-full md:w-auto">
                                <div className="flex items-center flex-wrap gap-4 mb-3">
                                    <h3 className={cn(
                                        "font-display text-xl md:text-2xl tracking-[0.2em] uppercase truncate",
                                        isTop3 ? "text-white" : "text-white/60"
                                    )}>{player.display_name || player.username}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {player.is_verified && <Shield className="w-4 h-4 text-arc-neon" />}
                                        {pos === 1 && <Crown className="w-6 h-6 text-arc-neon animate-pulse drop-shadow-glow" />}
                                        {pos === 2 && <Medal className="w-5 h-5 text-sony-indigo" />}
                                        {pos === 3 && <Medal className="w-5 h-5 text-sony-violet" />}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-[10px] font-display tracking-[0.3em] uppercase text-white/30">
                                    <span className={cn(
                                        "font-bold",
                                        (rankTextColors as any)[player.rank_title] || 'text-white/40'
                                    )}>{player.rank_title}
                                    </span>
                                    <span className="opacity-20">|</span>
                                    <span className="text-white/50">SEC LEVEL {player.level}</span>
                                    {player.college_name && (
                                        <>
                                            <span className="opacity-20">|</span>
                                            <span className="text-white/50">{player.college_name}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Performance HUD Section */}
                            <div className="flex flex-row md:flex-col items-end gap-6 md:gap-2 w-full md:w-auto justify-between md:justify-center border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                                <div className="text-right">
                                    <div className={cn(
                                        "font-display text-2xl md:text-4xl tracking-widest",
                                        isTop3 ? "text-arc-neon drop-shadow-glow" : "text-white/80"
                                    )}>
                                        {formatXP(player.xp)}
                                        <span className="text-[10px] text-white/20 ml-3 tracking-[0.2em] font-display">XP NODES</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-[10px] font-display tracking-widest text-white/40">
                                        <Activity className="w-3.5 h-3.5" />
                                        <span>WIN RATE: {player.win_rate}%</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-display tracking-widest text-sony-violet">
                                        <Swords className="w-3.5 h-3.5" />
                                        <span>{player.battles_won} WINS</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}

                {filteredLeaderboard.length === 0 && (
                    <div className="p-20 text-center glass-card bg-black/20 border-white/10 space-y-8">
                        <Target className="w-16 h-16 text-white/10 mx-auto animate-pulse" />
                        <div className="text-white/20 font-display text-sm tracking-[0.5em] uppercase">
                            NO RECORDS IN CURRENT NEBULA
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function LeaderboardPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center p-20 min-h-screen space-y-6">
                <Loader2 className="w-12 h-12 text-arc-neon animate-spin" />
                <div className="text-arc-neon font-display text-[10px] tracking-[0.5em] uppercase animate-pulse">Syncing Sector...</div>
            </div>
        }>
            <LeaderboardContent />
        </Suspense>
    )
}
