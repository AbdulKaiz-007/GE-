'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, CheckCircle, Loader2, Scroll, Activity, Cpu, Layers, Zap, Star, Layout } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/game-engine'

export default function VerifyPage() {
    const supabase = createClient()
    const [submitted, setSubmitted] = useState(false)

    const programId = process.env.NEXT_PUBLIC_SHEERID_PROGRAM_ID || 'demo_mode'

    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.origin !== 'https://services.sheerid.com') return

            if (event.data === 'sheerid-success') {
                setSubmitted(true)
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    toast.success('BIOMETRIC IDENTITY CONFIRMED')
                }
            }
        }
        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [supabase])

    if (!programId) {
        return (
            <div className="p-12 max-w-2xl mx-auto text-center space-y-8 animate-motion-blur-in mt-20">
                <div className="w-24 h-24 biometric-frame border-sony-violet flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(255,51,153,0.3)]">
                    <Shield className="w-12 h-12 text-sony-violet" />
                </div>
                <div>
                    <h1 className="font-display text-4xl mb-4 text-white uppercase tracking-[0.3em] chromatic-text">CONFIG MISSING</h1>
                    <p className="font-display text-[10px] text-white/40 tracking-[0.4em] uppercase">
                        SHEERID CRYSTAL UNSYNCED FROM REALM.
                    </p>
                </div>
                <div className="glass-card bg-black/40 border-white/10 p-8 text-left space-y-6 max-w-md mx-auto">
                    <p className="font-display text-[9px] text-arc-neon tracking-widest uppercase leading-relaxed">
                        <strong className="text-white">DEV ACTION ARRAY:</strong><br /><br />
                        1. INITIALIZE MYSHEERID PROGRAM<br />
                        2. APPEND ENV: NEXT PUBLIC SHEERID PROGRAM ID<br />
                        3. REBOOT SYSTEM CORE
                    </p>
                </div>
            </div>
        )
    }

    if (submitted) {
        return (
            <div className="p-12 max-w-xl mx-auto text-center space-y-12 animate-motion-blur-in mt-20">
                <div className="w-32 h-32 biometric-frame border-arc-neon flex items-center justify-center mx-auto relative group">
                    <CheckCircle className="w-16 h-16 text-arc-neon shadow-aura group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 border border-arc-neon/40 animate-ping rounded-full" />
                </div>
                <div className="space-y-4">
                    <h1 className="font-display text-5xl text-white uppercase tracking-[0.4em] chromatic-text">IDENTITY SECURED</h1>
                    <p className="font-display text-[11px] text-arc-neon tracking-[0.3em] uppercase">
                        CREDENTIALS DISPATCHED AND VERIFIED VIA SHEERID UPLINK.
                    </p>
                </div>
                <div className="glass-card bg-black/40 border-white/10 p-10 text-left space-y-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-arc-neon/5 via-transparent to-transparent opacity-50" />
                    <div className="flex items-center gap-4 text-white/60 font-display text-[10px] tracking-widest uppercase group transition-colors hover:text-white">
                        <CheckCircle className="w-4 h-4 text-arc-neon" />
                        <span>SCHOLAR IDENTITY TOKEN GENERATED</span>
                    </div>
                    <div className="flex items-center gap-4 text-white/60 font-display text-[10px] tracking-widest uppercase group transition-colors hover:text-white">
                        <Shield className="w-4 h-4 text-arc-neon" />
                        <span>METADATA ENCRYPTED IN SYSTEM VAULT</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 animate-motion-blur-in relative z-10 pb-32">

            {/* Header HUD */}
            <div className="flex flex-col md:flex-row items-center gap-8 border-b border-white/10 pb-12">
                <div className="w-16 h-16 biometric-frame flex items-center justify-center bg-arc-neon/10 border-arc-neon/40 group">
                    <Shield className="w-8 h-8 text-arc-neon group-hover:animate-pulsate transition-all" />
                </div>
                <div className="text-center md:text-left space-y-2">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                        <Activity className="w-4 h-4 text-arc-neon/50 animate-pulse" />
                        <span className="font-display text-[9px] text-arc-neon tracking-[0.4em] uppercase">Security Protocol v9.1</span>
                    </div>
                    <h1 className="font-display text-4xl md:text-6xl text-white tracking-[0.3em] uppercase chromatic-text">VERIFY IDENTITY CORE</h1>
                    <p className="font-display text-[11px] text-white/30 tracking-[0.4em] uppercase">AUTHENTICATE GUILD AFFILIATION VIA SECURE SHEERID UPLINK.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Benefits / Meta-Data */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="glass-card bg-black/40 border-white/10 p-10 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 opacity-5 transition-transform group-hover:rotate-12 duration-1000">
                            <Scroll className="w-48 h-48 text-arc-neon" />
                        </div>
                        <h3 className="font-display text-[11px] text-arc-neon tracking-[0.4em] uppercase mb-8 border-b border-white/5 pb-4">VERIFIED USER CAPABILITIES
                        </h3>
                        <ul className="space-y-6">
                            {[
                                { t: 'GUILD LEADERBOARDS', d: 'SYNC WITH SPECIFIC ACADEMIC ARRAYS' },
                                { t: 'OFFICIAL SCHOLAR BADGE', d: 'BIOMETRIC RECOGNITION TOKEN' },
                                { t: 'ARMORY MARKET ACCESS', d: 'ENABLE PREMIUM EQUIPMENT SYNC' },
                                { t: 'HIGH PRIORITY MISSIONS', d: 'LEVEL 10 DATA INGESTION QUERIES' },
                            ].map(item => (
                                <li key={item.t} className="space-y-1.5 group/item">
                                    <div className="font-display text-[10px] text-white tracking-widest uppercase transition-colors group-hover/item:text-arc-neon">{item.t}</div>
                                    <div className="font-display text-[8px] text-white/20 tracking-widest uppercase transition-colors group-hover/item:text-white/40">{item.d}</div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="glass-card bg-arc-neon/5 border-arc-neon/20 p-6 flex gap-5 items-start">
                        <Shield className="w-5 h-5 text-arc-neon flex-shrink-0 animate-pulse" />
                        <p className="font-display text-[9px] text-white/40 tracking-widest uppercase leading-loose">
                            IDENTITY ENCRYPTION MANAGED BY SHEERID CORE. SYSTEM NEVER ACCESSES RAW IDENTIFIERS.
                        </p>
                    </div>
                </div>

                {/* SheerID Form Viewport */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-1 bg-white/5 border-white/10 relative overflow-hidden min-h-[650px]">
                        <div className="absolute inset-0 bg-[url('/bg-noise.png')] opacity-10 pointer-events-none" />
                        {programId === 'demo_mode' ? (
                            <iframe
                                src="/sheerid-mock-iframe"
                                width="100%"
                                height="650"
                                className="relative z-10 opacity-80"
                                style={{ border: 'none', background: 'transparent' }}
                                title="SheerID Verification Mock"
                            />
                        ) : (
                            <iframe
                                src={`https://services.sheerid.com/verify/${programId}/`}
                                width="100%"
                                height="650"
                                className="relative z-10 opacity-90"
                                style={{ border: 'none', background: 'transparent' }}
                                title="SheerID Verification"
                                allow="camera; microphone"
                            />
                        )}
                        {/* Scanline overlay over iframe */}
                        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-arc-neon/10 to-transparent animate-scanline pointer-events-none z-20" />
                    </div>
                </div>
            </div>
        </div>
    )
}
