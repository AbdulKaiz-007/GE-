'use client'

import { useState, useEffect, useRef } from 'react'
import { Atom, Play, RefreshCw, Crosshair, Cpu } from 'lucide-react'
import { cn } from '@/lib/game-engine'

export default function PhysicsLab({ topic }: { topic: string }) {
    const [velocity, setVelocity] = useState(50) // m/s
    const [angle, setAngle] = useState(45) // degrees
    const [gravity, setGravity] = useState(9.81) // m/s^2

    const [time, setTime] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [trajectory, setTrajectory] = useState<{x: number, y: number}[]>([])
    
    // Calculated maximums for UI
    const rad = angle * (Math.PI / 180)
    const maxTime = (2 * velocity * Math.sin(rad)) / gravity
    const maxHeight = Math.pow(velocity * Math.sin(rad), 2) / (2 * gravity)
    const maxRange = (Math.pow(velocity, 2) * Math.sin(2 * rad)) / gravity

    // Animation loop
    const requestRef = useRef<number>()
    const lastTimeRef = useRef<number>()

    const calculatePosition = (t: number) => {
        const x = velocity * Math.cos(rad) * t
        const y = velocity * Math.sin(rad) * t - 0.5 * gravity * Math.pow(t, 2)
        return { x, y }
    }

    const animate = (timestamp: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = timestamp
        const dt = (timestamp - lastTimeRef.current) / 1000 // delta time in seconds (accelerated)
        lastTimeRef.current = timestamp

        setTime(prevTime => {
            const nextTime = prevTime + dt * 2 // Speed up the simulation visually
            // Stop when it hits the ground
            if (nextTime >= maxTime) {
                setIsRunning(false)
                return maxTime
            }
            return nextTime
        })
        
        requestRef.current = requestAnimationFrame(animate)
    }

    useEffect(() => {
        if (isRunning) {
            requestRef.current = requestAnimationFrame(animate)
        }
        return () => cancelAnimationFrame(requestRef.current!)
    }, [isRunning, gravity, velocity, angle, maxTime]) // dependencies for safe calculation

    // Update trajectory array while running
    useEffect(() => {
        if (time > 0) {
            setTrajectory(prev => {
                const pos = calculatePosition(time)
                // Add if it's the first point or significantly different from the last to prevent huge arrays
                if (prev.length === 0 || Math.abs(prev[prev.length - 1].x - pos.x) > 1) {
                    return [...prev, pos]
                }
                return prev
            })
        }
    }, [time])

    const handleLaunch = () => {
        setTime(0)
        setTrajectory([])
        setIsRunning(true)
        lastTimeRef.current = undefined
    }

    const handleReset = () => {
        setIsRunning(false)
        setTime(0)
        setTrajectory([])
    }

    // Mapping world physics coordinates to SVG viewport
    const svgWidth = 800
    const svgHeight = 400
    const padding = 40
    
    // Scale dynamically based on maxRange and maxHeight
    const scaleX = (svgWidth - padding * 2) / (Math.max(maxRange, 100) * 1.1)
    const scaleY = (svgHeight - padding * 2) / (Math.max(maxHeight, 50) * 1.5)
    
    const viewportScale = Math.min(scaleX, scaleY)

    const mapPoint = (x: number, y: number) => {
        const mappedX = padding + (x * viewportScale)
        const mappedY = svgHeight - padding - (y * viewportScale)
        return { mappedX, mappedY }
    }

    // Generate Path Data
    const pathD = trajectory.length > 0 
        ? trajectory.map((p, i) => {
            const { mappedX, mappedY } = mapPoint(p.x, p.y)
            return `${i === 0 ? 'M' : 'L'} ${mappedX} ${mappedY}`
        }).join(' ')
        : ''

    const currentPos = calculatePosition(time)
    const mappedCurrent = mapPoint(currentPos.x, currentPos.y)
    const origin = mapPoint(0, 0)
    
    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 min-h-[700px]">
            {/* Visualizer Canvas Area */}
            <div className="xl:col-span-2 space-y-6">
                
                {/* HUD Header */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center glass-card bg-black/40 border-white/10 p-4">
                    <div className="flex items-center gap-3">
                        <Atom className="w-5 h-5 text-blue-500 animate-[spin_4s_linear_infinite]" />
                        <span className="font-display text-xs text-blue-500 tracking-[0.4em] uppercase">KINEMATICS ENGINE v4.2</span>
                    </div>
                    
                    <div className="flex gap-6 items-center bg-black/40 border border-white/5 rounded-sm px-6 py-2 shrink-0">
                        <div className="text-center w-24">
                            <div className="font-display text-lg text-white tracking-widest">{currentPos.x.toFixed(1)}m</div>
                            <div className="font-display text-[8px] text-blue-500 tracking-[0.3em] uppercase mb-1">X-Axis Dist</div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center w-24">
                            <div className="font-display text-lg text-white tracking-widest">{Math.max(0, currentPos.y).toFixed(1)}m</div>
                            <div className="font-display text-[8px] text-blue-500 tracking-[0.3em] uppercase mb-1">Y-Axis Alt</div>
                        </div>
                    </div>
                </div>

                {/* Main Action Area */}
                <div className="glass-card bg-black/40 border-white/10 relative overflow-hidden h-[500px]">
                    <div className="absolute inset-0 bg-[url('/bg-noise.png')] opacity-10 pointer-events-none" />
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, transparent 70%)'}}></div>
                    
                    <div className="w-full h-full relative p-4">
                        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full object-contain pointer-events-none drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                            
                            {/* Grid/Background */}
                            <line x1={0} y1={origin.mappedY} x2={svgWidth} y2={origin.mappedY} className="stroke-white/20 stroke-1" />
                            <text x={svgWidth - padding} y={origin.mappedY - 10} className="fill-white/30 font-display text-[10px] tracking-widest">DISTANCE (x)</text>
                            
                            {/* The Target / Range Marker */}
                            {maxRange > 0 && (
                                <g>
                                    <line 
                                        x1={mapPoint(maxRange, 0).mappedX} y1={origin.mappedY - 5}
                                        x2={mapPoint(maxRange, 0).mappedX} y2={origin.mappedY + 5} 
                                        className="stroke-blue-500 stroke-2" 
                                    />
                                    <text 
                                        x={mapPoint(maxRange, 0).mappedX} y={origin.mappedY + 20} 
                                        textAnchor="middle" className="fill-blue-500 font-mono text-[9px]"
                                    >
                                        Impact
                                    </text>
                                </g>
                            )}

                            {/* Max Height Marker */}
                            {maxHeight > 0 && (
                                <g opacity={0.5}>
                                    <line 
                                        x1={padding} y1={mapPoint(0, maxHeight).mappedY}
                                        x2={svgWidth - padding} y2={mapPoint(0, maxHeight).mappedY} 
                                        className="stroke-white/10 stroke-1 stroke-dasharray-[4,4]" 
                                    />
                                    <text 
                                        x={padding} y={mapPoint(0, maxHeight).mappedY - 5} 
                                        className="fill-white/50 font-mono text-[9px]"
                                    >
                                        Apogee ({maxHeight.toFixed(1)}m)
                                    </text>
                                </g>
                            )}
                            
                            {/* Trajectory Trail */}
                            {pathD && <path d={pathD} className="fill-none stroke-blue-500/50 stroke-2 border-dashed stroke-dasharray-[6,6]" />}
                            
                            {/* Theoretical Arc (ghost path) */}
                            {!isRunning && time === 0 && (
                                <path 
                                    d={`M ${origin.mappedX} ${origin.mappedY} 
                                       Q ${mapPoint(maxRange/2, maxHeight * 2).mappedX} ${mapPoint(maxRange/2, maxHeight * 2).mappedY} 
                                       ${mapPoint(maxRange, 0).mappedX} ${origin.mappedY}`}
                                    className="fill-none stroke-white/5 stroke-2 stroke-dasharray-[4,4]" 
                                />
                            )}
                            
                            {/* Projectile */}
                            <g transform={`translate(${mappedCurrent.mappedX}, ${mappedCurrent.mappedY})`}>
                                <circle cx={0} cy={0} r={6} className={cn("fill-blue-500", isRunning && "animate-pulse shadow-[0_0_15px_#3b82f6]")} />
                                <circle cx={0} cy={0} r={12} className={cn("fill-transparent stroke-blue-500/50", isRunning && "animate-ping")} />
                                
                                {/* Velocity Vector Arrow */}
                                {time === 0 && (
                                    <line 
                                        x1={0} y1={0} 
                                        x2={Math.cos(rad) * 40} y2={-Math.sin(rad) * 40} 
                                        className="stroke-white stroke-2" markerEnd="url(#arrow)" 
                                    />
                                )}
                            </g>

                            {/* Define markers */}
                            <defs>
                                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" className="fill-white" />
                                </marker>
                            </defs>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Control Panel */}
            <div className="space-y-6 flex flex-col h-full lg:max-h-[700px]">
                {/* Physical Properties Form */}
                <div className="glass-card bg-black/40 border-white/10 p-6 space-y-6 flex-shrink-0 relative overflow-hidden">
                    <div className="font-display text-[10px] text-white/40 tracking-[0.4em] uppercase pb-4 border-b border-white/10 flex justify-between items-center">
                        <span>ENVIRONMENTAL CONTROLS</span>
                        <Cpu className="w-3 h-3 text-blue-500" />
                    </div>

                    <div className="space-y-4 pt-2">
                        {/* Velocity Control */}
                        <div className="space-y-2">
                            <div className="flex justify-between font-mono text-[10px] text-white/60">
                                <span>Initial Velocity (v₀)</span>
                                <span className="text-blue-500">{velocity} m/s</span>
                            </div>
                            <input 
                                type="range" min="10" max="150" step="5" 
                                value={velocity} onChange={(e) => { setVelocity(Number(e.target.value)); handleReset()}}
                                disabled={isRunning}
                                className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none outline-none cursor-pointer"
                            />
                        </div>

                        {/* Angle Control */}
                        <div className="space-y-2">
                            <div className="flex justify-between font-mono text-[10px] text-white/60">
                                <span>Launch Angle (θ)</span>
                                <span className="text-blue-500">{angle}°</span>
                            </div>
                            <input 
                                type="range" min="5" max="85" step="1" 
                                value={angle} onChange={(e) => { setAngle(Number(e.target.value)); handleReset()}}
                                disabled={isRunning}
                                className="w-full accent-blue-500 h-1 bg-white/10 rounded-full appearance-none outline-none cursor-pointer"
                            />
                        </div>

                        {/* Gravity Preset Control */}
                        <div className="space-y-2">
                            <div className="flex justify-between font-mono text-[10px] text-white/60">
                                <span>Gravity Constant (g)</span>
                                <span className="text-blue-500">{gravity} m/s²</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <button onClick={() => { setGravity(9.81); handleReset()}} disabled={isRunning} className={cn("p-2 text-[9px] font-display uppercase tracking-widest border transition-colors", gravity === 9.81 ? "border-blue-500 bg-blue-500/10 text-blue-500" : "border-white/10 text-white/50 hover:border-white/30")}>Earth</button>
                                <button onClick={() => { setGravity(1.62); handleReset()}} disabled={isRunning} className={cn("p-2 text-[9px] font-display uppercase tracking-widest border transition-colors", gravity === 1.62 ? "border-blue-500 bg-blue-500/10 text-blue-500" : "border-white/10 text-white/50 hover:border-white/30")}>Moon</button>
                                <button onClick={() => { setGravity(24.79); handleReset()}} disabled={isRunning} className={cn("p-2 text-[9px] font-display uppercase tracking-widest border transition-colors", gravity === 24.79 ? "border-blue-500 bg-blue-500/10 text-blue-500" : "border-white/10 text-white/50 hover:border-white/30")}>Jupiter</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-white/10">
                        <button 
                            onClick={handleLaunch} 
                            disabled={isRunning || time >= maxTime}
                            className="flex-1 py-3 bg-blue-500/10 border border-blue-500/30 text-[9px] font-display tracking-widest text-blue-500 uppercase hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Play className="w-3 h-3" /> Execute Launch
                        </button>
                        <button 
                            onClick={handleReset}
                            className="flex-1 py-3 border border-white/10 text-[9px] font-display tracking-widest text-white/50 uppercase hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-3 h-3" /> Reset Vector
                        </button>
                    </div>
                </div>

                {/* Telemetry Log */}
                <div className="glass-card bg-black/60 border-white/10 p-6 flex-1 min-h-[200px] flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Crosshair className="w-24 h-24" />
                    </div>
                    <div className="font-display text-[10px] text-white/40 tracking-[0.4em] uppercase pb-4 border-b border-white/10 z-10">
                        TELEMETRY LOG
                    </div>
                    
                    <ul className="space-y-4 text-white/60 font-sans text-sm leading-relaxed bg-black/40 border border-white/5 p-4 flex-1 mt-4 z-10 flex flex-col justify-center">
                        <li className="flex justify-between items-center border-b border-white/5 pb-2">
                            <strong className="text-white font-display text-[10px] uppercase tracking-widest">Time In Air:</strong>
                            <span className="font-mono text-blue-500">{time.toFixed(2)}s / {maxTime.toFixed(2)}s</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-white/5 pb-2">
                            <strong className="text-white font-display text-[10px] uppercase tracking-widest">Projectile Apogee:</strong>
                            <span className="font-mono text-blue-500">{maxHeight.toFixed(1)}m</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <strong className="text-white font-display text-[10px] uppercase tracking-widest">Calculated Range:</strong>
                            <span className="font-mono text-blue-500">{maxRange.toFixed(1)}m</span>
                        </li>
                    </ul>

                    {time >= maxTime && (
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500 text-center animate-pulse">
                            <span className="font-display text-[10px] tracking-widest uppercase text-blue-500">IMPACT CONFIRMED</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
