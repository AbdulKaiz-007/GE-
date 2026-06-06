'use client'

import { useState } from 'react'
import { X, ChevronRight, ChevronLeft, Target, Briefcase, GraduationCap, Laptop, Globe, Zap, Activity, Cpu, Radar } from 'lucide-react'
import { cn } from '@/lib/game-engine'

interface QuestFinderProps {
    onFilter: (filters: { type: string; domain: string; level: string; role: string; location: string }) => void;
    onClose: () => void;
}

const steps = [
    {
        title: "EXPERIENCE MATRIX",
        icon: GraduationCap,
        field: "level",
        options: [
            { label: "Student Unit", value: "student" },
            { label: "New Recruit", value: "graduate" },
            { label: "Elite Veteran", value: "professional" }
        ]
    },
    {
        title: "OPPORTUNITY VECTOR",
        icon: Briefcase,
        field: "type",
        options: [
            { label: "Temporal Intern", value: "internship" },
            { label: "Permanent Contract", value: "full-time" },
            { label: "Rapid Hack Op", value: "hackathon" }
        ]
    },
    {
        title: "DESIGNATED ROLE",
        icon: Target,
        field: "role",
        type: "text",
        placeholder: "INPUT CORE FUNCTION (E.G. REACT, DESIGN...)"
    },
    {
        title: "GEO LOCATION",
        icon: Globe,
        field: "location",
        type: "text",
        placeholder: "SEARCH GEO RADIUS (E.G. REMOTE, INDIA...)"
    }
]

export default function QuestFinder({ onFilter, onClose }: QuestFinderProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({
        level: '',
        type: '',
        role: '',
        location: ''
    })
    const [textInput, setTextInput] = useState('')

    const handleNext = (value?: string) => {
        const finalValue = value || textInput
        const newAnswers = { ...answers, [steps[currentStep].field]: finalValue }
        setAnswers(newAnswers)
        setTextInput('')

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            onFilter(newAnswers as any)
            onClose()
        }
    }

    const ProgressDots = () => (
        <div className="flex gap-4 justify-center mb-10">
            {steps.map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "w-12 h-0.5 transition-all duration-700",
                        i === currentStep ? "bg-arc-neon shadow-aura" :
                            i < currentStep ? "bg-arc-neon/40" : "bg-white/5"
                    )}
                />
            ))}
        </div>
    )

    const step = steps[currentStep]

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-motion-blur-in">
            <div className="absolute inset-0 bg-sony-nebula-deep opacity-40 pointer-events-none" />

            <div className="w-full max-w-lg glass-card bg-black/80 border-white/10 p-10 relative overflow-hidden group">
                {/* Decorative background grid */}
                <div className="absolute inset-0 bg-[url('/bg-noise.png')] opacity-10 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-scanline pointer-events-none opacity-20" />

                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 w-10 h-10 glass-card bg-black border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-arc-neon transition-all z-20"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-10 relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 biometric-frame flex items-center justify-center text-arc-neon">
                            <Target className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <Cpu className="w-3 h-3 text-arc-neon opacity-50" />
                                <span className="font-display text-[9px] text-arc-neon tracking-[0.4em] uppercase">Tracker Unit v9.0</span>
                            </div>
                            <h2 className="font-display text-2xl text-white uppercase tracking-[0.2em] chromatic-text">
                                QUEST LOG v1.0
                            </h2>
                        </div>
                    </div>
                    <div className="h-px bg-white/10 w-full" />
                </div>

                <ProgressDots />

                <div className="text-center mb-10 animate-motion-blur-in relative z-10" key={currentStep}>
                    <div className="flex justify-center mb-8">
                        {(() => {
                            const Icon = step.icon
                            return (
                                <div className="w-24 h-24 biometric-frame border-arc-neon/20 flex items-center justify-center group-hover:border-arc-neon transition-colors duration-1000">
                                    <Icon className="w-10 h-10 text-arc-neon animate-pulsate" />
                                </div>
                            )
                        })()}
                    </div>
                    <h3 className="font-display text-lg text-white uppercase tracking-[0.3em] mb-8">{step.title}
                    </h3>

                    {step.type === 'text' ? (
                        <div className="space-y-6">
                            <div className="relative group/input">
                                <input
                                    autoFocus
                                    type="text"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                    placeholder={step.placeholder}
                                    className="w-full bg-white/[0.03] border border-white/10 p-5 font-display text-sm text-white placeholder:text-white/10 uppercase tracking-widest outline-none focus:border-arc-neon/40 focus:bg-white/[0.05] transition-all"
                                />
                                <div className="absolute bottom-0 left-0 h-[1px] bg-arc-neon w-0 group-focus-within/input:w-full transition-all duration-700 shadow-aura" />
                            </div>
                            <button
                                onClick={() => handleNext()}
                                className="btn-hardware !w-full !py-5 group/btn"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-4 font-display text-xs tracking-[0.4em] uppercase">
                                    CONFIRM VECTOR <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1" />
                                </span>
                            </button>
                            <p className="font-display text-[8px] text-white/20 tracking-[0.3em] uppercase">
                                PRESS ENTER TO LOCK COORDINATES
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {step.options?.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleNext(option.value)}
                                    className="group/opt relative w-full glass-card border border-white/5 bg-white/[0.02] p-5 font-display text-[11px] uppercase tracking-[0.3em] text-white/60 hover:text-white hover:border-arc-neon/40 hover:bg-white/[0.05] transition-all duration-500 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-arc-neon/10 via-transparent to-transparent opacity-0 group-hover/opt:opacity-100 transition-opacity" />
                                    <span className="relative z-10 flex items-center justify-between">
                                        {option.label}
                                        <ChevronRight className="w-4 h-4 text-arc-neon opacity-0 group-hover/opt:opacity-100 group-hover/opt:translate-x-1 transition-all" />
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-10 pt-6 border-t border-white/5 relative z-10">
                    <button
                        disabled={currentStep === 0}
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className={cn(
                            "flex items-center gap-2 font-display text-[9px] racking-[0.3em] uppercase transition-all duration-300",
                            currentStep === 0 ? "text-white/5" : "text-white/40 hover:text-arc-neon"
                        )}
                    >
                        <ChevronLeft className="w-4 h-4" /> PREV STEP
                    </button>
                    <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-arc-neon animate-pulse" />
                        <span className="font-display text-[8px] text-white/10 tracking-[0.4em] uppercase">NAV PROTOCOL 8
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
