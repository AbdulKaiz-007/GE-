'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    Loader2, Mail, Lock, Eye, EyeOff, Activity, Cpu
} from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function LoginPage() {
    const router = useRouter()
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState<'google' | 'email' | null>(null)
    const [mounted, setMounted] = useState(false)
    const searchParams = useSearchParams()

    useEffect(() => {
        setMounted(true)
        
        // Check for error in URL (usually from OAuth callback)
        const error = searchParams.get('error')
        if (error) {
            toast.error(decodeURIComponent(error).replace(/_/g, ' '))
        }

        // Automatic Neural Link: Check for existing session
        const checkSession = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                toast.success('NEURAL LINK SECURED - WARPING...')
                router.push('/dashboard')
            }
        }
        checkSession()
    }, [searchParams, router])

    // ── Google Sign-In ────────────────────────────────────────
    const handleGoogle = async () => {
        setLoading('google')
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) throw error
            // Navigation happens automatically via OAuth redirect
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Google login failed')
            setLoading(null)
        }
    }

    // ── Email Auth ────────────────────────────────────────────
    const handleEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim() || !password) return toast.error('Enter email and password')
        setLoading('email')
        try {
            const supabase = createClient()
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    }
                })
                if (error) throw error
                toast.success('Check your email to verify your account!')
                setLoading(null)
                return // Don't redirect immediately on signup if email verification is required
            }
            toast.success('NEURAL LINK ESTABLISHED')
            router.push('/dashboard')
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Auth failed'
            toast.error(msg)
        } finally {
            setLoading(null)
        }
    }

    // ── Forgot Password ───────────────────────────────────────
    const handleReset = async () => {
        if (!email.trim()) return toast.error('Enter your email first')
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })
            if (error) throw error
            toast.success('Reset link dispatched to ' + email)
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Reset failed')
        }
    }

    if (!mounted) return null

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-sony-nebula-deep font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-sony-violet/10 rounded-full blur-[120px] animate-liquid-flow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-sony-indigo/10 rounded-full blur-[120px] animate-liquid-flow" style={{ animationDirection: 'reverse' }} />
                <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-arc-neon/20 to-transparent" />
                <div className="absolute bottom-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sony-violet/20 to-transparent" />
            </div>

            <div className="w-full max-w-[440px] relative z-10 animate-motion-blur-in">
                {/* Branding */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 mb-6 biometric-frame p-3 bg-sony-nebula-deep/50 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-arc-neon/10 animate-pulse rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Image src="/images/gamma_edison_logo.png" alt="Logo" width={80} height={80} className="object-contain brightness-125 relative z-10" />
                        
                        {/* Scanning beam during loading */}
                        {loading && (
                            <div className="absolute inset-0 z-20 pointer-events-none">
                                <div className="w-full h-[2px] bg-arc-neon/60 shadow-[0_0_15px_#00E5FF] blur-[1px] animate-scanline" />
                                <div className="absolute inset-0 bg-arc-neon/5 animate-pulse" />
                            </div>
                        )}
                    </div>
                    <h1 className="text-5xl font-display tracking-[0.2em] chromatic-text mb-2">ARC</h1>
                    <p className="font-display text-[10px] text-arc-neon tracking-[0.4em] uppercase opacity-70">
                        Spatial OS Auth v2050
                    </p>
                </div>

                {/* Login Card */}
                <div className="glass-card p-10 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-arc-neon/40 to-transparent opacity-50" />
                    <div className="absolute top-4 right-4 flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-arc-neon animate-pulse" />
                        <div className="w-1 h-1 rounded-full bg-arc-neon/40" />
                        <div className="w-1 h-1 rounded-full bg-arc-neon/40" />
                    </div>

                    {/* Mode toggle */}
                    <div className="mb-8">
                        <div className="flex gap-1 p-1 bg-black/40 rounded-sm border border-white/5">
                            {(['login', 'register'] as const).map(m => (
                                <button key={m} onClick={() => setMode(m)}
                                    className={`flex-1 py-2 font-display text-[9px] tracking-[0.2em] uppercase transition-all rounded-sm ${mode === m ? 'bg-arc-neon/20 text-arc-neon border border-arc-neon/30' : 'text-white/30 hover:text-white/60'
                                        }`}>
                                    {m === 'login' ? 'SIGN IN' : 'REGISTER'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Email + Password form */}
                        <form onSubmit={handleEmail} className="space-y-4">
                            {/* Email field */}
                            <div className="relative group/field">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Mail className="w-4 h-4 text-white/30 group-focus-within/field:text-arc-neon transition-colors" />
                                </div>
                                <input
                                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="NEURAL ID @ HOST.COM" required
                                    className="w-full bg-black/40 border border-white/10 text-white font-sans text-sm py-4 pl-12 pr-4 outline-none focus:border-arc-neon/50 transition-all rounded-sm tracking-widest placeholder:text-white/20 placeholder:font-display placeholder:text-[10px]"
                                />
                            </div>

                            {/* Password field */}
                            <div className="relative group/field">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Lock className="w-4 h-4 text-white/30 group-focus-within/field:text-arc-neon transition-colors" />
                                </div>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="ACCESS CODE" required minLength={6}
                                    className="w-full bg-black/40 border border-white/10 text-white font-sans text-sm py-4 pl-12 pr-12 outline-none focus:border-arc-neon/50 transition-all rounded-sm tracking-widest placeholder:text-white/20 placeholder:font-display placeholder:text-[10px]"
                                />
                                <button type="button" onClick={() => setShowPass(v => !v)}
                                    className="absolute inset-y-0 right-4 flex items-center text-white/30 hover:text-white/60 transition-colors">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Forgot password */}
                            {mode === 'login' && (
                                <button type="button" onClick={handleReset}
                                    className="text-[9px] font-display text-white/30 tracking-widest uppercase hover:text-arc-neon transition-colors">
                                    FORGOT ACCESS CODE?
                                </button>
                            )}

                            <button type="submit" disabled={!!loading} className="btn-hardware w-full group overflow-hidden">
                                <span className="flex items-center justify-center gap-3 relative z-10 font-display tracking-widest">
                                    {loading === 'email' ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>{mode === 'login' ? 'SYNC PROTOCOL' : 'INITIALIZE NEURAL ID'} <Activity className="w-4 h-4" /></>
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-[1px] bg-white/5" />
                            <span className="font-display text-[9px] text-white/20 tracking-widest uppercase">OR</span>
                            <div className="flex-1 h-[1px] bg-white/5" />
                        </div>

                        {/* Google Sign-In */}
                        <button onClick={handleGoogle} disabled={!!loading}
                            className="w-full flex items-center justify-center gap-3 py-4 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group disabled:opacity-50 rounded-sm">
                            {loading === 'google' ? (
                                <Loader2 className="w-4 h-4 animate-spin text-arc-neon" />
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                            <span className="font-display text-[10px] tracking-[0.2em] text-white/60 group-hover:text-white transition-colors uppercase">Continue with Google
                            </span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 flex justify-between px-2">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="font-display text-[8px] text-white/30 tracking-widest uppercase">Supabase Auth</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="font-display text-[8px] text-white/30 tracking-widest uppercase">v2050.5.0</span>
                        <Cpu className="w-3 h-3 text-white/20" />
                    </div>
                </div>

                <p className="text-center mt-8 font-display text-[8px] text-white/20 tracking-[0.5em] uppercase pointer-events-none">
                    ARC Studios · Secure Terminal
                </p>
            </div>
        </div>
    )
}
