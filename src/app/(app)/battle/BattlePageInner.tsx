'use client'

import { useState, useEffect } from 'react'
import { useBattleStore } from '@/store/battle-store'
import { createClient } from '@/lib/supabase/client'
import { Question } from '@/lib/types'
import { parseOptions, calculateBossHP, DIFFICULTY_CONFIG } from '@/lib/game-engine'
import { Swords, Heart, Zap, Shield, Trophy, RotateCcw, BookOpen, Loader2, Crosshair, Activity, ShieldAlert, Cpu, Sparkles, ChevronRight, Layers } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { cn } from '@/lib/game-engine'
import Image from 'next/image'

export default function BattlePageInner() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const supabase = createClient()
    const lessonId = searchParams.get('lesson')

    const {
        phase, playerHP, playerMaxHP, bossHP, bossMaxHP,
        currentQuestionIndex, questions, streak, combo, xpEarned,
        lastAnswerCorrect, comboMessage,
        initBattle, submitAnswer, resetBattle,
    } = useBattleStore()

    const [loading, setLoading] = useState(false)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [animating, setAnimating] = useState(false)
    const [difficulty, setDifficulty] = useState<'minion' | 'elite' | 'boss'>('elite')
    const [lessons, setLessons] = useState<{ id: string; topic: string; difficulty: string }[]>([])
    const [selectedLesson, setSelectedLesson] = useState(lessonId || '')
    const [playerLevel, setPlayerLevel] = useState(1)

    // Mock Data
    const MOCK_LESSONS = [
        { id: 'mock-1', topic: 'Quantum Mechanics', difficulty: 'advanced' },
        { id: 'mock-2', topic: 'Calculus Basics', difficulty: 'beginner' },
        { id: 'mock-3', topic: 'World War II', difficulty: 'intermediate' }
    ]

    const MOCK_QUESTIONS: Question[] = [
        {
            id: 'q1', lesson_id: 'mock-1', difficulty_tier: 'elite',
            question_text: 'What is the uncertainty principle?',
            options: { A: 'Position/Momentum tradeoff', B: 'Newton/Leibniz rivalry', C: 'Wave/Particle duality', D: 'Einstein/Bohr debate' },
            correct_option: 'A', explanation: 'Heisenberg principle states you cannot know both precise position and momentum.',
            concept_tag: 'Heisenberg', created_at: new Date().toISOString()
        },
        {
            id: 'q2', lesson_id: 'mock-1', difficulty_tier: 'elite',
            question_text: 'Who formulated the Schrödinger equation?',
            options: { A: 'Heisenberg', B: 'Schrödinger', C: 'Planck', D: 'Dirac' },
            correct_option: 'B', explanation: 'Erwin Schrödinger formulated the wave equation.',
            concept_tag: 'Wave Function', created_at: new Date().toISOString()
        },
        {
            id: 'q3', lesson_id: 'mock-1', difficulty_tier: 'elite',
            question_text: 'What is a photon?',
            options: { A: 'A particle of light', B: 'A wave of sound', C: 'An electron', D: 'A neutron' },
            correct_option: 'A', explanation: 'A photon is the fundamental particle of light.',
            concept_tag: 'Particle Physics', created_at: new Date().toISOString()
        }
    ]

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const [{ data: ls }, { data: stats }] = await Promise.all([
                    supabase.from('lessons').select('id, topic, difficulty').eq('is_published', true).limit(20),
                    supabase.from('player_stats').select('level').eq('user_id', user.id).single(),
                ])
                if (ls) setLessons(ls)
                if (stats) setPlayerLevel(stats.level)
            } else {
                setLessons(MOCK_LESSONS)
                setPlayerLevel(5) // Guest Level
            }
        }
        fetchData()
    }, [])

    const startBattle = async () => {
        if (!selectedLesson) { toast.error('Select mission parameters first!'); return }
        setLoading(true)
        try {
            const bossHPVal = calculateBossHP(playerLevel, difficulty)
            const { data: { user } } = await supabase.auth.getUser()

            let battleId = 'guest-battle'
            let initialQuestions: Question[] = []

            if (user) {
                const { data: qs } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('lesson_id', selectedLesson)
                    .eq('difficulty_tier', difficulty)
                    .limit(10)

                if (!qs || qs.length === 0) {
                    toast.error('No combat protocols found for this difficulty.')
                    return
                }
                initialQuestions = qs as Question[]

                const { data: battle } = await supabase.from('boss_battles').insert({
                    user_id: user.id,
                    lesson_id: selectedLesson,
                    difficulty,
                    player_hp_start: 100 + 10 * playerLevel,
                    boss_hp_start: bossHPVal,
                    streak_at_start: 0,
                }).select().single()

                battleId = battle?.id ?? 'local'
            } else {
                initialQuestions = MOCK_QUESTIONS
                battleId = 'guest-' + Date.now()
            }

            initBattle(battleId, initialQuestions, playerLevel, difficulty, bossHPVal)
        } catch (err) {
            toast.error('Arena synchronization failed.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleAnswer = async (option: string) => {
        if (animating || selectedOption) return
        setSelectedOption(option)
        setAnimating(true)

        await new Promise(r => setTimeout(r, 600))
        const result = submitAnswer(option)

        if (result.correct) {
            toast.success(`+${result.xpGained} XP SYNCED`, { duration: 1500, style: { background: '#001A3D', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.3)' } })
        } else {
            toast.error('SYSTEM BREACH! BOSS COUNTERS! 💥', { duration: 1500, style: { background: '#1A0000', color: '#FF0055', border: '1px solid rgba(255,0,85,0.3)' } })
        }

        await new Promise(r => setTimeout(r, 800))
        setSelectedOption(null)
        setAnimating(false)
    }

    const currentQuestion = questions[currentQuestionIndex]
    const options = currentQuestion ? parseOptions(currentQuestion.options) : []
    const playerHPPercent = Math.max(0, (playerHP / playerMaxHP) * 100)
    const bossHPPercent = Math.max(0, (bossHP / bossMaxHP) * 100)

    if (phase === 'idle') {
        return (
            <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10 font-sans animate-motion-blur-in">
                <div className="pb-8 border-b border-white/10 flex items-center gap-6">
                    <div className="w-14 h-14 biometric-frame overflow-hidden relative shrink-0">
                        <Image
                            src="/images/gamma_edison_logo.png"
                            alt="Logo"
                            fill
                            className="object-cover p-2 brightness-110"
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <span className="font-display text-[10px] text-arc-neon tracking-[0.3em] uppercase opacity-70">Combat Interface v4.5</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-arc-neon animate-pulse" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display tracking-[0.2em] chromatic-text uppercase leading-none">ARENA ORACLE</h1>
                    </div>
                </div>

                <div className="glass-card p-10 space-y-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Swords className="w-32 h-32" />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-display text-white/40 tracking-[0.4em] uppercase flex items-center gap-3">
                            <Layers className="w-4 h-4 text-arc-neon" /> 1. PROTOCOL SELECTION
                        </label>
                        <div className="relative">
                            <select
                                value={selectedLesson}
                                onChange={e => setSelectedLesson(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-sm p-5 text-white font-sans text-lg appearance-none focus:border-arc-neon/50 transition-all outline-none"
                            >
                                <option value="" className="bg-sony-nebula-deep">LOAD NEURAL CARTRIDGE</option>
                                {lessons.map(l => (
                                    <option key={l.id} value={l.id} className="bg-sony-nebula-deep">{l.topic.toUpperCase()} ({l.difficulty.toUpperCase()})</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                <ChevronRight className="w-5 h-5 rotate-90" />
                            </div>
                        </div>
                        {lessons.length === 0 && (
                            <p className="text-[10px] text-arc-neon font-display tracking-widest uppercase mt-4">
                                NO DATA DETECTED. <Link href="/lessons" className="underline hover:text-white transition-colors">INITIALIZE ARCHIVE →</Link>
                            </p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-display text-white/40 tracking-[0.4em] uppercase flex items-center gap-3">
                            <ShieldAlert className="w-4 h-4 text-sony-violet" /> 2. THREAT CALIBRATION
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            {(['minion', 'elite', 'boss'] as const).map(d => {
                                return (
                                    <button
                                        key={d}
                                        onClick={() => setDifficulty(d)}
                                        className={cn(
                                            "p-5 border font-display text-[10px] tracking-[0.2em] uppercase transition-all duration-300 relative group/btn overflow-hidden",
                                            difficulty === d
                                                ? "border-arc-neon bg-arc-neon/10 text-arc-neon shadow-aura"
                                                : "border-white/10 text-white/40 hover:border-white/30 hover:bg-white/5"
                                        )}
                                    >
                                        <div className="text-2xl mb-3 opacity-60 group-hover/btn:opacity-100 transition-opacity">
                                            {d === 'minion' ? '👹' : d === 'elite' ? '💀' : '🔥'}
                                        </div>
                                        {d}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <button
                        onClick={startBattle}
                        disabled={loading || !selectedLesson}
                        className="btn-hardware w-full py-8 group"
                    >
                        <div className="flex items-center justify-center gap-4 relative z-10 transition-transform group-active:scale-95">
                            {loading ? (
                                <Loader2 className="w-8 h-8 animate-spin text-arc-neon" />
                            ) : (
                                <Swords className="w-8 h-8 text-arc-neon animate-pulse" />
                            )}
                            <span className="font-display text-2xl tracking-[0.3em]">{loading ? 'INITIALIZING...' : 'ENGAGE ARENA'}</span>
                        </div>
                    </button>
                </div>
            </div>
        )
    }

    if (phase === 'victory') {
        return (
            <div className="p-6 md:p-10 max-w-2xl mx-auto text-center space-y-10 font-sans animate-motion-blur-in">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-arc-neon/20 blur-[60px] animate-pulse rounded-full" />
                    <Trophy className="w-24 h-24 text-arc-neon mx-auto relative z-10 drop-shadow-glow" />
                </div>
                <div>
                    <h1 className="text-5xl md:text-7xl font-display tracking-[0.4em] chromatic-text uppercase mb-4">VICTORY</h1>
                    <p className="text-arc-neon font-display text-[10px] tracking-[0.8em] uppercase opacity-60 animate-pulse">Neural Threat Eliminated</p>
                </div>

                <div className="glass-card p-10 space-y-6 border-arc-neon/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-arc-neon to-transparent" />
                    <div className="flex justify-between items-center py-4 border-b border-white/10">
                        <span className="text-white/40 font-display text-[10px] tracking-widest uppercase">SYNERGY SYNC</span>
                        <span className="text-arc-neon font-display text-3xl tracking-widest">+{xpEarned} XP</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-white/10">
                        <span className="text-white/40 font-display text-[10px] tracking-widest uppercase">MAX COMBO CHAIN</span>
                        <span className="text-sony-indigo font-display text-2xl tracking-widest">{combo}x</span>
                    </div>
                    <div className="flex justify-between items-center py-4">
                        <span className="text-white/40 font-display text-[10px] tracking-widest uppercase">STRIKE PRECISION</span>
                        <span className="text-sony-violet font-display text-2xl tracking-widest">{streak} HITS</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                    <button
                        onClick={resetBattle}
                        className="flex-1 glass-card p-6 font-display text-[10px] tracking-[0.4em] uppercase text-white hover:bg-white/5 transition-all flex items-center justify-center gap-3"
                    >
                        <RotateCcw className="w-4 h-4" /> RE INITIALIZE
                    </button>
                    <Link
                        href="/leaderboard"
                        className="btn-hardware flex-1 !p-6 flex items-center justify-center gap-3"
                    >
                        <span className="relative z-10 flex items-center gap-3 font-display text-[10px] tracking-[0.4em] uppercase">
                            <Trophy className="w-4 h-4" /> SECTOR RANKINGS
                        </span>
                    </Link>
                </div>
            </div>
        )
    }

    if (phase === 'defeat') {
        return (
            <div className="p-6 md:p-10 max-w-2xl mx-auto text-center space-y-10 font-sans animate-motion-blur-in">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-red-500/10 blur-[60px] animate-pulse rounded-full" />
                    <ShieldAlert className="w-24 h-24 text-red-500 mx-auto relative z-10 opacity-70" />
                </div>
                <div>
                    <h1 className="text-5xl md:text-7xl font-display tracking-[0.4em] text-red-500 uppercase mb-4 opacity-80">DEFEATED</h1>
                    <p className="text-red-400 font-display text-[10px] tracking-[0.8em] uppercase opacity-40">System Containment Failure</p>
                </div>

                <div className="glass-card p-10 bg-red-950/10 border-red-500/20">
                    <div className="flex justify-between items-center">
                        <span className="text-red-400/40 font-display text-[10px] tracking-widest uppercase">XP SALVAGED</span>
                        <span className="text-red-400 font-display text-2xl tracking-widest">+{xpEarned} XP</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                    <button
                        onClick={resetBattle}
                        className="flex-1 btn-hardware !bg-red-950/20 !border-red-500/30 !p-6 flex items-center justify-center gap-3"
                    >
                        <span className="relative z-10 flex items-center gap-3 font-display text-[10px] tracking-[0.4em] text-red-400 uppercase">
                            <RotateCcw className="w-4 h-4" /> RETRY SYNC
                        </span>
                    </button>
                    <Link
                        href="/lessons"
                        className="flex-1 glass-card p-6 font-display text-[10px] tracking-[0.4em] uppercase text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-3 border-white/10"
                    >
                        <BookOpen className="w-4 h-4" /> RE TRAIN
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-10 font-sans animate-motion-blur-in relative">
            {/* Arena Header HUD */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-2 h-2 rounded-full bg-arc-neon animate-pulse" />
                        <span className="font-display text-[10px] text-arc-neon tracking-[0.3em] uppercase opacity-70">Active Combat Zone</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display tracking-[0.2em] text-white uppercase">NEURAL ARENA</h1>
                </div>
                <div className="flex items-center gap-4 bg-black/40 p-3 rounded-sm border border-white/5">
                    {streak > 0 && (
                        <div className="px-4 py-1.5 bg-sony-indigo/20 border border-sony-indigo/40 text-sony-indigo font-display text-[10px] tracking-widest uppercase flex items-center gap-2 rounded-full animate-pulse shadow-aura">
                            <span>COMBO</span> {streak} CHAIN
                        </div>
                    )}
                    <div className="px-4 py-1.5 bg-arc-neon/10 border border-arc-neon/30 text-arc-neon font-display text-[10px] tracking-widest uppercase rounded-full">
                        {xpEarned} XP SYNCED
                    </div>
                </div>
            </div>

            {/* Health Management HUD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-8 border-arc-neon/20 relative group">
                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                        <div className="flex items-center gap-3">
                            <Activity className="w-4 h-4 text-arc-neon" />
                            <span className="text-[10px] font-display text-white/40 tracking-[0.2em] uppercase">SYSTEM INTEGRITY</span>
                        </div>
                        <span className="text-xl font-display text-arc-neon tracking-widest drop-shadow-glow">
                            {playerHP} <span className="text-[10px] text-white/20">/ {playerMaxHP}</span>
                        </span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px] relative">
                        <div
                            className={cn(
                                "h-full bg-gradient-to-r from-arc-neon to-sony-indigo transition-all duration-500 shadow-glow",
                                playerHPPercent < 30 ? "animate-pulse" : ""
                            )}
                            style={{ width: `${playerHPPercent}%` }}
                        />
                        {/* Biometric Scan Line effect */}
                        <div className="absolute top-0 bottom-0 w-8 bg-white/10 blur-md animate-pulse" style={{ left: `${playerHPPercent - 5}%` }} />
                    </div>
                </div>

                <div className="glass-card p-8 border-sony-violet/20 bg-black/60 relative">
                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="w-4 h-4 text-sony-violet" />
                            <span className="text-[10px] font-display text-white/40 tracking-[0.2em] uppercase">BOSS PROTOCOL</span>
                        </div>
                        <span className="text-xl font-display text-sony-violet tracking-widest drop-shadow-glow">
                            {bossHP} <span className="text-[10px] text-white/20">/ {bossMaxHP}</span>
                        </span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px] flex justify-end">
                        <div
                            className="h-full bg-gradient-to-l from-sony-violet to-sony-indigo transition-all duration-500 shadow-glow"
                            style={{ width: `${bossHPPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Interaction Layer */}
            {comboMessage && (
                <div className="text-center animate-bounce py-2">
                    <span className="text-4xl font-display tracking-[0.3em] chromatic-text uppercase transition-all scale-150">{comboMessage}</span>
                </div>
            )}

            {currentQuestion && (
                <div className="glass-card p-10 space-y-10 relative overflow-hidden group/arena">
                    {/* Background Grids */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                    <div className="flex items-center justify-between border-b border-white/10 pb-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 biometric-frame flex items-center justify-center font-display text-arc-neon text-xs">
                                {currentQuestionIndex + 1}
                            </div>
                            <span className="font-display text-[10px] text-white/40 tracking-[0.4em] uppercase">OF {questions.length} DATA NODES</span>
                        </div>
                        <div className="px-4 py-1.5 glass-card bg-black/40 border-arc-neon/30 text-[9px] font-display text-arc-neon tracking-[0.2em] uppercase rounded-full">
                            {currentQuestion.difficulty_tier}
                        </div>
                    </div>

                    <p className="text-2xl md:text-3xl font-display tracking-wider text-white leading-relaxed relative z-10 select-none">
                        {currentQuestion.question_text}
                    </p>

                    <div className="grid grid-cols-1 gap-4 relative z-10">
                        {options.map(opt => {
                            const isSelected = selectedOption === opt.label
                            const isCorrectAns = selectedOption && opt.is_correct

                            return (
                                <button
                                    key={opt.label}
                                    onClick={() => handleAnswer(opt.label)}
                                    disabled={!!selectedOption || animating}
                                    className={cn(
                                        "w-full text-left p-6 transition-all duration-300 font-sans text-lg rounded-sm border group/opt relative overflow-hidden",
                                        !selectedOption && "border-white/10 bg-black/40 hover:border-arc-neon/40 hover:bg-white/5",
                                        isSelected && opt.is_correct && "border-arc-neon bg-arc-neon/20 shadow-aura ring-1 ring-arc-neon/50",
                                        isSelected && !opt.is_correct && "border-red-500 bg-red-500/10 animate-shake",
                                        isCorrectAns && !isSelected && "border-arc-neon/40 bg-arc-neon/5"
                                    )}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full border flex items-center justify-center font-display text-xs transition-colors",
                                            !selectedOption ? "border-white/20 text-white/40 group-hover/opt:border-arc-neon group-hover/opt:text-arc-neon" :
                                                isSelected && opt.is_correct ? "border-arc-neon text-arc-neon bg-arc-neon/20" :
                                                    isSelected && !opt.is_correct ? "border-red-500 text-red-500" :
                                                        opt.is_correct ? "border-arc-neon/40 text-arc-neon/40" : "border-white/10 text-white/10"
                                        )}>
                                            {opt.label}
                                        </div>
                                        <span className={cn(
                                            "flex-1 transition-colors",
                                            !selectedOption ? "text-white/70 group-hover/opt:text-white" :
                                                isSelected && opt.is_correct ? "text-white drop-shadow-glow" :
                                                    isSelected && !opt.is_correct ? "text-red-400" :
                                                        opt.is_correct ? "text-arc-neon/60" : "text-white/20"
                                        )}>{opt.text}
                                        </span>
                                        {isSelected && opt.is_correct && <Sparkles className="w-5 h-5 text-arc-neon animate-pulse" />}
                                    </div>
                                    {/* Scanline overlay for active option */}
                                    {isSelected && <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-transparent to-white/5 pointer-events-none" />}
                                </button>
                            )
                        })}
                    </div>

                    {selectedOption && currentQuestion.explanation && (
                        <div className="p-6 glass-card bg-black/60 border-white/5 text-sm font-sans text-white/50 leading-relaxed animate-motion-blur-in relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                                <Cpu className="w-4 h-4 text-arc-neon" />
                                <span className="text-[10px] font-display text-arc-neon tracking-[0.2em] uppercase">Neural Insight</span>
                            </div>
                            {currentQuestion.explanation}
                        </div>
                    )}
                </div>
            )}

            {/* Neural Progress Bar */}
            <div className="flex items-center gap-4 pt-6">
                <span className="text-[10px] font-display text-white/20 tracking-widest uppercase">SYNC PROGRESS</span>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
                    <div
                        className="h-full bg-arc-neon transition-all duration-1000 shadow-glow"
                        style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                    />
                </div>
                <span className="text-[10px] font-display text-arc-neon tracking-widest uppercase">{Math.round(((currentQuestionIndex) / questions.length) * 100)}%</span>
            </div>
        </div>
    )
}
