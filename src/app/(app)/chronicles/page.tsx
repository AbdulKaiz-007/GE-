'use client'

import { ScrollText, Bell, Calendar, ExternalLink, Bot, Briefcase, GraduationCap, Flame, RotateCcw, Globe, Activity, Cpu, Sparkles, ChevronRight, TrendingUp, Search } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { fetchAllNews, NewsItem } from '@/lib/news-service'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/game-engine'

export default function ChroniclesPage() {
    const [news, setNews] = useState<NewsItem[]>([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState<string>('')
    const [activeFilter, setActiveFilter] = useState('All Scrolls')
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    useEffect(() => {
        const loadNews = async () => {
            try {
                setLoading(true)
                const freshNews = await fetchAllNews(activeFilter, debouncedQuery)
                setNews(freshNews)
                setLastUpdated(new Date().toLocaleString())
            } catch (error) {
                console.error("Failed to update news", error)
                toast.error("DATA STREAM INTERRUPTED")
            } finally {
                setLoading(false)
            }
        }

        loadNews()
    }, [activeFilter, debouncedQuery])

    const handleForceRefresh = async () => {
        setLoading(true)
        const freshNews = await fetchAllNews(activeFilter, debouncedQuery)
        setNews(freshNews)
        setLastUpdated(new Date().toLocaleString())
        setLoading(false)
        toast.success("SECTOR FORCE REFRESHED")
    }

    const filteredNews = news

    const filters = ['All Scrolls', 'Technology', 'Science & Health', 'Business & Finance', 'World & Society', 'Education & Campus', 'Industry & Jobs']

    const getIcon = (cat: string) => {
        switch (cat) {
            case 'Technology': return Bot;
            case 'Science & Health': return Flame;
            case 'Business & Finance': return Briefcase;
            case 'World & Society': return Globe;
            case 'Education & Campus': return GraduationCap;
            case 'Industry & Jobs': return TrendingUp;
            default: return ScrollText;
        }
    }

    const getColorClass = (cat: string) => {
        switch (cat) {
            case 'Technology': return 'text-arc-neon border-arc-neon/40 bg-arc-neon/5';
            case 'Science & Health': return 'text-sony-violet border-sony-violet/40 bg-sony-violet/5';
            case 'Business & Finance': return 'text-sony-indigo border-sony-indigo/40 bg-sony-indigo/5';
            case 'World & Society': return 'text-white/60 border-white/20 bg-white/5';
            case 'Education & Campus': return 'text-arc-neon border-arc-neon/40 bg-arc-neon/5';
            case 'Industry & Jobs': return 'text-sony-violet border-sony-violet/40 bg-sony-violet/5';
            default: return 'text-white/40 border-white/10 bg-white/5';
        }
    }

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-12 animate-motion-blur-in pb-32">
            {/* Header HUD */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/10">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 biometric-frame flex items-center justify-center relative group overflow-hidden">
                        <div className="absolute inset-0 bg-sony-indigo/10 group-hover:bg-sony-indigo/20 transition-colors" />
                        <ScrollText className="w-10 h-10 text-sony-indigo relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-sony-indigo/20 via-transparent to-transparent opacity-50" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-sony-indigo animate-pulse" />
                            <span className="font-display text-[10px] text-sony-indigo tracking-[0.4em] uppercase opacity-70">Intelligence Stream v10.0</span>
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl text-white tracking-[0.2em] uppercase chromatic-text">THE CHRONICLES</h1>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-arc-neon transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="SEARCH NEURAL RECORDS..."
                            className="w-full bg-black/40 border border-white/10 text-white font-display text-[9px] py-4 pl-12 pr-4 focus:border-arc-neon/50 transition-all rounded-sm tracking-widest placeholder:text-white/10 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleForceRefresh}
                            className="glass-card px-4 py-2 border-white/10 text-[9px] font-display tracking-[0.2em] uppercase text-white/40 hover:text-arc-neon hover:border-arc-neon/40 transition-all flex items-center gap-2"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> RE-SYNC
                        </button>
                        <div className="text-[10px] text-white/20 font-display tracking-widest uppercase">
                            SYNC: {lastUpdated || 'SYNCING...'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Chronicle HUD */}
            {news.length > 0 && !loading && (
                <Link href={news[0].url} target="_blank">
                    <div className="glass-card p-0 overflow-hidden relative group cursor-pointer border-white/10 hover:border-arc-neon/40 transition-all duration-700 min-h-[500px] flex">
                        {news[0].thumbnail && (
                            <div className="absolute inset-0 z-0">
                                <img
                                    src={news[0].thumbnail}
                                    alt="Featured"
                                    className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-700 scale-105 group-hover:scale-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/60 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-transparent to-transparent" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-sony-nebula-deep mix-blend-multiply opacity-40"></div>

                        <div className="relative z-10 p-10 md:p-14 flex flex-col justify-center w-full">
                            <div className="flex items-center gap-4 text-[10px] font-display tracking-[0.5em] uppercase text-arc-neon mb-6">
                                <Activity className="w-4 h-4 animate-pulse" /> ALPHA TRANSMISSION DETECTED
                            </div>
                            <h2 className="text-4xl md:text-6xl font-display tracking-[0.1em] text-white leading-tight mb-8 group-hover:chromatic-text transition-all uppercase max-w-3xl">
                                {news[0].title}
                            </h2>
                            <p className="text-white/60 font-sans text-lg mb-10 max-w-2xl line-clamp-2 font-light tracking-wide leading-relaxed">
                                {news[0].summary}
                            </p>
                            <div className="flex items-center gap-6 text-[11px] font-display tracking-[0.2em] text-white/40 uppercase">
                                <span className="text-white/60 px-2 py-1 bg-white/5 border border-white/10">{news[0].source.toUpperCase()}</span>
                                <span className="opacity-20">|</span>
                                <span>{news[0].date}</span>
                                <span className="opacity-20">|</span>
                                <div className="flex items-center gap-2 text-arc-neon">
                                    <Sparkles className="w-3.5 h-3.5" /> TRENDING PRIORITY
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            )}

            {/* Filter HUD */}
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-none relative z-10">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={cn(
                            "px-6 py-3 glass-card border text-[10px] font-display tracking-[0.3em] uppercase transition-all whitespace-nowrap",
                            activeFilter === filter
                                ? "border-arc-neon bg-arc-neon/20 text-arc-neon shadow-aura"
                                : "border-white/5 bg-transparent text-white/20 hover:border-white/20 hover:text-white/60"
                        )}
                    >
                        {filter.replace('& ', '')}
                    </button>
                ))}
            </div>

            {/* News Data Stream */}
            <div className="grid gap-6 relative z-10">
                {loading ? (
                    <div className="space-y-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-40 glass-card bg-white/[0.02] border-white/5 animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    filteredNews.slice(1).map((item) => {
                        const Icon = getIcon(item.category)
                        return (
                            <Link key={item.id} href={item.url} target="_blank" className="block group">
                                <div className="glass-card p-0 group border-white/5 hover:border-white/20 hover:bg-white/[0.02] transition-all duration-500 relative overflow-hidden flex flex-col md:flex-row min-h-[220px]">
                                    {item.thumbnail && (
                                        <div className="md:w-64 h-48 md:h-auto relative overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.thumbnail}
                                                alt="Article"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/40" />
                                        </div>
                                    )}
                                    <div className="flex-1 p-8 flex flex-col justify-center">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={cn("w-10 h-10 biometric-frame flex items-center justify-center", getColorClass(item.category))}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-display text-white/60 uppercase tracking-widest">{item.source.toUpperCase()}</span>
                                                <span className="text-[8px] font-display text-white/20 uppercase tracking-[0.3em]">{item.date}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-display text-white/90 tracking-widest group-hover:text-white transition-colors leading-snug uppercase mb-4 line-clamp-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm font-sans text-white/40 leading-relaxed line-clamp-2 tracking-wide font-light max-w-2xl">
                                            {item.summary}
                                        </p>
                                    </div>

                                    {/* Action HUD */}
                                    <div className="hidden md:flex items-center justify-center px-10 border-l border-white/5">
                                        <div className="w-12 h-12 glass-card border-white/10 flex items-center justify-center group-hover:border-arc-neon/40 group-hover:bg-arc-neon/10 transition-all">
                                            <ExternalLink className="w-5 h-5 text-white/20 group-hover:text-arc-neon transition-colors" />
                                        </div>
                                    </div>

                                    {/* Decorative scanline */}
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-arc-neon/40 transition-all" />
                                </div>
                            </Link>
                        )
                    })
                )}

                {!loading && filteredNews.length === 0 && (
                    <div className="text-center py-24 glass-card bg-black/20 border-white/5 space-y-6">
                        <Bot className="w-16 h-16 text-white/5 mx-auto animate-pulse" />
                        <p className="font-display text-[10px] text-white/20 tracking-[0.6em] uppercase">
                            NO TRANSMISSIONS IN SELECTED SECTOR
                        </p>
                    </div>
                )}
            </div>

            {/* Neural Intelligence Footer */}
            <div className="text-center mt-20 pt-12 border-t border-white/5 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-32 bg-gradient-to-r from-transparent via-sony-indigo/40 to-transparent" />
                <div className="flex items-center justify-center gap-4 text-[9px] font-display text-white/10 tracking-[0.6em] uppercase">
                    <Activity className="w-3.5 h-3.5" />
                    Aggregated via Gamma Edison Neural Net
                </div>
            </div>
        </div>
    )
}
