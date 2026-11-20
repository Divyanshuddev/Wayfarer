-- ==============================================================================
-- SHADOW – YOUR DIGITAL MEMORY
-- COMPLETE PRODUCTION SUPABASE DATABASE SCHEMA (POSTGRESQL + PGVECTOR + RLS)
-- Migration: 001_init_shadow.sql
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT 'Shadow Archivist',
    avatar_url TEXT,
    theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
    ai_auto_organize BOOLEAN NOT NULL DEFAULT true,
    ai_auto_link BOOLEAN NOT NULL DEFAULT true,
    default_privacy TEXT NOT NULL DEFAULT 'private' CHECK (default_privacy IN ('private', 'locked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. MEMORIES TABLE (WITH 1536-DIM VECTOR EMBEDDING)
CREATE TABLE IF NOT EXISTS public.memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    memory_type TEXT NOT NULL DEFAULT 'note' CHECK (
        memory_type IN ('note', 'photo', 'video', 'document', 'voice', 'conversation', 'link', 'event')
    ),
    memory_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    location TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    tags TEXT[] NOT NULL DEFAULT '{}',
    ai_summary TEXT,
    extracted_entities JSONB NOT NULL DEFAULT '{"people":[],"places":[],"dates":[],"topics":[],"details":[]}'::jsonb,
    personal_notes TEXT,
    source_url TEXT,
    privacy_level TEXT NOT NULL DEFAULT 'private' CHECK (privacy_level IN ('private', 'locked')),
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    embedding vector(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. MEMORY ATTACHMENTS TABLE
CREATE TABLE IF NOT EXISTS public.memory_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    extracted_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. MEMORY CONNECTIONS (KNOWLEDGE GRAPH AUTO-LINKS)
CREATE TABLE IF NOT EXISTS public.memory_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    target_memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    connection_reason TEXT,
    similarity_score FLOAT DEFAULT 0.8,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_different_memories CHECK (source_memory_id <> target_memory_id)
);

-- 6. COLLECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'folder',
    accent_shade TEXT NOT NULL DEFAULT '#8B5CF6',
    last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. COLLECTION MEMORIES JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.collection_memories (
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (collection_id, memory_id)
);

-- 8. REMINDERS TABLE
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    memory_id UUID REFERENCES public.memories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    notes TEXT,
    remind_at TIMESTAMPTZ NOT NULL,
    reminder_type TEXT NOT NULL DEFAULT 'custom' CHECK (
        reminder_type IN ('birthday', 'anniversary', 'follow_up', 'event', 'custom')
    ),
    recurrence TEXT NOT NULL DEFAULT 'none' CHECK (
        recurrence IN ('none', 'yearly', 'monthly', 'weekly')
    ),
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. CHAT SESSIONS & CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    referenced_memory_ids UUID[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM SPEED & HNSW VECTOR OPS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON public.memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_date ON public.memories(memory_date DESC);
CREATE INDEX IF NOT EXISTS idx_memories_category ON public.memories(category);
CREATE INDEX IF NOT EXISTS idx_memories_type ON public.memories(memory_type);
CREATE INDEX IF NOT EXISTS idx_memories_pinned ON public.memories(is_pinned);
CREATE INDEX IF NOT EXISTS idx_memories_tags ON public.memories USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_memories_entities ON public.memories USING GIN(extracted_entities);

-- HNSW Vector Index for 1536-dim text-embedding-3-small
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON public.memories 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_attachments_memory ON public.memory_attachments(memory_id);
CREATE INDEX IF NOT EXISTS idx_connections_source ON public.memory_connections(source_memory_id);
CREATE INDEX IF NOT EXISTS idx_connections_target ON public.memory_connections(target_memory_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_due ON public.reminders(user_id, remind_at ASC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id, created_at ASC);

-- ==============================================================================
-- VECTOR SEARCH STORED PROCEDURE (match_memories)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.match_memories (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  description text,
  memory_type text,
  memory_date timestamptz,
  location text,
  category text,
  tags text[],
  ai_summary text,
  extracted_entities jsonb,
  personal_notes text,
  source_url text,
  is_pinned boolean,
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
    m.description,
    m.memory_type,
    m.memory_date,
    m.location,
    m.category,
    m.tags,
    m.ai_summary,
    m.extracted_entities,
    m.personal_notes,
    m.source_url,
    m.is_pinned,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM public.memories m
  WHERE m.user_id = auth.uid()
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
ALTER TABLE public.memory_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles: users read and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Memories: strict isolation
CREATE POLICY "Users can view own memories" ON public.memories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memories" ON public.memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memories" ON public.memories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON public.memories FOR DELETE USING (auth.uid() = user_id);

-- Attachments: strict isolation
CREATE POLICY "Users can view own attachments" ON public.memory_attachments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attachments" ON public.memory_attachments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own attachments" ON public.memory_attachments FOR DELETE USING (auth.uid() = user_id);

-- Memory Connections: strict isolation
CREATE POLICY "Users view own connections" ON public.memory_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own connections" ON public.memory_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own connections" ON public.memory_connections FOR DELETE USING (auth.uid() = user_id);

-- Collections & Junction
CREATE POLICY "Users view own collections" ON public.collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own collections" ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own collections" ON public.collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own collections" ON public.collections FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users manage collection memories" ON public.collection_memories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.collections WHERE collections.id = collection_memories.collection_id AND collections.user_id = auth.uid())
);

-- Reminders
CREATE POLICY "Users view own reminders" ON public.reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reminders" ON public.reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reminders" ON public.reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own reminders" ON public.reminders FOR DELETE USING (auth.uid() = user_id);

-- Chat Sessions & Messages
CREATE POLICY "Users view own chat sessions" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own chat sessions" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own chat sessions" ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users view own chat messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own chat messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
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
