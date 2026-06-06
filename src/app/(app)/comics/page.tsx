'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import {
    Sparkles, Loader2, BookOpen, Swords,
    Palette, RefreshCw, ImageOff, Activity, Cpu, Layers, Zap, ChevronRight, Layout,
    Upload, FileText, CheckCircle2, AlertCircle, Trophy, Search, Wand2
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { cn } from '@/lib/game-engine'

// ─── Types ────────────────────────────────────────────────────
type ComicStyle = 'american' | 'manga' | 'webtoon' | 'franco' | 'dc'
type Difficulty = 'beginner' | 'intermediate' | 'advanced'

interface ComicPanel {
    panel_order: number
    image_url: string
    narration: string
    dialogue: string
    concept_tag: string
}

const COMIC_STYLES: { id: ComicStyle; label: string; emoji: string; desc: string }[] = [
    { id: 'american', label: 'American', emoji: '🦸', desc: 'Bold colors, dynamic poses' },
    { id: 'manga', label: 'Manga', emoji: '⚡', desc: 'Japanese B&W style, speed lines' },
    { id: 'webtoon', label: 'Webtoon', emoji: '🌸', desc: 'Korean digital, pastel & cute' },
    { id: 'franco', label: 'Franco-Belgian', emoji: '🎨', desc: 'Ligne claire, flat colors' },
    { id: 'dc', label: 'DC Comics', emoji: '🦇', desc: 'Dark, gritty superhero art' },
]

const DIFFICULTIES: { id: Difficulty; label: string; color: string }[] = [
    { id: 'beginner', label: 'BEGINNER', color: 'border-arc-neon/40 text-arc-neon bg-arc-neon/10' },
    { id: 'intermediate', label: 'INTERMEDIATE', color: 'border-sony-indigo/40 text-sony-indigo bg-sony-indigo/10' },
    { id: 'advanced', label: 'ADVANCED', color: 'border-sony-violet/40 text-sony-violet bg-sony-violet/10' },
]

const SUBJECT_TAGS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'History', 'Computer Science', 'Economics', 'Literature', 'Geography', 'Philosophy']

const SAMPLE_PROMPTS = [
    "Newton's Laws of Motion",
    "Photosynthesis & the Carbon Cycle",
    "World War II causes and effects",
    "How Computers Work",
    "DNA & Genetics",
]

