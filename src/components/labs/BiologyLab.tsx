'use client'

import { useState } from 'react'
import { Leaf, Search, Activity, ShieldAlert, Cpu, Dna, Microscope } from 'lucide-react'
import { cn } from '@/lib/game-engine'

// ─── ANIMAL CELL ORGANELLES ───
const ANIMAL_CELL = [
    { id: 'nucleus', name: 'Nucleus', desc: 'The control center of the cell, housing the master DNA blueprint. Regulates gene expression and orchestrates cellular replication.', stats: { output: 'Genetic Instructions', vulnerability: 'Critical - High Security', efficiency: '100%' } },
    { id: 'mitochondria', name: 'Mitochondrion', desc: 'Primary energy reactor. Generates ATP through oxidative phosphorylation, powering all metabolic operations.', stats: { output: 'ATP Energy', vulnerability: 'Monitored', efficiency: '92%' } },
    { id: 'golgi', name: 'Golgi Apparatus', desc: 'The logistics hub. Modifies, sorts, and routes proteins and lipids to their designated biological coordinates.', stats: { output: 'Protein Vesicles', vulnerability: 'Minimal', efficiency: '98%' } },
    { id: 'er', name: 'Endoplasmic Reticulum', desc: 'A vast manufacturing network. Rough ER synthesizes proteins, while smooth ER handles lipid production and detoxification.', stats: { output: 'Proteins & Lipids', vulnerability: 'Low', efficiency: '85%' } },
    { id: 'membrane', name: 'Plasma Membrane', desc: 'The exterior firewall. Composed of a phospholipid bilayer, controls nutrient flow and defends against external threats.', stats: { output: 'Filtration', vulnerability: 'Under constant assault', efficiency: 'Dynamic' } }
]

// ─── PLANT CELL ORGANELLES ───
const PLANT_CELL = [
    { id: 'cell_wall', name: 'Cell Wall', desc: 'A rigid structural envelope made of cellulose microfibrils. Provides mechanical support, shape, and protection beyond the plasma membrane.', stats: { output: 'Structural Integrity', vulnerability: 'Impervious', efficiency: '100%' } },
    { id: 'chloroplast', name: 'Chloroplast', desc: 'The solar energy factory. Harnesses photons from sunlight to drive photosynthesis, converting CO₂ and H₂O into glucose and oxygen.', stats: { output: 'Glucose & O₂', vulnerability: 'UV Sensitive', efficiency: '30% (Solar Converts)' } },
    { id: 'vacuole', name: 'Central Vacuole', desc: 'A large fluid-filled storage reservoir occupying up to 90% of the cell volume. Maintains turgor pressure and stores nutrients, waste, and pigments.', stats: { output: 'Structural Pressure', vulnerability: 'Osmotic Stress', efficiency: 'Passive' } },
    { id: 'nucleus_p', name: 'Nucleus', desc: 'Identical to animal cells, the nucleus is the master DNA library. Coordinates all cellular functions through transcription and replication.', stats: { output: 'Genetic Instructions', vulnerability: 'Critical', efficiency: '100%' } },
    { id: 'membrane_p', name: 'Plasma Membrane', desc: 'Lies just within the cell wall. A flexible selectively permeable bilayer providing the dynamic molecular gateway for the cell.', stats: { output: 'Ion Transport', vulnerability: 'Medium', efficiency: 'Dynamic' } }
]

// ─── REPRODUCTIVE SYSTEMS ───
const REPRODUCTIVE = [
    { id: 'anther', name: 'Anther (Stamen)', desc: 'The male reproductive organ of a flowering plant. Produces and releases pollen grains, which contain the male gametophytes.', stats: { output: 'Pollen / Gametes', vulnerability: 'Wind & Insect Exposure', efficiency: 'Seasonal' } },
    { id: 'stigma', name: 'Stigma (Pistil)', desc: 'The sticky apex of the female reproductive organ (pistil). Captures pollen during fertilization, initiating the germination of the pollen tube.', stats: { output: 'Pollen Receptor', vulnerability: 'Desiccation', efficiency: 'Selective' } },
    { id: 'ovary', name: 'Ovary', desc: 'Located at the base of the pistil, the ovary houses the ovules which develop into seeds after fertilization. Matures into fruit.', stats: { output: 'Seeds / Fruit', vulnerability: 'Predation', efficiency: 'Post-Fertilization' } },
    { id: 'ovule', name: 'Ovule', desc: 'The proto-seed inside the ovary. Contains the female gametophyte (embryo sac). After fertilization by pollen, it matures into a seed.', stats: { output: 'Embryo / Seed Material', vulnerability: 'Fertilization Dependency', efficiency: 'N/A Pre-Fertilization' } },
    { id: 'petals', name: 'Petals (Corolla)', desc: 'Highly modified leaves designed for display. Their vivid colors and scent serve to attract pollinators such as bees, butterflies, and hummingbirds.', stats: { output: 'Pollinator Attraction', vulnerability: 'Mechanical Damage', efficiency: 'Species Specific' } }
]

