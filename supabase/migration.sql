-- ============================================================
-- ARC STUDIOS — SUPABASE MIGRATION
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE (linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  role          TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  is_verified   BOOLEAN DEFAULT FALSE,
  college_email TEXT,
  college_name  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE NOT NULL,
  display_name    TEXT,
  avatar_url      TEXT,
  bio             TEXT,
  subscription    TEXT DEFAULT 'free' CHECK (subscription IN ('free', 'premium', 'institutional')),
  subscription_expires_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PLAYER STATS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.player_stats (
  user_id         UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  xp              BIGINT DEFAULT 0,
  level           INT DEFAULT 1,
  rank            TEXT DEFAULT 'Novice',
  hp              INT DEFAULT 100,
  max_hp          INT DEFAULT 100,
  streak_days     INT DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  total_battles   INT DEFAULT 0,
  battles_won     INT DEFAULT 0,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LESSONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic           TEXT NOT NULL,
  topic_slug      TEXT UNIQUE,
  cache_key       TEXT UNIQUE NOT NULL,
  difficulty      TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  subject_tag     TEXT,
  story_arc       JSONB,
  panel_count     INT DEFAULT 0,
  style           TEXT,
  concepts        JSONB,
  user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE,
  is_published    BOOLEAN DEFAULT FALSE,
  generated_by    TEXT DEFAULT 'ai',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lessons_topic_slug ON public.lessons(topic_slug);
CREATE INDEX IF NOT EXISTS idx_lessons_cache_key ON public.lessons(cache_key);
CREATE INDEX IF NOT EXISTS idx_lessons_difficulty ON public.lessons(difficulty);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON public.lessons(is_published);

-- ============================================================
-- COMIC PANELS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comic_panels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id       UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  panel_order     INT NOT NULL,
  dialogue        TEXT,
  narration       TEXT,
  concept_tag     TEXT,
  image_url       TEXT,
  image_prompt    TEXT,
  scene_desc      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lesson_id, panel_order)
);
CREATE INDEX IF NOT EXISTS idx_panels_lesson_id ON public.comic_panels(lesson_id);

-- ============================================================
-- QUESTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id       UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  question_text   TEXT NOT NULL,
  options         JSONB NOT NULL,
  correct_option  TEXT NOT NULL,
  explanation     TEXT,
  concept_tag     TEXT,
  difficulty_tier TEXT NOT NULL CHECK (difficulty_tier IN ('minion', 'elite', 'boss')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_questions_lesson_id ON public.questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty_tier);

-- ============================================================
-- BOSS BATTLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.boss_battles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id       UUID NOT NULL REFERENCES public.lessons(id),
  difficulty      TEXT NOT NULL,
  player_hp_start INT NOT NULL,
  boss_hp_start   INT NOT NULL,
  player_hp_end   INT,
  boss_hp_end     INT,
  outcome         TEXT CHECK (outcome IN ('victory', 'defeat', 'abandoned')),
  xp_earned       INT DEFAULT 0,
  streak_at_start INT DEFAULT 0,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  ended_at        TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_battles_user_id ON public.boss_battles(user_id);
CREATE INDEX IF NOT EXISTS idx_battles_lesson_id ON public.boss_battles(lesson_id);

-- ============================================================
-- BATTLE LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.battle_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id       UUID NOT NULL REFERENCES public.boss_battles(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES public.questions(id),
  selected_option TEXT NOT NULL,
  is_correct      BOOLEAN NOT NULL,
  xp_gained       INT DEFAULT 0,
  combo_count     INT DEFAULT 0,
  time_taken_ms   INT,
  logged_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_battle_logs_battle_id ON public.battle_logs(battle_id);

-- ============================================================
-- XP LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.xp_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  xp_delta        INT NOT NULL,
  source          TEXT NOT NULL,
  reference_id    UUID,
  logged_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_xp_logs_user_id ON public.xp_logs(user_id);

-- ============================================================
-- LEADERBOARD TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leaderboard (
  user_id         UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  username        TEXT NOT NULL,
  avatar_url      TEXT,
  college_name    TEXT,
  total_xp        BIGINT DEFAULT 0,
  level           INT DEFAULT 1,
  rank            TEXT DEFAULT 'Novice',
  win_rate        NUMERIC(5,2) DEFAULT 0,
  streak_days     INT DEFAULT 0,
  score           NUMERIC(15,2) DEFAULT 0,
  rank_position   INT,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_college ON public.leaderboard(college_name, score DESC);

-- ============================================================
-- VERIFICATION REQUESTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  college_email   TEXT NOT NULL,
  id_document_url TEXT NOT NULL,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by     UUID REFERENCES public.users(id),
  review_note     TEXT,
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_verification_user_id ON public.verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_status ON public.verification_requests(status);

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  ))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.player_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.leaderboard (user_id, username)
  VALUES (NEW.id, COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  ))
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comic_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boss_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Users: self access only
CREATE POLICY "users_self_access" ON public.users
  FOR ALL USING (auth.uid() = id);

-- Profiles: public read, self write
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "profiles_self_write" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Player stats: public read, self write
CREATE POLICY "stats_public_read" ON public.player_stats
  FOR SELECT USING (true);
CREATE POLICY "stats_self_write" ON public.player_stats
  FOR ALL USING (auth.uid() = user_id);

-- Lessons: public read (published), service role write
CREATE POLICY "lessons_public_read" ON public.lessons
  FOR SELECT USING (is_published = true);
CREATE POLICY "lessons_service_write" ON public.lessons
  FOR INSERT WITH CHECK (true);
CREATE POLICY "lessons_service_update" ON public.lessons
  FOR UPDATE USING (true);

-- Comic panels: public read
CREATE POLICY "panels_public_read" ON public.comic_panels
  FOR SELECT USING (true);
CREATE POLICY "panels_service_write" ON public.comic_panels
  FOR INSERT WITH CHECK (true);

-- Questions: public read
CREATE POLICY "questions_public_read" ON public.questions
  FOR SELECT USING (true);
CREATE POLICY "questions_service_write" ON public.questions
  FOR INSERT WITH CHECK (true);

-- Boss battles: self only
CREATE POLICY "battles_self_access" ON public.boss_battles
  FOR ALL USING (auth.uid() = user_id);

-- Battle logs: self via battle
CREATE POLICY "battle_logs_self" ON public.battle_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.boss_battles WHERE id = battle_id AND user_id = auth.uid())
  );

-- XP logs: self only
CREATE POLICY "xp_logs_self" ON public.xp_logs
  FOR ALL USING (auth.uid() = user_id);

-- Leaderboard: public read, self write
CREATE POLICY "leaderboard_public_read" ON public.leaderboard
  FOR SELECT USING (true);
CREATE POLICY "leaderboard_self_write" ON public.leaderboard
  FOR ALL USING (auth.uid() = user_id);

-- Verification: self read, admin all
CREATE POLICY "verification_self_read" ON public.verification_requests
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "verification_self_insert" ON public.verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "verification_admin_all" ON public.verification_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- STORAGE BUCKETS (run separately if needed)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('comic-panels', 'comic-panels', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('verification-docs', 'verification-docs', false) ON CONFLICT DO NOTHING;