// ─── Gamma Engine: Visual Theme Library ───────────────────────
// Endless theme presets — users can also type any custom theme.
const VISUAL_THEMES: { category: string; emoji: string; themes: string[] }[] = [
    {
        category: 'SCI-FI',
        emoji: '🚀',
        themes: [
            '2050 Cyberpunk', 'Space Opera', 'Hard Sci-Fi', 'Solarpunk', 'Post-Apocalyptic',
            'Biopunk', 'Dieselpunk', 'Quantum Noir', 'Alien Civilization', 'Generation Ship',
            'Nanotech Future', 'Virtual Reality Dystopia', 'Terraforming Mars', 'Time Travel Bureau',
            'Megacity Sprawl', 'AI Uprising', 'Zero-Gravity Lab', 'Deep Space Mining Colony',
        ]
    },
    {
        category: 'FANTASY',
        emoji: '🐉',
        themes: [
            'Dark Fantasy', 'High Fantasy', 'Mythic Greek', 'Norse Saga', 'Arabian Nights',
            'Celtic Folklore', 'Jungle Ruins & Lost Temples', 'Underwater Kingdom', 'Sky Citadels',
            'Necromancer\'s Academy', 'Fae Realm', 'Dragon Riders', 'Alchemist\'s Guild',
            'Shadow Empress Court', 'Elemental Planes', 'Goblin Market', 'Crystal Caverns',
        ]
    },
    {
        category: 'THRILLER & NOIR',
        emoji: '🕵️',
        themes: [
            '1920s Noir', 'Corporate Thriller', 'Cold War Spy', 'Heist Crew', 'Underground Resistance',
            'Paranormal Investigation', 'Assassin\'s Guild', 'Black Market Network', 'Witness Protection',
            'Political Conspiracy', 'Deep Web Hacker', 'Nuclear Countdown', 'Sleeper Agent',
            'Crime Lab Forensics', 'Bounty Hunter Circuit', 'Mafia Inner Circle',
        ]
    },
    {
        category: 'HISTORICAL',
        emoji: '🏛️',
        themes: [
            'Ancient Rome', 'Feudal Japan', 'Wild West', 'WW2 Resistance', 'Renaissance Court',
            'Age of Pirates', 'Industrial Revolution', 'Egyptian Pharaohs', 'Viking Expeditions',
            'Byzantine Empire', 'Silk Road Merchants', 'Aztec Empire', 'French Revolution Streets',
            'Gold Rush California', 'Ottoman Palace', 'Ming Dynasty Scholar', 'Medieval Siege',
        ]
    },
    {
        category: 'SURREAL & WEIRD',
        emoji: '🌀',
        themes: [
            'Dreamscape', 'Cosmic Horror', 'Retro-Futurism', 'Neon Mythology', 'Glitch Art',
            'Vaporwave', 'Lovecraftian Ocean', 'Salvador Dalí Surrealism', 'Infinite Library',
            'Clockwork Dimension', 'Fractal Universe', 'Living City Organism',
            'Mirror World', 'Anti-Gravity Archipelago', 'Sentient Forest', 'Recursive Simulation',
        ]
    },
    {
        category: 'CONTEMPORARY',
        emoji: '🏙️',
        themes: [
            'Silicon Valley Startup', 'Street Art Documentary', 'Sports Drama', 'Medical Drama',
            'Courtroom Thriller', 'Wall Street Trading Floor', 'Journalism Expose', 'Antarctic Research Station',
            'Olympics Underdog', 'Culinary Battle', 'Music Industry Rise', 'Architecture Studio',
            'Fashion Week Backstage', 'Field Hospital', 'Documentary Filmmaker', 'Protest Movement',
        ]
    },
]

function proxyImageUrl(url: string): string {
    return url;
}

const LOADING_STEPS = [
    { label: 'ANALYZING TOPIC VECTORS...', delay: 0 },
    { label: 'SYNTHESIZING NARRATIVE ARC...', delay: 5000 },
    { label: 'ENCODING 12 PANEL STRUCTURE...', delay: 12000 },
    { label: 'GENERATING HIGH FIDELITY ART...', delay: 20000 },
    { label: 'RENDERING SPATIAL ILLUSTRATIONS...', delay: 50000 },
    { label: 'CALIBRATING BOSS FIGHT LOGIC...', delay: 80000 },
    { label: 'FINALIZING CREATIVE SYNC...', delay: 100000 },
]

