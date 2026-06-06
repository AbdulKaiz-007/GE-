'use client'

import { useState, useEffect } from 'react'
import { Activity, FunctionSquare, ZoomIn, ZoomOut, RefreshCw, Layers, Box, Grid } from 'lucide-react'
import { cn } from '@/lib/game-engine'

type Mode = '2d' | '3d'

// ─── 3D ISOMETRIC PROJECTION ENGINE ───
const ISO_ANGLE = 30 * (Math.PI / 180)
const ISO_SCALE = 28

function project3D(x: number, y: number, z: number): [number, number] {
    // Standard isometric projection from 3D to 2D screen space
    const screenX = (x - y) * Math.cos(ISO_ANGLE) * ISO_SCALE
    const screenY = (x + y) * Math.sin(ISO_ANGLE) * ISO_SCALE - z * ISO_SCALE * 0.8
    return [screenX, screenY]
}

// ─── 3D SURFACE PRESETS ───
const SURFACE_PRESETS_3D = [
    {
        id: 'hyp_paraboloid',
        label: 'Hyperbolic Paraboloid',
        formula: 'z = x²/a² − y²/b²',
        fn: (x: number, y: number) => (x * x / 4) - (y * y / 4),
        color: '#ec4899'
    },
    {
        id: 'sine_wave',
        label: '3D Sine Surface',
        formula: 'z = sin(√(x²+y²))',
        fn: (x: number, y: number) => Math.sin(Math.sqrt(x * x + y * y)),
        color: '#6366f1'
    },
    {
        id: 'paraboloid',
        label: 'Elliptic Paraboloid',
        formula: 'z = x² + y²',
        fn: (x: number, y: number) => (x * x + y * y) / 8,
        color: '#00e5ff'
    },
    {
        id: 'cos_xy',
        label: 'Cosine Wave',
        formula: 'z = cos(x) · cos(y)',
        fn: (x: number, y: number) => Math.cos(x) * Math.cos(y),
        color: '#f97316'
    },
    {
        id: 'ripple',
        label: 'Ripple Surface',
        formula: 'z = sin(x) + cos(y)',
        fn: (x: number, y: number) => (Math.sin(x) + Math.cos(y)) * 1.5,
        color: '#10b981'
    }
]

// ─── 2D PRESETS ───
const PRESETS_2D = ['x^2', 'sin(x)', 'cos(x)*x', 'sqrt(abs(x))', 'tan(x)', 'e^(-x^2)*10', 'x^3 - 4*x', 'log(abs(x)+1)']

function parseInput(raw: string) {
    let parsed = raw.toLowerCase()
    const funcs = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'exp', 'sqrt', 'abs']
    funcs.forEach(f => {
        parsed = parsed.replace(new RegExp(`\\b${f}\\b`, 'g'), `Math.${f === 'ln' ? 'log' : f}`)
    })
    parsed = parsed.replace(/\bpi\b/g, 'Math.PI').replace(/\be\b/g, 'Math.E').replace(/\^/g, '**')
    return parsed
}