type SpecimenType = 'animal_cell' | 'plant_cell' | 'reproductive'
const SPECIMENS: { id: SpecimenType; label: string; color: string; icon: typeof Leaf }[] = [
    { id: 'animal_cell', label: 'Animal Cell', color: 'emerald', icon: Microscope },
    { id: 'plant_cell', label: 'Plant Cell', color: 'lime', icon: Leaf },
    { id: 'reproductive', label: 'Angiosperm Reproduction', color: 'pink', icon: Dna }
]

function AnimalCellSVG({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
    const sel = (id: string) => selectedId === id
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            {/* Plasma Membrane */}
            <g onClick={() => onSelect('membrane')} className="cursor-crosshair group">
                <circle cx="50" cy="50" r="48" strokeDasharray="4 2" className={cn("fill-emerald-500/5 transition-all", sel('membrane') ? "stroke-emerald-500 stroke-[1.5] animate-pulse" : "stroke-white/10 stroke-1 group-hover:stroke-emerald-500/50")} />
            </g>
            {/* ER Waves */}
            <g onClick={() => onSelect('er')} className="cursor-crosshair group">
                <path d="M 40 20 Q 50 15, 65 25 Q 80 40, 75 60" className={cn("fill-transparent stroke-[1.5]", sel('er') ? "stroke-emerald-400" : "stroke-white/20")} />
                <path d="M 35 25 Q 50 20, 60 30 Q 75 45, 70 65" className={cn("fill-transparent stroke-[1.5]", sel('er') ? "stroke-emerald-400" : "stroke-white/20")} />
                <path d="M 30 30 Q 50 25, 55 35 Q 65 50, 60 68" className={cn("fill-transparent stroke-[1.5]", sel('er') ? "stroke-emerald-400" : "stroke-white/20")} />
            </g>
            {/* Nucleus */}
            <g onClick={() => onSelect('nucleus')} className="cursor-crosshair group">
                <circle cx="50" cy="50" r="16" className={cn("transition-all", sel('nucleus') ? "fill-emerald-500/20 stroke-emerald-500 stroke-2 animate-pulse" : "fill-black stroke-emerald-500/50 stroke-1 group-hover:stroke-emerald-500")} />
                <circle cx="50" cy="50" r="6" className={cn("", sel('nucleus') ? "fill-emerald-500" : "fill-emerald-500/40")} />
                <circle cx="50" cy="50" r="12" className="fill-transparent stroke-white/20 stroke-[0.5]" strokeDasharray="1 2" />
            </g>
            {/* Mitochondria */}
            {[{ x: 30, y: 60, rotate: 20 }, { x: 70, y: 30, rotate: -40 }, { x: 50, y: 80, rotate: 70 }].map((m, i) => (
                <g key={i} onClick={() => onSelect('mitochondria')} className="cursor-crosshair group" transform={`rotate(${m.rotate} ${m.x} ${m.y})`}>
                    <ellipse cx={m.x} cy={m.y} rx={9} ry={3.5} className={cn("transition-all", sel('mitochondria') ? "fill-emerald-500/30 stroke-emerald-500 stroke-1" : "fill-black stroke-white/30 group-hover:stroke-emerald-500")} />
                    <path d={`M ${m.x - 7} ${m.y} Q ${m.x - 4} ${m.y - 2}, ${m.x} ${m.y} T ${m.x + 7} ${m.y}`} className="fill-transparent stroke-white/40 stroke-[0.5]" />
                </g>
            ))}
            {/* Golgi */}
            <g onClick={() => onSelect('golgi')} className="cursor-crosshair group">
                {[0, 5, 10].map((offset, i) => (
                    <path key={i} d={`M ${60 + offset * 0.5} ${70 + offset} Q ${75 + i} ${75 + offset + 5}, ${80 + offset * 0.5} ${65 + offset}`} className={cn("fill-transparent stroke-[3] transition-colors", sel('golgi') ? "stroke-emerald-500" : "stroke-white/30 group-hover:stroke-emerald-500/60")} strokeLinecap="round" />
                ))}
                <circle cx="85" cy="62" r="1.5" className={cn("transition-colors", sel('golgi') ? "fill-emerald-500 animate-ping" : "fill-white/30")} />
            </g>
        </svg>
    )
}

