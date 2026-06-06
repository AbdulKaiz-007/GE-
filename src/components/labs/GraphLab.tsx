'use client'

import { useState, useRef, useEffect } from 'react'
import { Activity, Play, RefreshCw, Layers, Map, Network } from 'lucide-react'
import { cn } from '@/lib/game-engine'

// ─── GRAPH TOPOLOGY ───
const NODES = [
    { id: 0, x: 18, y: 50 },
    { id: 1, x: 38, y: 18 },
    { id: 2, x: 38, y: 82 },
    { id: 3, x: 58, y: 50 },
    { id: 4, x: 78, y: 18 },
    { id: 5, x: 78, y: 82 },
    { id: 6, x: 88, y: 50 }
]

// Weighted adjacency list { neighbor: weight }
const WEIGHTED_ADJ: Record<number, { to: number; w: number }[]> = {
    0: [{ to: 1, w: 4 }, { to: 2, w: 7 }],
    1: [{ to: 0, w: 4 }, { to: 3, w: 2 }, { to: 4, w: 6 }],
    2: [{ to: 0, w: 7 }, { to: 3, w: 3 }, { to: 5, w: 5 }],
    3: [{ to: 1, w: 2 }, { to: 2, w: 3 }, { to: 6, w: 5 }],
    4: [{ to: 1, w: 6 }, { to: 6, w: 2 }],
    5: [{ to: 2, w: 5 }, { to: 6, w: 4 }],
    6: [{ to: 3, w: 5 }, { to: 4, w: 2 }, { to: 5, w: 4 }]
}

// Simple unweighted adjacency list
const ADJ: Record<number, number[]> = Object.fromEntries(
    Object.entries(WEIGHTED_ADJ).map(([k, vs]) => [k, vs.map(v => v.to)])
)

// ─── ALGORITHMS WITH YIELD ───
function* bfs(start: number) {
    const queue = [start]; const visited = new Set([start]); const path: number[] = []
    yield { current: start, visited: Array.from(visited), queue: [...queue], path: [...path], costs: null }
    while (queue.length) {
        const node = queue.shift()!; path.push(node)
        yield { current: node, visited: Array.from(visited), queue: [...queue], path: [...path], costs: null }
        for (const nb of ADJ[node] || []) {
            if (!visited.has(nb)) { visited.add(nb); queue.push(nb); yield { current: node, visited: Array.from(visited), queue: [...queue], path: [...path], costs: null } }
        }
    }
    yield { current: null, visited: Array.from(visited), queue: [], path: [...path], costs: null }
}

function* dfs(start: number) {
    const stack = [start]; const visited = new Set<number>(); const path: number[] = []
    while (stack.length) {
        const node = stack.pop()!
        if (!visited.has(node)) {
            visited.add(node); path.push(node)
            yield { current: node, visited: Array.from(visited), queue: [...stack], path: [...path], costs: null }
            for (const nb of [...ADJ[node] || []].reverse()) {
                if (!visited.has(nb)) stack.push(nb)
            }
        }
    }
    yield { current: null, visited: Array.from(visited), queue: [], path: [...path], costs: null }
}

function* dijkstra(start: number) {
    const costs: Record<number, number> = Object.fromEntries(NODES.map(n => [n.id, Infinity]))
    costs[start] = 0
    const unvisitedArr: number[] = NODES.map(n => n.id)
    const prev: Record<number, number | null> = Object.fromEntries(NODES.map(n => [n.id, null]))
    const path: number[] = []
    const visited: number[] = []

    yield { current: start, visited: [...visited], queue: [...unvisitedArr], path: [...path], costs: { ...costs } }

    while (unvisitedArr.length > 0) {
        // Pick node with minimum cost from unvisited
        let u = unvisitedArr[0]
        for (const n of unvisitedArr) { if (costs[n] < costs[u]) u = n }
        if (costs[u] === Infinity) break

        const idx = unvisitedArr.indexOf(u); unvisitedArr.splice(idx, 1)
        visited.push(u); path.push(u)
        yield { current: u, visited: [...visited], queue: [...unvisitedArr], path: [...path], costs: { ...costs } }

        for (const { to, w } of WEIGHTED_ADJ[u] || []) {
            if (!unvisitedArr.includes(to)) continue
            const alt = costs[u] + w
            if (alt < costs[to]) { costs[to] = alt; prev[to] = u }
            yield { current: u, visited: [...visited], queue: [...unvisitedArr], path: [...path], costs: { ...costs } }
        }
    }
    yield { current: null, visited: [...visited], queue: [], path: NODES.map(n => n.id).filter(n => prev[n] !== null || n === start), costs: { ...costs } }
}

