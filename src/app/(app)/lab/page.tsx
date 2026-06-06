'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Activity, Cpu, Blocks, Beaker, Atom, FunctionSquare, LineChart, Leaf } from 'lucide-react'
import BinaryTreeLab from '@/components/labs/BinaryTreeLab'
import KnowledgeGraphLab from '@/components/labs/KnowledgeGraphLab'
import MathPlotterLab from '@/components/labs/MathPlotterLab'
import ChemistryLab from '@/components/labs/ChemistryLab'
import PhysicsLab from '@/components/labs/PhysicsLab'
import BiologyLab from '@/components/labs/BiologyLab'
import SortingLab from '@/components/labs/SortingLab'
import GraphLab from '@/components/labs/GraphLab'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/game-engine'

import Image from 'next/image'

function LabContent() {
    const searchParams = useSearchParams()
    // ... rest of logic ...
    const id = searchParams.get('id')
    const urlTopic = searchParams.get('topic') || 'Unknown Directive'
    
    const [lesson, setLesson] = useState<any>(null)
    const [loading, setLoading] = useState(!!id)

    useEffect(() => {
        async function fetchLesson() {
            if (!id) return
            const supabase = createClient()
            const { data } = await supabase.from('lessons').select('*').eq('id', id).single()
            if (data) setLesson(data)
            setLoading(false)
        }
        fetchLesson()
    }, [id])

    const topic = lesson?.topic || urlTopic
    const topicLower = topic.toLowerCase()
    
    // Auto-detect lab type based on topic
    let labType = 'matrix'
    if (topicLower.includes('tree')) labType = 'binary_tree'
    else if (topicLower.includes('sort') || topicLower.includes('array')) labType = 'sorting'
    else if ((topicLower.includes('graph') || topicLower.includes('path') || topicLower.includes('search')) && !topicLower.includes('knowledge')) labType = 'graph'
    else if (topicLower.includes('math') || topicLower.includes('equat') || topicLower.includes('plot') || topicLower.includes('calculus')) labType = 'math'
    else if (topicLower.includes('phys') || topicLower.includes('mechanic') || topicLower.includes('motion')) labType = 'physics'
    else if (topicLower.includes('bio') || topicLower.includes('cell') || topicLower.includes('anatom') || topicLower.includes('dna')) labType = 'biology'
    else if (topicLower.includes('chem') || topicLower.includes('molec') || /\batom/.test(topicLower) || /\bbond/.test(topicLower)) labType = 'chemistry'
    else if (topicLower.includes('matrix') || topicLower.includes('knowledg')) labType = 'matrix'

    const concepts = lesson?.story_arc?.concepts || [
        `${topic} Fundamentals`,
        'Core Principles',
        'Advanced Applications',
        'Real-world Use Cases',
        'Historical Analytics'
    ]

    const hasTopic = searchParams.has('topic')
    const hasId = !!id

    if (!hasId && !hasTopic) {
        return (
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 animate-motion-blur-in pb-32">
                {/* Header HUD */}
                <div className="flex flex-col md:flex-row items-center gap-8 glass-card bg-black/40 border-white/10 p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-arc-neon/5 via-transparent to-sony-violet/5 opacity-50" />
                    
                    <div className="flex items-center gap-6 relative z-10 w-full justify-center md:justify-start">
                        <div className="w-14 h-14 biometric-frame overflow-hidden relative shrink-0">
                            <Image
                                src="/images/gamma_edison_logo.png"
                                alt="Logo"
                                fill
                                className="object-cover p-2 brightness-110"
                            />
                        </div>
                        <div className="flex-1 min-w-0 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <Activity className="w-4 h-4 text-arc-neon opacity-50" />
                                <span className="font-display text-[9px] text-arc-neon tracking-[0.4em] uppercase opacity-70">Sandbox Directive</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-display text-white uppercase tracking-[0.2em] chromatic-text leading-tight">Interactive Labs</h1>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mt-12 relative z-10">
                    
                    {/* DSA: Trees */}
                    <Link href="/lab?topic=binary%20search%20tree" className="glass-card p-8 border-white/10 hover:border-arc-neon group transition-all relative overflow-hidden hover:-translate-y-2 h-full flex flex-col">
                        <div className="absolute inset-0 bg-gradient-to-br from-arc-neon/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className="w-12 h-12 biometric-frame border-arc-neon flex items-center justify-center text-arc-neon bg-black/60">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-display text-white uppercase tracking-widest group-hover:text-arc-neon transition-colors">DSA: Trees</h2>
                        </div>
                        <p className="text-white/60 font-display text-[10px] tracking-widest leading-relaxed relative z-10 mt-auto">
                            Visualizer: Batch array injection, real-time node traversal, and execution statistics for Binary Search Trees.
                        </p>
                    </Link>

                    {/* DSA: Sorting */}
                    <Link href="/lab?topic=sorting%20algorithms" className="glass-card p-8 border-white/10 hover:border-sony-indigo group transition-all relative overflow-hidden hover:-translate-y-2 h-full flex flex-col">
                        <div className="absolute inset-0 bg-gradient-to-br from-sony-indigo/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className="w-12 h-12 biometric-frame border-sony-indigo flex items-center justify-center text-sony-indigo bg-black/60">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-display text-white uppercase tracking-widest group-hover:text-sony-indigo transition-colors">DSA: Sorting</h2>
                        </div>
                        <p className="text-white/60 font-display text-[10px] tracking-widest leading-relaxed relative z-10 mt-auto">
                            Algorithm Visualizer: Observe sorting algorithms with animated vertical data arrays and real-time complexity stats.
                        </p>
                    </Link>

                    {/* DSA: Graphs */}
                    <Link href="/lab?topic=graph%20search" className="glass-card p-8 border-white/10 hover:border-arc-neon group transition-all relative overflow-hidden hover:-translate-y-2 h-full flex flex-col">
                        <div className="absolute inset-0 bg-gradient-to-br from-arc-neon/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className="w-12 h-12 biometric-frame border-arc-neon flex items-center justify-center text-arc-neon bg-black/60">
                                <LineChart className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-display text-white uppercase tracking-widest group-hover:text-arc-neon transition-colors">DSA: Graphs</h2>
                        </div>
                        <p className="text-white/60 font-display text-[10px] tracking-widest leading-relaxed relative z-10 mt-auto">
                            Pathfinding Sandbox: Plot nodes, connect vertices, and visualize BFS/DFS traversals dynamically.
                        </p>
                    </Link>

                    {/* Math */}
                    <Link href="/lab?topic=math%20equation%20plotter" className="glass-card p-8 border-white/10 hover:border-pink-500 group transition-all relative overflow-hidden hover:-translate-y-2 h-full flex flex-col">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className="w-12 h-12 biometric-frame border-pink-500 flex items-center justify-center text-pink-500 bg-black/60">
                                <FunctionSquare className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-display text-white uppercase tracking-widest group-hover:text-pink-500 transition-colors">Math Engine</h2>
                        </div>
                        <p className="text-white/60 font-display text-[10px] tracking-widest leading-relaxed relative z-10 mt-auto">
                            Cartesian Plotter: Visualize functions, intercept points, and calculus concepts on an interactive 2D grid.
                        </p>
                    </Link>

                    {/* Physics */}
                    <Link href="/lab?topic=physics%20kinematics" className="glass-card p-8 border-white/10 hover:border-blue-500 group transition-all relative overflow-hidden hover:-translate-y-2 h-full flex flex-col">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className="w-12 h-12 biometric-frame border-blue-500 flex items-center justify-center text-blue-500 bg-black/60">
                                <Atom className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-display text-white uppercase tracking-widest group-hover:text-blue-500 transition-colors">Physics Sim</h2>
                        </div>
                        <p className="text-white/60 font-display text-[10px] tracking-widest leading-relaxed relative z-10 mt-auto">
                            Kinematics engine: Projectile motion, gravity parameters, and mechanical forces sandbox.
                        </p>
                    </Link>

                    {/* Chemistry */}
                    <Link href="/lab?topic=chemistry%20molecules" className="glass-card p-8 border-white/10 hover:border-orange-500 group transition-all relative overflow-hidden hover:-translate-y-2 h-full flex flex-col">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className="w-12 h-12 biometric-frame border-orange-500 flex items-center justify-center text-orange-500 bg-black/60">
                                <Beaker className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-display text-white uppercase tracking-widest group-hover:text-orange-500 transition-colors">Chem Lab</h2>
                        </div>
                        <p className="text-white/60 font-display text-[10px] tracking-widest leading-relaxed relative z-10 mt-auto">
                            Molecular workbench: Atomic properties, electron shells, and interactive compound visualization.
                        </p>
                    </Link>

                    {/* Biology */}
                    <Link href="/lab?topic=biology%20cell%20anatomy" className="glass-card p-8 border-white/10 hover:border-emerald-500 group transition-all relative overflow-hidden hover:-translate-y-2 h-full flex flex-col">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className="w-12 h-12 biometric-frame border-emerald-500 flex items-center justify-center text-emerald-500 bg-black/60">
                                <Leaf className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-display text-white uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Bio Lab</h2>
                        </div>
                        <p className="text-white/60 font-display text-[10px] tracking-widest leading-relaxed relative z-10 mt-auto">
                            Anatomy Explorer: Deep dive into cell structures, DNA sequencing, and biomechanical systems.
                        </p>
                    </Link>

                    {/* Knowledge Graph */}
                    <Link href="/lab?topic=knowledge%20graph" className="glass-card p-8 border-white/10 hover:border-sony-violet group transition-all relative overflow-hidden hover:-translate-y-2 h-full flex flex-col">
                        <div className="absolute inset-0 bg-gradient-to-br from-sony-violet/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className="w-12 h-12 biometric-frame border-sony-violet flex items-center justify-center text-sony-violet bg-black/60">
                                <Blocks className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-display text-white uppercase tracking-widest group-hover:text-sony-violet transition-colors">Matrix Web</h2>
                        </div>
                        <p className="text-white/60 font-display text-[10px] tracking-widest leading-relaxed relative z-10 mt-auto">
                            Interactive Knowledge Web: Conceptual semantic node mapping and force-directed algorithms.
                        </p>
                    </Link>
                </div>
            </div>
        )
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 min-h-[50vh] space-y-6">
            <Activity className="w-16 h-16 text-arc-neon animate-pulse" />
            <p className="font-display text-xs text-arc-neon tracking-[0.8em] uppercase animate-pulse">DECRYPTING SIMULATION DATA...</p>
        </div>
    )

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 animate-motion-blur-in pb-32">
            {/* Header HUD */}
            <div className="flex flex-col md:flex-row items-center gap-8 glass-card bg-black/40 border-white/10 p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-arc-neon/5 via-transparent to-sony-violet/5 opacity-50" />

                <Link href="/lab" className="w-14 h-14 glass-card bg-black/60 border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/30 transition-all group/back relative z-10 shrink-0">
                    <ChevronLeft className="w-6 h-6 transition-transform group-hover/back:-translate-x-1" />
                </Link>

                <div className="flex-1 min-w-0 relative z-10 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                        <Cpu className="w-4 h-4 text-arc-neon opacity-50" />
                        <span className="font-display text-[9px] text-arc-neon tracking-[0.4em] uppercase opacity-70">Interactive Lab v2.0</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-display text-white uppercase tracking-[0.2em] chromatic-text leading-tight">{topic}
                    </h1>
                </div>
            </div>

            {/* Lab Canvas Routing */}
            <div className="relative z-10">
                {labType === 'binary_tree' && <BinaryTreeLab />}
                {labType === 'sorting' && <SortingLab />}
                {labType === 'graph' && <GraphLab />}
                {labType === 'math' && <MathPlotterLab topic={topic} />}
                {labType === 'chemistry' && <ChemistryLab topic={topic} />}
                {labType === 'physics' && <PhysicsLab topic={topic} />}
                {labType === 'biology' && <BiologyLab topic={topic} />}
                {labType === 'matrix' && <KnowledgeGraphLab topic={topic} concepts={concepts} />}
            </div>
        </div>
    )
}

export default function LabPage() {
    return (
        <Suspense fallback={
            <div className="p-20 text-center space-y-8 flex flex-col items-center">
                <Activity className="w-16 h-16 text-arc-neon animate-pulse" />
                <p className="font-display text-xs text-arc-neon tracking-[0.8em] uppercase">LOADING SIMULATION...</p>
            </div>
        }>
            <LabContent />
        </Suspense>
    )
}
