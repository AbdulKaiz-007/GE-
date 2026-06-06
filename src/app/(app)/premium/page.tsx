'use client'

import { Check, Crown, Zap, Anchor, Sparkles, Shield, Skull, Map, Coins, Activity, Star, Cpu, Layers } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { loadRazorpay, createOrder } from '@/lib/razorpay'
import { cn } from '@/lib/game-engine'

type Tier = {
    name: string
    price: string
    amount: number
    period: string
    color: string
    glow: string
    accent: string
    icon: any
    features: string[]
    cta: string
    disabled?: boolean
    popular?: boolean
}

const tiers: Tier[] = [
    {
        name: 'FREEMAN INITIATE',
        price: 'FREE',
        amount: 0,
        period: 'STABLE VERSION',
        color: 'border-white/10',
        glow: '',
        accent: 'text-white/40',
        icon: Anchor,
        features: [
            '3 AI LESSONS / DAY',
            'BASIC QUESTS ACCESS',
            'STANDARD ARMOR SET',
            'COMMUNITY SYNC'
        ],
        cta: 'ACTIVE RANK',
        disabled: true
    },
    {
        name: 'RESEARCH FELLOW',
        price: '₹199',
        amount: 199,
        period: '/MO',
        color: 'border-sony-indigo/40',
        glow: 'shadow-[0_0_20px_rgba(77,100,255,0.2)]',
        accent: 'text-sony-indigo',
        icon: Map,
        features: [
            '10 AI LESSONS / DAY',
            'SILVER REWARD SCALE',
            'PREMIUM LEARNING TOOLS',
            'ADS SUPPRESSED'
        ],
        cta: 'INITIALIZE JOIN'
    },
    {
        name: 'ELITE SENTINEL',
        price: '₹499',
        amount: 499,
        period: '/MO',
        color: 'border-arc-neon/40',
        glow: 'shadow-aura',
        accent: 'text-arc-neon',
        icon: Crown,
        popular: true,
        features: [
            'UNLIMITED AI LESSONS',
            '2X GOLD SYNTHESIS',
            'EXCLUSIVE BOSS ENGAGEMENT',
            'CUSTOM BIOMETRIC FRAMES',
            'PRIORITY DATA LINK'
        ],
        cta: 'COMMAND VESSEL'
    },
    {
        name: 'ULTIMATE OVERSEER',
        price: '₹999',
        amount: 999,
        period: '/MO',
        color: 'border-sony-violet/40',
        glow: 'shadow-[0_0_20px_rgba(255,51,153,0.2)]',
        accent: 'text-sony-violet',
        icon: Skull,
        features: [
            'ALL MASTER BENEFITS',
            '4X GOLD SYNTHESIS',
            'LEGENDARY ARMOR ENCRYPTION',
            'DIRECT DEVELOPER UPLINK',
            'EXPERIMENTAL MODULES'
        ],
        cta: 'DOMINATE SEAS'
    }
]