export default function MathPlotterLab({ topic }: { topic: string }) {
    const [mode, setMode] = useState<Mode>('2d')

    // ── 2D State ──
    const [equation, setEquation] = useState('Math.sin(x)')
    const [inputVal, setInputVal] = useState('sin(x)')
    const [zoom, setZoom] = useState(10)
    const [error2d, setError2d] = useState<string | null>(null)
    const [points, setPoints] = useState<{ x: number; y: number }[]>([])
    const [isCalc, setIsCalc] = useState(false)

    // ── 3D State ──
    const [surface, setSurface] = useState(SURFACE_PRESETS_3D[0])
    const [meshData, setMeshData] = useState<{ paths: string[], colors: string[] }>({ paths: [], colors: [] })
    const [isBuilding, setIsBuilding] = useState(false)

    // ── 2D Effect ──
    useEffect(() => {
        if (mode !== '2d') return
        setIsCalc(true); setError2d(null)
        const t = setTimeout(() => {
            const newPoints: { x: number; y: number }[] = []
            const step = (zoom * 2) / 200
            try {
                const fn = new Function('x', `return ${equation}`); fn(0)
                for (let i = 0; i <= 200; i++) {
                    const x = -zoom + i * step
                    const y = fn(x)
                    if (Number.isFinite(y)) newPoints.push({ x, y })
                }
                setPoints(newPoints)
            } catch (e) { setError2d(e instanceof Error ? e.message : 'Invalid expression'); setPoints([]) }
            setIsCalc(false)
        }, 300)
        return () => clearTimeout(t)
    }, [equation, zoom, mode])

    // ── 3D Effect ──
    useEffect(() => {
        if (mode !== '3d') return
        setIsBuilding(true)
        const t = setTimeout(() => {
            const res = 18
            const range = 3.5
            const step = (range * 2) / res
            const facePaths: string[] = []
            const faceColors: string[] = []
            const faces: { screenY: number; path: string; color: string }[] = []

            for (let xi = 0; xi < res; xi++) {
                for (let yi = 0; yi < res; yi++) {
                    const x = -range + xi * step
                    const y = -range + yi * step
                    const x2 = x + step
                    const y2 = y + step
                    const z00 = surface.fn(x, y)
                    const z10 = surface.fn(x2, y)
                    const z01 = surface.fn(x, y2)
                    const z11 = surface.fn(x2, y2)

                    const [sx00, sy00] = project3D(x, y, z00)
                    const [sx10, sy10] = project3D(x2, y, z10)
                    const [sx11, sy11] = project3D(x2, y2, z11)
                    const [sx01, sy01] = project3D(x, y2, z01)

                    const avgZ = (z00 + z10 + z01 + z11) / 4
                    // Simple depth sort by avg screen Y + Z
                    const sortKey = (sy00 + sy10 + sy11 + sy01) / 4

                    const d = `M${sx00.toFixed(1)},${sy00.toFixed(1)} L${sx10.toFixed(1)},${sy10.toFixed(1)} L${sx11.toFixed(1)},${sy11.toFixed(1)} L${sx01.toFixed(1)},${sy01.toFixed(1)} Z`

                    // Depth-based opacity: higher Z = brighter
                    const t = Math.min(1, Math.max(0, (avgZ + 3) / 6))
                    const alpha = (0.15 + t * 0.6).toFixed(2)
                    faces.push({ screenY: sortKey, path: d, color: `${surface.color}${Math.round(parseFloat(alpha) * 255).toString(16).padStart(2, '0')}` })
                }
            }
            // Painter's algorithm: sort by screenY (far to near)
            faces.sort((a, b) => a.screenY - b.screenY)
            setMeshData({ paths: faces.map(f => f.path), colors: faces.map(f => f.color) })
            setIsBuilding(false)
        }, 400)
        return () => clearTimeout(t)
    }, [surface, mode])

    // ── 2D Render helpers ──
    const svgW = 800, svgH = 500
    const mapPoint = (x: number, y: number) => ({
        mappedX: ((x + zoom) / (zoom * 2)) * svgW,
        mappedY: svgH - ((y + zoom) / (zoom * 2)) * svgH
    })
    const pathD = points.map((p, i) => {
        const { mappedX, mappedY } = mapPoint(p.x, p.y)
        return `${i === 0 ? 'M' : 'L'} ${mappedX.toFixed(1)} ${mappedY.toFixed(1)}`
    }).join(' ')
    const origin = mapPoint(0, 0)
    const gridLines = []
    const gridStep = zoom <= 5 ? 1 : zoom <= 20 ? 2 : 5
    for (let i = -Math.ceil(zoom); i <= Math.ceil(zoom); i += gridStep) {
        if (i === 0) continue
        const pos = mapPoint(i, i)
        gridLines.push(<line key={`v${i}`} x1={pos.mappedX} y1={0} x2={pos.mappedX} y2={svgH} stroke="rgba(255,255,255,0.04)" />)
        gridLines.push(<line key={`h${i}`} x1={0} y1={pos.mappedY} x2={svgW} y2={pos.mappedY} stroke="rgba(255,255,255,0.04)" />)
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 min-h-[700px]">
            <div className="xl:col-span-2 space-y-6">
                {/* HUD Header */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center glass-card bg-black/40 border-white/10 p-4">
                    <div className="flex items-center gap-3">
                        <FunctionSquare className="w-5 h-5 text-pink-500 animate-pulse" />
                        <span className="font-display text-xs text-pink-500 tracking-[0.4em] uppercase">CARTESIAN MATRIX v4.0</span>
                    </div>
                    {/* Mode Toggle */}
                    <div className="flex gap-2">
                        <button onClick={() => setMode('2d')} className={cn("px-4 py-2 text-[9px] font-display uppercase tracking-widest border transition-colors flex items-center gap-2", mode === '2d' ? "border-pink-500 bg-pink-500/10 text-pink-500" : "border-white/10 text-white/40 hover:border-white/20")}>
                            <Grid className="w-3 h-3" /> 2D Mode
                        </button>
                        <button onClick={() => setMode('3d')} className={cn("px-4 py-2 text-[9px] font-display uppercase tracking-widest border transition-colors flex items-center gap-2", mode === '3d' ? "border-pink-500 bg-pink-500/10 text-pink-500" : "border-white/10 text-white/40 hover:border-white/20")}>
                            <Box className="w-3 h-3" /> 3D Surfaces
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="glass-card bg-black/40 border-white/10 relative overflow-hidden h-[500px]">
                    <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at center, rgba(236, 72, 153, 0.05) 0%, transparent 70%)` }} />

                    {(isCalc || isBuilding) && (
                        <div className="absolute top-4 left-4 z-20 glass-card bg-pink-500/10 border-pink-500/30 px-4 py-2 text-[9px] font-display tracking-widest text-pink-500 uppercase animate-pulse flex items-center gap-3">
                            <Layers className="w-4 h-4" />{mode === '3d' ? 'BUILDING SURFACE MESH...' : 'RECALCULATING VECTORS...'}
                        </div>
                    )}

                    {/* ── 2D VIEW ── */}
                    {mode === '2d' && (
                        <div className="w-full h-full p-4">
                            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                                <g>{gridLines}</g>
                                <line x1={0} y1={origin.mappedY} x2={svgW} y2={origin.mappedY} stroke="rgba(255,255,255,0.2)" />
                                <line x1={origin.mappedX} y1={0} x2={origin.mappedX} y2={svgH} stroke="rgba(255,255,255,0.2)" />
                                {!error2d && pathD && (
                                    <path d={pathD} fill="none" stroke="#ec4899" strokeWidth={2}
                                        style={{ strokeDasharray: 5000, strokeDashoffset: isCalc ? 5000 : 0, transition: 'stroke-dashoffset 1.8s ease-out' }} />
                                )}
                                {error2d && <text x={svgW / 2} y={svgH / 2} textAnchor="middle" className="fill-pink-500" fontSize={14}>Syntax Error</text>}
                            </svg>
                        </div>
                    )}

                    {/* ── 3D VIEW ── */}
                    {mode === '3d' && !isBuilding && (
                        <div className="w-full h-full flex items-center justify-center p-4">
                            <svg viewBox="-220 -180 440 360" className="w-full h-full">
                                {/* Axes */}
                                <line x1={-150} y1={0} x2={150} y2={0} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                                <line x1={0} y1={-150} x2={0} y2={150} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                                {meshData.paths.map((d, i) => (
                                    <path key={i} d={d} fill={meshData.colors[i]} stroke={surface.color} strokeWidth={0.3} strokeOpacity={0.5} />
                                ))}
                            </svg>
                        </div>
                    )}

                    {mode === '2d' && (
                        <div className="absolute bottom-4 right-4 z-20 flex gap-2 opacity-50 hover:opacity-100 transition-opacity">
                            <button onClick={() => setZoom(z => Math.max(z / 2, 1))} className="w-8 h-8 glass-card bg-black/60 border-white/10 flex items-center justify-center hover:border-pink-500 hover:text-pink-500 transition-colors"><ZoomIn className="w-4 h-4" /></button>
                            <button onClick={() => setZoom(z => Math.min(z * 2, 100))} className="w-8 h-8 glass-card bg-black/60 border-white/10 flex items-center justify-center hover:border-pink-500 hover:text-pink-500 transition-colors"><ZoomOut className="w-4 h-4" /></button>
                            <button onClick={() => setZoom(10)} className="w-8 h-8 glass-card bg-black/60 border-white/10 flex items-center justify-center hover:border-white transition-colors"><RefreshCw className="w-4 h-4" /></button>
                        </div>
                    )}
                </div>
            </div>

            {/* Control Panel */}
            <div className="space-y-6">
                <div className="glass-card bg-black/40 border-white/10 p-6 space-y-6 relative overflow-hidden">
                    {mode === '2d' ? (
                        <>
                            <div className="font-display text-[10px] text-white/40 tracking-[0.4em] uppercase pb-4 border-b border-white/10">2D EQUATION INPUT</div>
                            <form onSubmit={(e) => { e.preventDefault(); setEquation(parseInput(inputVal)) }} className="space-y-3">
                                <div className="flex gap-2">
                                    <span className="bg-white/5 text-white/50 border border-white/10 font-mono text-sm px-3 py-3">y =</span>
                                    <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)}
                                        placeholder="e.g. sin(x), x^2" className="w-full bg-black/40 border border-white/10 text-white font-mono text-sm px-4 py-3 focus:border-pink-500 outline-none transition-colors" />
                                </div>
                                <button type="submit" className="w-full py-3 bg-pink-500/10 border border-pink-500/30 text-[9px] font-display tracking-widest text-pink-500 uppercase hover:bg-pink-500/20 transition-colors">
                                    Plot Equation
                                </button>
                            </form>
                            <div className="space-y-2 pt-4 border-t border-white/10">
                                <div className="text-[9px] font-display tracking-widest text-white/40 uppercase mb-3">Presets</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {PRESETS_2D.map(preset => (
                                        <button key={preset} onClick={() => { setInputVal(preset); setEquation(parseInput(preset)) }}
                                            className="p-2 border border-white/5 text-[10px] font-mono text-white/60 hover:border-pink-500/50 hover:text-pink-500 transition-colors bg-white/5 text-left">
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="font-display text-[10px] text-white/40 tracking-[0.4em] uppercase pb-4 border-b border-white/10">3D SURFACE PRESETS</div>
                            <div className="space-y-3">
                                {SURFACE_PRESETS_3D.map(s => (
                                    <button key={s.id} onClick={() => setSurface(s)}
                                        className={cn("w-full text-left p-4 border transition-all space-y-1", surface.id === s.id ? "border-pink-500 bg-pink-500/10" : "border-white/5 bg-black/40 hover:border-white/20")}>
                                        <div className={cn("font-display text-[10px] uppercase tracking-widest", surface.id === s.id ? "text-pink-500" : "text-white/70")}>{s.label}</div>
                                        <div className="font-mono text-[9px] text-white/40">{s.formula}</div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                    <div className="pt-4 border-t border-white/10 opacity-40 space-y-1">
                        <Activity className="w-3 h-3 text-white" />
                        <p className="font-mono text-[8px] text-white/40">ARC Isometric 3D Engine with Painter&apos;s Algorithm depth sorting.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
