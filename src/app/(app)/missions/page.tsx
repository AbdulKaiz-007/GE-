'use client'

import { Target, Briefcase, Clock, ExternalLink, Search, Sparkles, Star, Swords, BookmarkCheck, ChevronRight, Activity, ShieldAlert, Cpu, Radar, Layers } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { fetchAdzunaJobs, Bounty } from '@/lib/adzuna-service'
import QuestFinder from '@/components/QuestFinder'
import InterviewPrepModal from '@/components/InterviewPrepModal'
import MockInterviewBattle from '@/components/MockInterviewBattle'
import { useBountyStore } from '@/store/bounty-store'
import { cn } from '@/lib/game-engine'

export default function BountyBoardsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [jobs, setJobs] = useState<Bounty[]>([])
    const [loading, setLoading] = useState(true)
    const [showQuestFinder, setShowQuestFinder] = useState(false)
    const [activeInterviewPrep, setActiveInterviewPrep] = useState<{ domain: string } | null>(null)
    const [activeMockBattle, setActiveMockBattle] = useState<{ domain: string; company: string } | null>(null)
    const [showSavedOnly, setShowSavedOnly] = useState(false)
    const [filters, setFilters] = useState({ type: '', role: '', level: '', location: '' })

    const { savedBounties, saveBounty, removeBounty, isSaved } = useBountyStore()

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true)
            const combinedQuery = [
                searchQuery,
                filters.role,
                filters.type,
                filters.level
            ].filter(Boolean).join(' ')

            const results = await fetchAdzunaJobs(combinedQuery, filters.location)
            setJobs(results)
            setLoading(false)
        }

        const timeoutId = setTimeout(fetchJobs, 500)
        return () => clearTimeout(timeoutId)
    }, [searchQuery, filters])

    const displayedJobs = showSavedOnly
        ? jobs.filter(j => isSaved(j.id))
        : jobs

    const getJobDomain = (job: Bounty) => {
        const tags = job.tags.map(t => t.toLowerCase())
        if (tags.some(t => t.includes('frontend') || t.includes('react') || t.includes('web') || t.includes('design') || t.includes('ui'))) return 'Frontend'
        if (tags.some(t => t.includes('backend') || t.includes('node') || t.includes('python') || t.includes('java') || t.includes('database'))) return 'Backend'
        if (tags.some(t => t.includes('ai') || t.includes('ml') || t.includes('data') || t.includes('llm'))) return 'AI/ML'
        return 'General'
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-12 animate-motion-blur-in pb-32">
            {/* Header HUD */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/10">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 biometric-frame flex items-center justify-center relative group overflow-hidden">
                        <div className="absolute inset-0 bg-arc-neon/10 group-hover:bg-arc-neon/20 transition-colors" />
                        <Target className="w-10 h-10 text-arc-neon relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-arc-neon/20 via-transparent to-transparent opacity-50" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-arc-neon animate-pulse" />
                            <span className="font-display text-[10px] text-arc-neon tracking-[0.4em] uppercase opacity-70">Procurement Terminal v8.0</span>
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl text-white tracking-[0.2em] uppercase chromatic-text">BOUNTY BOARDS
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 relative z-10">
                    <button
                        onClick={() => setShowSavedOnly(!showSavedOnly)}
                        className={cn(
                            "glass-card px-6 py-4 font-display text-[10px] tracking-[0.4em] uppercase transition-all flex items-center gap-3 border",
                            showSavedOnly ? "border-arc-neon bg-arc-neon/20 text-arc-neon shadow-aura" : "border-white/10 text-white/40 hover:border-white/30 hover:bg-white/5"
                        )}
                    >
                        <BookmarkCheck className="w-4 h-4" />
                        {showSavedOnly ? "ALL PROTOCOLS" : "SAVED MISSIVES"}
                    </button>

                    <button
                        onClick={() => setShowQuestFinder(true)}
                        className="btn-hardware !px-8 !py-4"
                    >
                        <span className="relative z-10 flex items-center gap-3 font-display text-[10px] tracking-[0.4em] uppercase">
                            <Radar className="w-4 h-4 animate-pulse" /> INITIATE SCAN
                        </span>
                    </button>
                </div>
            </div>

            {/* Search HUD */}
            <div className="relative max-w-3xl mx-auto z-10 group overflow-hidden">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-white/20 group-focus-within:text-arc-neon transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="LOCATE OPPORTUNITIES BY DOMAIN OR INTEL..."
                    className="w-full pl-16 pr-8 py-6 glass-card bg-black/40 border-white/10 focus:border-arc-neon/40 focus:bg-white/5 focus:outline-none transition-all font-display text-sm text-white placeholder-white/10 tracking-[0.3em] uppercase"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Content Layers */}
            <div className="space-y-6 relative z-10">
                {loading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-40 glass-card bg-white/[0.02] border-white/5 animate-pulse rounded-sm"></div>
                        ))}
                    </div>
                ) : displayedJobs.length > 0 ? (
                    displayedJobs.map((job) => (
                        <div key={job.id} className="glass-card p-8 group border-white/5 hover:border-white/20 hover:bg-white/[0.02] transition-all flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none">
                                <Briefcase className="w-24 h-24" />
                            </div>

                            <div className="w-16 h-16 biometric-frame aspect-square flex-shrink-0 flex items-center justify-center bg-sony-nebula-deep relative">
                                <Briefcase className="w-8 h-8 text-white/30 group-hover:text-arc-neon transition-colors" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent" />
                            </div>

                            <div className="flex-1 min-w-0 z-10">
                                <div className="flex items-center gap-6 mb-3 min-w-0">
                                    <button
                                        onClick={() => isSaved(job.id) ? removeBounty(job.id) : saveBounty({ ...job, savedAt: new Date().toISOString() })}
                                        className="flex-shrink-0 transition-transform active:scale-90"
                                    >
                                        <Star className={cn("w-6 h-6", isSaved(job.id) ? "fill-arc-neon text-arc-neon drop-shadow-glow" : "text-white/10 hover:text-white/30")} />
                                    </button>

                                    <div className="flex items-center gap-4 flex-wrap min-w-0">
                                        <h3 className="font-display text-2xl text-white tracking-widest truncate">{job.title.toUpperCase()}</h3>
                                        <div className="px-3 py-1 bg-black/40 border border-white/10 rounded-full font-display text-[9px] text-white/40 tracking-[0.2em] uppercase">
                                            {job.type}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-[10px] font-display tracking-[0.3em] uppercase text-white/30 mb-4">
                                    <span className="text-arc-neon/60">{job.company.toUpperCase()}</span>
                                    <span className="opacity-20">|</span>
                                    <span>{job.location.toUpperCase()}</span>
                                    <span className="opacity-20">|</span>
                                    <span className="text-sony-indigo">{job.source.toLowerCase()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] font-display tracking-widest text-white/20 uppercase">
                                    <Clock className="w-3 h-3" />
                                    <span>LOGGED: {job.posted.toUpperCase()}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 w-full md:w-auto z-10">
                                <Link href={job.url} target="_blank" className="w-full">
                                    <button className="btn-hardware !py-4 w-full">
                                        <span className="relative z-10 flex items-center justify-center gap-3 font-display text-[10px] tracking-[0.4em] uppercase">
                                            ACCEPT MISSION <ExternalLink className="w-4 h-4" />
                                        </span>
                                    </button>
                                </Link>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setActiveInterviewPrep({ domain: getJobDomain(job) })}
                                        className="glass-card px-3 py-3 border-white/5 text-[9px] font-display tracking-[0.2em] uppercase text-white/40 hover:text-arc-neon hover:border-arc-neon/40 hover:bg-arc-neon/5 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Cpu className="w-3.5 h-3.5" /> INTEL
                                    </button>

                                    <button
                                        onClick={() => setActiveMockBattle({ domain: getJobDomain(job), company: job.company })}
                                        className="glass-card px-3 py-3 border-white/5 text-[9px] font-display tracking-[0.2em] uppercase text-white/40 hover:text-sony-violet hover:border-sony-violet/40 hover:bg-sony-violet/5 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Swords className="w-3.5 h-3.5" /> BATTLE
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-24 glass-card bg-black/20 border-white/5 space-y-6">
                        <Target className="w-20 h-20 text-white/5 mx-auto animate-pulse" />
                        <p className="font-display text-xs text-white/20 tracking-[0.6em] uppercase">
                            NO BOUNTIES MATCH CURRENT COORDINATES
                        </p>
                    </div>
                )}
            </div>

            {/* Footer Intel */}
            <div className="text-center mt-16 pt-12 border-t border-white/5 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-32 bg-gradient-to-r from-transparent via-arc-neon/40 to-transparent" />
                <p className="font-display text-[9px] text-white/10 tracking-[0.8em] uppercase animate-pulse">
                    New bounties materialize as data streams evolve...
                </p>
            </div>

            {/* Modals Overlay layer */}
            {showQuestFinder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-motion-blur-in">
                    <div className="max-w-2xl w-full">
                        <QuestFinder
                            onFilter={(f) => setFilters(f)}
                            onClose={() => setShowQuestFinder(false)}
                        />
                    </div>
                </div>
            )}

            {activeInterviewPrep && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-motion-blur-in">
                    <div className="max-w-4xl w-full">
                        <InterviewPrepModal
                            domain={activeInterviewPrep.domain}
                            onClose={() => setActiveInterviewPrep(null)}
                        />
                    </div>
                </div>
            )}

            {activeMockBattle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-motion-blur-in">
                    <div className="max-w-4xl w-full">
                        <MockInterviewBattle
                            domain={activeMockBattle.domain}
                            company={activeMockBattle.company}
                            onClose={() => setActiveMockBattle(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

