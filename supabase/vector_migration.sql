-- ============================================================
-- ARC STUDIOS — SUPABASE MIGRATION
-- Vector Search for Lesson Caching
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add an "embedding" column to the lessons table
--    Google's text-embedding-004 model outputs 768 dimensions by default
--    Note: If you run this multiple times, it ignores the error if the column already exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='lessons' AND column_name='embedding') THEN
        ALTER TABLE public.lessons ADD COLUMN embedding vector(768);
    END IF;
END $$;

-- 3. Create an index on the embedding column for faster similarity searches
--    We use an IVFFlat index here with cosine distance (vector_cosine_ops)
CREATE INDEX IF NOT EXISTS lessons_embedding_idx ON public.lessons USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 4. Create a function to query lessons based on vector similarity
--    Filters strictly by difficulty, style, and panel_count to ensure the cached comic precisely matches parameters
CREATE OR REPLACE FUNCTION match_lessons_exact(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_difficulty text,
  p_style text,
  p_panel_count int
)
RETURNS TABLE (
  id uuid,
  topic text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.topic,
    1 - (l.embedding <=> query_embedding) AS similarity
  FROM public.lessons l
  WHERE 1 - (l.embedding <=> query_embedding) > match_threshold
    AND l.difficulty = p_difficulty
    AND l.style = p_style
    AND l.panel_count = p_panel_count
  ORDER BY l.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
