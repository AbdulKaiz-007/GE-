'use client'

import { useState } from 'react'
import { Plus, Search, RefreshCw, Activity, Dices, Layers, Database, GitBranch, List, ArrowUpDown, Hash, Triangle, Share2 } from 'lucide-react'
import { cn } from '@/lib/game-engine'

// ─── COMPLEXITY DATA ───
const COMPLEXITY: Record<string, { name: string; ops: { op: string; avg: string; worst: string }[]; space: string; note: string; color: string }> = {
    bst: {
        name: 'Binary Search Tree',
        color: 'arc-neon',
        ops: [
            { op: 'Search', avg: 'O(log n)', worst: 'O(n)' },
            { op: 'Insert', avg: 'O(log n)', worst: 'O(n)' },
            { op: 'Delete', avg: 'O(log n)', worst: 'O(n)' },
            { op: 'Traversal', avg: 'O(n)', worst: 'O(n)' }
        ],
        space: 'O(n)',
        note: 'Worst case O(n) when tree is completely unbalanced (linear chain).'
    },
    avl: {
        name: 'AVL Tree (Self-Balancing)',
        color: 'pink-500',
        ops: [
            { op: 'Search', avg: 'O(log n)', worst: 'O(log n)' },
            { op: 'Insert', avg: 'O(log n)', worst: 'O(log n)' },
            { op: 'Delete', avg: 'O(log n)', worst: 'O(log n)' },
            { op: 'Rotation', avg: 'O(1)', worst: 'O(1)' }
        ],
        space: 'O(n)',
        note: 'Height is always ≤ 1.44 log₂(n+2). Rotations maintain balance after every insert/delete.'
    },
    linked_list: {
        name: 'Linked List',
        color: 'blue-400',
        ops: [
            { op: 'Access', avg: 'O(n)', worst: 'O(n)' },
            { op: 'Search', avg: 'O(n)', worst: 'O(n)' },
            { op: 'Insert (Head)', avg: 'O(1)', worst: 'O(1)' },
            { op: 'Insert (Tail)', avg: 'O(n)', worst: 'O(n)' },
            { op: 'Delete', avg: 'O(n)', worst: 'O(n)' }
        ],
        space: 'O(n)',
        note: 'No random access. Each node stores pointer to next node, providing dynamic size.'
    },
    stack: {
        name: 'Stack (LIFO)',
        color: 'yellow-400',
        ops: [
            { op: 'Push', avg: 'O(1)', worst: 'O(1)' },
            { op: 'Pop', avg: 'O(1)', worst: 'O(1)' },
            { op: 'Peek/Top', avg: 'O(1)', worst: 'O(1)' },
            { op: 'Search', avg: 'O(n)', worst: 'O(n)' }
        ],
        space: 'O(n)',
        note: 'Last In First Out. Used for recursion call stacks, undo operations, and expression parsing.'
    },
    queue: {
        name: 'Queue (FIFO)',
        color: 'orange-400',
        ops: [
            { op: 'Enqueue', avg: 'O(1)', worst: 'O(1)' },
            { op: 'Dequeue', avg: 'O(1)', worst: 'O(1)' },
            { op: 'Peek/Front', avg: 'O(1)', worst: 'O(1)' },
            { op: 'Search', avg: 'O(n)', worst: 'O(n)' }
        ],
        space: 'O(n)',
        note: 'First In First Out. Used for BFS traversal, task scheduling, and print spoolers.'
    },
    array: {
        name: 'Dynamic Array',
        color: 'emerald-400',
        ops: [
            { op: 'Access', avg: 'O(1)', worst: 'O(1)' },
            { op: 'Search', avg: 'O(n)', worst: 'O(n)' },
            { op: 'Insert (End)', avg: 'O(1)*', worst: 'O(n)' },
            { op: 'Insert (Mid)', avg: 'O(n)', worst: 'O(n)' },
            { op: 'Delete', avg: 'O(n)', worst: 'O(n)' }
        ],
        space: 'O(n)',
        note: 'Random access in O(1). Amortized O(1) append due to doubling strategy on resize.'
    },
    hash_table: {
        name: 'Hash Table',
        color: 'purple-400',
        ops: [
            { op: 'Search', avg: 'O(1)', worst: 'O(n)' },
            { op: 'Insert', avg: 'O(1)', worst: 'O(n)' },
            { op: 'Delete', avg: 'O(1)', worst: 'O(n)' }
        ],
        space: 'O(n)',
        note: 'Worst case O(n) occurs with hash collisions. Load factor should be kept below 0.7.'
    },
    heap: {
        name: 'Min-Heap / Max-Heap',
        color: 'red-400',
        ops: [
            { op: 'Peek Min/Max', avg: 'O(1)', worst: 'O(1)' },
            { op: 'Insert', avg: 'O(log n)', worst: 'O(log n)' },
            { op: 'Extract Min/Max', avg: 'O(log n)', worst: 'O(log n)' },
            { op: 'Heapify', avg: 'O(n)', worst: 'O(n)' }
        ],
        space: 'O(n)',
        note: 'Complete binary tree. Used in priority queues and Heap Sort. Parent always ≤ children (Min-Heap).'
    },
    graph: {
        name: 'Graph (Adjacency List)',
        color: 'cyan-400',
        ops: [
            { op: 'Add Vertex', avg: 'O(1)', worst: 'O(1)' },
            { op: 'Add Edge', avg: 'O(1)', worst: 'O(1)' },
            { op: 'BFS/DFS', avg: 'O(V+E)', worst: 'O(V+E)' },
            { op: 'Search Edge', avg: 'O(V)', worst: 'O(V)' }
        ],
        space: 'O(V+E)',
        note: 'V = Vertices, E = Edges. Adjacency List more space-efficient than Matrix for sparse graphs.'
    }
}

type StructureId = keyof typeof COMPLEXITY

const STRUCTURES = [
    { id: 'bst' as StructureId, label: 'BST', icon: GitBranch, color: 'arc-neon' },
    { id: 'avl' as StructureId, label: 'AVL', icon: GitBranch, color: 'pink-500' },
    { id: 'linked_list' as StructureId, label: 'Linked List', icon: List, color: 'blue-400' },
    { id: 'stack' as StructureId, label: 'Stack', icon: Layers, color: 'yellow-400' },
    { id: 'queue' as StructureId, label: 'Queue', icon: ArrowUpDown, color: 'orange-400' },
    { id: 'array' as StructureId, label: 'Array', icon: Database, color: 'emerald-400' },
    { id: 'hash_table' as StructureId, label: 'Hash Table', icon: Hash, color: 'purple-400' },
    { id: 'heap' as StructureId, label: 'Heap', icon: Triangle, color: 'red-400' },
    { id: 'graph' as StructureId, label: 'Graph', icon: Share2, color: 'cyan-400' },
]