function PlantCellSVG({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
    const sel = (id: string) => selectedId === id
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(132,204,22,0.2)]">
            {/* Cell Wall - Outer rigid rectangle */}
            <g onClick={() => onSelect('cell_wall')} className="cursor-crosshair group">
                <rect x="4" y="4" width="92" height="92" rx="4" className={cn("fill-lime-500/5 transition-all", sel('cell_wall') ? "stroke-lime-400 stroke-[2] animate-pulse" : "stroke-white/20 stroke-[2] group-hover:stroke-lime-400/50")} />
            </g>
            {/* Plasma Membrane - Inner */}
            <g onClick={() => onSelect('membrane_p')} className="cursor-crosshair group">
                <rect x="8" y="8" width="84" height="84" rx="3" className={cn("fill-transparent transition-all", sel('membrane_p') ? "stroke-lime-300 stroke-1 animate-pulse" : "stroke-white/10 stroke-[0.5] stroke-dasharray-[2,2] group-hover:stroke-lime-300/50")} />
            </g>
            {/* Central Vacuole */}
            <g onClick={() => onSelect('vacuole')} className="cursor-crosshair group">
                <ellipse cx="50" cy="55" rx="28" ry="26" className={cn("transition-all", sel('vacuole') ? "fill-lime-500/10 stroke-lime-500 stroke-1" : "fill-lime-500/5 stroke-white/10 stroke-[0.5] group-hover:stroke-lime-500/40")} />
                <text x="50" y="55" textAnchor="middle" fontSize="4" className="fill-white/20 pointer-events-none">VACUOLE</text>
            </g>
            {/* Chloroplasts */}
            {[{ x: 18, y: 25 }, { x: 78, y: 20 }, { x: 20, y: 70 }, { x: 82, y: 72 }].map((c, i) => (
                <g key={i} onClick={() => onSelect('chloroplast')} className="cursor-crosshair group">
                    <ellipse cx={c.x} cy={c.y} rx={8} ry={4} className={cn("transition-all", sel('chloroplast') ? "fill-lime-500/40 stroke-lime-500 stroke-1" : "fill-lime-900/60 stroke-lime-500/60 stroke-[0.5] group-hover:stroke-lime-400")} />
                    <line x1={c.x - 4} y1={c.y} x2={c.x + 4} y2={c.y} className="stroke-lime-500/30 stroke-[0.5]" />
                </g>
            ))}
            {/* Nucleus */}
            <g onClick={() => onSelect('nucleus_p')} className="cursor-crosshair group">
                <circle cx="50" cy="30" r="10" className={cn("transition-all", sel('nucleus_p') ? "fill-lime-500/20 stroke-lime-500 stroke-2 animate-pulse" : "fill-black stroke-lime-500/50 stroke-1 group-hover:stroke-lime-500")} />
                <circle cx="50" cy="30" r="4" className={cn("", sel('nucleus_p') ? "fill-lime-500" : "fill-lime-500/40")} />
            </g>
        </svg>
    )
}

