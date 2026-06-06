'use client'

import { useState, useEffect } from 'react'
import { Activity, Shield, Link as LinkIcon, AlertCircle, Zap } from 'lucide-react'
import { cn } from '@/lib/game-engine'

interface KnowledgeGraphLabProps {
    topic: string
    concepts: string[]
}

interface Node {
    id: string
    label: string
    x: number
    y: number
    radius: number
}

interface Edge {
    source: string
    target: string
}

export default function KnowledgeGraphLab({ topic, concepts }: KnowledgeGraphLabProps) {
    const [nodes, setNodes] = useState<Node[]>([])
    const [edges, setEdges] = useState<Edge[]>([])
    const [activeNode, setActiveNode] = useState<string | null>(null)
    const [isSimulating, setIsSimulating] = useState(true)

    // Physics Simulation (Force Directed Graph layout simple approximation)
    useEffect(() => {
        setIsSimulating(true)
        
        // Root node
        const newNodes: Node[] = [
            { id: 'root', label: topic, x: 50, y: 50, radius: 20 }
        ]
        const newEdges: Edge[] = []

        // Distributed concepts in a circle around root
        const radiusOut = 30
        const angleStep = (2 * Math.PI) / concepts.length

        concepts.forEach((concept, i) => {
            const angle = i * angleStep - Math.PI / 2
            const targetX = 50 + radiusOut * Math.cos(angle)
            // scale y down slightly to handle aspect ratio difference
            const targetY = 50 + (radiusOut * 1.5) * Math.sin(angle)
            
            newNodes.push({
                id: `c-${i}`,
                label: concept,
                x: targetX,
                y: targetY,
                radius: 12
            })

            newEdges.push({ source: 'root', target: `c-${i}` })
            
            // Link to previous node to form a web if there are enough nodes
            if (concepts.length > 2) {
                const prevIndex = i === 0 ? concepts.length - 1 : i - 1
                newEdges.push({ source: `c-${prevIndex}`, target: `c-${i}` })
            }
        })

        // Simulate animation revealing nodes
        setTimeout(() => {
            setNodes(newNodes)
            setEdges(newEdges)
            setIsSimulating(false)
        }, 800)
    }, [topic, concepts])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[600px]">
            {/* Network Canvas */}
            <div className="lg:col-span-2 glass-card bg-black/60 border-white/10 relative overflow-hidden min-h-[500px] flex items-center justify-center group/canvas">
                {/* Background Details */}
                <div className="absolute inset-0 bg-[url('/bg-noise.png')] opacity-10 pointer-events-none" />
                <div className="absolute inset-0 animate-pulse opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.1) 0%, transparent 60%)'}}></div>
                
                {/* HUD Header */}
                <div className="absolute top-6 left-6 flex items-center gap-3 z-20">
                    <Activity className="w-5 h-5 text-sony-violet animate-pulse" />
                    <span className="font-display text-xs text-sony-violet tracking-[0.4em] uppercase">ONTOLOGY NETWORK v1.0</span>
                </div>

                {isSimulating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-sony-violet/40 z-30 space-y-4">
                        <Zap className="w-16 h-16 animate-pulse" />
                        <span className="font-display tracking-[0.4em] uppercase text-[10px]">MAPPING CONCEPT NEURAL PATHWAYS...</span>
                    </div>
                )}

                {!isSimulating && (
                    <div className="relative w-[90%] h-[90%]">
                        {/* Edges */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                            {edges.map((edge, i) => {
                                const source = nodes.find(n => n.id === edge.source)
                                const target = nodes.find(n => n.id === edge.target)
                                if (!source || !target) return null
                                
                                const isActive = activeNode === source.id || activeNode === target.id

                                return (
                                    <line
                                        key={`edge-${i}`}
                                        x1={`${source.x}%`} y1={`${source.y}%`}
                                        x2={`${target.x}%`} y2={`${target.y}%`}
                                        className={cn(
                                            "stroke-2 transition-all duration-1000",
                                            isActive ? "stroke-sony-violet shadow-glow animate-pulse" : "stroke-white/10"
                                        )}
                                    />
                                )
                            })}
                        </svg>

                        {/* Nodes */}
                        {nodes.map(node => {
                            const isRoot = node.id === 'root'
                            const isActive = activeNode === node.id
                            
                            return (
                                <button
                                    key={node.id}
                                    onClick={() => setActiveNode(node.id)}
                                    className={cn(
                                        "absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full flex flex-col items-center justify-center transition-all duration-700 aspect-square text-center biometric-frame p-4 group",
                                        isRoot ? "w-40 h-40 border-sony-violet/50 bg-sony-violet/10 z-20" : "w-32 h-32 border-white/20 bg-black/80 z-10 hover:border-sony-violet hover:bg-sony-violet/5 hover:scale-110",
                                        isActive && !isRoot && "border-sony-violet bg-sony-violet/20 shadow-aura scale-110 z-30"
                                    )}
                                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                                >
                                    <span className={cn(
                                        "font-display tracking-widest uppercase transition-colors line-clamp-3",
                                        isRoot ? "text-sony-violet text-sm drop-shadow-glow" : "text-[8px] md:text-[9px] text-white/70",
                                        isActive && !isRoot && "text-white"
                                    )}>
                                        {node.label}
                                    </span>
                                    {isActive && (
                                        <div className="absolute inset-0 border border-sony-violet/50 rounded-full animate-ping pointer-events-none" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Sidebar Inspector Panel */}
            <div className="glass-card bg-black/40 border-white/10 p-8 flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-scanline pointer-events-none opacity-20" />
                <div className="font-display text-[10px] text-white/40 tracking-[0.4em] uppercase pb-4 border-b border-white/10 mb-8">
                    CONCEPT INSPECTOR LOG
                </div>

                {!activeNode ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center text-white/20">
                        <LinkIcon className="w-16 h-16 opacity-20" />
                        <p className="font-display text-[9px] tracking-[0.5em] uppercase">NO NODE SELECTED // CLICK NETWORK TO INTERROGATE</p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col animate-motion-blur-in">
                        <div className="flex items-center gap-4 mb-6">
                            <Shield className="w-8 h-8 text-sony-violet shrink-0" />
                            <h2 className="font-display text-xl text-white tracking-[0.2em] uppercase chromatic-text leading-tight">
                                {nodes.find(n => n.id === activeNode)?.label}
                            </h2>
                        </div>
                        
                        <div className="bg-black/60 border border-white/5 p-6 mb-6">
                            <ul className="space-y-4 text-white/60 font-sans text-sm leading-relaxed">
                                {activeNode === 'root' ? (
                                    <>
                                        <li>Core directory structure analyzed.</li>
                                        <li>Multiple sub-concepts detected branching from the origin node.</li>
                                        <li><strong className="text-sony-violet font-display uppercase tracking-widest text-[10px]">DIRECTIVE:</strong> Select a peripheral sub-node to access granular neural records.</li>
                                    </>
                                ) : (
                                    <>
                                        <li><strong className="text-sony-violet font-display uppercase tracking-widest text-[10px]">CLASSIFIED INTEL:</strong> Detailed theoretical breakdown algorithmically generated for &quot;{nodes.find(n => n.id === activeNode)?.label}&quot;.</li>
                                        <li><strong className="text-arc-neon font-display uppercase tracking-widest text-[10px]">ANALYSIS:</strong> The concept operates dynamically within the broader framework defined by the parent node.</li>
                                        <li><strong className="text-white font-display uppercase tracking-widest text-[10px]">AI INSIGHT:</strong> This component is vital to mastering the domain objectives. Further testing is highly advised through combat situations.</li>
                                    </>
                                )}
                            </ul>
                        </div>
                        
                        <div className="mt-auto border-t border-white/10 pt-6">
                            <div className="flex items-center gap-2 opacity-50">
                                <AlertCircle className="w-3 h-3 text-white" />
                                <span className="font-display text-[8px] text-white tracking-[0.3em] uppercase">SYSTEM.INTEGRITY.VERIFIED</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
