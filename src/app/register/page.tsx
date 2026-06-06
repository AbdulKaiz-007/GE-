'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Zap, Mail, Lock, User, Eye, EyeOff, Loader2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
    const router = useRouter()
    const supabase = createClient()
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }
        setLoading(true)
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username },
                },
            })
            if (error) throw error
            toast.success('Account created! Check your email to verify. ✉️')
            router.push('/login')
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-arc-bg bg-grid flex items-center justify-center p-4">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-arc-neon/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-arc-cyan/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-arc-neon/20 border border-arc-neon/30 mb-4 shadow-neon">
                        <Zap className="w-8 h-8 text-arc-neonLight" />
                    </div>
                    <h1 className="text-4xl font-bold text-gradient-neon" style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.05em' }}>DUOSHINKI
                    </h1>
                    <p className="text-arc-muted mt-1">Begin your journey. Claim your rank.</p>
                </div>

                <div className="card p-8">
                    <h2 className="text-xl font-bold text-arc-text mb-6">Create Account</h2>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-arc-muted mb-2">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-arc-muted" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    placeholder="your warrior name"
                                    className="input pl-10"
                                    required
                                    minLength={3}
                                    maxLength={20}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-arc-muted mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-arc-muted" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@college.edu"
                                    className="input pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-arc-muted mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-arc-muted" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Min 8 characters"
                                    className="input pl-10 pr-10"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-arc-muted hover:text-arc-text"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start gap-2 p-3 bg-arc-neon/10 rounded-xl border border-arc-neon/20">
                            <Shield className="w-4 h-4 text-arc-neonLight mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-arc-muted">
                                Use your college email to unlock verified student features and campus leaderboards.
                            </p>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            {loading ? 'Creating Account...' : 'Join the Arena'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-arc-muted">
                        Already a warrior?{' '}
                        <Link href="/login" className="text-arc-neonLight hover:underline font-medium">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