type Algo = 'bfs' | 'dfs' | 'dijkstra'

export default function GraphLab() {
    const [algo, setAlgo] = useState<Algo>('bfs')
    const [startNode, setStartNode] = useState(0)
    const [current, setCurrent] = useState<number | null>(null)
    const [visited, setVisited] = useState<number[]>([])
    const [queue, setQueue] = useState<(number | string)[]>([])
    const [path, setPath] = useState<number[]>([])
    const [costs, setCosts] = useState<Record<number, number> | null>(null)
    const [isTraversing, setIsTraversing] = useState(false)
    const [isDone, setIsDone] = useState(false)

    const iterRef = useRef<Generator<any> | null>(null)
    const isRunRef = useRef(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => () => stopTraversal(), [])

    const stopTraversal = () => { isRunRef.current = false; setIsTraversing(false); if (timeoutRef.current) clearTimeout(timeoutRef.current) }

    const startTraversal = () => {
        if (isRunRef.current) return
        setCurrent(null); setVisited([]); setQueue([]); setPath([]); setCosts(null); setIsDone(false)
        isRunRef.current = true; setIsTraversing(true)
        iterRef.current = algo === 'bfs' ? bfs(startNode) : algo === 'dfs' ? dfs(startNode) : dijkstra(startNode)

        const runStep = () => {
            if (!isRunRef.current) return
            const result = iterRef.current?.next()
            if (result && !result.done) {
                const s = result.value
                setCurrent(s.current); setVisited(s.visited || []); setQueue(s.queue || [])
                setPath(s.path || []); if (s.costs) setCosts(s.costs)
                timeoutRef.current = setTimeout(runStep, algo === 'dijkstra' ? 700 : 800)
            } else {
                stopTraversal(); setIsDone(true); iterRef.current = null
            }
        }
        timeoutRef.current = setTimeout(runStep, 500)
    }

    const handleReset = () => { stopTraversal(); iterRef.current = null; setCurrent(null); setVisited([]); setQueue([]); setPath([]); setCosts(null); setIsDone(false) }

    // Build unique edges
    const renderedEdges = new Set<string>()
    const edges: { source: number; target: number; weight: number }[] = []
    Object.entries(WEIGHTED_ADJ).forEach(([src, nbrs]) => {
        nbrs.forEach(({ to, w }) => {
            const key = [parseInt(src), to].sort().join('-')
            if (!renderedEdges.has(key)) { renderedEdges.add(key); edges.push({ source: parseInt(src), target: to, weight: w }) }
        })
    })

    const accentColor = algo === 'bfs' ? '#00e5ff' : algo === 'dfs' ? '#ec4899' : '#f97316'

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 min-h-[700px]">
            <div className="xl:col-span-2 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center glass-card bg-black/40 border-white/10 p-4">
                    <div className="flex items-center gap-3">
                        <Network className="w-5 h-5 animate-[pulse_2s_infinite]" style={{ color: accentColor }} />
                        <span className="font-display text-xs tracking-[0.4em] uppercase" style={{ color: accentColor }}>ROUTING PROTOCOL v8</span>
                    </div>
                    <div className="flex gap-2">
                        {(['bfs', 'dfs', 'dijkstra'] as Algo[]).map(a => (
                            <button key={a} onClick={() => { setAlgo(a); handleReset() }} disabled={isTraversing}
                                className={cn("px-3 py-2 text-[9px] font-display uppercase tracking-widest border transition-colors", algo === a ? "border-white/40 bg-white/5 text-white" : "border-white/10 text-white/40 hover:border-white/20")}>
                                {a.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Canvas */}
                <div className="glass-card bg-black/40 border-white/10 relative overflow-hidden h-[500px]">
                    <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at center, ${accentColor}0d 0%, transparent 70%)` }} />
                    {isTraversing && (
                        <div className="absolute top-4 left-4 z-20 glass-card px-4 py-2 text-[9px] font-display tracking-widest uppercase animate-pulse flex items-center gap-3" style={{ backgroundColor: `${accentColor}1a`, borderColor: `${accentColor}4d`, color: accentColor }}>
                            <Layers className="w-4 h-4" /> TRACING NETWORK...
                        </div>
                    )}
                    {isDone && (
                        <div className="absolute top-4 left-4 z-20 glass-card bg-emerald-500/10 border-emerald-500/30 px-4 py-2 text-[9px] font-display tracking-widest text-emerald-500 uppercase flex items-center gap-3">
                            <Map className="w-4 h-4" /> TRACE COMPLETE
                        </div>
                    )}

                    <div className="w-full h-full relative p-6">
                        <svg className="w-full h-full overflow-visible pointer-events-none">
                            {/* Edge weights */}
                            {edges.map((e, i) => {
                                const src = NODES.find(n => n.id === e.source)!
                                const tgt = NODES.find(n => n.id === e.target)!
                                const mx = (src.x + tgt.x) / 2, my = (src.y + tgt.y) / 2
                                const bothVisited = visited.includes(e.source) && visited.includes(e.target)
                                return (
                                    <g key={i}>
                                        <line x1={`${src.x}%`} y1={`${src.y}%`} x2={`${tgt.x}%`} y2={`${tgt.y}%`}
                                            stroke={bothVisited ? accentColor : 'rgba(255,255,255,0.12)'} strokeWidth={bothVisited ? 2 : 1} strokeOpacity={bothVisited ? 0.5 : 1} className="transition-all duration-700" />
                                        {algo === 'dijkstra' && (
                                            <text x={`${mx}%`} y={`${my}%`} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" dominantBaseline="middle">{e.weight}</text>
                                        )}
                                    </g>
                                )
                            })}

                            {/* Nodes */}
                            {NODES.map(node => {
                                const isCur = current === node.id
                                const isVis = visited.includes(node.id) && !isCur
                                const isQueued = (queue as number[]).includes(node.id)
                                return (
                                    <g key={node.id}>
                                        {isCur && <circle cx={`${node.x}%`} cy={`${node.y}%`} r={18} fill="none" stroke={accentColor} strokeWidth={2} className="animate-ping" />}
                                        <circle cx={`${node.x}%`} cy={`${node.y}%`} r={isCur ? 14 : 12}
                                            fill={isCur ? accentColor : 'black'}
                                            stroke={isCur ? 'white' : isVis ? accentColor : isQueued ? '#6366f1' : 'rgba(255,255,255,0.2)'}
                                            strokeWidth={isCur ? 2 : 1.5}
                                            className="transition-all duration-300" />
                                        <text x={`${node.x}%`} y={`${node.y}%`} textAnchor="middle" dominantBaseline="middle" fontSize="10"
                                            fill={isCur ? 'black' : isVis ? 'white' : 'rgba(255,255,255,0.4)'} className="font-display transition-colors pointer-events-none select-none">
                                            {node.id}
                                        </text>
                                        {/* Dijkstra cost label */}
                                        {algo === 'dijkstra' && costs && (
                                            <text x={`${node.x}%`} y={`${node.y + 8}%`} textAnchor="middle" fontSize="8"
                                                fill={costs[node.id] === Infinity ? 'rgba(255,255,255,0.2)' : accentColor} dominantBaseline="hanging">
                                                {costs[node.id] === Infinity ? '∞' : costs[node.id]}
                                            </text>
                                        )}
                                    </g>
                                )
                            })}
                        </svg>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="space-y-6 flex flex-col">
                <div className="glass-card bg-black/40 border-white/10 p-6 space-y-5 flex-shrink-0">
                    <div className="font-display text-[10px] text-white/40 tracking-[0.4em] uppercase pb-4 border-b border-white/10">ROUTING CONTROLS</div>

                    <div className="space-y-2">
                        <div className="font-mono text-[10px] text-white/60">Origin Node</div>
                        <div className="flex flex-wrap gap-2">
                            {NODES.map(n => (
                                <button key={n.id} onClick={() => { setStartNode(n.id); handleReset() }} disabled={isTraversing}
                                    className={cn("w-8 h-8 rounded-full border text-[10px] font-display transition-colors", startNode === n.id ? "border-white bg-white/20 text-white" : "border-white/10 text-white/40 hover:border-white/40")}>
                                    {n.id}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Algorithm info blurb */}
                    <div className="bg-black/40 border border-white/5 p-3 text-[9px] font-mono text-white/50 leading-relaxed">
                        {algo === 'bfs' && 'BFS explores in rings from origin. Uses a FIFO Queue. Guarantees shortest path in unweighted graphs.'}
                        {algo === 'dfs' && 'DFS dives deep along each branch before backtracking. Uses a LIFO Stack. Efficient for connectivity checks.'}
                        {algo === 'dijkstra' && "Dijkstra's finds the minimum-cost path to all nodes. Edge weights are shown. Node cost labels update live."}
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-white/10">
                        {isTraversing ? (
                            <button onClick={stopTraversal} className="flex-1 py-3 bg-red-500/10 border border-red-500/30 text-[9px] font-display tracking-widest text-red-500 uppercase hover:bg-red-500/20 transition-colors">
                                Terminate
                            </button>
                        ) : (
                            <button onClick={startTraversal} disabled={isDone} className="flex-1 py-3 text-[9px] font-display tracking-widest uppercase transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                style={{ backgroundColor: `${accentColor}1a`, borderColor: `${accentColor}4d`, border: '1px solid', color: accentColor }}>
                                <Play className="w-3 h-3" /> Execute
                            </button>
                        )}
                        <button onClick={handleReset} disabled={isTraversing}
                            className="flex-1 py-3 border border-white/10 text-[9px] font-display tracking-widest text-white/50 uppercase hover:bg-white/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                            <RefreshCw className="w-3 h-3" /> Reset
                        </button>
                    </div>
                </div>

                {/* Memory Buffer */}
                <div className="glass-card bg-black/60 border-white/10 p-6 flex-1 flex flex-col">
                    <div className="font-display text-[10px] text-white/40 tracking-[0.4em] uppercase pb-4 border-b border-white/10">MEMORY BUFFER</div>
                    <div className="mt-4 flex-1 flex flex-col gap-3">
                        <div>
                            <span className="font-mono text-[9px] text-white/50 block mb-2">{algo === 'bfs' ? 'FIFO Queue' : algo === 'dfs' ? 'LIFO Stack' : 'Unvisited Priority Queue'}</span>
                            <div className="flex gap-2 flex-wrap min-h-[36px] p-2 bg-black/40 border border-white/5">
                                {(queue as number[]).map((nid, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-sony-indigo/20 border border-sony-indigo text-sony-indigo font-mono text-[10px]">[{nid}]</span>
                                ))}
                                {queue.length === 0 && <span className="font-mono text-[9px] text-white/20 italic p-1">Buffer Empty</span>}
                            </div>
                        </div>
                        <div className="flex-1">
                            <span className="font-mono text-[9px] text-white/50 block mb-2">Path {algo === 'dijkstra' ? '(Settled Nodes)' : 'Route'}</span>
                            <div className="bg-black/40 border border-white/5 p-3 flex items-start flex-wrap gap-2 flex-1 min-h-[60px]">
                                {path.map((nid, idx) => (
                                    <span key={idx} className="flex items-center gap-1">
                                        <span className="font-mono text-[10px]" style={{ color: accentColor }}>[{nid}]</span>
                                        {idx < path.length - 1 && <span className="text-white/20 text-[9px]">→</span>}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {algo === 'dijkstra' && costs && isDone && (
                            <div className="pt-3 border-t border-white/10">
                                <div className="font-mono text-[9px] text-white/50 mb-2">Final Costs from Node {startNode}:</div>
                                <div className="grid grid-cols-4 gap-1">
                                    {NODES.map(n => (
                                        <div key={n.id} className="text-center p-1 bg-black/40 border border-white/5">
                                            <div className="font-mono text-[8px] text-white/40">[{n.id}]</div>
                                            <div className="font-display text-[10px]" style={{ color: accentColor }}>{costs[n.id] === Infinity ? '∞' : costs[n.id]}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