// ─── BST / AVL TREE NODE ───
class TreeNode {
    val: number; left: TreeNode | null = null; right: TreeNode | null = null; height: number = 1
    constructor(val: number) { this.val = val }
}

function treeHeight(node: TreeNode | null): number {
    return node ? node.height : 0
}
function updateHeight(node: TreeNode) {
    node.height = 1 + Math.max(treeHeight(node.left), treeHeight(node.right))
}
function balanceFactor(node: TreeNode): number {
    return treeHeight(node.left) - treeHeight(node.right)
}
function rotateRight(y: TreeNode): TreeNode {
    const x = y.left!; const T2 = x.right
    x.right = y; y.left = T2
    updateHeight(y); updateHeight(x); return x
}
function rotateLeft(x: TreeNode): TreeNode {
    const y = x.right!; const T2 = y.left
    y.left = x; x.right = T2
    updateHeight(x); updateHeight(y); return y
}
function avlInsert(node: TreeNode | null, val: number): TreeNode {
    if (!node) return new TreeNode(val)
    if (val < node.val) node.left = avlInsert(node.left, val)
    else if (val > node.val) node.right = avlInsert(node.right, val)
    else return node
    updateHeight(node)
    const bf = balanceFactor(node)
    if (bf > 1 && val < node.left!.val) return rotateRight(node)
    if (bf < -1 && val > node.right!.val) return rotateLeft(node)
    if (bf > 1 && val > node.left!.val) { node.left = rotateLeft(node.left!); return rotateRight(node) }
    if (bf < -1 && val < node.right!.val) { node.right = rotateRight(node.right!); return rotateLeft(node) }
    return node
}
function bstInsert(node: TreeNode | null, val: number): TreeNode {
    if (!node) return new TreeNode(val)
    if (val < node.val) node.left = bstInsert(node.left, val)
    else if (val > node.val) node.right = bstInsert(node.right, val)
    return node
}

type SVGPos = { x: number; y: number }
function assignPositions(node: TreeNode | null, x: number, y: number, spread: number, positions: Map<TreeNode, SVGPos>) {
    if (!node) return
    positions.set(node, { x, y })
    assignPositions(node.left, x - spread, y + 14, spread / 2, positions)
    assignPositions(node.right, x + spread, y + 14, spread / 2, positions)
}

function TreeSVG({ root, activeVal, isAVL }: { root: TreeNode | null; activeVal: number | null; isAVL: boolean }) {
    const positions = new Map<TreeNode, SVGPos>()
    assignPositions(root, 50, 8, 22, positions)
    const edges: JSX.Element[] = []
    const nodes: JSX.Element[] = []
    const color = isAVL ? '#ec4899' : '#00e5ff'

    const collectEdges = (node: TreeNode | null) => {
        if (!node) return
        const pos = positions.get(node)!
        if (node.left) {
            const lpos = positions.get(node.left)!
            edges.push(<line key={`e-l-${node.val}`} x1={`${pos.x}%`} y1={`${pos.y}%`} x2={`${lpos.x}%`} y2={`${lpos.y}%`} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />)
            collectEdges(node.left)
        }
        if (node.right) {
            const rpos = positions.get(node.right)!
            edges.push(<line key={`e-r-${node.val}`} x1={`${pos.x}%`} y1={`${pos.y}%`} x2={`${rpos.x}%`} y2={`${rpos.y}%`} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />)
            collectEdges(node.right)
        }
        const isActive = activeVal === node.val
        const bf = balanceFactor(node)
        nodes.push(
            <g key={`n-${node.val}`}>
                {isActive && <circle cx={`${pos.x}%`} cy={`${pos.y}%`} r={18} fill="none" stroke={color} strokeWidth={1.5} className="animate-ping" />}
                <circle cx={`${pos.x}%`} cy={`${pos.y}%`} r={12} fill="black" stroke={isActive ? color : isAVL && Math.abs(bf) > 1 ? '#ef4444' : 'rgba(255,255,255,0.3)'} strokeWidth={isActive ? 2 : 1} className="transition-all duration-300" />
                <text x={`${pos.x}%`} y={`${pos.y}%`} textAnchor="middle" dominantBaseline="middle" fontSize="9"
                    fill={isActive ? color : 'white'} className="pointer-events-none select-none font-mono">{node.val}</text>
                {isAVL && <text x={`${pos.x + 3}%`} y={`${pos.y - 5}%`} fontSize="7" fill={Math.abs(bf) > 1 ? '#ef4444' : 'rgba(255,255,255,0.3)'}>{bf > 0 ? `+${bf}` : bf}</text>}
            </g>
        )
    }
    collectEdges(root)
    return (
        <svg className="w-full h-full overflow-visible">
            <g>{edges}</g>
            <g>{nodes}</g>
        </svg>
    )
}

// ─── LINKED LIST VIZ ───
function LinkedListViz({ nodes, activeIdx }: { nodes: number[]; activeIdx: number | null }) {
    return (
        <div className="flex items-center gap-1 flex-wrap p-4">
            <div className="flex items-center gap-1 text-[9px] font-display text-blue-400 tracking-widest uppercase mr-2">HEAD →</div>
            {nodes.map((val, idx) => (
                <div key={idx} className="flex items-center gap-1">
                    <div className={cn("flex flex-col items-center border rounded-sm transition-all duration-300", activeIdx === idx ? "border-blue-400 bg-blue-400/20 shadow-[0_0_15px_rgba(96,165,250,0.5)]" : "border-white/20 bg-black/40")}>
                        <div className="px-4 py-2 font-mono text-sm font-bold text-white border-b border-white/10">{val}</div>
                        <div className="px-4 py-1 font-mono text-[8px] text-white/30">{idx < nodes.length - 1 ? `→[${nodes[idx+1]}]` : 'NULL'}</div>
                    </div>
                    {idx < nodes.length - 1 && <span className="text-white/30 text-lg font-mono">→</span>}
                </div>
            ))}
            {nodes.length === 0 && <span className="font-mono text-[11px] text-white/30 italic">NULL (empty list)</span>}
        </div>
    )
}

