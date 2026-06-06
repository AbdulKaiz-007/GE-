'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import {
    Sparkles, Loader2, BookOpen, Swords,
    Palette, Activity, Cpu, Layers, Zap, ChevronRight, Layout,
    Upload, FileText, CheckCircle2, AlertCircle, Trophy, Search, Wand2, Target, Crosshair
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { cn } from '@/lib/game-engine'
import Image from 'next/image'

// ─── Types ────────────────────────────────────────────────────
type ComicStyle = 'american' | 'manga' | 'webtoon' | 'franco' | 'dc'
type Difficulty = 'beginner' | 'intermediate' | 'advanced'

const COMIC_STYLES: { id: ComicStyle; label: string; emoji: string; desc: string }[] = [
    { id: 'american', label: 'American', emoji: '🦸', desc: 'Bold colors, dynamic poses' },
    { id: 'manga', label: 'Manga', emoji: '⚡', desc: 'Japanese B&W style, speed lines' },
    { id: 'webtoon', label: 'Webtoon', emoji: '🌸', desc: 'Korean digital, pastel & cute' },
    { id: 'franco', label: 'Franco-Belgian', emoji: '🎨', desc: 'Ligne claire, flat colors' },
    { id: 'dc', label: 'DC Comics', emoji: '蝙', desc: 'Dark, gritty superhero art' },
]

const DIFFICULTIES: { id: Difficulty; label: string; color: string }[] = [
    { id: 'beginner', label: 'INITIATE', color: 'border-arc-neon/40 text-arc-neon bg-arc-neon/10' },
    { id: 'intermediate', label: 'VANGUARD', color: 'border-sony-indigo/40 text-sony-indigo bg-sony-indigo/10' },
    { id: 'advanced', label: 'PREMIER', color: 'border-sony-violet/40 text-sony-violet bg-sony-violet/10' },
]

const SUBJECT_TAGS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'History', 'Computer Science', 'Economics', 'Literature', 'Geography', 'Philosophy']

const LOADING_STEPS = [
    { label: 'ANALYZING NEURAL VECTORS...', delay: 0 },
    { label: 'SYNTHESIZING NARRATIVE ARC...', delay: 5000 },
    { label: 'ENCODING COMIC STRUCTURES...', delay: 12000 },
    { label: 'GENERATING HIGH FIDELITY ART...', delay: 20000 },
    { label: 'RENDERING SPATIAL ILLUSTRATIONS...', delay: 50000 },
    { label: 'CALIBRATING BATTLE LOGIC...', delay: 80000 },
    { label: 'FINALIZING CREATIVE SYNC...', delay: 100000 },
]

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
]

const COMIC_VOLUMES = [
    { id: 4, label: 'MICRO', desc: '1 PAGE', icon: Zap },
    { id: 8, label: 'STANDARD', desc: '2 PAGES', icon: BookOpen },
    { id: 20, label: 'EPIC', desc: '5 PAGES', icon: Sparkles },
    { id: 32, label: 'LEGEND', desc: '8 PAGES', icon: Trophy }
]

