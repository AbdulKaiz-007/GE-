'use client'

import { useState, useEffect } from 'react'
import { Beaker, Search, RefreshCw, AlertCircle, Zap } from 'lucide-react'
import { cn } from '@/lib/game-engine'

// Element Types
type ElementType = 'H' | 'O' | 'C' | 'N' | 'Unknown'

const ElementData: Record<ElementType, { color: string, radius: number, name: string }> = {
    'H': { color: 'white', radius: 10, name: 'Hydrogen' },
    'O': { color: 'orange-500', radius: 16, name: 'Oxygen' },
    'C': { color: 'zinc-400', radius: 18, name: 'Carbon' },
    'N': { color: 'blue-500', radius: 17, name: 'Nitrogen' },
    'Unknown': { color: 'sony-violet', radius: 15, name: 'Unknown' }
}

// Pre-defined molecular structures (Positioned on a 100x100 relative grid)
const MOLECULES = [
    {
        id: 'h2o',
        name: 'Water',
        formula: 'H₂O',
        desc: 'A polar inorganic compound that is at room temperature a tasteless and odorless liquid.',
        atoms: [
            { id: 'o1', type: 'O' as ElementType, x: 50, y: 40 },
            { id: 'h1', type: 'H' as ElementType, x: 30, y: 65 },
            { id: 'h2', type: 'H' as ElementType, x: 70, y: 65 },
        ],
        bonds: [
            { source: 'o1', target: 'h1', type: 'single' },
            { source: 'o1', target: 'h2', type: 'single' }
        ]
    },
    {
        id: 'co2',
        name: 'Carbon Dioxide',
        formula: 'CO₂',
        desc: 'A colorless gas with a density about 53% higher than that of dry air. Vital for plant life.',
        atoms: [
            { id: 'o1', type: 'O' as ElementType, x: 20, y: 50 },
            { id: 'c1', type: 'C' as ElementType, x: 50, y: 50 },
            { id: 'o2', type: 'O' as ElementType, x: 80, y: 50 },
        ],
        bonds: [
            { source: 'c1', target: 'o1', type: 'double' },
            { source: 'c1', target: 'o2', type: 'double' }
        ]
    },
    {
        id: 'ch4',
        name: 'Methane',
        formula: 'CH₄',
        desc: 'The simplest alkane and the main component of natural gas.',
        atoms: [
            { id: 'c1', type: 'C' as ElementType, x: 50, y: 50 },
            { id: 'h1', type: 'H' as ElementType, x: 50, y: 20 }, // Top
            { id: 'h2', type: 'H' as ElementType, x: 20, y: 65 }, // Bottom Left
            { id: 'h3', type: 'H' as ElementType, x: 80, y: 65 }, // Bottom Right
            { id: 'h4', type: 'H' as ElementType, x: 50, y: 80 }, // Center-Bottom (3D effect)
        ],
        bonds: [
            { source: 'c1', target: 'h1', type: 'single' },
            { source: 'c1', target: 'h2', type: 'single' },
            { source: 'c1', target: 'h3', type: 'single' },
            { source: 'c1', target: 'h4', type: 'single' }
        ]
    },
    {
        id: 'nh3',
        name: 'Ammonia',
        formula: 'NH₃',
        desc: 'A colorless gas with a distinct pungent smell, commonly used in fertilizer.',
        atoms: [
            { id: 'n1', type: 'N' as ElementType, x: 50, y: 40 },
            { id: 'h1', type: 'H' as ElementType, x: 25, y: 70 },
            { id: 'h2', type: 'H' as ElementType, x: 75, y: 70 },
            { id: 'h3', type: 'H' as ElementType, x: 50, y: 85 },
        ],
        bonds: [
            { source: 'n1', target: 'h1', type: 'single' },
            { source: 'n1', target: 'h2', type: 'single' },
            { source: 'n1', target: 'h3', type: 'single' }
        ]
    }
]

