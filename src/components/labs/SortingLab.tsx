'use client'

import { useState, useRef, useEffect } from 'react'
import { Activity, Play, RefreshCw, Layers, Database, Cpu, Search } from 'lucide-react'
import { cn } from '@/lib/game-engine'

// ─── SORTING ALGORITHMS ───
function* bubbleSort(array: number[]) {
    const arr = [...array]; const n = arr.length; let sortedCount = 0
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            yield { arr: [...arr], comparing: [j, j + 1], swapping: [], sortedCount }
            if (arr[j] > arr[j + 1]) { [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; yield { arr: [...arr], comparing: [], swapping: [j, j + 1], sortedCount } }
        }
        sortedCount++
    }
    yield { arr, comparing: [], swapping: [], sortedCount: n }
}

function* insertionSort(array: number[]) {
    const arr = [...array]; const n = arr.length
    for (let i = 1; i < n; i++) {
        let key = arr[i]; let j = i - 1
        yield { arr: [...arr], comparing: [j, i], swapping: [], sortedCount: i }
        while (j >= 0 && arr[j] > key) {
            yield { arr: [...arr], comparing: [], swapping: [j, j + 1], sortedCount: i }
            arr[j + 1] = arr[j]; j--
        }
        arr[j + 1] = key
        yield { arr: [...arr], comparing: [], swapping: [j + 1], sortedCount: i }
    }
    yield { arr, comparing: [], swapping: [], sortedCount: n }
}

function* selectionSort(array: number[]) {
    const arr = [...array]; const n = arr.length; let sortedCount = 0
    for (let i = 0; i < n; i++) {
        let minIdx = i
        for (let j = i + 1; j < n; j++) {
            yield { arr: [...arr], comparing: [minIdx, j], swapping: [], sortedCount }
            if (arr[j] < arr[minIdx]) minIdx = j
        }
        if (minIdx !== i) { [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]; yield { arr: [...arr], comparing: [], swapping: [i, minIdx], sortedCount } }
        sortedCount++
    }
    yield { arr, comparing: [], swapping: [], sortedCount: n }
}

function* quickSort(inputArray: number[]): Generator<any> {
    const arr = [...inputArray]
    const stack: [number, number][] = [[0, arr.length - 1]]

    while (stack.length > 0) {
        const [lo, hi] = stack.pop()!
        if (lo >= hi) continue

        const pivot = arr[hi]; let i = lo - 1
        for (let j = lo; j < hi; j++) {
            yield { arr: [...arr], comparing: [j, hi], swapping: [], pivot: hi, sortedCount: 0 }
            if (arr[j] <= pivot) {
                i++
                ;[arr[i], arr[j]] = [arr[j], arr[i]]
                yield { arr: [...arr], comparing: [], swapping: [i, j], pivot: hi, sortedCount: 0 }
            }
        }
        ;[arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]]
        const pivotIdx = i + 1
        yield { arr: [...arr], comparing: [], swapping: [pivotIdx], pivot: pivotIdx, sortedCount: 0 }
        stack.push([lo, pivotIdx - 1])
        stack.push([pivotIdx + 1, hi])
    }
    yield { arr, comparing: [], swapping: [], sortedCount: arr.length }
}

// ─── SEARCH ALGORITHMS ───
function* linearSearch(array: number[], target: number) {
    for (let i = 0; i < array.length; i++) {
        yield { arr: array, scanning: [i], found: null, low: null, high: null, mid: null }
        if (array[i] === target) { yield { arr: array, scanning: [], found: i, low: null, high: null, mid: null }; return }
    }
    yield { arr: array, scanning: [], found: -1, low: null, high: null, mid: null }
}

function* binarySearch(array: number[], target: number) {
    const sorted = [...array].sort((a, b) => a - b)
    let low = 0; let high = sorted.length - 1
    while (low <= high) {
        const mid = Math.floor((low + high) / 2)
        yield { arr: sorted, scanning: [], found: null, low, high, mid }
        if (sorted[mid] === target) { yield { arr: sorted, scanning: [], found: mid, low, high, mid }; return }
        else if (sorted[mid] < target) low = mid + 1
        else high = mid - 1
    }
    yield { arr: sorted, scanning: [], found: -1, low: null, high: null, mid: null }
}

type Mode = 'sort' | 'search'
type SortAlgo = 'bubble' | 'insertion' | 'selection' | 'quick'
type SearchAlgo = 'linear' | 'binary'

