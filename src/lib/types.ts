export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    role: 'student' | 'admin'
                    is_verified: boolean
                    college_email: string | null
                    college_name: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    role?: 'student' | 'admin'
                    is_verified?: boolean
                    college_email?: string | null
                    college_name?: string | null
                }
                Update: {
                    role?: 'student' | 'admin'
                    is_verified?: boolean
                    college_email?: string | null
                    college_name?: string | null
                    updated_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    username: string
                    display_name: string | null
                    avatar_url: string | null
                    bio: string | null
                    subscription: 'free' | 'premium' | 'institutional'
                    subscription_expires_at: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    username: string
                    display_name?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    subscription?: 'free' | 'premium' | 'institutional'
                }
                Update: {
                    username?: string
                    display_name?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    subscription?: 'free' | 'premium' | 'institutional'
                    subscription_expires_at?: string | null
                }
            }
            player_stats: {
                Row: {
                    user_id: string
                    xp: number
                    level: number
                    rank: string
                    hp: number
                    max_hp: number
                    streak_days: number
                    last_active_date: string
                    total_battles: number
                    battles_won: number
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    xp?: number
                    level?: number
                    rank?: string
                    hp?: number
                    max_hp?: number
                    streak_days?: number
                }
                Update: {
                    xp?: number
                    level?: number
                    rank?: string
                    hp?: number
                    max_hp?: number
                    streak_days?: number
                    last_active_date?: string
                    total_battles?: number
                    battles_won?: number
                    updated_at?: string
                }
            }
            lessons: {
                Row: {
                    id: string
                    topic: string
                    topic_slug: string
                    cache_key: string
                    difficulty: 'beginner' | 'intermediate' | 'advanced'
                    subject_tag: string | null
                    story_arc: Json | null
                    panel_count: number
                    is_published: boolean
                    generated_by: string
                    created_at: string
                }
                Insert: {
                    topic: string
                    topic_slug: string
                    cache_key: string
                    difficulty: 'beginner' | 'intermediate' | 'advanced'
                    subject_tag?: string | null
                    story_arc?: Json | null
                    panel_count?: number
                    is_published?: boolean
                }
                Update: {
                    is_published?: boolean
                    panel_count?: number
                    story_arc?: Json | null
                }
            }
            comic_panels: {
                Row: {
                    id: string
                    lesson_id: string
                    panel_order: number
                    dialogue: string | null
                    narration: string | null
                    concept_tag: string | null
                    image_url: string | null
                    image_prompt: string | null
                    scene_desc: string | null
                    created_at: string
                }
                Insert: {
                    lesson_id: string
                    panel_order: number
                    dialogue?: string | null
                    narration?: string | null
                    concept_tag?: string | null
                    image_url?: string | null
                    image_prompt?: string | null
                    scene_desc?: string | null
                }
                Update: {
                    image_url?: string | null
                }
            }
            questions: {
                Row: {
                    id: string
                    lesson_id: string
                    question_text: string
                    options: Json
                    correct_option: string
                    explanation: string | null
                    concept_tag: string | null
                    difficulty_tier: 'minion' | 'elite' | 'boss'
                    created_at: string
                }
                Insert: {
                    lesson_id: string
                    question_text: string
                    options: Json
                    correct_option: string
                    explanation?: string | null
                    concept_tag?: string | null
                    difficulty_tier: 'minion' | 'elite' | 'boss'
                }
                Update: Record<string, never>
            }
            boss_battles: {
                Row: {
                    id: string
                    user_id: string
                    lesson_id: string
                    difficulty: string
                    player_hp_start: number
                    boss_hp_start: number
                    player_hp_end: number | null
                    boss_hp_end: number | null
                    outcome: 'victory' | 'defeat' | 'abandoned' | null
                    xp_earned: number
                    streak_at_start: number
                    started_at: string
                    ended_at: string | null
                }
                Insert: {
                    user_id: string
                    lesson_id: string
                    difficulty: string
                    player_hp_start: number
                    boss_hp_start: number
                    streak_at_start?: number
                }
                Update: {
                    player_hp_end?: number
                    boss_hp_end?: number
                    outcome?: 'victory' | 'defeat' | 'abandoned'
                    xp_earned?: number
                    ended_at?: string
                }
            }
            leaderboard: {
                Row: {
                    user_id: string
                    username: string
                    avatar_url: string | null
                    college_name: string | null
                    total_xp: number
                    level: number
                    rank: string
                    win_rate: number
                    streak_days: number
                    score: number
                    rank_position: number | null
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    username: string
                    avatar_url?: string | null
                    college_name?: string | null
                    total_xp?: number
                    level?: number
                    rank?: string
                    win_rate?: number
                    streak_days?: number
                    score?: number
                }
                Update: {
                    username?: string
                    avatar_url?: string | null
                    college_name?: string | null
                    total_xp?: number
                    level?: number
                    rank?: string
                    win_rate?: number
                    streak_days?: number
                    score?: number
                    rank_position?: number | null
                    updated_at?: string
                }
            }
            verification_requests: {
                Row: {
                    id: string
                    user_id: string
                    college_email: string
                    id_document_url: string
                    status: 'pending' | 'approved' | 'rejected'
                    reviewed_by: string | null
                    review_note: string | null
                    submitted_at: string
                    reviewed_at: string | null
                }
                Insert: {
                    user_id: string
                    college_email: string
                    id_document_url: string
                }
                Update: {
                    status?: 'pending' | 'approved' | 'rejected'
                    reviewed_by?: string | null
                    review_note?: string | null
                    reviewed_at?: string | null
                }
            }
        }
    }
}

// Convenience types
export type User = Database['public']['Tables']['users']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type PlayerStats = Database['public']['Tables']['player_stats']['Row']
export type Lesson = Database['public']['Tables']['lessons']['Row']
export type ComicPanel = Database['public']['Tables']['comic_panels']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type BossBattle = Database['public']['Tables']['boss_battles']['Row']
export type LeaderboardEntry = Database['public']['Tables']['leaderboard']['Row']
export type VerificationRequest = Database['public']['Tables']['verification_requests']['Row']

// Game types
export interface QuestionOption {
    label: string
    text: string
    is_correct: boolean
}

export interface BattleState {
    battleId: string | null
    playerHP: number
    playerMaxHP: number
    bossHP: number
    bossMaxHP: number
    currentQuestionIndex: number
    questions: Question[]
    streak: number
    combo: number
    xpEarned: number
    phase: 'idle' | 'loading' | 'question' | 'player_attack' | 'boss_attack' | 'victory' | 'defeat'
    lastAnswerCorrect: boolean | null
    comboMessage: string | null
}

export type Rank = 'Novice' | 'Apprentice' | 'Warrior' | 'Champion' | 'Legend' | 'Mythic'

export const RANK_THRESHOLDS: Record<Rank, number> = {
    Novice: 0,
    Apprentice: 5,
    Warrior: 15,
    Champion: 30,
    Legend: 60,
    Mythic: 100,
}
