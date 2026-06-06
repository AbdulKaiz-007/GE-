-- ============================================================
-- ARC STUDIOS — SUPABASE MIGRATION
-- User Library for Caching Hits
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_library (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id       UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON public.user_library(user_id);

ALTER TABLE public.user_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_library_self_access" ON public.user_library
  FOR ALL USING (auth.uid() = user_id);