// ─── STACK VIZ ───
function StackViz({ items, activeIdx }: { items: number[]; activeIdx: number | null }) {
    return (
        <div className="flex flex-col-reverse items-center gap-1 h-full justify-end p-6">
            <div className="w-48 h-1 bg-yellow-400/50 rounded-full mb-1" />
            {items.map((val, idx) => {
                const isTop = idx === items.length - 1
                return (
                    <div key={idx} className={cn("w-48 py-3 text-center font-mono text-sm border transition-all duration-300", isTop ? "border-yellow-400 bg-yellow-400/20 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)] animate-bounce" : "border-white/20 bg-white/5 text-white")}>
                        {val}
                        {isTop && <span className="text-[9px] font-display ml-2 tracking-widest uppercase opacity-60">← TOP</span>}
                    </div>
                )
            })}
            {items.length === 0 && <div className="w-48 py-3 text-center font-mono text-[11px] text-white/30 border border-dashed border-white/10">EMPTY STACK</div>}
        </div>
    )
}

// ─── QUEUE VIZ ───
function QueueViz({ items }: { items: number[] }) {
    return (
        <div className="flex flex-col gap-4 p-6 h-full justify-center">
            <div className="flex items-center gap-2">
                <div className="font-display text-[9px] text-orange-400 tracking-[0.3em] uppercase w-16">FRONT →</div>
                <div className="flex gap-1 flex-1 overflow-x-auto">
                    {items.map((val, idx) => (
                        <div key={idx} className={cn("flex-shrink-0 w-16 py-4 text-center font-mono text-sm border transition-all duration-300", idx === 0 ? "border-orange-400 bg-orange-400/20 text-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.4)]" : "border-white/20 bg-white/5 text-white")}>
                            {val}
                        </div>
                    ))}
                    {items.length === 0 && <div className="w-full py-4 text-center font-mono text-[11px] text-white/30 border border-dashed border-white/10">EMPTY QUEUE</div>}
                </div>
                <div className="font-display text-[9px] text-orange-400 tracking-[0.3em] uppercase w-16">← BACK</div>
            </div>
        </div>
    )
}

// ─── ARRAY VIZ ───
function ArrayViz({ items, activeIdx }: { items: number[]; activeIdx: number | null }) {
    return (
        <div className="flex flex-col gap-4 p-6 h-full justify-center">
            <div className="flex gap-px">
                {items.map((val, idx) => (
                    <div key={idx} className="flex flex-col flex-1" style={{ minWidth: '36px' }}>
                        <div className={cn("py-4 text-center font-mono text-sm border transition-all duration-300", activeIdx === idx ? "border-emerald-400 bg-emerald-400/20 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]" : "border-white/10 bg-white/5 text-white")}>
                            {val}
                        </div>
                        <div className="text-center font-mono text-[9px] text-white/30 mt-1">[{idx}]</div>
                    </div>
                ))}
                {items.length === 0 && <div className="w-full py-4 text-center font-mono text-[11px] text-white/30 border border-dashed border-white/10">EMPTY ARRAY</div>}
            </div>
        </div>
    )
}

// ─── HASH TABLE VIZ ───
function HashTableViz({ entries }: { entries: { key: string; val: number; bucket: number }[] }) {
    const BUCKETS = 8
    const buckets: ({ key: string; val: number } | null)[] = Array(BUCKETS).fill(null)
    entries.forEach(e => {
        if (!buckets[e.bucket]) buckets[e.bucket] = { key: e.key, val: e.val }
    })
    return (
        <div className="grid grid-cols-2 gap-2 p-6">
            {buckets.map((b, idx) => (
                <div key={idx} className="flex items-stretch gap-0 border border-white/10 overflow-hidden">
                    <div className="bg-purple-400/20 border-r border-purple-400/30 px-2 py-3 text-[9px] font-display text-purple-400 flex items-center w-10 justify-center">{idx}</div>
                    <div className={cn("flex-1 px-3 py-3 font-mono text-sm transition-all duration-300", b ? "bg-purple-400/10 text-purple-400" : "bg-transparent text-white/20")}>
                        {b ? `"${b.key}" → ${b.val}` : 'NULL'}
                    </div>
                </div>
            ))}
        </div>
    )
}

// ─── HEAP VIZ (Array-based) ───
function HeapViz({ items, heapType }: { items: number[]; heapType: 'min' | 'max' }) {
    const positions: { x: number; y: number }[] = []
    for (let i = 0; i < items.length; i++) {
        const level = Math.floor(Math.log2(i + 1))
        const posInLevel = i - (Math.pow(2, level) - 1)
        const totalInLevel = Math.pow(2, level)
        const x = ((posInLevel + 0.5) / totalInLevel) * 100
        const y = level * 18 + 8
        positions.push({ x, y })
    }
    return (
        <div className="relative h-full">
            <svg className="w-full h-full overflow-visible absolute top-0 left-0 pointer-events-none">
                {items.map((_, i) => {
                    const left = 2 * i + 1; const right = 2 * i + 2
                    const pos = positions[i]
                    return (
                        <g key={`edges-${i}`}>
                            {left < items.length && <line x1={`${pos.x}%`} y1={`${pos.y}%`} x2={`${positions[left].x}%`} y2={`${positions[left].y}%`} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />}
                            {right < items.length && <line x1={`${pos.x}%`} y1={`${pos.y}%`} x2={`${positions[right].x}%`} y2={`${positions[right].y}%`} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />}
                        </g>
                    )
                })}
                {items.map((val, i) => {
                    const pos = positions[i]
                    const isRoot = i === 0
                    return (
                        <g key={`node-${i}`}>
                            {isRoot && <circle cx={`${pos.x}%`} cy={`${pos.y}%`} r={18} fill="none" stroke="#f87171" strokeWidth={1} className="animate-pulse" />}
                            <circle cx={`${pos.x}%`} cy={`${pos.y}%`} r={12} fill="black" stroke={isRoot ? '#f87171' : 'rgba(255,255,255,0.3)'} strokeWidth={isRoot ? 2 : 1} />
                            <text x={`${pos.x}%`} y={`${pos.y}%`} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill={isRoot ? '#f87171' : 'white'} className="font-mono">{val}</text>
                        </g>
                    )
                })}
            </svg>
            <div className="absolute top-2 right-2 font-display text-[8px] text-red-400 uppercase tracking-widest">{heapType === 'min' ? 'MIN-HEAP ▾ smallest at root' : 'MAX-HEAP ▴ largest at root'}</div>
        </div>
    )
}

