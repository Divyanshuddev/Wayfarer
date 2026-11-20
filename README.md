# Ψ SHADOW – YOUR DIGITAL MEMORY
> *"Your life, remembered."*

**Shadow** is a complete, production-ready, full-stack personal memory assistant. Built as a high-performance monorepo with a **Python 3.12+ FastAPI backend** (managed via `uv`), a **Next.js 15 App Router frontend** (TypeScript & Tailwind CSS), and a **Supabase PostgreSQL + pgvector** database.

---

## ✦ Core Principles & Anti-Hallucination Guarantee

- **Strict Grounding Rule (`ZERO FABRICATION`):** Shadow never invents, guesses, or extrapolates facts. If requested information is not present in the user's saved memories or attachments, Shadow explicitly states:  
  > *"I could not find any saved memories or details in your archive regarding this question."*
- **Every statement cites its source:** Bracket citations formatted as `[Memory #id: "Title"]` connect answers directly to the originating record.
- **Multimodal AI Ingestion:** Text notes, voice recording with live waveform visualization & Whisper transcription, photo/document upload with Vision OCR, and URL scraping.
- **Auto-Linking Knowledge Graph:** Automatic discovery of entity connections (shared people, thematic tags, intellectual references) with confidence scores and reasoning.
- **Retro-Minimal Black & Purple Theme:** Obsidian dark background (`#08080c`), glowing electric violet accents, phosphor scanlines, and `JetBrains Mono` terminal typography.
- **Global Keyboard Shortcut:** Press `⌘K` or `Ctrl+K` anywhere to open the Quick Add modal.

---

## 📁 Monorepo Structure

```text
.
├── backend/                               # Python 3.12+ FastAPI Service (managed via uv)
│   ├── pyproject.toml
│   ├── .env.example
│   └── app/
│       ├── main.py                        # FastAPI app, CORS middleware, lifespan, router registration
│       ├── core/
│       │   ├── config.py                  # Pydantic Settings (SUPABASE_URL, keys, OPENAI_API_KEY)
│       │   ├── security.py                # Supabase JWKS JWT verification + user-scoped Supabase client
│       │   ├── openai_client.py           # AsyncOpenAI client singleton
│       │   └── database.py                # In-memory + persistent repository seeded with memories
│       ├── schemas/
│       │   ├── memory.py                  # Pydantic v2 models for all 8 memory categories & AI extraction
│       │   ├── search.py                  # Hybrid search & match explanation schemas
│       │   ├── chat.py                    # Grounded RAG chat & citation schemas
│       │   └── collections_reminders.py   # Collections, reminders, and user settings schemas
│       ├── services/
│       │   ├── attachment_parser.py       # Whisper transcription, Vision OCR, PyMuPDF/pypdf text, URL scraper
│       │   ├── ai_organizer.py            # Structured extraction (title, summary, entities, tags, category)
│       │   ├── embedding_service.py       # text-embedding-3-small + auto-linking similar memories
│       │   └── rag_assistant.py           # Hybrid vector retrieval + grounded SSE streaming chat
│       └── api/v1/
│           ├── router.py
│           ├── dashboard.py               # Aggregated dashboard stats, daily highlight, recent items
│           ├── memories.py                # CRUD + multipart file upload + AI processing pipeline
│           ├── search.py                  # Natural language semantic search endpoint
│           ├── chat.py                    # Streaming SSE Shadow AI Assistant + chat history
│           ├── collections.py             # Collections CRUD & memory assignment
│           ├── reminders.py               # Birthdays, anniversaries & memory-linked reminders
│           └── settings.py                # Profile, AI toggles, theme & full JSON archive export
├── frontend/                              # Next.js 15 App Router (TypeScript)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login/page.tsx
│   │   │   ├── (auth)/signup/page.tsx
│   │   │   └── (dashboard)/
│   │   │       ├── layout.tsx             # Desktop sidebar + mobile bottom nav + global Quick Add (⌘K)
│   │   │       ├── page.tsx               # 1. Home Dashboard
│   │   │       ├── memories/page.tsx      # 2. Memories Archive & Filters
│   │   │       ├── memories/[id]/page.tsx # Memory Detail, Media Viewer, Entities & Connections
│   │   │       ├── search/page.tsx        # 3. AI Semantic Search & Shadow AI Chat Assistant
│   │   │       ├── timeline/page.tsx      # 4. Automatic Timeline (List, Calendar, Photo views)
│   │   │       ├── collections/page.tsx   # 5. Collections Grid
│   │   │       ├── collections/[id]/page.tsx
│   │   │       ├── reminders/page.tsx     # 6. Upcoming Birthdays & Reminders
│   │   │       └── settings/page.tsx      # 7. Settings, Privacy & Data Export
│   │   ├── components/
│   │   │   ├── layout/                    # Sidebar, MobileBottomNav, RetroGridBackground, TopHeader
│   │   │   ├── memories/                  # QuickAddModal, DragDropUploader, VoiceRecorder, MemoryCard
│   │   │   ├── search/                    # SemanticSearchBar, SearchResultCard, ShadowChatPanel, CitationBadge
│   │   │   ├── timeline/                  # TimelineListView, TimelineCalendarView, TimelinePhotoView
│   │   │   └── dashboard/                 # RediscoverCard, MemoryStatsChart, UpcomingRemindersWidget
│   │   ├── lib/
│   │   │   ├── api-client.ts              # Typed fetch wrapper attaching Supabase Bearer JWT to FastAPI
│   │   │   ├── supabase/                  # Browser & SSR Supabase Auth clients
│   │   │   ├── storage/store.ts           # Client store fallback for offline resilience
│   │   │   └── validations/               # Zod schemas for forms
│   │   └── types/index.ts                 # Shared TypeScript interfaces
└── supabase/
    └── migrations/001_init_shadow.sql     # Complete PostgreSQL + pgvector + RLS + Storage setup
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.12+ with `uv` installed (`curl -LsSf https://astral.sh/uv/install.sh | sh`)
- Node.js 20+ or 22+ with `npm`

