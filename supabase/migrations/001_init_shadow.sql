-- ==============================================================================
-- SHADOW – YOUR DIGITAL MEMORY
-- COMPLETE PRODUCTION SUPABASE DATABASE SCHEMA (POSTGRESQL + PGVECTOR)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE memory_category AS ENUM (
        'thought', 'event', 'conversation', 'media', 'reading', 'work', 'personal', 'location', 'idea'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE memory_sentiment AS ENUM ('positive', 'neutral', 'negative', 'reflective');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE memory_source_type AS ENUM ('quick_note', 'voice', 'image_ocr', 'document', 'chat');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE link_type AS ENUM ('related', 'caused', 'follows', 'references', 'opposite');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE reminder_type AS ENUM ('birthday', 'anniversary', 'follow_up', 'memory_recurrence', 'custom');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT 'Shadow Archivist',
    avatar_url TEXT,
    bio TEXT,
    ai_tone TEXT NOT NULL DEFAULT 'grounded' CHECK (ai_tone IN ('grounded', 'creative', 'analytical')),
    theme_preference TEXT NOT NULL DEFAULT 'dark-purple' CHECK (theme_preference IN ('dark-purple', 'midnight', 'cyberpunk')),
    storage_used_bytes BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. MEMORIES TABLE (WITH 1536-DIM VECTOR EMBEDDING)
CREATE TABLE IF NOT EXISTS public.memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    category memory_category NOT NULL DEFAULT 'thought',
    sentiment memory_sentiment NOT NULL DEFAULT 'neutral',
    memory_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    location_name TEXT,
    location_coordinates JSONB,
    weather TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    people TEXT[] NOT NULL DEFAULT '{}',
    source_type memory_source_type NOT NULL DEFAULT 'quick_note',
    embedding vector(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. MEMORY ATTACHMENTS TABLE
CREATE TABLE IF NOT EXISTS public.memory_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    extracted_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. COLLECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'folder',
    color TEXT NOT NULL DEFAULT '#8b5cf6',
    is_smart BOOLEAN NOT NULL DEFAULT false,
    filter_criteria JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. MEMORY_COLLECTIONS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.memory_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(memory_id, collection_id)
);

-- 8. MEMORY_LINKS TABLE (KNOWLEDGE GRAPH)
CREATE TABLE IF NOT EXISTS public.memory_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    source_memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    target_memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    link_type link_type NOT NULL DEFAULT 'related',
    confidence_score FLOAT NOT NULL DEFAULT 0.8 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    reasoning TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CHECK (source_memory_id <> target_memory_id),
    UNIQUE(source_memory_id, target_memory_id)
);

-- 9. REMINDERS TABLE
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    memory_id UUID REFERENCES public.memories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    reminder_type reminder_type NOT NULL DEFAULT 'custom',
    is_completed BOOLEAN NOT NULL DEFAULT false,
    recurrence_rule TEXT DEFAULT 'none',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY SPEED & VECTOR SIMILARITY
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON public.memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_date ON public.memories(memory_date DESC);
CREATE INDEX IF NOT EXISTS idx_memories_category ON public.memories(category);
CREATE INDEX IF NOT EXISTS idx_memories_favorite ON public.memories(is_favorite);
CREATE INDEX IF NOT EXISTS idx_memories_pinned ON public.memories(is_pinned);
CREATE INDEX IF NOT EXISTS idx_memories_tags ON public.memories USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_memories_people ON public.memories USING GIN(people);
CREATE INDEX IF NOT EXISTS idx_memories_fts ON public.memories USING GIN(to_tsvector('english', title || ' ' || content || ' ' || summary));

-- HNSW Vector Index for 1536-dim text-embedding-3-small
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON public.memories 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_attachments_memory ON public.memory_attachments(memory_id);
CREATE INDEX IF NOT EXISTS idx_links_source ON public.memory_links(source_memory_id);
CREATE INDEX IF NOT EXISTS idx_links_target ON public.memory_links(target_memory_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_due ON public.reminders(user_id, due_date ASC);

-- ==============================================================================
-- HYBRID VECTOR SEARCH STORED PROCEDURE
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.match_memories (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10,
  filter_user_id uuid DEFAULT NULL,
  filter_category text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  content text,
  summary text,
  category memory_category,
  sentiment memory_sentiment,
  memory_date timestamptz,
  is_pinned boolean,
  is_favorite boolean,
  location_name text,
  weather text,
  tags text[],
  people text[],
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.user_id,
    m.title,
    m.content,
    m.summary,
    m.category,
    m.sentiment,
    m.memory_date,
    m.is_pinned,
    m.is_favorite,
    m.location_name,
    m.weather,
    m.tags,
    m.people,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM public.memories m
  WHERE (filter_user_id IS NULL OR m.user_id = filter_user_id)
    AND (filter_category IS NULL OR m.category::text = filter_category)
    AND m.embedding IS NOT NULL
    AND (1 - (m.embedding <=> query_embedding)) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Profiles: users read and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Memories: strict isolation per user
CREATE POLICY "Users can view own memories" ON public.memories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memories" ON public.memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memories" ON public.memories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON public.memories FOR DELETE USING (auth.uid() = user_id);

-- Attachments: strict isolation
CREATE POLICY "Users can view own attachments" ON public.memory_attachments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attachments" ON public.memory_attachments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own attachments" ON public.memory_attachments FOR DELETE USING (auth.uid() = user_id);

-- Collections: strict isolation
CREATE POLICY "Users can view own collections" ON public.collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own collections" ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collections" ON public.collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collections" ON public.collections FOR DELETE USING (auth.uid() = user_id);

-- Memory Collections junction
CREATE POLICY "Users manage junction" ON public.memory_collections FOR ALL USING (
    EXISTS (SELECT 1 FROM public.memories WHERE memories.id = memory_collections.memory_id AND memories.user_id = auth.uid())
);

-- Memory Links: strict isolation
CREATE POLICY "Users view own links" ON public.memory_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own links" ON public.memory_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own links" ON public.memory_links FOR DELETE USING (auth.uid() = user_id);

-- Reminders: strict isolation
CREATE POLICY "Users can view own reminders" ON public.reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reminders" ON public.reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminders" ON public.reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reminders" ON public.reminders FOR DELETE USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Shadow Archivist'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- STORAGE BUCKETS SETUP (memory-attachments & avatars)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('memory-attachments', 'memory-attachments', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: files must be in folder named after user auth.uid()
CREATE POLICY "Users can upload their own memory attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'memory-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can read their own memory attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'memory-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own memory attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'memory-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can manage their avatars"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
