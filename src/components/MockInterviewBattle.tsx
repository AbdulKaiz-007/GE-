'use client'

import { useState, useEffect } from 'react'
import { useBattleStore } from '@/store/battle-store'
import { getQuestionsForDomain } from '@/lib/interview-questions'
import { parseOptions } from '@/lib/game-engine'
import { Swords, Heart, Zap, Shield, Trophy, RotateCcw, X, Loader2, Activity, Cpu, Radar, Crosshair, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/game-engine'
import toast from 'react-hot-toast'

interface MockInterviewBattleProps {
    domain: string;
    company: string;
    onClose: () => void;
}

export default function MockInterviewBattle({ domain, company, onClose }: MockInterviewBattleProps) {
    const {
        phase, playerHP, playerMaxHP, bossHP, bossMaxHP,
        currentQuestionIndex, questions, streak, xpEarned,
        comboMessage, initBattle, submitAnswer, resetBattle,
    } = useBattleStore()

    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [animating, setAnimating] = useState(false)

    useEffect(() => {
        // Initialize interview battle
        const interviewQuestions = getQuestionsForDomain(domain)
        const playerLevel = 5
        const bossHPVal = 300

        initBattle(
            `interview-${Date.now()}`,
            interviewQuestions,
            playerLevel,
            'elite',
            bossHPVal
        )

        return () => resetBattle()
    }, [domain])

    const handleAnswer = async (option: string) => {
        if (animating || selectedOption) return
        setSelectedOption(option)
        setAnimating(true)

        await new Promise(r => setTimeout(r, 600))
        const result = submitAnswer(option)

        if (result.correct) {
            toast.success(`MATCHED! +${result.xpGained} XP`, { duration: 1500 })
        } else {
            toast.error('MISMATCH! STRESS UP! 💥', { duration: 1500 })
        }

        await new Promise(r => setTimeout(r, 800))
        setSelectedOption(null)
        setAnimating(false)
    }

    const currentQuestion = questions[currentQuestionIndex]
    const options = currentQuestion ? parseOptions(currentQuestion.options) : []
    const playerHPPercent = Math.max(0, (playerHP / playerMaxHP) * 100)
    const bossHPPercent = Math.max(0, (bossHP / bossMaxHP) * 100)

    if (phase === 'loading' || questions.length === 0) {
        return (
            <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center gap-6">
                <Activity className="w-16 h-16 text-arc-neon animate-pulse" />
                <p className="font-display text-xs text-arc-neon tracking-[0.8em] uppercase animate-pulse">INITIATING BIOMETRIC EVALUATION...</p>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="absolute inset-0 bg-sony-nebula-deep opacity-40 pointer-events-none" />

            <div className="w-full max-w-4xl glass-card bg-black/80 border-white/10 p-8 relative animate-motion-blur-in my-auto overflow-hidden group">
                {/* Decorative background grid */}
                <div className="absolute inset-0 bg-[url('/bg-noise.png')] opacity-10 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-scanline pointer-events-none opacity-20" />

                {/* Header */}
                <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 biometric-frame flex items-center justify-center text-arc-neon">
                            <Swords className="w-7 h-7 animate-pulsate" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <Cpu className="w-3 h-3 text-arc-neon opacity-50" />
                                <span className="font-display text-[9px] text-arc-neon tracking-[0.4em] uppercase">Interview Protocol v8.4</span>
                            </div>
                            <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.2em] chromatic-text">{company} EVALUATION</h2>
                            <p className="font-display text-[9px] text-white/30 uppercase tracking-[0.4em] mt-1">
                                SECTOR: {domain.toUpperCase()} {"//"} THREAT: ELITE SENTINEL
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 glass-card bg-black border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-arc-neon transition-all group/close">
                        <X className="w-6 h-6 transition-transform group-hover/close:rotate-90" />
                    </button>
                </div>

                {/* Battle Stats HUD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative z-10">
                    <div className="space-y-3">
                        <div className="flex justify-between font-display text-[10px] tracking-widest">
                            <span className="text-arc-neon">CANDIDATE INTEGRITY</span>
                            <span className="text-white/60">{playerHP}% STABLE</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
                            <div className="h-full bg-arc-neon shadow-aura transition-all duration-700" style={{ width: `${playerHPPercent}%` }} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between font-display text-[10px] tracking-widest">
                            <span className="text-sony-violet">RECRUITER THRESHOLD</span>
                            <span className="text-white/60">{bossHP} STRESS CAP</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px] flex justify-end">
                            <div className="h-full bg-sony-violet shadow-[0_0_15px_rgba(255,51,153,0.4)] transition-all duration-700" style={{ width: `${bossHPPercent}%` }} />
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="min-h-[400px] flex flex-col justify-center relative z-10">
                    {phase === 'victory' ? (
                        <div className="text-center space-y-10 animate-motion-blur-in">
                            <div className="w-32 h-32 mx-auto biometric-frame border-arc-neon flex items-center justify-center text-arc-neon">
                                <Trophy className="w-16 h-16 animate-bounce" />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-5xl md:text-7xl font-display text-white uppercase tracking-[0.4em] chromatic-text">JOB OFFER LOCKED</h1>
                                <p className="font-display text-[11px] text-arc-neon tracking-[0.3em] uppercase">SYSTEM EVALUATION PASSED. CANDIDATE DEEMED OPTIMAL.</p>
                            </div>
                            <div className="flex flex-col items-center gap-8 pt-4">
                                <div className="glass-card bg-arc-neon/10 border-arc-neon/40 px-10 py-5 font-display text-lg text-white tracking-[0.3em] shadow-aura">
                                    +{xpEarned} CREDITS ACQUIRED
                                </div>
                                <button onClick={onClose} className="btn-hardware !px-12 !py-6 group/btn">
                                    <span className="relative z-10 font-display text-sm tracking-[0.5em] uppercase chromatic-text">RETURN TO COMMAND</span>
                                </button>
                            </div>
                        </div>
                    ) : phase === 'defeat' ? (
                        <div className="text-center space-y-10 animate-motion-blur-in">
                            <div className="w-32 h-32 mx-auto biometric-frame border-sony-violet flex items-center justify-center text-sony-violet">
                                <Activity className="w-16 h-16 grayscale" />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-5xl md:text-7xl font-display text-white uppercase tracking-[0.4em] chromatic-text">REJECTION PROTOCOL</h1>
                                <p className="font-display text-[11px] text-sony-violet tracking-[0.3em] uppercase">CANDIDATE INTEGRITY COMPROMISED. EVALUATION TERMINATED.</p>
                            </div>
                            <button onClick={onClose} className="btn-hardware !px-12 !py-6 group/btn !bg-sony-violet/10 !border-sony-violet/40">
                                <span className="relative z-10 font-display text-sm tracking-[0.5em] uppercase text-sony-violet">TRY RE-SYNC LATER</span>
                            </button>
                        </div>
                    ) : currentQuestion ? (
                        <div className="space-y-10">
                            {comboMessage && (
                                <div className="text-center animate-bounce mb-4">
                                    <span className="font-display text-4xl text-arc-neon uppercase tracking-[0.4em] drop-shadow-glow">{comboMessage}</span>
                                </div>
                            )}

                            <div className="glass-card bg-white/5 border-white/10 p-10 relative group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-arc-neon/5 via-transparent to-transparent opacity-50" />
                                <span className="font-display text-[9px] text-arc-neon tracking-[0.5em] uppercase block mb-4 animate-pulse">EVALUATION QUERY:</span>
                                <h3 className="text-2xl md:text-3xl font-display text-white uppercase tracking-widest leading-relaxed">{currentQuestion.question_text}
                                </h3>
                            </div>

                            <div className="grid gap-6">
                                {options.map(opt => {
                                    const isSelected = selectedOption === opt.label
                                    return (
                                        <button
                                            key={opt.label}
                                            onClick={() => handleAnswer(opt.label)}
                                            disabled={!!selectedOption || animating}
                                            className={cn(
                                                "w-full text-left p-6 glass-card border font-display text-sm uppercase tracking-widest transition-all duration-500 relative overflow-hidden group/opt",
                                                !selectedOption && "bg-black/60 border-white/10 hover:border-arc-neon/60 hover:bg-white/5 hover:translate-x-2",
                                                isSelected && opt.is_correct && "border-arc-neon bg-arc-neon/20 shadow-aura text-arc-neon translate-x-4",
                                                isSelected && !opt.is_correct && "border-sony-violet bg-sony-violet/20 shadow-[0_0_30px_rgba(255,51,153,0.3)] text-sony-violet animate-shake",
                                                selectedOption && opt.is_correct && !isSelected && "opacity-20 grayscale"
                                            )}
                                        >
                                            <span className="opacity-40 mr-6 font-display text-xs group-hover/opt:text-arc-neon transition-colors">[{opt.label}]</span>
                                            {opt.text}
                                            {/* Selection indicator */}
                                            {isSelected && (
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                                    <Activity className="w-5 h-5 animate-spin" />
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>

                            {selectedOption && currentQuestion.explanation && (
                                <div className="glass-card bg-black/80 border-white/20 p-6 font-display text-[10px] text-white/60 tracking-widest uppercase animate-motion-blur-in leading-relaxed">
                                    <span className="text-arc-neon mr-3">SYSTEM FEEDBACK:</span>
                                    {currentQuestion.explanation}
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Footer Progress HUD */}
                <div className="mt-12 flex items-center gap-8 relative z-10 border-t border-white/5 pt-8">
                    <span className="font-display text-[9px] text-white/20 tracking-[0.4em] uppercase">EVALUATION PATHWAY</span>
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden p-[1px]">
                        <div
                            className="h-full bg-arc-neon shadow-aura transition-all duration-1000"
                            style={{ width: `${(currentQuestionIndex / questions.length) * 100}%` }}
                        />
                    </div>
                    <div className="font-display text-[10px] text-white/40 tracking-[0.2em]">
                        QUERY: <span className="text-white">{(currentQuestionIndex + 1).toString().padStart(2, '0')}</span> / {questions.length.toString().padStart(2, '0')}
                    </div>
                </div>
            </div>
        </div>
    )
}