export default function SortingLab() {
    const [mode, setMode] = useState<Mode>('sort')
    const [sortAlgo, setSortAlgo] = useState<SortAlgo>('bubble')
    const [searchAlgo, setSearchAlgo] = useState<SearchAlgo>('linear')
    const [arraySize, setArraySize] = useState(24)
    const [speedMs, setSpeedMs] = useState(60)
    const [searchTarget, setSearchTarget] = useState(50)

    const [array, setArray] = useState<number[]>([])
    const [comparing, setComparing] = useState<number[]>([])
    const [swapping, setSwapping] = useState<number[]>([])
    const [pivotIdx, setPivotIdx] = useState<number | null>(null)
    const [sortedCount, setSortedCount] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [stats, setStats] = useState({ comparisons: 0, swaps: 0 })

    // Search states
    const [scanning, setScanning] = useState<number[]>([])
    const [found, setFound] = useState<number | null>(null)
    const [low, setLow] = useState<number | null>(null)
    const [high, setHigh] = useState<number | null>(null)
    const [mid, setMid] = useState<number | null>(null)

    const iterator = useRef<Generator<any> | null>(null)
    const isRunningRef = useRef(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const generateArray = () => {
        stopRun()
        const newArr = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 90) + 10)
        setArray(newArr)
        resetVisuals()
    }

    const resetVisuals = () => {
        setComparing([]); setSwapping([]); setPivotIdx(null); setSortedCount(0)
        setStats({ comparisons: 0, swaps: 0 }); setScanning([]); setFound(null)
        setLow(null); setHigh(null); setMid(null)
    }

    useEffect(() => { generateArray() }, [arraySize])
    useEffect(() => () => stopRun(), [])

    const stopRun = () => { isRunningRef.current = false; setIsRunning(false); if (timeoutRef.current) clearTimeout(timeoutRef.current) }

    const startRun = () => {
        if (isRunningRef.current) return
        isRunningRef.current = true; setIsRunning(true)

        if (!iterator.current) {
            if (mode === 'sort') {
                const algos = { bubble: bubbleSort, insertion: insertionSort, selection: selectionSort, quick: (a: number[]) => quickSort([...a]) }
                iterator.current = algos[sortAlgo](array)
            } else {
                const target = searchTarget
                iterator.current = searchAlgo === 'linear' ? linearSearch([...array], target) : binarySearch([...array], target)
            }
        }

        const runStep = () => {
            if (!isRunningRef.current) return
            const result = iterator.current?.next()
            if (result && !result.done) {
                const s = result.value
                if (mode === 'sort') {
                    setArray(s.arr); setComparing(s.comparing || []); setSwapping(s.swapping || [])
                    setPivotIdx(s.pivot ?? null); if (s.sortedCount !== undefined) setSortedCount(s.sortedCount)
                    setStats(prev => ({ comparisons: prev.comparisons + (s.comparing?.length > 0 ? 1 : 0), swaps: prev.swaps + (s.swapping?.length > 0 ? 1 : 0) }))
                } else {
                    setArray(s.arr); setScanning(s.scanning || []); setFound(s.found ?? null)
                    setLow(s.low ?? null); setHigh(s.high ?? null); setMid(s.mid ?? null)
                }
                timeoutRef.current = setTimeout(runStep, speedMs)
            } else {
                stopRun()
                if (mode === 'sort') { setComparing([]); setSwapping([]); setSortedCount(array.length) }
                iterator.current = null
            }
        }
        runStep()
    }

    const handleReset = () => { iterator.current = null; generateArray() }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 min-h-[700px]">
            <div className="xl:col-span-2 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center glass-card bg-black/40 border-white/10 p-4">
                    <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-sony-indigo animate-pulse" />
                        <span className="font-display text-xs text-sony-indigo tracking-[0.4em] uppercase">ALGO MATRIX v2</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { setMode('sort'); handleReset() }} disabled={isRunning}
                            className={cn("px-4 py-2 text-[9px] font-display uppercase tracking-widest border transition-colors", mode === 'sort' ? "border-sony-indigo bg-sony-indigo/10 text-sony-indigo" : "border-white/10 text-white/40 hover:border-white/20")}>Sort Mode</button>
                        <button onClick={() => { setMode('search'); handleReset() }} disabled={isRunning}
                            className={cn("px-4 py-2 text-[9px] font-display uppercase tracking-widest border transition-colors flex items-center gap-2", mode === 'search' ? "border-arc-neon bg-arc-neon/10 text-arc-neon" : "border-white/10 text-white/40 hover:border-white/20")}>
                            <Search className="w-3 h-3" /> Search Mode
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="glass-card bg-black/40 border-white/10 relative overflow-hidden h-[500px] flex flex-col justify-end px-4 pb-4">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.05) 0%, transparent 70%)' }} />
                    {isRunning && (
                        <div className="absolute top-4 left-4 z-20 glass-card bg-sony-indigo/10 border-sony-indigo/30 px-4 py-2 text-[9px] font-display tracking-widest text-sony-indigo uppercase animate-pulse flex items-center gap-3">
                            <Layers className="w-4 h-4" /> {mode === 'sort' ? 'REORGANIZING DATA...' : 'SCANNING MEMORY...'}
                        </div>
                    )}

                    {/* Search range markers */}
                    {mode === 'search' && low !== null && high !== null && (
                        <>
                            <div className="absolute top-0 bottom-0 z-10 border-l-2 border-blue-500/50 pointer-events-none" style={{ left: `${(low! / array.length) * 100}%` }} />
                            <div className="absolute top-0 bottom-0 z-10 border-l-2 border-blue-500/50 pointer-events-none" style={{ left: `${((high! + 1) / array.length) * 100}%` }} />
                        </>
                    )}

                    <div className="w-full flex items-end justify-between gap-px h-[400px] relative z-10">
                        {array.map((val, idx) => {
                            const isComparing = comparing.includes(idx)
                            const isSwapping = swapping.includes(idx)
                            const isPivot = pivotIdx === idx
                            const isFoundItem = found === idx
                            const isMidItem = mid === idx
                            const isScanning = scanning.includes(idx)
                            const isLow = low === idx
                            const isHigh = high === idx
                            const inRange = low !== null && high !== null && idx >= low && idx <= high
                            const isSorted = mode === 'sort' && (sortAlgo === 'bubble' || sortAlgo === 'selection')
                                ? idx >= array.length - sortedCount
                                : mode === 'sort' && sortAlgo === 'insertion'
                                    ? idx < sortedCount && !isRunning
                                    : false

                            return (
                                <div key={`bar-${idx}`} className="relative flex-1" style={{ height: `${val}%` }}>
                                    <div className={cn(
                                        "absolute inset-x-0 bottom-0 w-full rounded-t-sm transition-all duration-75",
                                        isFoundItem ? "bg-emerald-500 shadow-[0_0_20px_#10b981]" :
                                        isMidItem ? "bg-yellow-400 shadow-[0_0_15px_#fbbf24]" :
                                        isSwapping || isPivot ? "bg-arc-neon shadow-[0_0_15px_#00e5ff]" :
                                        isComparing || isScanning ? "bg-pink-500 shadow-[0_0_10px_#ec4899]" :
                                        isSorted ? "bg-white shadow-[0_0_8px_#fff]" :
                                        inRange && mode === 'search' ? "bg-sony-indigo/80 border-t border-sony-indigo shadow-[0_0_8px_#6366f1]" :
                                        "bg-sony-indigo/40 border-t border-sony-indigo/60"
                                    )} style={{ height: '100%' }} />
                                </div>
                            )
                        })}
                    </div>
                    <div className="w-full h-px bg-white/20 mt-2 relative z-10" />
                </div>
            </div>

            {/* Controls */}
            <div className="space-y-6 flex flex-col">
                <div className="glass-card bg-black/40 border-white/10 p-6 space-y-5 flex-shrink-0 relative overflow-hidden">
                    <div className="font-display text-[10px] text-white/40 tracking-[0.4em] uppercase pb-4 border-b border-white/10 flex justify-between items-center">
                        <span>CONTROLS</span><Database className="w-3 h-3 text-sony-indigo" />
                    </div>

                    {mode === 'sort' ? (
                        <div className="grid grid-cols-2 gap-2">
                            {(['bubble', 'insertion', 'selection', 'quick'] as SortAlgo[]).map(a => (
                                <button key={a} onClick={() => { setSortAlgo(a); handleReset() }} disabled={isRunning}
                                    className={cn("p-3 text-[10px] font-display uppercase tracking-widest border transition-colors capitalize", sortAlgo === a ? "border-sony-indigo bg-sony-indigo/10 text-sony-indigo" : "border-white/10 text-white/50 hover:border-white/30")}>
                                    {a}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-2">
                                {(['linear', 'binary'] as SearchAlgo[]).map(a => (
                                    <button key={a} onClick={() => { setSearchAlgo(a); handleReset() }} disabled={isRunning}
                                        className={cn("p-3 text-[10px] font-display uppercase tracking-widest border transition-colors capitalize", searchAlgo === a ? "border-arc-neon bg-arc-neon/10 text-arc-neon" : "border-white/10 text-white/50 hover:border-white/30")}>
                                        {a}
                                    </button>
                                ))}
                            </div>
                            {searchAlgo === 'binary' && <p className="font-mono text-[9px] text-white/40 italic">Binary Search requires sorted data. Array will be auto-sorted.</p>}
                            <div className="space-y-2">
                                <div className="flex justify-between font-mono text-[10px] text-white/60">
                                    <span>Target Value</span>
                                    <span className="text-arc-neon">{searchTarget}</span>
                                </div>
                                <input type="range" min="10" max="99" step="1" value={searchTarget} onChange={e => { setSearchTarget(Number(e.target.value)); handleReset() }}
                                    disabled={isRunning} className="w-full accent-arc-neon h-1 bg-white/10 rounded-full appearance-none outline-none cursor-pointer" />
                            </div>
                        </>
                    )}

                    <div className="space-y-3 pt-3 border-t border-white/10">
                        <div className="flex justify-between font-mono text-[10px] text-white/60">
                            <span>Array Size (N)</span><span className="text-sony-indigo">{arraySize}</span>
                        </div>
                        <input type="range" min="10" max="60" step="2" value={arraySize} onChange={e => setArraySize(Number(e.target.value))} disabled={isRunning}
                            className="w-full accent-sony-indigo h-1 bg-white/10 rounded-full appearance-none outline-none cursor-pointer" />
                        <div className="flex justify-between font-mono text-[10px] text-white/60">
                            <span>Execution Speed</span><span className="text-sony-indigo">{speedMs}ms</span>
                        </div>
                        <input type="range" min="10" max="300" step="10" value={310 - speedMs} onChange={e => setSpeedMs(310 - Number(e.target.value))}
                            className="w-full accent-sony-indigo h-1 bg-white/10 rounded-full appearance-none outline-none cursor-pointer" />
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-white/10">
                        {isRunning ? (
                            <button onClick={stopRun} className="flex-1 py-3 bg-red-500/10 border border-red-500/30 text-[9px] font-display tracking-widest text-red-500 uppercase hover:bg-red-500/20 transition-colors">Halt</button>
                        ) : (
                            <button onClick={startRun} className="flex-1 py-3 bg-sony-indigo/10 border border-sony-indigo/30 text-[9px] font-display tracking-widest text-sony-indigo uppercase hover:bg-sony-indigo/20 transition-colors flex items-center justify-center gap-2">
                                <Play className="w-3 h-3" /> Execute
                            </button>
                        )}
                        <button onClick={handleReset} disabled={isRunning}
                            className="flex-1 py-3 border border-white/10 text-[9px] font-display tracking-widest text-white/50 uppercase hover:bg-white/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                            <RefreshCw className="w-3 h-3" /> Reset
                        </button>
                    </div>
                </div>

                {/* Legend */}
                <div className="glass-card bg-black/60 border-white/10 p-6 flex-1 flex flex-col">
                    <div className="font-display text-[10px] text-white/40 tracking-[0.4em] uppercase pb-4 border-b border-white/10 flex items-center justify-between">
                        <span>LEGEND</span><Cpu className="w-3 h-3 text-sony-indigo" />
                    </div>
                    <div className="mt-4 flex-1 flex flex-col justify-center space-y-3">
                        {(() => {
                            const legendItems: { color: string; label: string }[] = mode === 'sort' ? [
                                { color: 'bg-sony-indigo/40', label: 'Unsorted Value' },
                                { color: 'bg-pink-500', label: 'Evaluating / Comparing' },
                                { color: 'bg-arc-neon', label: 'Memory Swap / Pivot' },
                                { color: 'bg-white', label: 'Sorted in Final Position' }
                            ] : [
                                { color: 'bg-sony-indigo/80', label: 'Active Search Range' },
                                { color: 'bg-pink-500', label: 'Scanning / Checking' },
                                { color: 'bg-yellow-400', label: 'Mid-point (Binary)' },
                                { color: 'bg-emerald-500', label: 'Target Found!' }
                            ]
                            return legendItems.map(({ color, label }) => (
                                <div key={label} className="flex items-center gap-3 bg-black/40 border border-white/5 px-3 py-2">
                                    <div className={cn("w-4 h-4 rounded-sm flex-shrink-0", color)}></div>
                                    <span className="font-mono text-[10px] text-white/70 uppercase">{label}</span>
                                </div>
                            ))
                        })()}

                        {mode === 'sort' && (
                            <div className="mt-4 pt-4 border-t border-white/10 space-y-1">
                                <div className="flex justify-between font-mono text-[10px] text-white/50"><span>Comparisons:</span><span className="text-sony-indigo">{stats.comparisons}</span></div>
                                <div className="flex justify-between font-mono text-[10px] text-white/50"><span>Swaps:</span><span className="text-arc-neon">{stats.swaps}</span></div>
                            </div>
                        )}
                        {mode === 'search' && found !== null && (
                            <div className={cn("mt-4 p-3 border text-center animate-pulse", found >= 0 ? "border-emerald-500 bg-emerald-500/10" : "border-red-500 bg-red-500/10")}>
                                <span className={cn("font-display text-[10px] tracking-widest uppercase", found >= 0 ? "text-emerald-500" : "text-red-500")}>
                                    {found >= 0 ? `Found at index [${found}]` : 'Value Not In Array'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