### 2. Start the FastAPI Backend
```bash
cd backend
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API docs available at: `http://localhost:8000/docs`

### 3. Start the Next.js Frontend
```bash
cd frontend
npm install
npm run dev
# or for production:
npm run build && npm run start
```
Frontend accessible at: `http://localhost:3000`

---

## 🧪 Verified API Endpoints

- `GET /health`: Returns service status and grounding engine state.
- `GET /api/v1/dashboard`: Aggregated stats, emotional valence breakdown, and daily memory highlight.
- `GET /api/v1/memories`: Filter memories by category, sentiment, people, tags, and favorites.
- `POST /api/v1/memories/upload`: Multipart upload with Whisper transcription, Vision OCR, and PDF parsing.
- `POST /api/v1/memories/process`: AI distillation and 1536-dimensional vector embedding.
- `POST /api/v1/search`: Hybrid lexical and cosine semantic search with match explanations.
- `POST /api/v1/chat`: Grounded RAG query endpoint with strict anti-hallucination citations.
- `POST /api/v1/chat/stream`: Real-time Server-Sent Events (SSE) streaming assistant response.
- `GET /api/v1/settings/export`: Portable full archive JSON export.

---

## 🗄️ Database & Vector Migration (`supabase/migrations/001_init_shadow.sql`)

Includes:
- Extensions: `uuid-ossp`, `vector`
- Tables: `profiles`, `memories`, `memory_attachments`, `collections`, `memory_links`, `reminders`
- HNSW Index: `CREATE INDEX idx_memories_embedding ON memories USING hnsw (embedding vector_cosine_ops);`
- Stored Procedure: `match_memories` for cosine similarity ranking
- Strict Row-Level Security (RLS) policies on every table and storage bucket (`memory-attachments`, `avatars`)