function ReproductiveSVG({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
    const sel = (id: string) => selectedId === id
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(236,72,153,0.2)]">
            {/* Stem */}
            <line x1="50" y1="100" x2="50" y2="55" stroke="rgba(132,204,22,0.4)" strokeWidth={3} />
            {/* Leaves */}
            <path d="M 50 80 Q 35 70, 30 55 Q 45 60, 50 75" className={cn("fill-lime-500/10 stroke-lime-500/30 stroke-[0.5]")} />
            <path d="M 50 70 Q 65 60, 70 45 Q 55 52, 50 68" className={cn("fill-lime-500/10 stroke-lime-500/30 stroke-[0.5]")} />
            {/* Petals */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                const rad = (angle * Math.PI) / 180
                const px = 50 + 22 * Math.cos(rad)
                const py = 35 + 22 * Math.sin(rad)
                return (
                    <g key={i} onClick={() => onSelect('petals')} className="cursor-crosshair group">
                        <ellipse cx={px} cy={py} rx={8} ry={5} transform={`rotate(${angle + 90}, ${px}, ${py})`}
                            className={cn("transition-all", sel('petals') ? "fill-pink-500/40 stroke-pink-500 stroke-1 animate-pulse" : "fill-pink-500/10 stroke-pink-500/40 stroke-[0.5] group-hover:fill-pink-500/20")} />
                    </g>
                )
            })}
            {/* Sepal Ring */}
            <circle cx="50" cy="35" r="11" className="fill-lime-500/15 stroke-lime-500/30 stroke-[0.5]" />
            {/* Center Pistil - Stigma */}
            <g onClick={() => onSelect('stigma')} className="cursor-crosshair group">
                <circle cx="50" cy="35" r="7" className={cn("transition-all", sel('stigma') ? "fill-pink-400/30 stroke-pink-400 stroke-[1.5] animate-pulse" : "fill-pink-400/10 stroke-pink-400/50 stroke-1 group-hover:stroke-pink-400")} />
            </g>
            {/* Stamen (Anthers) */}
            {[320, 40, 130, 220].map((angle, i) => {
                const rad = (angle * Math.PI) / 180
                const ax = 50 + 14 * Math.cos(rad)
                const ay = 35 + 14 * Math.sin(rad)
                return (
                    <g key={i} onClick={() => onSelect('anther')} className="cursor-crosshair group">
                        <line x1="50" y1="35" x2={ax} y2={ay} className="stroke-yellow-500/30 stroke-[0.5]" />
                        <circle cx={ax} cy={ay} r="2.5" className={cn("transition-all", sel('anther') ? "fill-yellow-500 animate-ping" : "fill-yellow-500/50 group-hover:fill-yellow-500")} />
                    </g>
                )
            })}
            {/* Ovary (base bulge) */}
            <g onClick={() => onSelect('ovary')} className="cursor-crosshair group">
                <ellipse cx="50" cy="52" rx="6" ry="4" className={cn("transition-all", sel('ovary') ? "fill-pink-500/30 stroke-pink-500 stroke-1.5 animate-pulse" : "fill-pink-500/10 stroke-pink-500/30 stroke-[0.5] group-hover:stroke-pink-500")} />
            </g>
            {/* Ovule dots inside */}
            {[{ x: 48, y: 51 }, { x: 52, y: 53 }].map((o, i) => (
                <g key={i} onClick={() => onSelect('ovule')} className="cursor-crosshair group">
                    <circle cx={o.x} cy={o.y} r="1.2" className={cn("transition-all", sel('ovule') ? "fill-white animate-pulse" : "fill-white/40 group-hover:fill-white")} />
                </g>
            ))}
        </svg>
    )
}