// ─── Single Comic Panel ───────────────────────────────────────
function ComicPanelCard({ panel, index, style }: {
    panel: ComicPanel; index: number; style: ComicStyle
}) {
    const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
    const isManga = style === 'manga'

    return (
        <div
            className={cn(
                "relative flex flex-col overflow-hidden rounded border-2 group transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl",
                isManga
                    ? "border-white/20 bg-white grayscale hover:grayscale-0"
                    : "border-white/10 bg-black/60 shadow-xl shadow-black/60 hover:border-arc-neon/30"
            )}
            style={{ animationDelay: `${index * 0.07}s` }}
        >
            {/* Panel number tag */}
            <div className="absolute top-2 left-2 z-30 bg-black/80 border border-white/20 px-2 py-0.5 text-[9px] font-display text-white tracking-widest uppercase backdrop-blur-sm">
                {panel.panel_order.toString().padStart(2, '0')}
            </div>
            {/* Concept tag */}
            {panel.concept_tag && (
                <div className="absolute top-2 right-2 z-30 bg-arc-neon/10 border border-arc-neon/30 px-2 py-0.5 text-[8px] font-display text-arc-neon tracking-widest uppercase backdrop-blur-sm">
                    {panel.concept_tag.toUpperCase()}
                </div>
            )}

            {/* ── Main image area (tall portrait like a real comic panel) ── */}
            <div className="relative w-full" style={{ aspectRatio: '3/4' }}>
                {/* Loading skeleton */}
                {imgStatus === 'loading' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 animate-pulse">
                        <Activity className="w-6 h-6 text-arc-neon/40 animate-spin" />
                        <span className="font-display text-[8px] uppercase tracking-[0.4em] text-arc-neon/40">RENDERING...</span>
                    </div>
                )}
                {/* Error state */}
                {imgStatus === 'error' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40">
                        <ImageOff className="w-8 h-8 text-white/20" />
                        <span className="font-display text-[8px] uppercase tracking-[0.3em] text-white/20">IMG ERR</span>
                    </div>
                )}
                {/* The actual comic panel image */}
                <img
                    src={panel.image_url}
                    alt={panel.narration || `Panel ${panel.panel_order}`}
                    onLoad={() => setImgStatus('loaded')}
                    onError={() => setImgStatus('error')}
                    className={cn(
                        "w-full h-full object-cover transition-all duration-700",
                        imgStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
                    )}
                />
                {/* Scanline overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.03] to-black/40 pointer-events-none" />

                {/* Speech bubble overlaid on image bottom */}
                {panel.dialogue && (
                    <div className="absolute bottom-3 left-3 right-3 z-20 bg-white text-black rounded-sm shadow-lg px-3 py-2 border border-black/10">
                        {/* bubble tail */}
                        <div className="absolute -top-2 left-5 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-white" />
                        <p className="font-bold text-[11px] leading-snug text-black line-clamp-3" style={{ fontFamily: 'Georgia, serif' }}>
                            {panel.dialogue.replace(/^["']|["']$/g, '')}
                        </p>
                    </div>
                )}
            </div>

            {/* Narration caption below image */}
            {panel.narration && (
                <div className={cn(
                    "px-3 py-2 border-t text-[10px] uppercase tracking-[0.15em] leading-relaxed font-display",
                    isManga
                        ? "bg-white text-black border-black/10"
                        : "bg-black/80 text-white/60 border-white/5 group-hover:text-white/90 transition-colors"
                )}>
                    {panel.narration}
                </div>
            )}
        </div>
    )
}


const COMIC_VOLUMES = [
    { id: 6, label: 'MICRO', desc: '1 PAGE', icon: Zap },
    { id: 12, label: 'STANDARD', desc: '2 PAGES', icon: BookOpen },
    { id: 30, label: 'EPIC', desc: '5 PAGES', icon: Sparkles },
    { id: 42, label: 'LEGEND', desc: '7 PAGES BESTSELLER', icon: Trophy }
]

export default function ComicsPage() {
    const router = useRouter()
    const [topic, setTopic] = useState('')
    const [style, setStyle] = useState<string>('american')
    const [difficulty, setDifficulty] = useState<string>('beginner')
    const [subject, setSubject] = useState('')
    const [generating, setGenerating] = useState(false)
    const [loadingStep, setLoadingStep] = useState(0)

    const [panels, setPanels] = useState<ComicPanel[]>([])
    const [lessonId, setLessonId] = useState<string | null>(null)
    const [generatedTopic, setGeneratedTopic] = useState('')
    const [isOffline, setIsOffline] = useState(false)

    // UI Cleanup & Volume States
    const [activeTab, setActiveTab] = useState<'manual' | 'uplink'>('manual')
    const [extractedContext, setExtractedContext] = useState('')
    const [isExtracting, setIsExtracting] = useState(false)
    const [uplinkStatus, setUplinkStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [customStyle, setCustomStyle] = useState('')
    const [visualTheme, setVisualTheme] = useState('')
    const [themeSearch, setThemeSearch] = useState('')
    const [comicVolume, setComicVolume] = useState(12)

    const stepsRef = useRef<NodeJS.Timeout[]>([])
    const panelsRef = useRef<HTMLDivElement>(null)

    const clearStepTimers = useCallback(() => {
        stepsRef.current.forEach(clearTimeout)
        stepsRef.current = []
    }, [])

    const startLoadingSteps = useCallback(() => {
        setLoadingStep(0)
        LOADING_STEPS.forEach((step, i) => {
            if (i === 0) return
            const t = setTimeout(() => setLoadingStep(i), step.delay)
            stepsRef.current.push(t)
        })
    }, [])

    const fetchPanelsFromDB = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/panels?lesson_id=${id}`)
            if (!res.ok) return
            const data = await res.json()
            if (data.panels?.length) setPanels(data.panels)
        } catch (e) {
            console.error('Panel fetch error', e)
        }
    }, [])

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        setIsExtracting(true)
        setUplinkStatus('idle')
        const loadingToast = toast.loading('UPLINKING KNOWLEDGE DATA...')

        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/extract', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'UPLINK_FAILURE')

            setExtractedContext(data.text)
            setUplinkStatus('success')
            toast.success('NEURAL EXTRACTION COMPLETE', { id: loadingToast })
        } catch (err: any) {
            setUplinkStatus('error')
            toast.error(err.message || 'EXTRACTION_ERROR', { id: loadingToast })
        } finally {
            setIsExtracting(false)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg'],
            'text/plain': ['.txt'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
            'application/vnd.ms-powerpoint': ['.ppt']
        },
        multiple: false,
        disabled: isExtracting || generating
    })

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        const t = (activeTab === 'manual' ? topic : extractedContext).trim()
        if (!t) {
            toast.error(activeTab === 'manual' ? 'PLEASE_ENTER_TOPIC_SEED' : 'PLEASE_UPLOAD_KNOWLEDGE_DATA')
            return
        }

        setGenerating(true)
        setPanels([])
        setLessonId(null)
        setGeneratedTopic('')
        setIsOffline(false)
        clearStepTimers()
        startLoadingSteps()

        try {
            const res = await fetch('/api/lessons/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: t,
                    difficulty,
                    subject_tag: subject,
                    style: (customStyle.trim() || style) as ComicStyle,
                    panelCount: comicVolume,
                    visualTheme: visualTheme.trim(),
                }),
            })

            const contentType = res.headers.get('content-type') || ''
            if (!contentType.includes('application/json')) {
                throw new Error(`API_OFFLINE [${res.status}]`)
            }

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'GENERATION_FAILURE')

            setGeneratedTopic(data.topic || (activeTab === 'manual' ? t : 'Extracted Content'))
            setIsOffline(!!data.offline)

            if (data.panels?.length) {
                setPanels(data.panels)
            } else if (data.lesson_id) {
                await fetchPanelsFromDB(data.lesson_id)
            }

            // Always navigate to the immersive comic reader
            const comicId = data.lesson_id || `temp-${Date.now()}`
            const topicLabel = data.topic || (activeTab === 'manual' ? t : 'Extracted Content')
            setGeneratedTopic(topicLabel)
            setIsOffline(!!data.offline)

            if (data.lesson_id) {
                setLessonId(data.lesson_id)
            }

            // Store panels in sessionStorage so the reader can load them
            // (works even when Supabase table isn't created yet)
            if (data.panels?.length) {
                sessionStorage.setItem(`comic-${comicId}`, JSON.stringify({
                    panels: data.panels,
                    topic: topicLabel,
                    style: customStyle.trim() || style,
                }))
            }

            const params = new URLSearchParams({
                topic: topicLabel,
                style: (customStyle.trim() || style),
            })
            toast.success('COMIC BOOK READY!')
            router.push(`/comic-book/${comicId}?${params.toString()}`)
            return

        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'FAILED_TO_INITIATE_CORE')
        } finally {
            clearStepTimers()
            setGenerating(false)
        }
    }

    const handleReset = () => {
        setTopic('')
        setExtractedContext('')
        setUplinkStatus('idle')
        setPanels([])
        setLessonId(null)
        setGeneratedTopic('')
        setIsOffline(false)
        setVisualTheme('')
        setThemeSearch('')
    }

    const hasPanels = panels.length > 0

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 animate-motion-blur-in pb-32">

            {/* Header HUD */}
            <div className="text-center space-y-4 border-b border-white/10 pb-12">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <Layers className="w-4 h-4 text-arc-neon opacity-50 animate-pulse" />
                    <span className="font-display text-[10px] text-arc-neon tracking-[0.6em] uppercase opacity-70">Creative Engine v10.5</span>
                </div>
                <h1 className="font-display text-4xl md:text-6xl text-white tracking-[0.3em] uppercase chromatic-text drop-shadow-glow">COMIC FACTORY
                </h1>
                <p className="font-display text-[10px] text-white/30 tracking-[0.4em] uppercase max-w-xl mx-auto leading-relaxed">
                    AI DRIVEN NARRATIVE SYNTHESIS. TRANSFORMING TEXT VECTORS INTO HIGH FIDELITY SPATIAL ILLUSTRATIONS.
                </p>
            </div>

            {/* Controls Console */}
            <div className="glass-card bg-black/40 border-white/10 p-6 md:p-10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-arc-neon/5 via-transparent to-sony-violet/5 opacity-50" />

                <form onSubmit={handleGenerate} className="space-y-8 relative z-10">

                    {/* Tab Switcher */}
                    <div className="flex gap-1 p-1 glass-card bg-white/5 border-white/10 max-w-sm mx-auto mb-8">
                        <button
                            type="button"
                            onClick={() => setActiveTab('manual')}
                            className={cn(
                                "flex-1 px-4 py-2 font-display text-[10px] tracking-widest uppercase transition-all duration-300",
                                activeTab === 'manual' ? "bg-arc-neon text-black shadow-aura" : "text-white/40 hover:text-white"
                            )}
                        >
                            MANUAL SEED
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('uplink')}
                            className={cn(
                                "flex-1 px-4 py-2 font-display text-[10px] tracking-widest uppercase transition-all duration-300",
                                activeTab === 'uplink' ? "bg-arc-neon text-black shadow-aura" : "text-white/40 hover:text-white"
                            )}
                        >
                            KNOWLEDGE UPLINK
                        </button>
                    </div>

                    {/* Input HUDs */}
                    {activeTab === 'manual' ? (
                        <div className="space-y-4 animate-slide-up">
                            <label className="font-display text-[10px] text-white/40 tracking-[0.4em] uppercase flex items-center gap-3">
                                <BookOpen className="w-4 h-4 text-arc-neon" /> NARRATIVE SEED INPUT
                            </label>
                            <textarea
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                placeholder="INITIALIZE TOPIC DATA (e.g. QUANTUM MECHANICS FUNDAMENTALS)..."
                                rows={3}
                                className="w-full glass-card bg-black/60 border-white/10 p-6 text-white font-display text-sm tracking-widest uppercase focus:border-arc-neon/40 focus:ring-1 focus:ring-arc-neon/20 transition-all outline-none resize-none placeholder:text-white/5"
                                required={activeTab === 'manual'}
                            />
                            <div className="flex flex-wrap gap-2 pt-2">
                                {SAMPLE_PROMPTS.map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setTopic(p)}
                                        className="font-display text-[8px] tracking-widest uppercase text-white/40 border border-white/5 px-3 py-1.5 hover:border-arc-neon hover:text-arc-neon transition-all hover:bg-arc-neon/5"
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-slide-up">
                            {uplinkStatus === 'success' ? (
                                <div className="glass-card border-green-500/30 bg-green-500/5 p-8 text-center space-y-4 group/linked">
                                    <div className="flex justify-center">
                                        <div className="w-16 h-16 rounded-full border border-green-500/40 flex items-center justify-center text-green-500 shadow-aura-green animate-pulsate">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="font-display text-sm tracking-[0.3em] text-green-500 uppercase">NEURAL LINK ESTABLISHED</div>
                                        <div className="font-display text-[9px] text-white/40 tracking-widest uppercase">CONTEXT DATA INGESTED SUCCESSFULLY</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setUplinkStatus('idle')}
                                        className="font-display text-[9px] text-white/20 hover:text-white tracking-[0.4em] uppercase transition-all pt-2"
                                    >
                                        [ RESET LINK AND RESCAN ]
                                    </button>
                                </div>
                            ) : (
                                <div
                                    {...getRootProps()}
                                    className={cn(
                                        "glass-card border-dashed border-2 py-10 md:py-16 px-8 text-center transition-all cursor-pointer group/drop relative overflow-hidden",
                                        isDragActive ? "border-arc-neon bg-arc-neon/5 scale-[1.01]" : "border-white/10 bg-black/40 hover:border-white/20",
                                        isExtracting ? "opacity-50 cursor-wait" : "",
                                        uplinkStatus === 'error' ? "border-red-500/50 bg-red-500/5" : ""
                                    )}
                                >
                                    <input {...getInputProps()} />
                                    {isExtracting ? (
                                        <div className="space-y-4 animate-pulse">
                                            <div className="flex justify-center"><Activity className="w-12 h-12 text-arc-neon animate-spin" /></div>
                                            <div className="font-display text-sm tracking-[0.2em] text-arc-neon uppercase">EXTRACTING NEURAL PATTERNS...</div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex justify-center"><Upload className={cn("w-12 h-12 transition-all", isDragActive ? "text-arc-neon scale-110" : "text-white/20")} /></div>
                                            <div className="space-y-2">
                                                <div className="font-display text-sm tracking-[0.2em] text-white group-hover/drop:text-arc-neon transition-colors uppercase">
                                                    {isDragActive ? 'DROP_CORE_DATA' : 'DRAG_AND_DROP_STUDY_MATERIAL'}
                                                </div>
                                                <p className="font-display text-[9px] text-white/30 tracking-widest uppercase">PDF, PNG, JPG, TXT, OR PPTX (MAX 10MB)</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-scanline pointer-events-none opacity-10" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Calibration Hub */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
                        {/* Styles Grid - 8 cols */}
                        <div className="lg:col-span-8 space-y-4">
                            <label className="font-display text-[10px] text-white/40 tracking-[0.4em] uppercase flex items-center gap-3">
                                <Palette className="w-4 h-4 text-sony-indigo" /> STYLISTIC CALIBRATION
                            </label>
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                {COMIC_STYLES.map(s => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => setStyle(s.id)}
                                        className={cn(
                                            "p-4 glass-card border transition-all duration-500 text-left group/style relative",
                                            style === s.id ? "bg-arc-neon/10 border-arc-neon/40 shadow-aura" : "bg-black/40 border-white/5 hover:border-white/10"
                                        )}
                                    >
                                        <div className="text-2xl mb-2">{s.emoji}</div>
                                        <div className={cn("font-display text-[9px] tracking-[0.2em] uppercase", style === s.id ? "text-arc-neon" : "text-white/40")}>{s.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Config HUD - 4 cols */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="space-y-4">
                                <label className="font-display text-[10px] text-white/40 tracking-[0.4em] uppercase flex items-center gap-3">
                                    <Layers className="w-4 h-4 text-arc-neon" /> COMIC VOLUME PLAN
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {COMIC_VOLUMES.map(v => (
                                        <button
                                            key={v.id}
                                            type="button"
                                            onClick={() => setComicVolume(v.id)}
                                            className={cn(
                                                "p-3 glass-card border text-left transition-all duration-300 group/vol",
                                                comicVolume === v.id ? "bg-arc-neon/10 border-arc-neon/40 shadow-aura" : "bg-black/40 border-white/5 hover:border-white/10"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <v.icon className={cn("w-3 h-3", comicVolume === v.id ? "text-arc-neon" : "text-white/20")} />
                                                {comicVolume === v.id && <div className="w-1 h-1 bg-arc-neon rounded-full animate-pulse" />}
                                            </div>
                                            <div className={cn("font-display text-[8px] tracking-widest uppercase", comicVolume === v.id ? "text-arc-neon" : "text-white/40")}>{v.label}</div>
                                            <div className="font-display text-[6px] text-white/10 group-hover/vol:text-white/20 uppercase mt-0.5">{v.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="font-display text-[10px] text-white/40 tracking-[0.4em] uppercase flex items-center gap-3">
                                    <Cpu className="w-4 h-4 text-sony-violet" /> PARAMETER TUNING
                                </label>
                                <div className="flex gap-2">
                                    {DIFFICULTIES.map(d => (
                                        <button
                                            key={d.id}
                                            type="button"
                                            onClick={() => setDifficulty(d.id)}
                                            className={cn(
                                                "flex-1 py-3 glass-card border font-display text-[8px] tracking-[0.3em] uppercase transition-all duration-300",
                                                difficulty === d.id ? d.color + " shadow-aura opacity-100" : "bg-black/40 text-white/20 border-white/5 hover:border-white/10"
                                            )}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── Gamma Engine: Narrative Theme Override ─────────────────── */}
                    <div className="space-y-4 border-t border-white/5 pt-8">
                        <label className="font-display text-[10px] text-white/40 tracking-[0.4em] uppercase flex items-center gap-3">
                            <Wand2 className="w-4 h-4 text-sony-violet" /> NARRATIVE THEME OVERRIDE
                            <span className="text-white/20 text-[8px] ml-auto normal-case tracking-normal font-sans">Optional — any theme imaginable</span>
                        </label>

                        {/* Free-text input */}
                        <div className="relative">
                            <Wand2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sony-violet/40 pointer-events-none" />
                            <input
                                type="text"
                                value={visualTheme}
                                onChange={e => setVisualTheme(e.target.value)}
                                placeholder="TYPE ANY THEME (e.g. Victorian Steampunk, Lovecraftian Ocean, Samurai Dystopia)..."
                                className="w-full glass-card bg-black/40 border-white/5 pl-12 pr-4 py-4 text-white font-display text-[10px] tracking-widest uppercase focus:border-sony-violet/40 transition-all outline-none placeholder:text-white/10"
                            />
                            {visualTheme && (
                                <button
                                    type="button"
                                    onClick={() => { setVisualTheme(''); setThemeSearch('') }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors font-display text-[9px] tracking-widest uppercase"
                                >[ CLEAR ]</button>
                            )}
                        </div>

                        {/* Search filter */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 pointer-events-none" />
                            <input
                                type="text"
                                value={themeSearch}
                                onChange={e => setThemeSearch(e.target.value)}
                                placeholder="SEARCH PRESETS..."
                                className="w-full glass-card bg-black/20 border-white/5 pl-10 pr-4 py-2.5 text-white/60 font-display text-[9px] tracking-widest uppercase focus:border-white/10 transition-all outline-none placeholder:text-white/10"
                            />
                        </div>

                        {/* Scrollable categorized chip grid */}
                        <div className="max-h-52 overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {VISUAL_THEMES.map(group => {
                                const filtered = group.themes.filter(t =>
                                    !themeSearch || t.toLowerCase().includes(themeSearch.toLowerCase())
                                )
                                if (filtered.length === 0) return null
                                return (
                                    <div key={group.category}>
                                        <div className="font-display text-[8px] text-white/20 tracking-[0.4em] uppercase mb-2 flex items-center gap-2">
                                            <span>{group.emoji}</span> {group.category}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {filtered.map(theme => (
                                                <button
                                                    key={theme}
                                                    type="button"
                                                    onClick={() => { setVisualTheme(theme); setThemeSearch('') }}
                                                    className={cn(
                                                        "font-display text-[8px] tracking-widest uppercase px-3 py-1.5 transition-all duration-300 border",
                                                        visualTheme === theme
                                                            ? "glass-card bg-sony-violet/20 border-sony-violet/50 text-sony-violet shadow-aura"
                                                            : "border-white/5 text-white/30 hover:border-sony-violet/30 hover:text-sony-violet/80 hover:bg-sony-violet/5"
                                                    )}
                                                >
                                                    {theme}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {visualTheme && (
                            <div className="flex items-center gap-3 glass-card bg-sony-violet/5 border-sony-violet/20 px-4 py-3">
                                <Wand2 className="w-3 h-3 text-sony-violet flex-shrink-0" />
                                <span className="font-display text-[9px] text-sony-violet uppercase tracking-widest">GAMMA ENGINE LOCKED → {visualTheme}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Execution Switch */}
                    <button
                        type="submit"
                        disabled={generating || (activeTab === 'manual' ? !topic.trim() : !extractedContext.trim())}
                        className="btn-hardware !w-full !py-5 group"
                    >
                        <div className="relative z-10 flex justify-center items-center gap-4 text-white">
                            {generating ? (
                                <><Activity className="w-5 h-5 animate-spin text-arc-neon" /> <span className="font-display text-md tracking-[0.4em] uppercase">SYNTHESIZING...</span></>
                            ) : (
                                <><Sparkles className="w-5 h-5 text-arc-neon group-hover:animate-pulsate" /> <span className="font-display text-md tracking-[0.4em] uppercase chromatic-text">INITIALIZE AI CREATION</span></>
                            )}
                        </div>
                    </button>
                </form>

                {/* Processing State HUD */}
                {generating && (
                    <div className="mt-12 glass-card bg-black/60 p-8 border-arc-neon/20 animate-motion-blur-in">
                        <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                            <Activity className="w-6 h-6 animate-spin text-arc-neon" />
                            <span className="font-display text-xs text-white tracking-[0.6em] uppercase">PIPELINE EXECUTION STATE
                            </span>
                        </div>
                        <div className="space-y-6">
                            {LOADING_STEPS.map((step, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-6 transition-all duration-700"
                                >
                                    <div className={cn(
                                        "w-2 h-2 rounded-full transition-all duration-1000",
                                        i < loadingStep ? 'bg-arc-neon shadow-aura' : i === loadingStep ? 'bg-arc-neon animate-pulse shadow-aura' : 'bg-white/5'
                                    )} />
                                    <span className={cn(
                                        "font-display text-[10px] tracking-[0.3em] uppercase transition-all duration-700",
                                        i < loadingStep ? 'text-white/60' : i === loadingStep ? 'text-arc-neon' : 'text-white/10'
                                    )}>{step.label}</span>
                                    {i === loadingStep && (
                                        <div className="flex-1 h-px bg-gradient-to-r from-arc-neon/30 to-transparent animate-pulse" />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-10 pt-6 border-t border-white/5 h-1 bg-white/5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-arc-neon shadow-aura transition-all duration-[5000ms] ease-out" style={{ width: `${(loadingStep / LOADING_STEPS.length) * 100}%` }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Content Output Array - MOVED TO DEDICATED READER (`/comic-book/[id]`) */}
            {hasPanels && !generating && (
                <div className="flex flex-col items-center justify-center p-20 space-y-6 text-center animate-motion-blur-in">
                    <Activity className="w-12 h-12 text-arc-neon animate-spin" />
                    <h2 className="font-display text-2xl text-white tracking-[0.2em] uppercase chromatic-text">ROUTING TO COMIC READER...
                    </h2>
                    <p className="font-display text-[10px] text-white/40 tracking-widest uppercase">
                        PREPARING IMMERSIVE EXPERIENCE MODULE
                    </p>
                </div>
            )}

            {/* Onboarding HUD (Empty State) */}
            {!hasPanels && !generating && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { Icon: Layout, title: 'DEFINE SEED', desc: 'INPUT TOPIC VECTOR AND CORE SUBJECT' },
                        { Icon: Palette, title: 'ENGINE CALIBRATE', desc: 'SELECT STYLISTIC VISUAL BIAS' },
                        { Icon: Activity, title: 'NEURAL RENDER', desc: 'AI SYNTHESIZES SCRIPT AND ARTWORK' },
                        { Icon: Swords, title: 'ENGAGE COMBAT', desc: 'TEST KNOWLEDGE IN BOSS WARFARE' },
                    ].map((item, i) => (
                        <div
                            key={item.title}
                            className="glass-card bg-black/40 border-white/5 p-8 text-center space-y-6 group hover:border-white/20 transition-all duration-700 relative overflow-hidden h-56 flex flex-col justify-center"
                        >
                            <div className="absolute top-0 right-0 p-3 opacity-5">
                                <item.Icon className="w-16 h-16" />
                            </div>
                            <div className="w-14 h-14 biometric-frame flex items-center justify-center mx-auto relative z-10 group-hover:border-arc-neon transition-colors">
                                <item.Icon className={cn(
                                    "w-6 h-6 text-white/40 group-hover:text-arc-neon transition-colors",
                                    i === 2 ? 'animate-spin' : i === 3 ? 'animate-pulsate' : ''
                                )} />
                            </div>
                            <div className="space-y-2 relative z-10">
                                <div className="font-display text-xs text-white tracking-[0.3em] uppercase group-hover:text-white transition-colors">
                                    {item.title}
                                </div>
                                <div className="font-display text-[8px] text-white/10 tracking-widest uppercase group-hover:text-white/30 transition-colors leading-relaxed">
                                    {item.desc}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
