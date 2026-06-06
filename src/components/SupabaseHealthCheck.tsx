'use client'

import { useState, useEffect } from 'react'
import { Activity, ShieldAlert, Cpu } from 'lucide-react'

export function SupabaseHealthCheck() {
    const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking')

    useEffect(() => {
        const checkHealth = async () => {
            try {
                // Ping the Supabase auth health endpoint
                const url = process.env.NEXT_PUBLIC_SUPABASE_URL
                if (!url) return setStatus('online') // Let the app handle missing vars later

                const response = await fetch(`${url}/auth/v1/health`, { 
                    method: 'GET',
                    mode: 'no-cors' // We just need to see if the server responds at all
                })
                
                // If it doesn't throw, we assume it's reachable
                setStatus('online')
            } catch (err) {
                console.error('SUPABASE_LINK_FAILURE:', err)
                setStatus('offline')
            }
        }

        checkHealth()
        const interval = setInterval(checkHealth, 30000) // Re-check every 30s
        return () => clearInterval(interval)
    }, [])

    if (status === 'online') return null

    return (
        <div className="fixed inset-0 z-[9999] bg-sony-nebula-deep flex items-center justify-center p-6 text-center animate-motion-blur-in">
            {/* Ambient System Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-arc-neon/5 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-sony-violet/5 rounded-full blur-[100px] animate-pulse" style={{ animationDirection: 'reverse' }} />
            </div>

            <div className="max-w-md w-full glass-card p-10 border-arc-neon/30 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-arc-neon shadow-[0_0_15px_#00E5FF] animate-scanline" />
                
                <div className="relative z-10 space-y-8">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full border border-arc-neon/30 flex items-center justify-center animate-spin-slow">
                            <ShieldAlert className="w-8 h-8 text-arc-neon animate-pulse" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="font-display text-2xl tracking-[0.3em] text-white chromatic-text uppercase">NEURAL LINK FAILURE</h2>
                        <p className="font-display text-[10px] text-arc-neon tracking-[0.4em] uppercase opacity-70">Error: 0xConnectionTimeout</p>
                    </div>

                    <div className="p-6 bg-black/40 border border-white/5 space-y-6">
                        <p className="text-white/60 text-xs leading-relaxed tracking-wide">
                            The central cognitive engine is currently unresponsive. We are attempting to re-establish the uplink.
                        </p>
                        
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center justify-center gap-2 text-[8px] font-display text-white/30 tracking-[0.3em] uppercase">
                                <Activity className="w-3 h-3 animate-pulse" /> STANDBY FOR AUTO-RECOVERY
                            </div>
                            <button 
                                onClick={() => setStatus('online')}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-arc-neon/30 text-arc-neon font-display text-[10px] tracking-[0.2em] uppercase transition-all"
                            >
                                Bypass Neural Link (Offline Mode)
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between px-2 pt-4">
                        <div className="flex items-center gap-2">
                             <Cpu className="w-3 h-3 text-white/20" />
                             <span className="font-display text-[8px] text-white/20 tracking-widest uppercase">System v2050.5.1</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