export default function BiologyLab({ topic }: { topic: string }) {
    const [specimen, setSpecimen] = useState<SpecimenType>('animal_cell')
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const organelles = specimen === 'animal_cell' ? ANIMAL_CELL : specimen === 'plant_cell' ? PLANT_CELL : REPRODUCTIVE
    const activePart = organelles.find(o => o.id === selectedId)
    const cfg = SPECIMENS.find(s => s.id === specimen)!

    const colorClass = cfg.color
    const textColor = `text-${colorClass}-500`
    const borderColor = `border-${colorClass}-500`
    const bgColor = `bg-${colorClass}-500/10`

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 min-h-[700px]">
            <div className="xl:col-span-2 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center glass-card bg-black/40 border-white/10 p-4">
                    <div className="flex items-center gap-3">
                        <Leaf className={cn("w-5 h-5 animate-[pulse_3s_ease-in-out_infinite]", textColor)} />
                        <span className={cn("font-display text-xs tracking-[0.4em] uppercase", textColor)}>BIO ANALYTICS v10</span>
                    </div>
                    <div className="flex gap-2">
                        {SPECIMENS.map(s => (
                            <button key={s.id} onClick={() => { setSpecimen(s.id); setSelectedId(null) }}
                                className={cn("px-3 py-2 text-[9px] font-display uppercase tracking-widest border transition-colors", specimen === s.id ? `border-${s.color}-500 bg-${s.color}-500/10 text-${s.color}-500` : "border-white/10 text-white/40 hover:border-white/20")}>
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Canvas */}
                <div className="glass-card bg-black/40 border-white/10 relative overflow-hidden h-[500px] flex items-center justify-center">
                    <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at center, rgba(16, 185, 129, 0.05) 0%, transparent 80%)` }} />
                    <div className="w-[75%] h-[75%] relative z-10">
                        {specimen === 'animal_cell' && <AnimalCellSVG selectedId={selectedId} onSelect={setSelectedId} />}
                        {specimen === 'plant_cell' && <PlantCellSVG selectedId={selectedId} onSelect={setSelectedId} />}
                        {specimen === 'reproductive' && <ReproductiveSVG selectedId={selectedId} onSelect={setSelectedId} />}
                        {activePart && (
                            <div className="absolute top-0 right-0 text-right pointer-events-none">
                                <div className={cn("font-display text-sm uppercase tracking-[0.2em]", textColor)}>{activePart.name}</div>
                                <div className={cn("font-mono text-[9px] uppercase tracking-widest", `text-${colorClass}-500/50`)}>Target Locked</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Panel */}
            <div className="space-y-6 flex flex-col h-full">
                <div className="glass-card bg-black/60 border-white/10 p-6 flex-1 flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Search className={cn("w-24 h-24", textColor)} />
                    </div>
                    <div className={cn("font-display text-[10px] tracking-[0.4em] uppercase pb-4 border-b border-white/10 z-10 flex items-center justify-between", "text-white/40")}>
                        <span>BIOSCAN LOG</span><Cpu className={cn("w-3 h-3", textColor)} />
                    </div>

                    {!selectedId || !activePart ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center text-white/20 z-10">
                            <ShieldAlert className="w-12 h-12 opacity-50" />
                            <p className={cn("font-display text-[9px] tracking-[0.5em] uppercase", `text-${colorClass}-500/30`)}>SCANNER IDLE — SELECT TARGET</p>
                            <p className="font-mono text-[9px]">Click a structure in the diagram.</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col mt-4 z-10 overflow-y-auto no-scrollbar pb-6 animate-motion-blur-in">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={cn("p-3 border", borderColor, bgColor)}><Activity className={cn("w-6 h-6", textColor)} /></div>
                                <div>
                                    <h3 className={cn("font-display text-xl tracking-[0.2em] text-white uppercase")}>{activePart.name}</h3>
                                    <span className={cn("font-mono text-[9px] uppercase tracking-widest block", textColor)}>Structural Scan Complete</span>
                                </div>
                            </div>
                            <div className={cn("p-5 mb-6 text-white/70 font-sans text-sm leading-relaxed border-l-2 bg-black/40 border border-white/5", `border-l-${colorClass}-500`)}>
                                {activePart.desc}
                            </div>
                            <div className="space-y-3 text-xs">
                                <div className="font-display text-[8px] tracking-[0.3em] uppercase text-white/30 mb-2">Internal Metrics</div>
                                {Object.entries(activePart.stats).map(([k, v]) => (
                                    <div key={k} className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className={cn("font-display text-[10px] uppercase tracking-widest", textColor)}>{k.replace(/_/g,' ')}</span>
                                        <span className="font-mono text-white/80 border border-white/10 px-2 py-1 bg-white/5">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {/* Quick Target Selector */}
                <div className="glass-card bg-black/40 border-white/10 p-4 space-y-3 flex-shrink-0">
                    <div className="font-display text-[8px] text-white/40 tracking-[0.3em] uppercase">QUICK TARGET</div>
                    <div className="flex flex-wrap gap-2">
                        {organelles.map(org => (
                            <button key={org.id} onClick={() => setSelectedId(org.id)}
                                className={cn("px-3 py-1.5 border text-[9px] font-display uppercase tracking-widest transition-colors",
                                    selectedId === org.id ? `${borderColor} ${bgColor} ${textColor}` : "border-white/10 text-white/50 hover:bg-white/5 hover:text-white")}>
                                {org.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