export default function LessonsPage() {
    const router = useRouter()
    const [topic, setTopic] = useState('')
    const [style, setStyle] = useState<ComicStyle>('american')
    const [difficulty, setDifficulty] = useState<Difficulty>('beginner')
    const [subject, setSubject] = useState('')
    const [visualTheme, setVisualTheme] = useState('')
    const [comicVolume, setComicVolume] = useState(8)
    const [generating, setGenerating] = useState(false)
    const [loadingStep, setLoadingStep] = useState(0)
    const [activeTab, setActiveTab] = useState<'manual' | 'uplink'>('manual')
    const [extractedContext, setExtractedContext] = useState('')
    const [isExtracting, setIsExtracting] = useState(false)
    const [uplinkStatus, setUplinkStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

    const stepsRef = useRef<NodeJS.Timeout[]>([])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100
            })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

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
            if (!res.ok) throw new Error(data.error || 'UPLINK FAILURE')

            setExtractedContext(data.text)
            setUplinkStatus('success')
            toast.success('NEURAL EXTRACTION COMPLETE', { id: loadingToast })
        } catch (err: any) {
            setUplinkStatus('error')
            toast.error(err.message || 'EXTRACTION ERROR', { id: loadingToast })
        } finally {
            setIsExtracting(false)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
        multiple: false
    })

    const handleGenerate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        const finalTopic = activeTab === 'uplink' ? extractedContext : topic
        if (!finalTopic || finalTopic.length < 5) {
            toast.error('INPUT NEURAL TARGET FIRST')
            return
        }

        setGenerating(true)
        startLoadingSteps()

        try {
            const res = await fetch('/api/lessons/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: finalTopic,
                    difficulty,
                    subject_tag: subject,
                    style,
                    panelCount: comicVolume,
                    visualTheme
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'GENERATION FAILED')

            toast.success('COMIC SYNTHESIS COMPLETE')
            
            // Redirect to the Comic Book Flipbook Viewer
            const params = new URLSearchParams({
                topic: data.topic,
                style: style
            })
            router.push(`/comic-book/${data.lesson_id}?${params.toString()}`)
            
        } catch (err: any) {
            toast.error(err.message || 'NEURAL LINK FAILED')
            setGenerating(false)
            clearStepTimers()
        }
    }

    if (generating) {
        return (
            <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-6 text-center">
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-[10%] left-[20%] w-[60vw] h-[60vw] bg-arc-neon/10 rounded-full blur-[120px] animate-liquid-flow" />
                    <div className="absolute bottom-[20%] right-[10%] w-[50vw] h-[50vw] bg-sony-violet/10 rounded-full blur-[120px] animate-liquid-flow" style={{ animationDirection: 'reverse' }} />
                </div>

                <div className="relative z-10 space-y-12 max-w-2xl w-full">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 biometric-frame flex items-center justify-center mb-10 text-arc-neon animate-neural-pulse">
                            <Activity className="w-12 h-12 animate-spin-slow" />
                        </div>
                        <h2 className="text-4xl font-display tracking-[0.2em] text-white uppercase animate-chromatic-glitch">
                            {LOADING_STEPS[loadingStep].label}
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
                            <div
                                className="h-full bg-gradient-to-r from-arc-neon via-sony-indigo to-sony-violet transition-all duration-1000 shadow-glow"
                                style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] font-display text-white/40 tracking-widest uppercase">
                            <span>NEURAL SYNC PERCENTAGE</span>
                            <span>{Math.round(((loadingStep + 1) / LOADING_STEPS.length) * 100)}%</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {LOADING_STEPS.map((step, i) => (
                            <div
                                key={step.label}
                                className={cn(
                                    "flex items-center gap-4 transition-all duration-500",
                                    i === loadingStep ? "opacity-100 translate-x-2" : i < loadingStep ? "opacity-30" : "opacity-10"
                                )}
                            >
                                <div className={cn(
                                    "w-3 h-3 rounded-full border border-white/20",
                                    i <= loadingStep ? "bg-arc-neon shadow-glow" : "bg-transparent"
                                )} />
                                <span className="font-display text-[9px] tracking-widest uppercase text-left">{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 min-h-screen relative font-sans animate-motion-blur-in">
            {/* Ambient System Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] left-[20%] w-[60vw] h-[60vw] bg-sony-violet/5 rounded-full blur-[120px] animate-liquid-flow" />
                <div className="absolute bottom-[20%] right-[10%] w-[50vw] h-[50vw] bg-sony-indigo/5 rounded-full blur-[120px] animate-liquid-flow" style={{ animationDirection: 'reverse' }} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(0,229,255,0.03)_0%,transparent_50%)]"
                    style={{ '--mouse-x': `${mousePos.x}%`, '--mouse-y': `${mousePos.y}%` } as any} />
            </div>

            {/* Header */}
            <div className="relative z-10 pb-8 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 biometric-frame overflow-hidden relative">
                        <Image
                            src="/images/gamma_edison_logo.png"
                            alt="Logo"
                            fill
                            className="object-cover p-2 brightness-110"
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <span className="font-display text-[10px] text-arc-neon tracking-[0.3em] uppercase opacity-70">Comic Engine v4.0</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-arc-neon animate-pulse" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-display tracking-[0.1em] chromatic-text uppercase"> EDUCATIONAL COMIC FACTORY</h1>
                    </div>
                </div>
                <div className="hidden md:block text-right">
                    <p className="font-display text-[10px] text-white/30 tracking-[0.3em] uppercase">STATION 04 ∙ NEURAL SYNC ACTIVE</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
                {/* Left Columns: Generator HUD */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Tab Navigation */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('manual')}
                            className={cn(
                                "flex-1 py-4 border font-display text-[10px] tracking-widest uppercase transition-all",
                                activeTab === 'manual' ? "bg-arc-neon/10 border-arc-neon text-arc-neon" : "border-white/10 text-white/40 hover:bg-white/5"
                            )}
                        >
                            THOUGHT UPLINK
                        </button>
                        <button
                            onClick={() => setActiveTab('uplink')}
                            className={cn(
                                "flex-1 py-4 border font-display text-[10px] tracking-widest uppercase transition-all",
                                activeTab === 'uplink' ? "bg-arc-neon/10 border-arc-neon text-arc-neon" : "border-white/10 text-white/40 hover:bg-white/5"
                            )}
                        >
                            KNOWLEDGE UPLINK
                        </button>
                    </div>

                    <div className="glass-card p-10 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-arc-neon/40 to-transparent shadow-glow" />

                        {activeTab === 'manual' ? (
                            <form onSubmit={handleGenerate} className="space-y-10 relative z-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-display text-white/40 tracking-[0.4em] uppercase flex items-center gap-3">
                                        <Target className="w-4 h-4 text-arc-neon" /> 1. DEFINING NEURAL TARGET
                                    </label>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-arc-neon transition-colors" />
                                        <input
                                            type="text"
                                            value={topic}
                                            onChange={e => setTopic(e.target.value)}
                                            placeholder="INPUT TOPIC (E.G. QUANTUM PHYSICS)..."
                                            className="w-full bg-black/40 border border-white/10 text-white font-sans text-lg py-5 pl-14 pr-4 focus:border-arc-neon/50 transition-all rounded-sm tracking-widest placeholder:text-white/10 placeholder:font-display placeholder:text-xs"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-display text-white/40 tracking-[0.4em] uppercase">2. SECTOR ALIGNMENT</label>
                                    <div className="flex flex-wrap gap-2">
                                        {SUBJECT_TAGS.map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => setSubject(subject === tag ? '' : tag)}
                                                className={cn(
                                                    "px-4 py-2 font-display text-[10px] uppercase tracking-[0.2em] border transition-all duration-300",
                                                    subject === tag
                                                        ? "border-arc-neon bg-arc-neon/20 text-arc-neon shadow-aura-hover"
                                                        : "border-white/10 text-white/40 hover:border-white/30 hover:text-white"
                                                )}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-10 relative z-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-display text-white/40 tracking-[0.4em] uppercase flex items-center gap-3">
                                        <Upload className="w-4 h-4 text-arc-neon" /> 1. UPLINK KNOWLEDGE CORE
                                    </label>
                                    <div
                                        {...getRootProps()}
                                        className={cn(
                                            "border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer group",
                                            isDragActive ? "border-arc-neon bg-arc-neon/5" : "border-white/10 hover:border-white/30 hover:bg-white/5",
                                            uplinkStatus === 'success' && "border-arc-neon/50 bg-arc-neon/5"
                                        )}
                                    >
                                        <input {...getInputProps()} />
                                        <div className="flex flex-col items-center gap-4">
                                            {isExtracting ? (
                                                <Loader2 className="w-12 h-12 text-arc-neon animate-spin" />
                                            ) : uplinkStatus === 'success' ? (
                                                <CheckCircle2 className="w-12 h-12 text-arc-neon animate-bounce" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-arc-neon/10 transition-colors">
                                                    <FileText className="w-8 h-8 text-white/40 group-hover:text-arc-neon transition-colors" />
                                                </div>
                                            )}
                                            <div className="space-y-1">
                                                <p className="font-display text-xs tracking-widest text-white uppercase">
                                                    {isExtracting ? 'DECRYPTING DATA...' : uplinkStatus === 'success' ? 'LINK ESTABLISHED' : 'DROP PDF OR NOTES HERE'}
                                                </p>
                                                <p className="font-sans text-[10px] text-white/40 uppercase">MAX 10MB ∙ OPTIMIZED FOR STUDY MATERIAL</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {uplinkStatus === 'success' && (
                                    <div className="p-5 bg-black/40 border border-arc-neon/20 rounded-sm animate-motion-blur-in">
                                        <div className="flex items-center gap-3 mb-4 text-arc-neon">
                                            <Wand2 className="w-4 h-4" />
                                            <span className="font-display text-[9px] tracking-widest uppercase">EXTRACTION PREVIEW</span>
                                        </div>
                                        <p className="text-[11px] text-white/60 font-sans leading-relaxed line-clamp-3 italic">
                                            &quot;{extractedContext}&quot;
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-10 pt-10 border-t border-white/5 space-y-10">
                            {/* Comic Style Selection */}
                            <div className="space-y-6">
                                <label className="text-[10px] font-display text-white/40 tracking-[0.4em] uppercase flex items-center gap-3">
                                    <Palette className="w-4 h-4 text-arc-neon" /> 3. STYLISTIC CALIBRATION
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                    {COMIC_STYLES.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setStyle(s.id)}
                                            className={cn(
                                                "p-4 border transition-all text-center space-y-2 group/style relative overflow-hidden",
                                                style === s.id ? "border-arc-neon bg-arc-neon/5 shadow-aura" : "border-white/10 hover:border-white/30"
                                            )}
                                        >
                                            <div className="text-2xl mb-1">{s.emoji}</div>
                                            <div className={cn("font-display text-[8px] tracking-widest uppercase", style === s.id ? "text-arc-neon" : "text-white/40")}>{s.label}</div>
                                            {style === s.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-arc-neon animate-pulse" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Volume Selector */}
                            <div className="space-y-6">
                                <label className="text-[10px] font-display text-white/40 tracking-[0.4em] uppercase flex items-center gap-3">
                                    <Layers className="w-4 h-4 text-arc-neon" /> 4. VOLUME PLANNING
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {COMIC_VOLUMES.map(v => (
                                        <button
                                            key={v.id}
                                            onClick={() => setComicVolume(v.id)}
                                            className={cn(
                                                "p-4 border transition-all text-left flex items-center gap-4 group/vol",
                                                comicVolume === v.id ? "border-arc-neon bg-arc-neon/10 shadow-aura" : "border-white/10 hover:border-white/30"
                                            )}
                                        >
                                            <v.icon className={cn("w-5 h-5", comicVolume === v.id ? "text-arc-neon" : "text-white/20")} />
                                            <div>
                                                <div className={cn("font-display text-[9px] tracking-widest uppercase", comicVolume === v.id ? "text-white" : "text-white/40")}>{v.label}</div>
                                                <div className="text-[8px] text-white/20 uppercase tracking-tighter">{v.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Narrative Theme */}
                            <div className="space-y-6">
                                <label className="text-[10px] font-display text-white/40 tracking-[0.4em] uppercase flex items-center gap-3">
                                    <Layout className="w-4 h-4 text-arc-neon" /> 5. NARRATIVE THEME OVERRIDE
                                </label>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-arc-neon transition-colors" />
                                    <input
                                        type="text"
                                        value={visualTheme}
                                        onChange={e => setVisualTheme(e.target.value)}
                                        placeholder="INPUT THEME (E.G. 2050 CYBERPUNK, DARK FANTASY)..."
                                        className="w-full bg-black/40 border border-white/10 text-white font-sans text-xs py-4 pl-12 pr-4 focus:border-arc-neon/50 transition-all rounded-sm tracking-widest placeholder:text-white/10 placeholder:font-display placeholder:text-[9px]"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {VISUAL_THEMES.map(cat => (
                                        <div key={cat.category} className="flex gap-2">
                                            {cat.themes.slice(0, 2).map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => setVisualTheme(t)}
                                                    className="px-3 py-1.5 border border-white/10 text-[8px] font-display tracking-widest uppercase text-white/30 hover:border-arc-neon/40 hover:text-arc-neon transition-all"
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Launch Button */}
                            <button
                                onClick={() => handleGenerate()}
                                disabled={generating || (activeTab === 'manual' ? !topic : !extractedContext)}
                                className="btn-hardware w-full group relative overflow-hidden py-10"
                            >
                                <div className="font-display tracking-[0.4em] text-2xl flex justify-center items-center gap-6 relative z-10 transition-transform group-active:scale-95">
                                    <Zap className="w-8 h-8 text-arc-neon animate-pulse" />
                                    <span>INITIALIZE AI CREATION</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Intensity & Status */}
                <div className="space-y-8">
                    <div className="glass-card p-8 border-white/10">
                        <label className="text-[10px] font-display text-white/40 tracking-[0.4em] uppercase mb-8 block">SYNAPSE INTENSITY</label>
                        <div className="space-y-4">
                            {DIFFICULTIES.map(d => (
                                <button
                                    key={d.id}
                                    onClick={() => setDifficulty(d.id)}
                                    className={cn(
                                        "w-full py-5 border font-display text-[9px] tracking-[0.2em] transition-all duration-300 relative overflow-hidden group/btn",
                                        difficulty === d.id
                                            ? d.color + " shadow-aura"
                                            : "border-white/10 text-white/40 hover:border-white/30"
                                    )}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-8 border-white/10">
                        <div className="text-[10px] font-display text-white/40 tracking-[0.4em] uppercase mb-8 flex justify-between items-center border-b border-white/10 pb-4">
                            <span>System Status</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-arc-neon animate-pulse" />
                                <span className="text-arc-neon">READY</span>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-black/40 p-4 border border-white/5">
                                <Cpu className="w-4 h-4 text-white/20" />
                                <span className="font-display text-[8px] text-white/30 tracking-widest uppercase">NODE OVERSEER: ACTIVE</span>
                            </div>
                            <div className="flex justify-between items-center bg-black/40 p-4 border border-white/5">
                                <Activity className="w-4 h-4 text-white/20" />
                                <span className="font-display text-[8px] text-white/30 tracking-widest uppercase">LATENCY: 42MS</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Particle Dust Overlay */}
            <div className="particle-container opacity-20 pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="particle animate-particle-dust"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${15 + Math.random() * 10}s`
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
