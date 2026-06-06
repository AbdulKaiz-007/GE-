'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, forwardRef, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Activity, ImageOff, BookOpen } from 'lucide-react'
import Link from 'next/link'
import HTMLFlipBook from 'react-pageflip'
import { cn } from '@/lib/game-engine'

interface ComicPanel {
    panel_order: number;
    image_url: string;
    narration: string;
    dialogue: string;
    concept_tag: string;
}

// Custom Font Injection & Comic Textures
const COMIC_STYLES_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:ital,wght@0,400;0,700;1,400;1,700&family=Kalam:wght@700&display=swap');

.font-bangers { font-family: 'Bangers', cursive; letter-spacing: 0.05em; }
.font-comic { font-family: 'Comic Neue', cursive; font-weight: 700; }
.font-kalam { font-family: 'Kalam', cursive; }

.paper-texture {
  background-color: #fcfcfc;
  background-image: 
    url("https://www.transparenttextures.com/patterns/notebook.png"),
    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.7) 0%, rgba(220,220,220,0.1) 100%);
  position: relative;
}

.paper-texture::before {
  content: "";
  position: absolute;
  inset: 0;
  background: url("https://www.transparenttextures.com/patterns/p6-mini.png");
  opacity: 0.15;
  pointer-events: none;
}

