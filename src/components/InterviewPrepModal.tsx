'use client'

import { X, HelpCircle, ChevronDown, ChevronUp, Zap, Sparkles, Activity, Shield, Cpu } from 'lucide-react'
import { useState } from 'react'
import { INTERVIEW_QUESTIONS, InterviewQuestion } from '@/lib/interview-questions'
import { cn } from '@/lib/game-engine'

interface InterviewPrepModalProps {
    domain: string;
    onClose: () => void;
}

export default function InterviewPrepModal({ domain, onClose }: InterviewPrepModalProps) {
    const questions = INTERVIEW_QUESTIONS[domain] || INTERVIEW_QUESTIONS["General"]
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-motion-blur-in">
            <div className="absolute inset-0 bg-sony-nebula-deep opacity-40 pointer-events-none" />

            <div className="w-full max-w-3xl glass-card bg-black/80 border-white/10 p-10 relative max-h-[85vh] flex flex-col overflow-hidden group">
                {/* Decorative background grid */}
                <div className="absolute inset-0 bg-[url('/bg-noise.png')] opacity-10 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-scanline pointer-events-none opacity-20" />

                {/* Sony-style Header */}
                <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 biometric-frame flex items-center justify-center text-arc-neon">
                            <Shield className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <Cpu className="w-3 h-3 text-arc-neon opacity-50" />
                                <span className="font-display text-[9px] text-arc-neon tracking-[0.4em] uppercase">SYSTEM ARCHIVE v4.2</span>
                            </div>
                            <h2 className="font-display text-2xl md:text-3xl text-white uppercase tracking-[0.2em] chromatic-text">INTEL DOWNLOAD
                            </h2>
                            <p className="font-display text-[9px] text-white/30 uppercase tracking-[0.4em] mt-1">
                                CLASSIFIED_CORE: {domain.toUpperCase()} {'//'} SIGINT_DECRYPTED
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 glass-card bg-black border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-arc-neon transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Questions Array */}
                <div className="flex-1 overflow-y-auto pr-4 space-y-6 no-scrollbar relative z-10">
                    {questions.map((q, i) => (
                        <div
                            key={i}
                            className={cn(
                                "glass-card border transition-all duration-500 overflow-hidden group/item",
                                openIndex === i
                                    ? "bg-white/[0.05] border-arc-neon shadow-aura"
                                    : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.03]"
                            )}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full p-6 flex items-center justify-between gap-6 text-left"
                            >
                                <div className="flex gap-6 items-center">
                                    <span className={cn(
                                        "font-display text-lg transition-colors",
                                        openIndex === i ? "text-arc-neon" : "text-white/20"
                                    )}>{(i + 1).toString().padStart(2, '0')}
                                    </span>
                                    <span className={cn(
                                        "font-display text-sm text-white uppercase tracking-widest leading-relaxed transition-all",
                                        openIndex === i ? "translate-x-2" : "group-hover/item:translate-x-1"
                                    )}>{q.question.replace('?', '')}
                                    </span>
                                </div>
                                <div className={cn(
                                    "w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all",
                                    openIndex === i ? "rotate-180 border-arc-neon bg-arc-neon/20" : "group-hover/item:border-white/30"
                                )}>
                                    <ChevronDown className={cn("w-4 h-4 transition-colors", openIndex === i ? "text-arc-neon" : "text-white/40")} />
                                </div>
                            </button>

                            {openIndex === i && (
                                <div className="px-20 pb-8 animate-motion-blur-in">
                                    <div className="h-px bg-white/10 mb-6" />
                                    <div className="flex gap-4">
                                        <Activity className="w-4 h-4 text-arc-neon shrink-0 mt-1 opacity-50" />
                                        <p className="font-display text-[11px] text-white/50 leading-relaxed uppercase tracking-[0.1em]">
                                            {q.answer}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Operational Footer */}
                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-3">
                        <Zap className="w-3 h-3 text-arc-neon animate-pulsate" />
                        <span className="font-display text-[8px] text-white/20 tracking-[0.5em] uppercase">NEURAL LINK STABLE // SECURE SYNC
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn-hardware !px-8 !py-3"
                    >
                        <span className="relative z-10 font-display text-[9px] tracking-[0.3em] uppercase chromatic-text">ACKNOWLEDGE INTEL
                        </span>
                    </button>
                </div>
            </div>
        </div>
    )
}
