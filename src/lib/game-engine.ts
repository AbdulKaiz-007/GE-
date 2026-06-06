import { BattleState, Question, QuestionOption, Rank, RANK_THRESHOLDS } from './types'

// ============================================================
// XP & LEVEL FORMULAS
// ============================================================

export function xpRequiredForLevel(level: number): number {
    return Math.floor(500 * Math.pow(level, 1.8))
}

export function getLevelFromXP(totalXP: number): number {
    let level = 1
    while (xpRequiredForLevel(level + 1) <= totalXP) {
        level++
        if (level >= 200) break
    }
    return level
}

export function getXPProgress(totalXP: number): { level: number; currentXP: number; requiredXP: number; percent: number } {
    const level = getLevelFromXP(totalXP)
    const prevLevelXP = level > 1 ? xpRequiredForLevel(level) : 0
    const nextLevelXP = xpRequiredForLevel(level + 1)
    const currentXP = totalXP - prevLevelXP
    const requiredXP = nextLevelXP - prevLevelXP
    const percent = Math.min(100, Math.floor((currentXP / requiredXP) * 100))
    return { level, currentXP, requiredXP, percent }
}

export function getRankFromLevel(level: number): Rank {
    if (level >= RANK_THRESHOLDS.Mythic) return 'Mythic'
    if (level >= RANK_THRESHOLDS.Legend) return 'Legend'
    if (level >= RANK_THRESHOLDS.Champion) return 'Champion'
    if (level >= RANK_THRESHOLDS.Warrior) return 'Warrior'
    if (level >= RANK_THRESHOLDS.Apprentice) return 'Apprentice'
    return 'Novice'
}

// ============================================================
// XP GAIN FORMULA
// ============================================================

export function calculateXPGain(
    difficulty: 'minion' | 'elite' | 'boss',
    streakCount: number,
    comboCount: number
): number {
    const baseXP = 100
    const difficultyMultiplier = { minion: 1.0, elite: 1.5, boss: 2.5 }[difficulty]
    const streakMultiplier = 1 + 0.1 * Math.min(streakCount, 10)
    const comboBonus = 1 + 0.05 * comboCount
    return Math.floor(baseXP * difficultyMultiplier * streakMultiplier * comboBonus)
}

// ============================================================
// BOSS HP FORMULA
// ============================================================

export function calculateBossHP(playerLevel: number, difficulty: 'minion' | 'elite' | 'boss'): number {
    const difficultyFactor = { minion: 0.5, elite: 1.0, boss: 2.0 }[difficulty]
    return Math.floor(500 * (1 + 0.3 * (playerLevel - 1)) * difficultyFactor)
}

export function calculatePlayerMaxHP(level: number): number {
    return 100 + 10 * level
}

// ============================================================
// BOSS ATTACK FORMULA
// ============================================================

export function calculateBossAttack(difficulty: 'minion' | 'elite' | 'boss'): number {
    const difficultyFactor = { minion: 0.5, elite: 1.0, boss: 2.0 }[difficulty]
    const basePower = 15 * difficultyFactor
    const randomFactor = 1 + (Math.random() * 0.5 - 0.2) // -20% to +30%
    return Math.floor(basePower * randomFactor)
}

// ============================================================
// COMBO MESSAGES
// ============================================================

export function getComboMessage(combo: number): { message: string; xpBonus: number; healHP: number; stunBoss: boolean } | null {
    if (combo >= 10) return { message: '⚡ LEGENDARY!', xpBonus: 0.75, healHP: 999, stunBoss: false }
    if (combo >= 7) return { message: '🔥 UNSTOPPABLE!', xpBonus: 0.40, healHP: 10, stunBoss: false }
    if (combo >= 5) return { message: '💥 POWER SURGE!', xpBonus: 0.25, healHP: 0, stunBoss: true }
    if (combo >= 3) return { message: '⚔️ TRIPLE STRIKE!', xpBonus: 0.15, healHP: 0, stunBoss: false }
    return null
}

// ============================================================
// LEADERBOARD SCORE FORMULA
// ============================================================

export function calculateLeaderboardScore(totalXP: number, winRate: number, streakDays: number): number {
    return totalXP * 0.5 + winRate * 1000 * 0.3 + streakDays * 50 * 0.2
}

// ============================================================
// QUESTION HELPERS
// ============================================================

export function parseOptions(options: unknown): QuestionOption[] {
    if (Array.isArray(options)) return options as QuestionOption[]
    return []
}

// ============================================================
// DIFFICULTY DISPLAY
// ============================================================

export const DIFFICULTY_CONFIG = {
    minion: { label: 'Minion', color: 'text-arc-green', bg: 'bg-arc-green/20', border: 'border-arc-green/30' },
    elite: { label: 'Elite', color: 'text-arc-blue', bg: 'bg-arc-blue/20', border: 'border-arc-blue/30' },
    boss: { label: 'Boss', color: 'text-arc-red', bg: 'bg-arc-red/20', border: 'border-arc-red/30' },
}

export const LESSON_DIFFICULTY_CONFIG = {
    beginner: { label: 'Beginner', color: 'text-arc-green', emoji: '🌱' },
    intermediate: { label: 'Intermediate', color: 'text-arc-blue', emoji: '⚔️' },
    advanced: { label: 'Advanced', color: 'text-arc-red', emoji: '💀' },
}

// ============================================================
// UTILITY
// ============================================================

export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ')
}

export function formatXP(xp: number): string {
    if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(1)}M`
    if (xp >= 1_000) return `${(xp / 1_000).toFixed(1)}K`
    return xp.toString()
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}