export default function PremiumPage() {
    const [loading, setLoading] = useState<string | null>(null)
    const [serverUnreachable, setServerUnreachable] = useState(false)

    useEffect(() => {
        const checkServer = async () => {
            try {
                const url = process.env.NEXT_PUBLIC_SUPABASE_URL
                if (!url) return
                // Mode: no-cors allows us to ping the server without needing full CORS approval for a health check
                await fetch(`${url}/auth/v1/health`, { method: 'GET', mode: 'no-cors' })
                setServerUnreachable(false)
            } catch (err) {
                setServerUnreachable(true)
                toast.error('CENTRAL UPLINK OFFLINE', { id: 'health-check' })
            }
        }
        checkServer()
    }, [])

    const handleUpgrade = async (plan: Tier) => {
        if (plan.amount === 0 || serverUnreachable) return
        setLoading(plan.name)

        try {
            // DEMO MODE: If no real key is provided, simulate success
            const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
            if (!razorpayKey || razorpayKey === 'test_key') {
                console.log('ENTERING DEMO UPLINK MODE')
                await new Promise(resolve => setTimeout(resolve, 2000))
                toast.success(`RANK PROMOTED: ${plan.name}`)
                return
            }

            const isLoaded = await loadRazorpay()
            if (!isLoaded) {
                toast.error('PAYMENT GATEWAY FAILURE')
                return
            }

            const order = await createOrder(plan.amount)

            const options: any = {
                key: razorpayKey,
                amount: order.amount,
                currency: order.currency,
                name: "GAMMA EDISON",
                description: `${plan.name} LICENSE UPGRADE`,
                image: "/logo.png",

                ...(order.id && !order.id.startsWith('order_placeholder_') ? { order_id: order.id } : {}),

                handler: function (response: any) {
                    toast.success(`RANK PROMOTED: ${plan.name}`)
                },
                prefill: {
                    name: "OPERATIVE",
                    email: "student@arc-system.com",
                    contact: "9999999999"
                },
                theme: {
                    color: '#00D1FF'
                }
            }

            const paymentObject = new (window as any).Razorpay(options)

            paymentObject.on('payment.failed', function (response: any) {
                toast.error(response.error.description || 'TRANSACTION FAILED')
            })

            paymentObject.open()

        } catch (error) {
            console.error(error)
            toast.error('INITIALIZATION ERROR')
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 animate-motion-blur-in pb-32">

            {/* Header HUD */}
            <div className="text-center space-y-4 border-b border-white/10 pb-12">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <Activity className="w-4 h-4 text-arc-neon opacity-50 animate-pulse" />
                    <span className="font-display text-[10px] text-arc-neon tracking-[0.6em] uppercase opacity-70">Licensing Module v8.2</span>
                </div>
                <h1 className="font-display text-4xl md:text-6xl text-white tracking-[0.3em] uppercase chromatic-text drop-shadow-glow">SUBSCRIPTION RANKS
                </h1>
                <p className="font-display text-[10px] text-white/30 tracking-[0.4em] uppercase max-w-xl mx-auto leading-relaxed">
                    LEVEL UP YOUR BIOMETRIC CAPABILITIES. ACQUIRE PREMIUM DATA STREAMS AND TACTICAL ADVANTAGES.
                </p>
                <div className="flex justify-center gap-6 pt-6">
                    <div className="flex items-center gap-2 glass-card bg-black/60 px-4 py-2 border-white/10">
                        <Shield className="w-3 h-3 text-arc-neon" />
                        <span className="font-display text-[9px] text-white/60 tracking-widest uppercase mt-0.5">SECURE ENCRYPTION</span>
                    </div>
                    <div className="flex items-center gap-2 glass-card bg-black/60 px-4 py-2 border-white/10">
                        <Zap className="w-3 h-3 text-sony-indigo" />
                        <span className="font-display text-[9px] text-white/60 tracking-widest uppercase mt-0.5">INSTANT PROVISIONING</span>
                    </div>
                </div>
            </div>

            {/* Pricing Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch pt-8">
                {tiers.map((tier) => (
                    <div
                        key={tier.name}
                        className={cn(
                            "relative glass-card flex flex-col border transition-all duration-700 bg-black/40 overflow-hidden group",
                            tier.popular ? "scale-[1.05] border-arc-neon ring-1 ring-arc-neon/20 z-10" : "hover:-translate-y-2 border-white/10 hover:border-white/30"
                        )}
                    >
                        {/* Scanline pattern */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-scanline pointer-events-none opacity-20" />

                        {tier.popular && (
                            <div className="absolute top-0 right-0 glass-card bg-arc-neon text-black px-4 py-1.5 text-[9px] font-display uppercase tracking-[0.3em] z-20 shadow-aura">
                                OPTIMAL VECTOR
                            </div>
                        )}

                        <div className="p-8 text-center space-y-6 relative z-10">
                            <div className={cn("w-16 h-16 mx-auto biometric-frame flex items-center justify-center transition-all duration-700 group-hover:scale-110", tier.accent)}>
                                <tier.icon className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className={cn("text-xl font-display uppercase tracking-[0.4em]", tier.popular ? 'text-arc-neon' : 'text-white/80')}>{tier.name}</h3>
                                <div className="font-display text-4xl text-white tracking-widest chromatic-text">
                                    {tier.price}
                                </div>
                                <div className="font-display text-[9px] text-white/20 tracking-[0.4em] uppercase">{tier.period}</div>
                            </div>
                        </div>

                        <div className="p-8 flex-1 flex flex-col space-y-8 relative z-10 bg-gradient-to-b from-white/5 to-transparent">
                            <ul className="space-y-4 flex-1">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-[10px] font-display tracking-widest text-white/40 uppercase group/item">
                                        <Check className={cn("w-3 h-3 flex-shrink-0 mt-0.5 transition-colors", tier.popular ? 'text-arc-neon' : 'text-white/20 group-hover/item:text-white')} />
                                        <span className="leading-relaxed transition-colors group-hover/item:text-white/60">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleUpgrade(tier)}
                                disabled={tier.disabled || !!loading}
                                className={cn(
                                    "btn-hardware !w-full !py-4 group/btn",
                                    tier.disabled && "!opacity-30 !cursor-not-allowed !grayscale",
                                    tier.popular ? "" : "bg-black/80 hover:bg-white/5"
                                )}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    {loading === tier.name ? (
                                        <><Activity className="w-4 h-4 animate-spin" /> RUNNING...</>
                                    ) : (
                                        <span className="font-display text-[11px] tracking-[0.4em] uppercase">{tier.cta}</span>
                                    )}
                                </span>
                            </button>
                        </div>
                        {/* Aura glow on hover */}
                        <div className={cn("absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-[100px] opacity-0 group-hover:opacity-40 transition-opacity duration-1000", tier.accent.replace('text', 'bg'))} />
                    </div>
                ))}
            </div>

            {/* Security HUD Footer */}
            <div className="pt-12">
                <div className="glass-card bg-black/40 border-white/10 p-6 max-w-xl mx-auto flex items-center justify-center gap-6 relative overflow-hidden group">
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-arc-neon/40 to-transparent" />
                    <Shield className="w-5 h-5 text-arc-neon animate-pulse" />
                    <div className="font-display text-[10px] text-white/40 tracking-[0.3em] uppercase">
                        TRANSACTIONS ENCRYPTED BY RAZORPAY CORE. CANCEL ANY TIME.
                    </div>
                </div>
            </div>

            {/* Bottom visual elements */}
            <div className="flex justify-between items-center px-4 pt-12 opacity-10">
                <div className="font-display text-[8px] tracking-[1em] text-white">SYSTEM PRICING MATRIX ID: 992-ARC</div>
                <div className="flex gap-4">
                    <Cpu className="w-4 h-4 text-white" />
                    <Layers className="w-4 h-4 text-white" />
                </div>
            </div>
        </div>
    )
}