export default function ChemistryLab({ topic }: { topic: string }) {
    const [activeMol, setActiveMol] = useState(MOLECULES[0])
    const [selectedAtom, setSelectedAtom] = useState<string | null>(null)
    const [isSimulating, setIsSimulating] = useState(true)

    useEffect(() => {
        setIsSimulating(true)
        setSelectedAtom(null)
        const timer = setTimeout(() => setIsSimulating(false), 800)
        return () => clearTimeout(timer)
    }, [activeMol])

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 min-h-[700px]">
            {/* Visualizer Canvas Area */}
            <div className="xl:col-span-2 space-y-6">
                
                {/* HUD Header */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center glass-card bg-black/40 border-white/10 p-4">
                    <div className="flex items-center gap-3">
                        <Beaker className="w-5 h-5 text-orange-500 animate-pulse" />
                        <span className="font-display text-xs text-orange-500 tracking-[0.4em] uppercase">MOLECULAR SYNTHESIS v1.0</span>
                    </div>
                    
                    <div className="flex gap-8 items-center bg-black/40 border border-white/5 rounded-sm px-6 py-2">
                        <div className="text-center">
                            <div className="font-display text-2xl text-white tracking-widest">{activeMol.formula}</div>
                            <div className="font-display text-[8px] text-orange-500 tracking-[0.3em] uppercase">Active Compound</div>
                        </div>
                    </div>
                </div>

                {/* Main Graph Area */}
                <div className="glass-card bg-black/40 border-white/10 relative overflow-hidden h-[500px]">
                    <div className="absolute inset-0 bg-[url('/bg-noise.png')] opacity-10 pointer-events-none" />
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(249, 115, 22, 0.05) 0%, transparent 70%)'}}></div>
                    
                    {isSimulating && (
                        <div className="absolute top-4 left-4 z-20 glass-card bg-orange-500/10 border-orange-500/30 px-4 py-2 text-[9px] font-display tracking-widest text-orange-500 uppercase animate-pulse shadow-aura flex items-center gap-3">
                            <Zap className="w-4 h-4" /> FORMING ATOMIC BONDS...
                        </div>
                    )}

                    {!isSimulating && (
                        <div className="absolute inset-0 pt-10 px-10">
                            <svg className="w-full h-full overflow-visible">
                                {/* Bonds Layer */}
                                {activeMol.bonds.map((bond, i) => {
                                    const source = activeMol.atoms.find(a => a.id === bond.source)
                                    const target = activeMol.atoms.find(a => a.id === bond.target)
                                    if (!source || !target) return null
                                    
                                    const isDouble = bond.type === 'double'
                                    const isActive = selectedAtom === source.id || selectedAtom === target.id
                                    
                                    return (
                                        <g key={`bond-${i}`}>
                                            <line
                                                x1={`${source.x}%`} y1={`${source.y}%`}
                                                x2={`${target.x}%`} y2={`${target.y}%`}
                                                className={cn(
                                                    "stroke-white/20 transition-all duration-500",
                                                    isDouble ? "stroke-[8px]" : "stroke-[4px]",
                                                    isActive ? "stroke-orange-500/50" : ""
                                                )}
                                            />
                                            {isDouble && (
                                                <line
                                                    x1={`${source.x}%`} y1={`${source.y}%`}
                                                    x2={`${target.x}%`} y2={`${target.y}%`}
                                                    className="stroke-black stroke-[4px]"
                                                />
                                            )}
                                        </g>
                                    )
                                })}

                                {/* Atoms Layer */}
                                {activeMol.atoms.map((atom) => {
                                    const data = ElementData[atom.type] || ElementData['Unknown']
                                    const isActive = selectedAtom === atom.id
                                    return (
                                        <g key={atom.id} onClick={() => setSelectedAtom(atom.id)} className="cursor-pointer group">
                                            {/* Glow effect */}
                                            <circle
                                                cx={`${atom.x}%`} cy={`${atom.y}%`}
                                                r={data.radius + (isActive ? 15 : 8)}
                                                className={cn(
                                                    `fill-${data.color}/10 transition-all duration-300`,
                                                    isActive && "animate-pulse fill-orange-500/20"
                                                )}
                                            />
                                            {/* Core Atom */}
                                            <circle
                                                cx={`${atom.x}%`} cy={`${atom.y}%`}
                                                r={data.radius}
                                                className={cn(
                                                    "stroke-2 transition-all duration-300",
                                                    `fill-black stroke-${data.color}`,
                                                    isActive ? `stroke-orange-500 shadow-glow` : `group-hover:stroke-${data.color}`
                                                )}
                                            />
                                            {/* Element Text */}
                                            <text
                                                x={`${atom.x}%`} y={`${atom.y}%`}
                                                alignmentBaseline="middle" textAnchor="middle"
                                                className={cn(
                                                    "font-display text-sm tracking-widest fill-white/80 transition-colors pointer-events-none select-none",
                                                    isActive && "fill-orange-500"
                                                )}
                                            >
                                                {atom.type}
                                            </text>
                                        </g>
                                    )
                                })}
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            {/* Control Panel */}
            <div className="space-y-6 flex flex-col h-full lg:max-h-[700px]">
                {/* Compound Selection */}
                <div className="glass-card bg-black/40 border-white/10 p-6 space-y-6 flex-shrink-0 relative overflow-hidden">
                    <div className="font-display text-[10px] text-white/40 tracking-[0.4em] uppercase pb-4 border-b border-white/10 flex justify-between items-center">
                        <span>COMPOUND LIBRARY</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {MOLECULES.map(mol => (
                            <button
                                key={mol.id}
                                onClick={() => setActiveMol(mol)}
                                disabled={isSimulating}
                                className={cn(
                                    "p-3 border text-left flex flex-col gap-1 transition-all group",
                                    activeMol.id === mol.id 
                                        ? "border-orange-500 bg-orange-500/10" 
                                        : "border-white/5 bg-black/40 hover:border-white/20"
                                )}
                            >
                                <span className={cn(
                                    "font-display text-xs tracking-widest uppercase",
                                    activeMol.id === mol.id ? "text-orange-500" : "text-white/70"
                                )}>
                                    {mol.formula}
                                </span>
                                <span className="font-mono text-[9px] text-white/40 truncate w-full">{mol.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-white/10 space-y-2 text-white/60 text-xs font-mono leading-relaxed">
                        <strong className="text-orange-500 font-display uppercase tracking-widest block mb-2">{activeMol.name}</strong>
                        {activeMol.desc}
                    </div>
                </div>

                {/* Atom Inspector Log */}
                <div className="glass-card bg-black/60 border-white/10 p-6 flex-1 min-h-[200px] flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Search className="w-24 h-24" />
                    </div>
                    <div className="font-display text-[10px] text-white/40 tracking-[0.4em] uppercase pb-4 border-b border-white/10 z-10">
                        ELEMENT INSPECTOR
                    </div>
                    
                    {!selectedAtom ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center text-white/20 z-10">
                            <p className="font-display text-[9px] tracking-[0.5em] uppercase">AWAITING ELEMENT SELECTION</p>
                            <p className="font-mono text-[9px]">Click an atom in the visualizer to inspect properties.</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col mt-4 z-10 animate-motion-blur-in">
                            {(() => {
                                const atom = activeMol.atoms.find(a => a.id === selectedAtom)
                                const data = atom ? ElementData[atom.type] : null
                                if (!atom || !data) return null
                                
                                return (
                                    <>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 flex items-center justify-center border border-orange-500 text-orange-500 font-display text-xl bg-orange-500/10 rounded-full">
                                                {atom.type}
                                            </div>
                                            <div>
                                                <h3 className="font-display tracking-[0.2em] text-white uppercase">{data.name}</h3>
                                                <span className="font-mono text-[9px] text-orange-500 uppercase tracking-widest">Atomic Node Located</span>
                                            </div>
                                        </div>
                                        <ul className="space-y-4 text-white/60 font-sans text-sm leading-relaxed bg-black/40 border border-white/5 p-4 flex-1">
                                            <li><strong className="text-white font-display text-[10px] uppercase tracking-widest">Bonding Phase:</strong> Stable in current structural configuration.</li>
                                            <li><strong className="text-white font-display text-[10px] uppercase tracking-widest">Coordinates:</strong> [{atom.x.toFixed(2)}, {atom.y.toFixed(2)}] relative matrix mapping.</li>
                                            <li><strong className="text-orange-500 font-display text-[10px] uppercase tracking-widest">Analysis:</strong> Integral element to forming {activeMol.formula}.</li>
                                        </ul>
                                    </>
                                )
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