// ─── GRAPH VIZ ───
const GRAPH_NODES = [
    { id: 'A', x: 20, y: 25 }, { id: 'B', x: 50, y: 10 }, { id: 'C', x: 80, y: 25 },
    { id: 'D', x: 15, y: 65 }, { id: 'E', x: 50, y: 80 }, { id: 'F', x: 85, y: 65 }
]
const GRAPH_EDGES = [
    ['A', 'B'], ['A', 'D'], ['B', 'C'], ['B', 'E'], ['C', 'F'], ['D', 'E'], ['E', 'F']
]
function GraphViz({ active, visited }: { active: string | null; visited: string[] }) {
    return (
        <svg className="w-full h-full overflow-visible">
            {GRAPH_EDGES.map(([a, b], i) => {
                const na = GRAPH_NODES.find(n => n.id === a)!
                const nb = GRAPH_NODES.find(n => n.id === b)!
                const isActive = active === a || active === b
                return <line key={i} x1={`${na.x}%`} y1={`${na.y}%`} x2={`${nb.x}%`} y2={`${nb.y}%`} stroke={isActive ? '#22d3ee' : 'rgba(255,255,255,0.15)'} strokeWidth={isActive ? 2 : 1} className="transition-all duration-300" />
            })}
            {GRAPH_NODES.map(node => {
                const isActive = active === node.id
                const isVisited = visited.includes(node.id)
                return (
                    <g key={node.id}>
                        {isActive && <circle cx={`${node.x}%`} cy={`${node.y}%`} r={18} fill="none" stroke="#22d3ee" strokeWidth={1.5} className="animate-ping" />}
                        <circle cx={`${node.x}%`} cy={`${node.y}%`} r={14} fill={isVisited ? 'rgba(34,211,238,0.15)' : 'black'} stroke={isActive ? '#22d3ee' : isVisited ? '#22d3ee' : 'rgba(255,255,255,0.3)'} strokeWidth={isActive ? 2 : 1} className="transition-all duration-300" />
                        <text x={`${node.x}%`} y={`${node.y}%`} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill={isActive || isVisited ? '#22d3ee' : 'white'} className="font-mono">{node.id}</text>
                    </g>
                )
            })}
        </svg>
    )
}

// ─── BST / AVL DELETE + TRAVERSALS ───
function bstDelete(node: TreeNode | null, val: number): TreeNode | null {
    if (!node) return null
    if (val < node.val) { node.left = bstDelete(node.left, val); return node }
    if (val > node.val) { node.right = bstDelete(node.right, val); return node }
    if (!node.left) return node.right
    if (!node.right) return node.left
    let succ = node.right; while (succ.left) succ = succ.left
    node.val = succ.val; node.right = bstDelete(node.right, succ.val); return node
}
function avlDelete(node: TreeNode | null, val: number): TreeNode | null {
    if (!node) return null
    if (val < node.val) node.left = avlDelete(node.left, val)
    else if (val > node.val) node.right = avlDelete(node.right, val)
    else {
        if (!node.left) return node.right
        if (!node.right) return node.left
        let succ = node.right; while (succ.left) succ = succ.left
        node.val = succ.val; node.right = avlDelete(node.right, succ.val)
    }
    updateHeight(node); const bf = balanceFactor(node)
    if (bf > 1 && balanceFactor(node.left!) >= 0) return rotateRight(node)
    if (bf > 1 && balanceFactor(node.left!) < 0) { node.left = rotateLeft(node.left!); return rotateRight(node) }
    if (bf < -1 && balanceFactor(node.right!) <= 0) return rotateLeft(node)
    if (bf < -1 && balanceFactor(node.right!) > 0) { node.right = rotateRight(node.right!); return rotateLeft(node) }
    return node
}
function inorder(node: TreeNode | null, out: number[] = []): number[] {
    if (!node) return out; inorder(node.left, out); out.push(node.val); inorder(node.right, out); return out
}
function preorder(node: TreeNode | null, out: number[] = []): number[] {
    if (!node) return out; out.push(node.val); preorder(node.left, out); preorder(node.right, out); return out
}
function postorder(node: TreeNode | null, out: number[] = []): number[] {
    if (!node) return out; postorder(node.left, out); postorder(node.right, out); out.push(node.val); return out
}