.comic-border {
  border: 4px solid black;
  box-shadow: 4px 4px 0px 0px rgba(0,0,0,0.8);
}
`;

// ─── Single Comic Panel ─────────────────────────────────────────────
function Panel({ panel, styleName, layoutClass }: { panel: ComicPanel, styleName: string, layoutClass: string }) {
    const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
    const [retryCount, setRetryCount] = useState(0)
    const MAX_RETRIES = 12;

    const currentImgUrl = retryCount > 0
        ? `${panel.image_url}${panel.image_url.includes('?') ? '&' : '?'}retry=${retryCount}`
        : panel.image_url

    useEffect(() => {
        if (imgStatus === 'error' && retryCount < MAX_RETRIES) {
            const timer = setTimeout(() => {
                setImgStatus('loading')
                setRetryCount(c => c + 1)
            }, 3500)
            return () => clearTimeout(timer)
        }
    }, [imgStatus, retryCount])

    return (
        <div className={cn(
            "relative group",
            layoutClass,
            styleName === 'manga' ? 'grayscale' : ''
        )}>
            {/* Image Container with high-contrast comic border */}
            <div className="absolute inset-0 bg-gray-100 border-[3px] border-black overflow-hidden shadow-[2px_2px_0px_#000] group-hover:shadow-[4px_4px_0px_#000] transition-all duration-300">
                {(imgStatus === 'loading' || imgStatus === 'error') && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white">
                        <Activity className="w-6 h-6 animate-spin mx-auto text-gray-300 mb-2" />
                        <p className="font-bangers text-gray-400 text-[9px] tracking-widest uppercase">
                            {imgStatus === 'error' ? `RETRIEVING ART (${retryCount}/${MAX_RETRIES})` : 'SKETCHING SCENE...'}
                        </p>
                    </div>
                )}

                <img
                    src={currentImgUrl}
                    alt={`Panel ${panel.panel_order}`}
                    className={cn(
                        "absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105",
                        imgStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
                    )}
                    onLoad={() => setImgStatus('loaded')}
                    onError={() => setImgStatus('error')}
                />

                {/* Halftone & Grain Overlay */}
                <div className="absolute inset-0 mix-blend-overlay opacity-[0.08] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(black 1px, transparent 0)', backgroundSize: '3px 3px' }} />
                
                {/* Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none opacity-50" />
            </div>

            {/* Narration Box - Distinctive Yellow Shape */}
            {panel.narration && (
                <div className="absolute top-1.5 left-2 max-w-[85%] bg-[#fffde7] border-[2px] border-black px-3 py-1.5 z-10 shadow-[2px_2px_0px_#000] rotate-[-0.5deg]">
                    <p className="font-comic text-[9px] leading-tight text-black uppercase tracking-tight">
                        {panel.narration}
                    </p>
                </div>
            )}

            {/* Speech Bubble - Organic Comic Shape */}
            {panel.dialogue && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[90%] min-h-[48px] bg-white border-[2.5px] border-black rounded-[20px] px-4 py-2.5 z-20 flex items-center justify-center shadow-[1px_1px_0px_#000] rotate-[1deg]">
                    {/* The Tail */}
                    <div className="absolute -bottom-[14px] left-1/3 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[16px] border-l-transparent border-r-transparent border-t-black origin-top-left -rotate-12">
                        <div className="absolute -top-[19px] -left-[5px] w-0 h-0 border-l-[5px] border-r-[5px] border-t-[14px] border-l-transparent border-r-transparent border-t-white" />
                    </div>
                    <p className="font-comic text-[10px] leading-tight text-black text-center font-bold tracking-tight">
                        {panel.dialogue.replace(/^["']|["']$/g, '')}
                    </p>
                </div>
            )}
        </div>
    )
}

// ─── Layout Presets: Variety of panel arrangements ───────────────────
const LAYOUT_PRESETS = [
    // Strict 2x2 Grid Manga Layout to match user reference image
    { grid: 'grid-cols-2 grid-rows-2', cells: ['col-span-1', 'col-span-1', 'col-span-1', 'col-span-1'] },
]

// ─── Comic Page (forwarded ref for react-pageflip) ──────────────────
const ComicPage = forwardRef<HTMLDivElement, {
    panels: ComicPanel[];
    pageNum: number;
    totalPages: number;
    styleName: string;
}>(({ panels, pageNum, totalPages, styleName }, ref) => {
    const layoutIndex = (pageNum - 1) % LAYOUT_PRESETS.length
    const layout = LAYOUT_PRESETS[layoutIndex]

    return (
        <div ref={ref} className="w-full h-full p-1 bg-black">
            <div className="w-full h-full paper-texture flex flex-col overflow-hidden comic-border">
                {/* Page Header */}
                <div className="flex justify-between items-center px-5 pt-4 pb-2 border-b-[3px] border-black shrink-0 bg-white/40">
                    <div className="font-bangers text-[10px] text-black uppercase tracking-[0.2em]">
                        {styleName} Edition — Vol. 01
                    </div>
                    <div className="font-bangers text-[10px] text-black tracking-widest">
                        PAGE {pageNum}
                    </div>
                </div>

                {/* 4-Panel Grid (2x2) */}
                <div className={cn("flex-1 grid gap-3 p-4", layout.grid)}>
                    {panels.map((p, idx) => (
                        <Panel
                            key={p.panel_order}
                            panel={p}
                            styleName={styleName}
                            layoutClass={layout.cells[idx] || 'col-span-1'}
                        />
                    ))}
                </div>

                {/* Page Footer */}
                <div className="px-5 pb-3 pt-1 border-t-[3px] border-black text-right font-comic text-[8px] text-black/40 font-bold uppercase shrink-0 bg-white/40">
                    © ARC STUDIOS COMIC FACTORY — SYSTEM ID: {Math.random().toString(36).slice(2, 9).toUpperCase()}
                </div>
            </div>
        </div>
    )
})
ComicPage.displayName = 'ComicPage'

// ─── Cover Page ─────────────────────────────────────────────────────
const CoverPage = forwardRef<HTMLDivElement, { topic: string; styleName: string; totalPages: number }>(
    ({ topic, styleName, totalPages }, ref) => (
        <div ref={ref} className="w-full h-full p-1 bg-black">
            <div className="w-full h-full paper-texture flex flex-col items-center justify-center text-center p-10 relative overflow-hidden comic-border border-r-0">
                {/* Vintage Frame */}
                <div className="absolute inset-4 border-[3px] border-black pointer-events-none" />
                <div className="absolute inset-6 border border-black/20 pointer-events-none" />

                <div className="relative z-10 w-full flex flex-col items-center">
                    <div className="bg-black text-yellow-400 font-bangers text-[10px] px-3 py-1 mb-10 tracking-[0.5em] uppercase">
                        ARC COLLECTOR&apos;S ITEM
                    </div>

                    <div className="mb-8 p-3 bg-black transform -rotate-1 shadow-[8px_8px_0px_#facc15]">
                        <BookOpen className="w-16 h-16 text-yellow-400" />
                    </div>

                    <h1 className="font-bangers text-4xl md:text-5xl text-black uppercase tracking-tight leading-[0.9] mb-8 max-w-[90%] drop-shadow-[2px_2px_0px_#facc15] transform rotate-[-1deg]">
                        {topic}
                    </h1>

                    <div className="w-32 h-1 bg-black mb-8" />

                    <div className="space-y-2">
                        <p className="font-comic text-xs text-black/60 uppercase tracking-[0.3em] font-black">
                            {styleName} EDITION
                        </p>
                        <p className="font-comic text-[10px] text-black/40 uppercase tracking-widest font-black">
                             ADAPTATION SERIES — {totalPages} PAGES
                        </p>
                    </div>
                </div>

                {/* Price Tag */}
                <div className="absolute top-10 right-10 bg-white border-2 border-black p-2 font-bangers text-black rotate-12 shadow-[3px_3px_0px_#000]">
                    <div className="text-[10px] border-b border-black/20 pb-0.5">ISSUE #01</div>
                    <div className="text-sm">25¢</div>
                </div>

                {/* Graphics */}
                <div className="absolute bottom-10 left-10 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                        <span className="text-white font-bangers text-[8px]">ARC</span>
                    </div>
                </div>
            </div>
        </div>
    )
)
CoverPage.displayName = 'CoverPage'

// ─── Back Cover ─────────────────────────────────────────────────────
const BackCover = forwardRef<HTMLDivElement, { topic: string }>(
    ({ topic }, ref) => (
        <div ref={ref} className="w-full h-full">
            <div className="w-full h-full bg-gradient-to-br from-[#0f3460] via-[#16213e] to-[#1a1a2e] flex flex-col items-center justify-center text-center p-8">
                <div className="font-bangers text-xl text-yellow-400/40 tracking-widest uppercase mb-4">
                    The End
                </div>
                <div className="w-16 h-[1px] bg-yellow-400/20 mb-6" />
                <p className="font-comic text-xs text-white/30 uppercase tracking-widest">
                    Generated by ARC Studios Comic Factory
                </p>
                <p className="font-comic text-[10px] text-white/20 mt-2">
                    Powered by NanoBanana AI
                </p>
            </div>
        </div>
    )
)
BackCover.displayName = 'BackCover'

// ─── Main Comic Reader ─────────────────────────────────────────────
export default function ComicReader() {
    const params = useParams()
    const searchParams = useSearchParams()

    const lessonId = params.id as string
    const topic = searchParams.get('topic') || 'Unknown Story'
    const styleName = searchParams.get('style') || 'american'

    const [panels, setPanels] = useState<ComicPanel[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(0)
    const bookRef = useRef<any>(null)

    useEffect(() => {
        let isMounted = true
        let retryTimer: NodeJS.Timeout

        async function fetchComic() {
            setLoading(true)
            try {
                // 1. Try DB fetch
                const res = await fetch(`/api/panels?lesson_id=${lessonId}`)
                const data = res.ok ? await res.json() : { panels: [] }

                if (data.panels && data.panels.length > 0) {
                    if (isMounted) setPanels(data.panels)
                } else {
                    // 2. Try Cache fetch
                    const cached = sessionStorage.getItem(`comic-${lessonId}`)
                    if (cached) {
                        const parsed = JSON.parse(cached)
                        if (isMounted) setPanels(parsed.panels || [])
                    } else if (lessonId && !lessonId.startsWith('temp-')) {
                        // 3. Optional: Retry after delay if DB might be slow
                        retryTimer = setTimeout(async () => {
                            const resRetry = await fetch(`/api/panels?lesson_id=${lessonId}`)
                            const dataRetry = resRetry.ok ? await resRetry.json() : { panels: [] }
                            if (isMounted && dataRetry.panels?.length > 0) {
                                setPanels(dataRetry.panels)
                            }
                        }, 3000)
                    }
                }
            } catch (e) {
                console.error('Fetch error:', e)
                const cached = sessionStorage.getItem(`comic-${lessonId}`)
                if (cached) {
                    const parsed = JSON.parse(cached)
                    if (isMounted) setPanels(parsed.panels || [])
                }
            }
            if (isMounted) setLoading(false)
        }

        if (lessonId) fetchComic()

        return () => {
            isMounted = false
            clearTimeout(retryTimer)
        }
    }, [lessonId])

    // Chunk panels into pages (strictly 4 panels per page for 2x2 layout)
    const pages: ComicPanel[][] = []
    let currentChunk: ComicPanel[] = []
    panels.forEach((p, i) => {
        currentChunk.push(p)
        const limit = 4
        if (currentChunk.length === limit || i === panels.length - 1) {
            pages.push(currentChunk)
            currentChunk = []
        }
    })

    const totalPages = pages.length

    const handleFlip = useCallback((e: any) => {
        setCurrentPage(e.data)
    }, [])

    const goNext = useCallback(() => {
        if (bookRef.current) {
            bookRef.current.pageFlip().flipNext()
        }
    }, [])

    const goPrev = useCallback(() => {
        if (bookRef.current) {
            bookRef.current.pageFlip().flipPrev()
        }
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-yellow-400 animate-spin mx-auto mb-4" />
                    <p className="font-bangers text-yellow-400/60 text-lg tracking-widest">
                        PREPARING YOUR COMIC...
                    </p>
                </div>
            </div>
        )
    }

    if (!panels.length) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
                <ImageOff className="w-16 h-16 text-white/20 mb-4" />
                <h1 className="font-bangers text-2xl tracking-widest text-white/40">NO COMIC FOUND</h1>
                <Link href="/comics" className="mt-8 text-yellow-400 hover:underline font-bangers tracking-widest text-sm">
                    RETURN TO FACTORY
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-hidden flex flex-col font-sans">
            <style dangerouslySetInnerHTML={{ __html: COMIC_STYLES_CSS }} />

            {/* Top Navigation Bar - Stark Aesthetic */}
            <div className="h-16 border-b border-white/10 bg-black/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-50">
                <Link href="/comics" className="flex items-center gap-3 text-white/40 hover:text-white transition-all group">
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-arc-neon transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </div>
                    <span className="font-bangers text-[10px] tracking-[0.4em] uppercase hidden sm:inline">TERMINATE FACTORY</span>
                </Link>
                <div className="text-center group">
                    <div className="flex items-center justify-center gap-2 mb-0.5">
                        <Activity className="w-3 h-3 text-arc-neon animate-pulse" />
                        <span className="font-display text-[8px] tracking-[0.6em] text-white/30 uppercase">Immersive Module Active</span>
                    </div>
                    <h1 className="font-bangers text-xl tracking-widest text-white group-hover:text-arc-neon transition-colors uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                        {topic}
                    </h1>
                </div>
                <div className="flex items-center gap-6">
                    <div className="font-bangers text-sm text-arc-neon/60 tracking-[0.3em]">
                        {currentPage + 1} / {totalPages + 2}
                    </div>
                </div>
            </div>

            {/* Flipbook Area */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden p-4 sm:p-8"
                style={{
                    background: 'radial-gradient(circle at center, #111 0%, #000 100%)',
                }}
            >
                {/* Visual Glow */}
                <div className="absolute inset-0 bg-arc-neon/5 opacity-20 pointer-events-none" />

                {/* @ts-ignore */}
                <HTMLFlipBook
                    ref={bookRef}
                    width={450}
                    height={630}
                    size="stretch"
                    minWidth={300}
                    maxWidth={800}
                    minHeight={420}
                    maxHeight={1120}
                    showCover={true}
                    drawShadow={true}
                    flippingTime={1000}
                    usePortrait={false}
                    startZIndex={0}
                    autoSize={true}
                    maxShadowOpacity={0.8}
                    mobileScrollSupport={true}
                    clickEventForward={false}
                    useMouseEvents={true}
                    swipeDistance={15}
                    showPageCorners={true}
                    disableFlipByClick={false}
                    onFlip={handleFlip}
                    className="shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                    style={{}}
                    startPage={0}
                >
                    {/* Cover */}
                    <CoverPage topic={topic} styleName={styleName} totalPages={totalPages} />

                    {/* Content Pages */}
                    {pages.map((pagePanels, idx) => (
                        <ComicPage
                            key={idx}
                            panels={pagePanels}
                            pageNum={idx + 1}
                            totalPages={totalPages}
                            styleName={styleName}
                        />
                    ))}

                    {/* Back Cover */}
                    <BackCover topic={topic} />
                </HTMLFlipBook>
            </div>

            {/* Bottom Navigation - Heavy Hardware Look */}
            <div className="h-24 bg-black/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-10 shrink-0 z-50">
                {/* Previous — Bottom Left */}
                <button
                    onClick={goPrev}
                    disabled={currentPage === 0}
                    className="flex items-center gap-4 px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-arc-neon hover:text-black hover:shadow-aura disabled:opacity-5 disabled:pointer-events-none transition-all group font-bangers tracking-[0.3em] uppercase text-xs"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="hidden md:inline">SEQUENCE PREV</span>
                </button>

                {/* Page Indicator - Heavy Rectangles */}
                <div className="hidden lg:flex gap-3">
                    {Array.from({ length: totalPages + 2 }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-12 h-1.5 transition-all duration-500",
                                i === currentPage
                                    ? "bg-arc-neon shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-y-125"
                                    : i < currentPage ? "bg-arc-neon/30" : "bg-white/10"
                            )}
                        />
                    ))}
                </div>

                {/* Mobile Page Indicator */}
                <div className="lg:hidden font-bangers text-arc-neon text-lg">
                    {currentPage + 1} / {totalPages + 2}
                </div>

                {/* Next — Bottom Right */}
                <button
                    onClick={goNext}
                    disabled={currentPage >= totalPages + 1}
                    className="flex items-center gap-4 px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-arc-neon hover:text-black hover:shadow-aura disabled:opacity-5 disabled:pointer-events-none transition-all group font-bangers tracking-[0.3em] uppercase text-xs"
                >
                    <span className="hidden md:inline">SEQUENCE NEXT</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    )
}
