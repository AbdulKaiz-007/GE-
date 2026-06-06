'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Lock, ScanLine, Radar, Cpu, Terminal, ShieldAlert, Zap, Layers, Activity } from 'lucide-react'
import { cn } from '@/lib/game-engine'

export default function HomePage() {
    const router = useRouter()
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
    const [decrypting, setDecrypting] = useState(false)
    const [decryptedText, setDecryptedText] = useState('0x4F92A1')
    const containerRef = useRef<HTMLDivElement>(null)

    // Mouse tracking for spatial effects
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return
            const { left, top, width, height } = containerRef.current.getBoundingClientRect()
            const x = ((e.clientX - left) / width) * 100
            const y = ((e.clientY - top) / height) * 100
            setMousePos({ x, y })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    // Simulated decryption effect
    useEffect(() => {
        if (!decrypting) return

        let iters = 0
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
        const target = 'ORACLE SYNC'

        const interval = setInterval(() => {
            setDecryptedText(target.split('').map((char, index) => {
                if (index < iters) return target[index]
                return chars[Math.floor(Math.random() * chars.length)]
            }).join(''))

            if (iters >= target.length) {
                clearInterval(interval)
                setTimeout(() => setDecrypting(false), 2000)
            }
            iters += 1 / 3
        }, 30)

        return () => clearInterval(interval)
    }, [decrypting])

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-sony-nebula-deep text-arc-text p-4 md:p-8 lg:p-12 overflow-x-hidden relative font-sans animate-motion-blur-in"
            style={{
                '--mouse-x': `${mousePos.x}%`,
                '--mouse-y': `${mousePos.y}%`
            } as React.CSSProperties}
        >
            {/* Ambient System Background - Ribbons and Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] left-[20%] w-[60vw] h-[60vw] bg-sony-violet/10 rounded-full blur-[120px] animate-liquid-flow" />
                <div className="absolute bottom-[20%] right-[10%] w-[50vw] h-[50vw] bg-sony-indigo/10 rounded-full blur-[120px] animate-liquid-flow" style={{ animationDirection: 'reverse' }} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(0,229,255,0.05)_0%,transparent_50%)]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* PS5 Header */}
                <header className="flex justify-between items-center mb-16 border-b border-white/10 pb-8">
                    <div className="flex items-center gap-6 group cursor-default">
                        <div className="w-14 h-14 biometric-frame overflow-hidden relative">
                            <Image
                                src="/images/gamma_edison_logo.png"
                                alt="Gamma Edison Logo"
                                fill
                                className="object-cover p-2 brightness-125"
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-display tracking-[0.2em] chromatic-text">DUOSHINKI</h1>
                            <p className="font-display text-[10px] text-arc-neon tracking-[0.4em] uppercase mt-2 opacity-80">Spatial OS v2050</p>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="btn-hardware group"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            <Activity className="w-5 h-5 group-hover:animate-pulse" /> Initialize
                        </span>
                    </button>
                </header>

                {/* Floating Blades Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[minmax(220px,auto)] gap-8">

                    {/* Hero Section - The Main Console */}
                    <div className="md:col-span-8 row-span-2 glass-card p-10 md:p-16 flex flex-col justify-center group">
                        <div className="relative z-10 max-w-2xl">
                            <div className="flex items-center gap-4 mb-10">
                                <span className="inline-flex items-center px-4 py-1.5 glass-card border-arc-neon/30 text-arc-neon font-display text-[10px] tracking-widest uppercase">
                                    <span className="w-1.5 h-1.5 bg-arc-neon rounded-full animate-ping mr-3" />System Link Active
                                </span>
                                <span className="font-display text-[10px] text-white/40 tracking-[0.3em] uppercase">Core Module v5.0</span>
                            </div>

                            <h2 className="text-6xl md:text-7xl font-display font-black leading-none uppercase mb-10 chromatic-text">
                                SHAPE THE <br />
                                <span className="text-arc-neon">FUTURE</span> OF AI
                            </h2>

                            <p className="text-white/60 text-lg font-sans max-w-xl mb-12 leading-relaxed tracking-wide">
                                Seamlessly integrate with the next generation of neural architecture. Train, execute, and transcend in the worlds first spatial learning environment.
                            </p>

                            <button
                                onClick={() => router.push('/dashboard')}
                                className="btn-hardware self-start"
                            >
                                <span className="flex items-center gap-4">
                                    Commence Operations <Layers className="w-5 h-5 animate-pulse" />
                                </span>
                            </button>
                        </div>

                        {/* Decorative side blade */}
                        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-arc-neon/20 to-transparent" />
                    </div>

                    {/* Tutor Twin - Biometric Frame */}
                    <div className="md:col-span-4 row-span-2 glass-card flex flex-col group overflow-hidden border-white/20">
                        <div className="relative flex-1 min-h-[300px] biometric-frame m-4 overflow-hidden">
                            <div className="absolute inset-0 bg-sony-nebula-deep/40 z-10 mix-blend-overlay" />
                            <Image
                                src="/images/ai_student_avatar.png"
                                alt="Tutor Twin"
                                fill
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                                priority
                            />

                            {/* Holographic Overlays */}
                            <div className="absolute top-4 left-4 z-20">
                                <div className="flex items-center gap-2 text-arc-neon font-display text-[8px] tracking-tighter">
                                    <ScanLine className="w-3 h-3" /> EYE TRACKING ON
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white/5 backdrop-blur-md border-t border-white/10">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-display text-lg tracking-widest text-white">TWIN AI</h3>
                                    <p className="font-display text-[8px] text-arc-neon tracking-[0.2em] uppercase mt-1">Neural Sync: 99.8%</p>
                                </div>
                                <Zap className="w-5 h-5 text-arc-neon animate-pulse" />
                            </div>

                            {/* Bio-metric bars */}
                            <div className="space-y-4">
                                {[85, 92, 78].map((val, i) => (
                                    <div key={i} className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-arc-neon to-sony-indigo transition-all duration-1000 ease-out"
                                            style={{ width: `${val}%` }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Exam Oracle - Holographic Projection */}
                    <div
                        className="md:col-span-5 row-span-1 glass-card p-10 flex flex-col justify-between cursor-pointer group border-arc-neon/20"
                        onMouseEnter={() => !decrypting && setDecrypting(true)}
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h4 className="font-display text-[9px] tracking-[0.3em] text-arc-neon uppercase mb-2 flex items-center gap-2">
                                    <ShieldAlert className="w-3 h-3 animate-pulse" /> Encryption Level: OMEGA
                                </h4>
                                <h3 className="text-3xl font-display tracking-widest chromatic-text">EXAM ORACLE
                                </h3>
                            </div>
                            <Cpu className="w-8 h-8 text-white/20 group-hover:text-arc-neon transition-colors duration-500" />
                        </div>

                        {/* Holographic Decryption Field */}
                        <div className="relative flex-1 bg-black/40 border border-white/10 p-6 perspective-1000 overflow-hidden">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px]" />

                            <div className="relative z-10 flex flex-col h-full justify-center">
                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                                    <span className="font-display text-[10px] text-white/40 tracking-widest uppercase">Target ID</span>
                                    <span className={cn(
                                        "font-display text-xs tracking-widest text-arc-neon drop-shadow-glow",
                                        decrypting && "animate-glitch"
                                    )}>{decryptedText}
                                    </span>
                                </div>

                                <div className="grid grid-cols-12 gap-1 h-3">
                                    {Array.from({ length: 24 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-full transition-all duration-300"
                                            style={{
                                                backgroundColor: decrypting ? (Math.random() > 0.5 ? '#00E5FF' : 'transparent') : (decryptedText === 'ORACLE SYNC' ? '#00E5FF' : 'rgba(255,255,255,0.05)')
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Scanning Light */}
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-arc-neon/40 shadow-glow blur-[1px] animate-scanline" />
                        </div>
                    </div>

                    {/* Spatial Bounties */}
                    <div className="md:col-span-7 row-span-1 glass-card p-10 relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
                            <div className="flex items-center gap-4">
                                <Radar className="w-6 h-6 text-arc-neon animate-pulse" />
                                <h4 className="font-display text-2xl tracking-[0.2em] chromatic-text uppercase">Spatial Bounties</h4>
                            </div>
                            <span className="font-display text-[9px] text-white/30 tracking-[0.4em] uppercase">Sector 04</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            {/* Active Module */}
                            <div className="p-6 glass-card border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-all">
                                <div className="flex justify-between items-center mb-4">
                                    <h5 className="font-display text-[10px] text-arc-neon tracking-widest uppercase">Neural Optimization</h5>
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-white/40 text-[10px] font-display uppercase tracking-tighter">Reward: 4,500 XP</span>
                                    <span className="text-white font-display text-[10px] uppercase">Tier: Omega</span>
                                </div>
                            </div>

                            {/* Locked Module */}
                            <div className="p-6 glass-card border-white/5 bg-black/40 opacity-50 relative flex items-center justify-center grayscale">
                                <div className="text-center">
                                    <Lock className="w-5 h-5 mx-auto mb-2 text-white/20" />
                                    <p className="font-display text-[8px] tracking-widest text-white/30 uppercase">Level 10 required</p>
                                </div>
                            </div>

                            {/* Locked Full Width Module */}
                            <div className="p-6 glass-card border-white/5 bg-black/40 opacity-50 md:col-span-2 relative flex items-center justify-center grayscale">
                                <div className="flex items-center gap-4">
                                    <ShieldAlert className="w-5 h-5 text-white/20" />
                                    <p className="font-display text-[8px] tracking-[0.5em] text-white/30 uppercase">Classified Sector Locked</p>
                                </div>
                            </div>
                        </div>

                        {/* Interactive glow follows cursor inside card */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(157,0,255,0.03)_0%,transparent_60%)] pointer-events-none" />
                    </div>

                </div>
            </div>

            {/* Particle Dust Overlay for Landing Page */}
            <div className="particle-container">
                {Array.from({ length: 30 }).map((_, i) => (
                    <div
                        key={i}
                        className="particle animate-particle-dust"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${10 + Math.random() * 10}s`
                        }}
                    />
                ))}
            </div>

            {/* Branded Footer Module */}
            <footer className="relative z-20 mt-20 pb-10 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Subtle Divider */}
                    <div className="w-full h-px bg-[#32CD32]/10 mb-8" />
                    
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <p className="font-inter text-[12px] text-white/60 tracking-wider leading-relaxed max-w-2xl">
                            Incubated at Chenraj Roychand Center for Entrepreneurship 
                            <span className="text-[#32CD32] drop-shadow-[0_0_8px_rgba(50,205,50,0.4)] px-1">(CRCE)</span>, 
                            <span className="text-[#32CD32] drop-shadow-[0_0_8px_rgba(50,205,50,0.4)] px-1">JAIN</span> 
                            (Deemed-to-be University)
                        </p>
                        
                        <div className="font-display text-[9px] text-white/20 tracking-[0.5em] uppercase pt-2">
                            © 2026 GAMMA EDISON — ALL RIGHTS RESERVED
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