// ─── MAIN COMPONENT ───
export default function BinaryTreeLab() {
    const [structure, setStructure] = useState<StructureId>('bst')
    const [input, setInput] = useState('')
    const [message, setMessage] = useState('')

    // BST / AVL state
    const [bstRoot, setBstRoot] = useState<TreeNode | null>(null)
    const [avlRoot, setAvlRoot] = useState<TreeNode | null>(null)
    const [activeTreeVal, setActiveTreeVal] = useState<number | null>(null)

    // Linked List
    const [linkedList, setLinkedList] = useState<number[]>([])
    const [llActive, setLLActive] = useState<number | null>(null)

    // Stack
    const [stack, setStack] = useState<number[]>([])

    // Queue
    const [queue, setQueue] = useState<number[]>([])

    // Array
    const [arr, setArr] = useState<number[]>([])
    const [arrActive, setArrActive] = useState<number | null>(null)

    // Hash Table
    const [hashEntries, setHashEntries] = useState<{ key: string; val: number; bucket: number }[]>([])
    const [hashKey, setHashKey] = useState('')

    // Heap
    const [heapItems, setHeapItems] = useState<number[]>([])
    const [heapType, setHeapType] = useState<'min' | 'max'>('min')

    // Graph
    const [graphActive, setGraphActive] = useState<string | null>(null)
    const [graphVisited, setGraphVisited] = useState<string[]>([])

    // Shared secondary state
    const [secondaryInput, setSecondaryInput] = useState('')  // pos / key input
    const [traversalResult, setTraversalResult] = useState<{order: string; vals: number[]} | null>(null)

    const flash = (msg: string) => setMessage(msg)

    const handleAction = (action: 'push' | 'pop' | 'enqueue' | 'dequeue' | 'insert' | 'search' | 'delete' | 'random' | 'traverse' | 'reverse' | 'sort' | 'clear' | 'peek') => {
        const val = parseInt(input)
        const isValid = !isNaN(val)

        if (action === 'random') {
            const rval = Math.floor(Math.random() * 90) + 10
            setInput(String(rval))
            return
        }

        switch (structure) {
            case 'bst':
                if (action === 'insert' && isValid) {
                    setBstRoot(prev => bstInsert(prev, val))
                    setActiveTreeVal(val); setTimeout(() => setActiveTreeVal(null), 1500)
                    flash(`Inserted ${val} into BST`)
                }
                if (action === 'delete' && isValid) {
                    setBstRoot(prev => bstDelete(prev, val))
                    flash(`Deleted ${val} from BST`)
                }
                if (action === 'search' && isValid) {
                    setActiveTreeVal(val); flash(`Searching for ${val}...`)
                    setTimeout(() => setActiveTreeVal(null), 2000)
                }
                if (action === 'traverse') {
                    const ord = secondaryInput || 'inorder'
                    const res = ord === 'preorder' ? preorder(bstRoot) : ord === 'postorder' ? postorder(bstRoot) : inorder(bstRoot)
                    setTraversalResult({ order: ord, vals: res }); setTimeout(() => setTraversalResult(null), 5000)
                    flash(`${ord}: [${res.join(' → ')}]`)
                }
                if (action === 'clear') { setBstRoot(null); setActiveTreeVal(null); setTraversalResult(null); flash('BST Cleared') }
                break
            case 'avl':
                if (action === 'insert' && isValid) {
                    setAvlRoot(prev => avlInsert(prev, val))
                    setActiveTreeVal(val); setTimeout(() => setActiveTreeVal(null), 1500)
                    flash(`Inserted ${val} into AVL Tree (Auto-balanced)`)
                }
                if (action === 'delete' && isValid) {
                    setAvlRoot(prev => avlDelete(prev, val))
                    flash(`Deleted ${val} from AVL Tree (re-balanced)`)
                }
                if (action === 'traverse') {
                    const ord = secondaryInput || 'inorder'
                    const res = ord === 'preorder' ? preorder(avlRoot) : ord === 'postorder' ? postorder(avlRoot) : inorder(avlRoot)
                    setTraversalResult({ order: ord, vals: res }); setTimeout(() => setTraversalResult(null), 5000)
                    flash(`${ord}: [${res.join(' → ')}]`)
                }
                if (action === 'search' && isValid) {
                    setActiveTreeVal(val); flash(`Searching for ${val}...`)
                    setTimeout(() => setActiveTreeVal(null), 2000)
                }
                if (action === 'clear') { setAvlRoot(null); setActiveTreeVal(null); setTraversalResult(null); flash('AVL Tree Cleared') }
                break
            case 'linked_list':
                if (action === 'insert' && isValid) {
                    const pos = parseInt(secondaryInput)
                    if (!isNaN(pos) && pos >= 0 && pos <= linkedList.length) {
                        setLinkedList(prev => { const n = [...prev]; n.splice(pos, 0, val); return n })
                        flash(`Inserted ${val} at index ${pos}`)
                    } else { setLinkedList(prev => [...prev, val]); flash(`Appended ${val} to tail`) }
                }
                if (action === 'push' && isValid) { setLinkedList(prev => [val, ...prev]); flash(`Prepended ${val} at head`) }
                if (action === 'delete' && isValid) {
                    const idx = linkedList.indexOf(val)
                    if (idx >= 0) { setLinkedList(prev => prev.filter((_, i) => i !== idx)); flash(`Deleted ${val} (was at index ${idx})`) }
                    else flash(`${val} not found in list`)
                }
                if (action === 'search' && isValid) {
                    const idx = linkedList.indexOf(val)
                    setLLActive(idx); setTimeout(() => setLLActive(null), 2000)
                    flash(idx >= 0 ? `Found ${val} at index ${idx}` : `${val} not in list`)
                }
                if (action === 'reverse') { setLinkedList(prev => [...prev].reverse()); flash('List reversed') }
                if (action === 'clear') { setLinkedList([]); flash('List cleared') }
                break
            case 'stack':
                if (action === 'push' && isValid) { setStack(prev => [...prev, val]); flash(`Pushed ${val}`) }
                if (action === 'pop') {
                    if (stack.length === 0) { flash('Stack Underflow!'); return }
                    const top = stack[stack.length - 1]; setStack(prev => prev.slice(0, -1)); flash(`Popped ${top}`)
                }
                if (action === 'peek') { flash(stack.length > 0 ? `Top: ${stack[stack.length - 1]} | Size: ${stack.length}` : 'Stack is empty') }
                if (action === 'clear') { setStack([]); flash('Stack cleared') }
                break
            case 'queue':
                if (action === 'enqueue' && isValid) { setQueue(prev => [...prev, val]); flash(`Enqueued ${val}`) }
                if (action === 'dequeue') {
                    if (queue.length === 0) { flash('Queue is empty!'); return }
                    flash(`Dequeued ${queue[0]}`); setQueue(prev => prev.slice(1))
                }
                if (action === 'peek') { flash(queue.length > 0 ? `Front: ${queue[0]}  |  Rear: ${queue[queue.length - 1]}  |  Size: ${queue.length}` : 'Queue is empty') }
                if (action === 'clear') { setQueue([]); flash('Queue cleared') }
                break
            case 'array':
                if (action === 'insert' && isValid) {
                    const pos = parseInt(secondaryInput)
                    if (!isNaN(pos) && pos >= 0 && pos <= arr.length) {
                        setArr(prev => { const n = [...prev]; n.splice(pos, 0, val); return n }); flash(`Inserted ${val} at [${pos}]`)
                    } else { setArr(prev => [...prev, val]); flash(`Appended ${val}`) }
                }
                if (action === 'delete') {
                    const pos = parseInt(secondaryInput)
                    if (!isNaN(pos) && pos >= 0 && pos < arr.length) {
                        setArr(prev => prev.filter((_, i) => i !== pos)); flash(`Deleted element at [${pos}]`)
                    } else if (isValid) {
                        const vi = arr.indexOf(val)
                        if (vi >= 0) { setArr(prev => prev.filter((_, i) => i !== vi)); flash(`Deleted ${val} at [${vi}]`) }
                        else flash(`${val} not in array`)
                    } else { setArr([]); flash('Array cleared') }
                }
                if (action === 'search' && isValid) {
                    const idx = arr.indexOf(val)
                    setArrActive(idx); setTimeout(() => setArrActive(null), 2000)
                    flash(idx >= 0 ? `Found ${val} at [${idx}]` : `${val} not in array`)
                }
                if (action === 'sort') { setArr(prev => [...prev].sort((a, b) => a - b)); flash('Array sorted ascending (O(n log n))') }
                if (action === 'reverse') { setArr(prev => [...prev].reverse()); flash('Array reversed') }
                if (action === 'clear') { setArr([]); setArrActive(null); flash('Array cleared') }
                break
            case 'hash_table': {
                const key = hashKey.trim() || `key${hashEntries.length}`
                if (action === 'insert' && isValid) {
                    const bucket = Array.from(key).reduce((acc, c) => acc + c.charCodeAt(0), 0) % 8
                    setHashEntries(prev => [...prev.filter(e => e.key !== key), { key, val, bucket }])
                    flash(`Stored "${key}" → ${val} in bucket [${bucket}]`)
                }
                if (action === 'search') {
                    const entry = hashEntries.find(e => e.key === key)
                    flash(entry ? `Found "${key}" → ${entry.val} in bucket [${entry.bucket}]` : `Key "${key}" not found`)
                }
                if (action === 'delete') {
                    if (hashKey.trim()) {
                        const e = hashEntries.find(e => e.key === key)
                        if (e) { setHashEntries(prev => prev.filter(x => x.key !== key)); flash(`Deleted key "${key}" from bucket [${e.bucket}]`) }
                        else flash(`Key "${key}" not found`)
                    } else { setHashEntries([]); flash('Hash Table Cleared') }
                }
                break
            }
            case 'heap':
                if (action === 'insert' && isValid) {
                    setHeapItems(prev => {
                        const next = [...prev, val]; let i = next.length - 1
                        while (i > 0) {
                            const parent = Math.floor((i - 1) / 2)
                            const shouldSwap = heapType === 'min' ? next[i] < next[parent] : next[i] > next[parent]
                            if (shouldSwap) { [next[i], next[parent]] = [next[parent], next[i]]; i = parent } else break
                        }
                        return next
                    }); flash(`Inserted ${val} into ${heapType}-heap`)
                }
                if (action === 'pop') {
                    if (heapItems.length === 0) { flash('Heap is empty!'); return }
                    flash(`Extracted root: ${heapItems[0]}`)
                    setHeapItems(prev => {
                        if (prev.length === 1) return []
                        const next = [...prev]; next[0] = next[next.length - 1]; next.pop(); let i = 0
                        while (true) {
                            const left = 2 * i + 1; const right = 2 * i + 2; let target = i
                            if (left < next.length && (heapType === 'min' ? next[left] < next[target] : next[left] > next[target])) target = left
                            if (right < next.length && (heapType === 'min' ? next[right] < next[target] : next[right] > next[target])) target = right
                            if (target === i) break; [next[i], next[target]] = [next[target], next[i]]; i = target
                        }
                        return next
                    })
                }
                if (action === 'peek') { flash(heapItems.length > 0 ? `${heapType === 'min' ? 'Min' : 'Max'} (root): ${heapItems[0]}  |  Size: ${heapItems.length}` : 'Heap is empty') }
                if (action === 'clear') { setHeapItems([]); flash('Heap Cleared') }
                break
            case 'graph': {
                const adjMap: Record<string, string[]> = {}
                GRAPH_EDGES.forEach(([a, b]) => { adjMap[a] = [...(adjMap[a] || []), b]; adjMap[b] = [...(adjMap[b] || []), a] })
                const startId = (input.trim().toUpperCase() || 'A')
                const validStart = GRAPH_NODES.find(n => n.id === startId)
                if (action === 'search' && validStart) {
                    // BFS
                    const order: string[] = []; const q = [startId]; const seen: Record<string,boolean> = { [startId]: true }
                    while (q.length) { const cur = q.shift()!; order.push(cur); (adjMap[cur] || []).forEach(nb => { if (!seen[nb]) { seen[nb] = true; q.push(nb) } }) }
                    setGraphVisited([]); let d = 0
                    order.forEach(id => { setTimeout(() => { setGraphActive(id); setGraphVisited(prev => [...prev, id]) }, d); d += 600 })
                    setTimeout(() => setGraphActive(null), d)
                    flash(`BFS from ${startId}: ${order.join(' → ')}`)
                } else if (action === 'traverse') {
                    // DFS
                    const order: string[] = []; const stk = [startId]; const seen: Record<string,boolean> = {}
                    while (stk.length) { const cur = stk.pop()!; if (!seen[cur]) { seen[cur] = true; order.push(cur); [...(adjMap[cur] || [])].reverse().forEach(nb => { if (!seen[nb]) stk.push(nb) }) } }
                    setGraphVisited([]); let d = 0
                    order.forEach(id => { setTimeout(() => { setGraphActive(id); setGraphVisited(prev => [...prev, id]) }, d); d += 600 })
                    setTimeout(() => setGraphActive(null), d)
                    flash(`DFS from ${startId}: ${order.join(' → ')}`)
                } else if (action === 'clear') {
                    setGraphVisited([]); setGraphActive(null); flash('Traversal cleared')
                }
                break
            }
        }
        setInput('')
        setHashKey('')
    }

    const cfg = STRUCTURES.find(s => s.id === structure)!
    const cmp = COMPLEXITY[structure]
    const accentHex: Record<string, string> = {
        'arc-neon': '#00e5ff', 'pink-500': '#ec4899', 'blue-400': '#60a5fa', 'yellow-400': '#facc15',
        'orange-400': '#fb923c', 'emerald-400': '#34d399', 'purple-400': '#a78bfa', 'red-400': '#f87171', 'cyan-400': '#22d3ee'
    }
    const accent = accentHex[cfg.color] || '#00e5ff'

    return (
        <div className="space-y-6">
            {/* Structure Selector */}
            <div className="glass-card bg-black/40 border-white/10 p-4">
                <div className="font-display text-[9px] text-white/40 tracking-[0.4em] uppercase mb-3">SELECT DATA STRUCTURE</div>
                <div className="flex flex-wrap gap-2">
                    {STRUCTURES.map(s => {
                        const Icon = s.icon
                        const hex = accentHex[s.color]
                        return (
                            <button key={s.id} onClick={() => { setStructure(s.id); setMessage('') }}
                                className={cn("px-3 py-2 border text-[10px] font-display uppercase tracking-widest transition-all flex items-center gap-2",
                                    structure === s.id ? "bg-white/10 text-white" : "border-white/10 text-white/40 hover:border-white/30 hover:text-white/70")}
                                style={structure === s.id ? { borderColor: hex, color: hex, backgroundColor: `${hex}1a` } : {}}>
                                <Icon className="w-3 h-3" /> {s.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Visualizer */}
                <div className="xl:col-span-2 space-y-4">
                    {/* Header HUD */}
                    <div className="flex items-center justify-between glass-card bg-black/40 border-white/10 p-4">
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 animate-pulse" style={{ color: accent }} />
                            <span className="font-display text-xs tracking-[0.4em] uppercase" style={{ color: accent }}>{cmp.name.toUpperCase()}</span>
                        </div>
                        {message && <div className="font-mono text-[10px] text-white/60 animate-motion-blur-in truncate max-w-xs">{'>'} {message}</div>}
                    </div>

                    {/* Canvas */}
                    <div className="glass-card bg-black/40 border-white/10 relative overflow-hidden h-[420px]"
                        style={{ backgroundImage: `radial-gradient(circle at center, ${accent}0d 0%, transparent 70%)` }}>
                        <div className="w-full h-full">
                            {structure === 'bst' && <div className="w-full h-full p-4"><TreeSVG root={bstRoot} activeVal={activeTreeVal} isAVL={false} /></div>}
                            {structure === 'avl' && <div className="w-full h-full p-4"><TreeSVG root={avlRoot} activeVal={activeTreeVal} isAVL={true} /></div>}
                            {structure === 'linked_list' && <div className="w-full h-full overflow-x-auto"><LinkedListViz nodes={linkedList} activeIdx={llActive} /></div>}
                            {structure === 'stack' && <StackViz items={stack} activeIdx={stack.length - 1} />}
                            {structure === 'queue' && <QueueViz items={queue} />}
                            {structure === 'array' && <ArrayViz items={arr} activeIdx={arrActive} />}
                            {structure === 'hash_table' && <HashTableViz entries={hashEntries} />}
                            {structure === 'heap' && <div className="w-full h-full p-4 relative"><HeapViz items={heapItems} heapType={heapType} /></div>}
                            {structure === 'graph' && <div className="w-full h-full p-4"><GraphViz active={graphActive} visited={graphVisited} /></div>}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="glass-card bg-black/40 border-white/10 p-4 space-y-4">
                        {/* Heap type toggle */}
                        {structure === 'heap' && (
                            <div className="flex gap-2">
                                <button onClick={() => setHeapType('min')} className={cn("px-3 py-1.5 text-[9px] font-display uppercase tracking-widest border transition-colors", heapType === 'min' ? "border-red-400 bg-red-400/10 text-red-400" : "border-white/10 text-white/40")}>Min-Heap</button>
                                <button onClick={() => setHeapType('max')} className={cn("px-3 py-1.5 text-[9px] font-display uppercase tracking-widest border transition-colors", heapType === 'max' ? "border-red-400 bg-red-400/10 text-red-400" : "border-white/10 text-white/40")}>Max-Heap</button>
                            </div>
                        )}

                        {/* Traversal selector for trees */}
                        {(structure === 'bst' || structure === 'avl') && (
                            <div className="flex gap-2 items-center">
                                <span className="font-display text-[9px] text-white/40 uppercase tracking-widest">Traversal:</span>
                                {(['inorder','preorder','postorder'] as const).map(o => (
                                    <button key={o} onClick={() => setSecondaryInput(o)}
                                        className={cn("px-2 py-1 text-[9px] font-display uppercase tracking-widest border transition-colors", secondaryInput === o ? "border-white/50 text-white bg-white/10" : "border-white/10 text-white/40 hover:border-white/30")}>
                                        {o}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Secondary input: position for list/array */}
                        {(structure === 'linked_list' || structure === 'array') && (
                            <div className="flex items-center gap-2">
                                <span className="font-display text-[9px] text-white/40 uppercase tracking-widest w-24">Index (opt):</span>
                                <input value={secondaryInput} onChange={e => setSecondaryInput(e.target.value)} placeholder="e.g. 2"
                                    className="bg-black/40 border border-white/10 text-white font-mono text-sm px-3 py-1.5 w-20 focus:outline-none" />
                            </div>
                        )}

                        <div className="flex gap-2 flex-wrap">
                            {/* Value input */}
                            {structure !== 'graph' && (
                                <>
                                    {structure === 'hash_table' && (
                                        <input value={hashKey} onChange={e => setHashKey(e.target.value)} placeholder="Key" className="bg-black/40 border border-white/10 text-white font-mono text-sm px-3 py-2 w-24 focus:outline-none" />
                                    )}
                                    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleAction('insert') }}
                                        placeholder={structure === 'graph' ? 'Node (A-F)' : 'Value'}
                                        className="bg-black/40 border border-white/10 text-white font-mono text-sm px-3 py-2 focus:outline-none flex-1"
                                        onFocus={e => (e.target.style.borderColor = accent)}
                                        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
                                    <button onClick={() => handleAction('random')} className="px-3 py-2 border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-colors">
                                        <Dices className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                            {structure === 'graph' && (
                                <input value={input} onChange={e => setInput(e.target.value)} placeholder="Start node (A–F)"
                                    className="bg-black/40 border border-white/10 text-white font-mono text-sm px-3 py-2 focus:outline-none flex-1"
                                    onFocus={e => (e.target.style.borderColor = accent)}
                                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
                            )}

                            {/* Structure-specific operation buttons */}
                            {(structure === 'bst' || structure === 'avl') && (<>
                                <button onClick={() => handleAction('insert')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center gap-1"><Plus className="w-3 h-3" />Insert</button>
                                <button onClick={() => handleAction('delete')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">Delete</button>
                                <button onClick={() => handleAction('search')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/10 text-white/60 hover:bg-white/5 transition-colors flex items-center gap-1"><Search className="w-3 h-3" />Search</button>
                                <button onClick={() => handleAction('traverse')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/20 text-white/70 hover:bg-white/10 transition-colors">Traverse</button>
                                <button onClick={() => handleAction('clear')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/10 text-white/30 hover:bg-white/5 transition-colors flex items-center gap-1"><RefreshCw className="w-3 h-3" />Clear</button>
                            </>)}
                            {structure === 'linked_list' && (<>
                                <button onClick={() => handleAction('push')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/20 text-white hover:bg-white/10 transition-colors">Prepend</button>
                                <button onClick={() => handleAction('insert')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border text-white/70 hover:bg-white/5 transition-colors" style={{borderColor:`${accent}50`}}>Append/At</button>
                                <button onClick={() => handleAction('delete')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">Delete Val</button>
                                <button onClick={() => handleAction('search')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/10 text-white/60 hover:bg-white/5 transition-colors flex items-center gap-1"><Search className="w-3 h-3" />Find</button>
                                <button onClick={() => handleAction('reverse')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/20 text-white/70 hover:bg-white/10 transition-colors">Reverse</button>
                                <button onClick={() => handleAction('clear')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/10 text-white/30 hover:bg-white/5 transition-colors flex items-center gap-1"><RefreshCw className="w-3 h-3" />Clear</button>
                            </>)}
                            {structure === 'stack' && (<>
                                <button onClick={() => handleAction('push')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border text-white/80 hover:bg-white/10 transition-colors" style={{borderColor:`${accent}80`}}><Plus className="w-3 h-3 inline mr-1" />Push</button>
                                <button onClick={() => handleAction('pop')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-yellow-400/30 text-yellow-400 hover:bg-yellow-500/10 transition-colors">Pop</button>
                                <button onClick={() => handleAction('peek')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/10 text-white/60 hover:bg-white/5 transition-colors">Peek Top</button>
                                <button onClick={() => handleAction('clear')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/10 text-white/30 hover:bg-white/5 transition-colors flex items-center gap-1"><RefreshCw className="w-3 h-3" />Clear</button>
                            </>)}
                            {structure === 'queue' && (<>
                                <button onClick={() => handleAction('enqueue')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border text-white/80 hover:bg-white/10 transition-colors" style={{borderColor:`${accent}80`}}><Plus className="w-3 h-3 inline mr-1" />Enqueue</button>
                                <button onClick={() => handleAction('dequeue')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-orange-400/30 text-orange-400 hover:bg-orange-500/10 transition-colors">Dequeue</button>
                                <button onClick={() => handleAction('peek')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/10 text-white/60 hover:bg-white/5 transition-colors">Peek Front/Rear</button>
                                <button onClick={() => handleAction('clear')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/10 text-white/30 hover:bg-white/5 transition-colors flex items-center gap-1"><RefreshCw className="w-3 h-3" />Clear</button>
                            </>)}
                            {structure === 'array' && (<>
                                <button onClick={() => handleAction('insert')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center gap-1"><Plus className="w-3 h-3" />Append/At</button>
                                <button onClick={() => handleAction('delete')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">Delete Val/At</button>
                                <button onClick={() => handleAction('search')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/10 text-white/60 hover:bg-white/5 transition-colors flex items-center gap-1"><Search className="w-3 h-3" />Search</button>
                                <button onClick={() => handleAction('sort')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors">Sort ↑</button>
                                <button onClick={() => handleAction('reverse')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/20 text-white/70 hover:bg-white/10 transition-colors">Reverse</button>
                                <button onClick={() => handleAction('clear')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/10 text-white/30 hover:bg-white/5 transition-colors flex items-center gap-1"><RefreshCw className="w-3 h-3" />Clear</button>
                            </>)}
                            {structure === 'hash_table' && (<>
                                <button onClick={() => handleAction('insert')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center gap-1"><Plus className="w-3 h-3" />Set</button>
                                <button onClick={() => handleAction('search')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/10 text-white/60 hover:bg-white/5 transition-colors flex items-center gap-1"><Search className="w-3 h-3" />Get</button>
                                <button onClick={() => handleAction('delete')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">Delete Key</button>
                            </>)}
                            {structure === 'heap' && (<>
                                <button onClick={() => handleAction('insert')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center gap-1"><Plus className="w-3 h-3" />Insert</button>
                                <button onClick={() => handleAction('pop')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-red-400/40 text-red-400 hover:bg-red-500/10 transition-colors">Extract Root</button>
                                <button onClick={() => handleAction('peek')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/10 text-white/60 hover:bg-white/5 transition-colors">Peek Root</button>
                                <button onClick={() => handleAction('clear')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/10 text-white/30 hover:bg-white/5 transition-colors flex items-center gap-1"><RefreshCw className="w-3 h-3" />Clear</button>
                            </>)}
                            {structure === 'graph' && (<>
                                <button onClick={() => handleAction('search')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border text-white/80 hover:bg-white/10 transition-colors" style={{borderColor:`${accent}60`}}>BFS</button>
                                <button onClick={() => handleAction('traverse')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/20 text-white/70 hover:bg-white/10 transition-colors">DFS</button>
                                <button onClick={() => handleAction('clear')} className="px-3 py-2 text-[9px] font-display uppercase tracking-widest border border-white/10 text-white/30 hover:bg-white/5 transition-colors flex items-center gap-1"><RefreshCw className="w-3 h-3" />Reset</button>
                            </>)}
                        </div>

                        {/* Traversal result display */}
                        {traversalResult && (
                            <div className="bg-black/60 border border-white/10 p-3 font-mono text-[10px] text-white/70 leading-relaxed">
                                <span className="uppercase tracking-widest text-[8px]" style={{color: accent}}>{traversalResult.order}: </span>
                                {traversalResult.vals.join(' → ')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Complexity Panel */}
                <div className="space-y-4">
                    <div className="glass-card bg-black/60 border-white/10 p-5 space-y-5 h-full flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <span className="font-display text-[10px] text-white/40 tracking-[0.4em] uppercase">COMPLEXITY MATRIX</span>
                            <Database className="w-3 h-3" style={{ color: accent }} />
                        </div>

                        {/* Time Complexity Table */}
                        <div className="space-y-2">
                            <div className="font-display text-[9px] text-white/40 tracking-widest uppercase mb-3">TIME COMPLEXITY</div>
                            <div className="grid grid-cols-3 gap-px text-[8px] font-display uppercase tracking-widest bg-white/5 border border-white/5 overflow-hidden">
                                <div className="bg-black/60 px-2 py-2 text-white/40">Operation</div>
                                <div className="bg-black/60 px-2 py-2 text-white/40">Avg</div>
                                <div className="bg-black/60 px-2 py-2 text-white/40">Worst</div>
                                {cmp.ops.map((o, i) => (
                                    <div key={i} className={cn("contents")}>
                                        <div className="bg-black/40 px-2 py-2 font-mono text-[9px] text-white/70">{o.op}</div>
                                        <div className="bg-black/40 px-2 py-2 font-mono text-[9px]" style={{ color: accent }}>{o.avg}</div>
                                        <div className={cn("bg-black/40 px-2 py-2 font-mono text-[9px]",
                                            o.worst.includes('n)') && !o.worst.includes('log') && o.worst !== 'O(n)' ? 'text-red-400' :
                                                o.worst === 'O(n)' ? 'text-yellow-400' : 'text-emerald-400'
                                        )}>{o.worst}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Space Complexity */}
                        <div className="flex items-center justify-between bg-black/40 border border-white/5 px-4 py-3">
                            <span className="font-display text-[9px] text-white/40 uppercase tracking-widest">Space Complexity</span>
                            <span className="font-mono text-sm" style={{ color: accent }}>{cmp.space}</span>
                        </div>

                        {/* AVL Balance Factor Legend */}
                        {structure === 'avl' && (
                            <div className="bg-pink-500/5 border border-pink-500/20 p-3 space-y-1">
                                <div className="font-display text-[9px] text-pink-500 uppercase tracking-widest mb-2">AVL Balance Factor</div>
                                <div className="flex items-center gap-2 text-[9px] font-mono">
                                    <span className="text-emerald-400">bf ∈ {'{-1, 0, 1}'}</span>
                                    <span className="text-white/40">= balanced</span>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] font-mono">
                                    <span className="text-red-400">|bf| &gt; 1</span>
                                    <span className="text-white/40">= rotation needed</span>
                                </div>
                            </div>
                        )}

                        {/* Note */}
                        <div className="bg-black/40 border border-white/5 border-l-2 p-3 flex-1" style={{ borderLeftColor: accent }}>
                            <div className="font-display text-[8px] tracking-widest uppercase mb-2 opacity-60" style={{ color: accent }}>Analysis Note</div>
                            <p className="font-mono text-[9px] text-white/60 leading-relaxed">{cmp.note}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
