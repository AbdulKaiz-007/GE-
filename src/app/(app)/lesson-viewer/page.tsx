'use client'

export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { BookOpen, Swords, ChevronLeft, Download, Share2, RefreshCw, Activity, Cpu, Layers, Zap, Star, Layout } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, Suspense } from 'react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/game-engine'

function LessonContent() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const router = useRouter()
    const [lesson, setLesson] = useState<any>(null)
    const [panels, setPanels] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return

        async function fetchLessonAndPanels() {
            setLoading(true)
            const supabase = createClient()

            const { data: lessonData } = await supabase
                .from('lessons')
                .select('*')
                .eq('id', id)
                .single()

            const { data: panelsData } = await supabase
                .from('comic_panels')
                .select('*')
                .eq('lesson_id', id)
                .order('panel_order')

            if (lessonData) {
                setLesson(lessonData)
                setPanels(panelsData || [])
            } else {
                // Demo data fallback
                if (id === 'demo-1') {
                    setLesson({ id: 'demo-1', topic: 'The Secrets Blockchain: Zero-Trust Jutsu', subject_tag: 'Computer Science', difficulty: 'intermediate', panel_count: 6 })
                    setPanels([
                        { id: 'p1', panel_order: 1, image_url: 'https://image.pollinations.ai/prompt/naruto%20explaining%20blockchain%20to%20sensei?width=512&height=512&nologo=true', narration: 'In the Hidden Village of Data...', dialogue: '"Yo! So, Dattebayo! What is this \'Node\' and \'Encryption\' dattebayo!"', concept_tag: 'Introduction', scene_desc: 'Ninja Student pointing at a complex glowing diagram' },
                        { id: 'p2', panel_order: 2, image_url: 'https://image.pollinations.ai/prompt/ninja%20sensei%20with%20glowing%20cyber%20fox%20hologram?width=512&height=512&nologo=true', narration: 'The Wise Sensei answers.', dialogue: '"Think of DLT as a fraction of truth, the un-chain. It is Zero-Trust Jutsu!"', concept_tag: 'Core Concept', scene_desc: 'Wise sensei holding a tablet, a glowing cyber fox is projecting blocks of data' },
                        { id: 'p3', panel_order: 3, image_url: 'https://image.pollinations.ai/prompt/naruto%20doing%20hand%20signs%20with%20sensei%20watching?width=512&height=512&nologo=true', narration: 'A new technique is revealed.', dialogue: '"So practicing more Jutsu... more nodes recognize the Hash!"', concept_tag: 'Practice', scene_desc: 'Ninja student doing hand signs in front of glowing data structure' },
                        { id: 'p4', panel_order: 4, image_url: 'https://image.pollinations.ai/prompt/cyber%20fox%20breathing%20energy%20naruto%20cheering?width=512&height=512&nologo=true', narration: 'The network is secured.', dialogue: '"Believe it!"', concept_tag: 'Application', scene_desc: 'Cyber fox breathing blue energy, student cheering' },
                        { id: 'p5', panel_order: 5, image_url: 'https://image.pollinations.ai/prompt/ninja%20student%20protecting%20village%20from%20hackers?width=512&height=512&nologo=true', narration: 'Defending against threats.', dialogue: '"No rogue hacker can break our encryption!"', concept_tag: 'Security', scene_desc: 'Ninja student using chakra shield against red hacker silhouettes' },
                        { id: 'p6', panel_order: 6, image_url: 'https://image.pollinations.ai/prompt/naruto%20giving%20thumbs%20up%20mission%20complete?width=512&height=512&nologo=true', narration: 'Mission Accomplished.', dialogue: '"Zero-Trust Jutsu mastered, Dattebayo!"', concept_tag: 'Summary', scene_desc: 'Ninja student giving a thumbs up, smiling brightly' },
                    ])
                }
            }
            setLoading(false)
        }
        fetchLessonAndPanels()
    }, [id])

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        toast.success('GEO LINK COPIED')
    }

    if (!id) return <div className="p-12 text-center text-white/40 font-display text-xs tracking-[0.5em] uppercase">LINK ID INVALID</div>
    if (loading) return (
        <div className="p-20 text-center space-y-8 flex flex-col items-center">
            <Activity className="w-16 h-16 text-arc-neon animate-pulse" />
            <p className="font-display text-xs text-arc-neon tracking-[0.8em] uppercase animate-pulse">DECRYPTING CONTENT ARRAY...</p>
        </div>
    )
    if (!lesson) return <div className="p-12 text-center text-white/40 font-display text-xs tracking-[0.5em] uppercase">CONTENT ARCHIVE NULL</div>

    const difficultyStyles: Record<string, string> = {
        beginner: 'border-arc-neon text-arc-neon bg-arc-neon/10 shadow-aura',
        intermediate: 'border-sony-indigo text-sony-indigo bg-sony-indigo/10 shadow-aura',
        advanced: 'border-sony-violet text-sony-violet bg-sony-violet/10 shadow-aura',
    }

    const style = lesson.story_arc?.style || 'american'

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 animate-motion-blur-in pb-32">

            {/* Header HUD */}
            <div className="flex flex-col md:flex-row items-center gap-8 glass-card bg-black/40 border-white/10 p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-arc-neon/5 via-transparent to-sony-violet/5 opacity-50" />

                <Link href="/comics" className="w-14 h-14 glass-card bg-black/60 border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-arc-neon hover:text-arc-neon transition-all group/back relative z-10 shrink-0">
                    <ChevronLeft className="w-6 h-6 transition-transform group-hover/back:-translate-x-1" />
                </Link>

                <div className="flex-1 min-w-0 relative z-10 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                        <Cpu className="w-4 h-4 text-arc-neon opacity-50" />
                        <span className="font-display text-[9px] text-arc-neon tracking-[0.4em] uppercase opacity-70">Core Lesson v4.0</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-display text-white uppercase tracking-[0.2em] chromatic-text leading-tight">{lesson.topic}</h1>
                    <div className="flex items-center justify-center md:justify-start gap-4 mt-6 flex-wrap">
                        {lesson.subject_tag && <span className="font-display text-[10px] text-white/40 tracking-widest uppercase py-1 px-3 border border-white/5">{lesson.subject_tag.toUpperCase()}</span>}
                        <span className={cn(
                            "px-4 py-1.5 glass-card border font-display text-[10px] tracking-widest uppercase transition-all duration-500",
                            difficultyStyles[lesson.difficulty] || 'border-white/10 text-white/40'
                        )}>{lesson.difficulty}
                        </span>
                        <span className="font-display text-[9px] text-white/20 tracking-widest uppercase ml-2">SEQ SIZE: {lesson.panel_count || panels.length}
                        </span>
                            <span className="glass-card bg-sony-indigo/10 border-sony-indigo/40 px-3 py-1.5 font-display text-[9px] text-sony-indigo tracking-widest uppercase shadow-aura">{style} STYLIZATION</span>
                    </div>
                </div>

                <div className="flex flex-row gap-4 relative z-10 shrink-0">
                    <button onClick={handleShare} className="glass-card bg-black/80 border-white/10 px-6 py-4 font-display text-[10px] text-white/40 tracking-widest uppercase hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-3">
                        <Share2 className="w-4 h-4" />
                        <span className="hidden lg:inline">SYNC LINK</span>
                    </button>
                    <Link
                        href={`/comic-book/${lesson.id}?topic=${encodeURIComponent(lesson.topic)}&style=${style}`}
                        className="glass-card bg-arc-neon/10 border-arc-neon/30 px-6 py-4 font-display text-[10px] text-arc-neon tracking-widest uppercase hover:bg-arc-neon/20 hover:border-arc-neon transition-all flex items-center justify-center gap-3 shadow-aura"
                    >
                        <BookOpen className="w-4 h-4" />
                        <span className="hidden lg:inline">READ AS BOOK</span>
                    </Link>
                    <Link href={`/battle?lesson=${lesson.id}`} className="btn-hardware !px-8 !py-5 group">
                        <span className="relative z-10 flex items-center justify-center gap-4 text-white">
                            <Swords className="w-5 h-5 group-hover:animate-pulsate text-arc-neon" />
                            <span className="font-display text-[11px] tracking-[0.3em] uppercase chromatic-text">INITIALIZE BOSS WAR</span>
                        </span>
                    </Link>
                </div>
            </div>

            {/* Content Overview HUD */}
            {lesson.story_arc?.concepts && (
                <div className="glass-card bg-black/20 border-white/5 p-8 relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                        <Layers className="w-5 h-5 text-arc-neon animate-pulse" />
                        <span className="font-display text-[11px] text-white/60 tracking-[0.4em] uppercase">ONTOLOGY ARRAY MAPPING</span>
                    </div>
                    <div className="flex flex-wrap gap-4 relative z-10">
                        {lesson.story_arc.concepts.map((c: string, i: number) => (
                            <div key={i} className="glass-card bg-arc-neon/5 border-arc-neon/20 px-4 py-2 font-display text-[9px] text-white tracking-widest uppercase hover:border-arc-neon/60 transition-colors cursor-default">
                                {c}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Data Stream Grid */}
            {panels && panels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                    {panels.map((panel: any, index: number) => (
                        <ComicPanel key={panel.id} panel={panel} index={index} style={style} />
                    ))}
                </div>
            ) : (
                <div className="glass-card bg-black/40 border-white/5 p-24 text-center space-y-8 animate-pulse">
                    <Activity className="w-16 h-16 mx-auto text-arc-neon opacity-20" />
                    <p className="font-display text-[10px] text-white/20 tracking-[0.8em] uppercase">SEQUENCING ART ARRAYS...</p>
                </div>
            )}

            {/* Battle Ready HUD */}
            <div className="glass-card bg-black/40 border-white/10 p-16 text-center space-y-10 relative overflow-hidden group">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-arc-neon/40 to-transparent" />

                <h2 className="text-4xl md:text-5xl font-display text-white uppercase tracking-[0.3em] chromatic-text group-hover:scale-[1.05] transition-transform duration-1000">MASTERED THE SEQUENCE?
                </h2>
                <p className="font-display text-[11px] text-white/30 tracking-[0.3em] uppercase max-w-xl mx-auto leading-relaxed">9 TACTICAL QUERIES INITIATED. DEFEAT THE CORE SENTINEL WITH ACQUIRED DATA VECTORS.</p>
                <div className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-4 relative z-10">
                    <Link href={`/battle?lesson=${lesson.id}`} className="btn-hardware !px-12 !py-6 group/btn">
                        <span className="relative z-10 font-display text-base tracking-[0.5em] uppercase flex items-center gap-6 group-hover/btn:chromatic-text">
                            <Swords className="w-7 h-7 text-arc-neon group-hover/btn:animate-pulsate" /> ENGAGE COMBAT
                        </span>
                    </Link>
                    <Link href="/comics" className="glass-card bg-white/5 border-white/10 px-10 py-5 font-display text-[11px] tracking-[0.4em] text-white/40 uppercase hover:bg-white/10 hover:text-white transition-all group/btn">
                        <span className="flex items-center gap-4">
                            <RefreshCw className="w-5 h-5 group-hover/btn:animate-spin" /> RESET CREATIVE FLOW
                        </span>
                    </Link>
                </div>
                {/* Visual texture */}
                <div className="absolute inset-0 bg-[url('/bg-noise.png')] opacity-10 pointer-events-none" />
            </div>
        </div>
    )
}

function ComicPanel({
    panel, index, style
}: {
    panel: any; index: number; style: string
}) {
    const [imgLoaded, setImgLoaded] = useState(false)
    const [imgError, setImgError] = useState(false)

    return (
        <div
            className="glass-card border-white/5 bg-black/40 overflow-hidden flex flex-col group relative transition-all duration-700 hover:border-white/20"
            style={{ animationDelay: `${index * 0.07}s` }}
        >
            {/* Panel number HUD */}
            <div className="absolute top-4 left-4 z-20 glass-card bg-black/80 border-white/10 px-2.5 py-1 text-[10px] font-display text-white tracking-widest uppercase">
                {panel.panel_order.toString().padStart(2, '0')}
            </div>

            {/* Concept tag HUD */}
            {panel.concept_tag && (
                <div className="absolute top-4 right-4 z-20 glass-card bg-arc-neon/10 border-arc-neon/30 px-3 py-1 text-[8px] font-display text-arc-neon tracking-widest uppercase shadow-aura">
                    {panel.concept_tag.toUpperCase()}
                </div>
            )}

            {/* Image viewport */}
            <div className="relative aspect-[4/3] overflow-hidden bg-sony-nebula-deep flex items-center justify-center">
                {!imgLoaded && !imgError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md gap-4">
                        <Activity className="w-8 h-8 text-arc-neon/40 animate-pulse" />
                        <p className="font-display text-[9px] uppercase tracking-[0.4em] text-arc-neon/40 animate-pulse">RENDER SEQUENCE...</p>
                    </div>
                )}
                {imgError ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                        <BookOpen className="w-12 h-12 text-white/10" />
                    </div>
                ) : (
                    <Image
                        src={panel.image_url}
                        alt={panel.scene_desc || `Panel ${panel.panel_order}`}
                        fill
                        className={cn(
                            "object-cover transition-all duration-1000 group-hover:scale-110",
                            imgLoaded ? 'opacity-70 group-hover:opacity-100' : 'opacity-0'
                        )}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => { setImgError(true); setImgLoaded(true) }}
                        unoptimized
                    />
                )}

                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('/bg-noise.png')] mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-scanline pointer-events-none opacity-30" />

                {/* Speech Matrix HUD */}
                {(panel.dialogue || panel.speech) && (
                    <div className="absolute bottom-4 left-4 right-4 z-10 glass-card bg-black/80 border-white/20 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 shadow-2xl">
                        <p className="font-display text-[11px] text-white uppercase tracking-widest leading-relaxed">{panel.dialogue || panel.speech}</p>
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-white/20 rotate-45" />
                    </div>
                )}
            </div>

            {/* Caption HUD */}
            {panel.narration && (
                <div className="bg-black/60 p-5 border-t border-white/5 flex-1 select-none">
                    <p className="font-display text-[10px] uppercase tracking-[0.2em] text-white/40 group-hover:text-white/80 transition-colors leading-relaxed">{panel.narration}</p>
                </div>
            )}
        </div>
    )
}

import { SecurityHandshake } from '@/components/SecurityHandshake'

export default function LessonViewerPage() {
    return (
        <Suspense fallback={
            <div className="p-20 text-center space-y-8 flex flex-col items-center">
                <Activity className="w-16 h-16 text-arc-neon animate-pulse" />
                <p className="font-display text-xs text-arc-neon tracking-[0.8em] uppercase">DECRYPTING DATA STREAM...</p>
            </div>
        }>
            <SecurityHandshake>
                <LessonContent />
            </SecurityHandshake>
        </Suspense>
    )
}
