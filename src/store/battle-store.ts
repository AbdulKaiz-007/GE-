import { create } from 'zustand'
import { BattleState, Question } from '@/lib/types'
import {
    calculateBossAttack,
    calculateXPGain,
    getComboMessage,
    calculatePlayerMaxHP,
} from '@/lib/game-engine'

interface BattleStore extends BattleState {
    initBattle: (battleId: string, questions: Question[], playerLevel: number, difficulty: 'minion' | 'elite' | 'boss', bossHP: number) => void
    submitAnswer: (selectedOption: string) => { correct: boolean; xpGained: number; comboMessage: string | null; bossStunned: boolean }
    endBattle: (outcome: 'victory' | 'defeat') => void
    resetBattle: () => void
}

const initialState: BattleState = {
    battleId: null,
    playerHP: 100,
    playerMaxHP: 100,
    bossHP: 500,
    bossMaxHP: 500,
    currentQuestionIndex: 0,
    questions: [],
    streak: 0,
    combo: 0,
    xpEarned: 0,
    phase: 'idle',
    lastAnswerCorrect: null,
    comboMessage: null,
}

export const useBattleStore = create<BattleStore>((set, get) => ({
    ...initialState,

    initBattle: (battleId, questions, playerLevel, difficulty, bossHP) => {
        const maxHP = calculatePlayerMaxHP(playerLevel)
        set({
            battleId,
            questions,
            playerHP: maxHP,
            playerMaxHP: maxHP,
            bossHP,
            bossMaxHP: bossHP,
            currentQuestionIndex: 0,
            streak: 0,
            combo: 0,
            xpEarned: 0,
            phase: 'question',
            lastAnswerCorrect: null,
            comboMessage: null,
        })
    },

    submitAnswer: (selectedOption: string) => {
        const state = get()
        const question = state.questions[state.currentQuestionIndex]
        if (!question) return { correct: false, xpGained: 0, comboMessage: null, bossStunned: false }

        const correct = selectedOption === question.correct_option
        const difficulty = question.difficulty_tier as 'minion' | 'elite' | 'boss'

        if (correct) {
            const newCombo = state.combo + 1
            const newStreak = state.streak + 1
            const xpGained = calculateXPGain(difficulty, newStreak, newCombo)
            const comboData = getComboMessage(newCombo)

            let newPlayerHP = state.playerHP
            if (comboData?.healHP) {
                newPlayerHP = Math.min(state.playerMaxHP, state.playerHP + comboData.healHP)
            }

            // Boss takes damage (10% of boss max HP per correct answer)
            const bossDamage = Math.floor(state.bossMaxHP * 0.1)
            const newBossHP = Math.max(0, state.bossHP - bossDamage)
            const nextIndex = state.currentQuestionIndex + 1
            const isLastQuestion = nextIndex >= state.questions.length
            const bossDefeated = newBossHP <= 0

            set({
                combo: newCombo,
                streak: newStreak,
                xpEarned: state.xpEarned + xpGained,
                bossHP: newBossHP,
                playerHP: newPlayerHP,
                currentQuestionIndex: isLastQuestion ? state.currentQuestionIndex : nextIndex,
                phase: bossDefeated ? 'victory' : isLastQuestion ? 'victory' : 'player_attack',
                lastAnswerCorrect: true,
                comboMessage: comboData?.message ?? null,
            })

            return { correct: true, xpGained, comboMessage: comboData?.message ?? null, bossStunned: comboData?.stunBoss ?? false }
        } else {
            // Wrong answer — boss attacks
            const attackDamage = calculateBossAttack(difficulty)
            const newPlayerHP = Math.max(0, state.playerHP - attackDamage)
            const nextIndex = state.currentQuestionIndex + 1
            const isLastQuestion = nextIndex >= state.questions.length
            const playerDefeated = newPlayerHP <= 0

            set({
                combo: 0,
                playerHP: newPlayerHP,
                currentQuestionIndex: isLastQuestion ? state.currentQuestionIndex : nextIndex,
                phase: playerDefeated ? 'defeat' : isLastQuestion ? 'defeat' : 'boss_attack',
                lastAnswerCorrect: false,
                comboMessage: null,
            })

            return { correct: false, xpGained: 0, comboMessage: null, bossStunned: false }
        }
    },

    endBattle: (outcome) => {
        set({ phase: outcome === 'victory' ? 'victory' : 'defeat' })
    },

    resetBattle: () => {
        set(initialState)
    },
}))
