# Ψ SHADOW – Your Digital Memory
> *"Your life, remembered."*

**Shadow** is a production-ready, full-stack personal memory assistant that captures, organizes, embeds, links, and rediscovers moments and details from everyday life in one private, intelligent, and strictly-grounded archive.

---

## ✦ Key Highlights & Core Principles

- **Zero-Fabrication Grounding Rule:** Shadow never hallucinates facts, dates, people, or events. If no memory exists in your vault regarding a query, Shadow explicitly states: *"I could not find any saved memories or details in your archive regarding this question."*
- **Retro-Minimal Black & Purple Theme:** Custom obsidian palette (`#08080c`), glowing neon violet accents, phosphor scanline ambience, monospace terminal metadata typography (`JetBrains Mono`), and glassmorphism.
- **Multimodal Capture:** Quick notes, interactive audio recording with animated waveform and Whisper transcription, and photo/document upload with Vision OCR.
- **Auto-Linking Knowledge Graph:** When a memory is captured, Shadow discovers thematic overlaps and shared relationships with past memories, creating bidirectional cognitive links with confidence scores and reasoning.
- **Data Sovereignty:** Full JSON export/import of all memories, attachments, links, and collections.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15+ App Router, Server Actions, Route Handlers, Strict TypeScript |
| **Styling & Motion** | Tailwind CSS, Custom Retro-Minimal Design Tokens, Framer Motion, Lucide Icons |
| **Database & Vector Engine** | Supabase (PostgreSQL 15+ with `pgvector` extension, HNSW cosine index, Row-Level Security, RPC `match_memories`) |
| **Storage Buckets** | `memory-attachments` (private), `avatars` (public) with folder-level RLS |
| **AI Systems** | OpenAI API (`gpt-4o-mini`, `text-embedding-3-small`, `whisper-1`) + Heuristic NLP Fallback |
| **Data Visualization** | Recharts (Archive density, category breakdown, emotional spectrum) |
| **Validation** | Zod v3 |

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx             # Vault sign-in + instant archivist demo access
│   │   └── signup/page.tsx            # New vault initialization
│   ├── (dashboard)/
│   │   ├── layout.tsx                 # Responsive sidebar + mobile bottom nav + quick add modal
│   │   ├── page.tsx                   # 1. Home Dashboard (Rediscover card, stats, recent stream)
│   │   ├── memories/page.tsx          # 2. All Memories Archive & Filters (Grid, search, tags)
│   │   ├── memories/[id]/page.tsx     # Memory Detail (Markdown, audio, OCR, entity web)
│   │   ├── search/page.tsx            # 3. AI Semantic Search + Shadow AI Chat Assistant
│   │   ├── timeline/page.tsx          # 4. Automatic Memory Timeline (List, Calendar, Photo views)
│   │   ├── collections/page.tsx       # 5. Collections Grid & Smart Auto-rule Collections
│   │   ├── collections/[id]/page.tsx  # Single Collection View
│   │   ├── reminders/page.tsx         # 6. Upcoming Birthdays & Memory Reminders (Recurrence rules)
│   │   └── settings/page.tsx          # 7. Profile, Theme, AI Preferences & Data Export/Import
│   └── api/
│       ├── memories/process/route.ts  # AI pipeline: transcription, vision OCR, extraction, 1536-dim embeddings
│       ├── search/route.ts            # Hybrid vector + metadata search with match reasoning
│       └── chat/route.ts              # Grounded RAG assistant with memory citations
├── components/
│   ├── layout/                        # Sidebar, MobileBottomNav, TopHeader, RetroGridBackground
│   ├── memories/                      # QuickAddModal, DragDropUploader, VoiceRecorder, MemoryCard, MemoryDetailView
│   ├── search/                        # SemanticSearchBar, SearchResultCard, ShadowChatPanel, CitationBadge
│   ├── timeline/                      # TimelineListView, TimelineCalendarView, TimelinePhotoView
│   └── dashboard/                     # RediscoverCard, MemoryStatsChart, UpcomingRemindersWidget
├── lib/
│   ├── supabase/                      # client.ts, server.ts, middleware.ts, mock-data.ts
│   ├── storage/                       # store.ts (Unified reactive store with local persistence & vector math)
│   ├── ai/                            # openai.ts, extractor.ts, embeddings.ts, rag.ts
│   └── validations/                   # memory.ts, collection.ts, reminder.ts
└── types/
    └── database.ts                    # Complete TypeScript interfaces matching Supabase schema
supabase/
└── schema.sql                         # Production PostgreSQL + pgvector migration & RLS policies
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+ or 22+
- npm, pnpm, or yarn

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase and OpenAI API keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
OPENAI_API_KEY=sk-proj-your-openai-api-key
```
*(Note: Shadow includes built-in high-fidelity local fallbacks for both Supabase and OpenAI so you can test all features offline and immediately out of the box).*

### 3. Deploy Supabase Database Schema
Run the SQL migration script located at `supabase/schema.sql` in your Supabase SQL Editor:
- Enables `uuid-ossp` and `vector` extensions
- Creates `profiles`, `memories`, `memory_attachments`, `collections`, `memory_links`, and `reminders` tables
- Creates HNSW cosine index `idx_memories_embedding`
- Configures stored procedure `match_memories`
- Enables Row-Level Security (RLS) on all tables and storage buckets (`memory-attachments`, `avatars`)

### 4. Run Development Server
```bash
npm run dev
# or for production
npm run build && npm run start
```
Open [http://localhost:3000](http://localhost:3000) or [http://localhost:3001](http://localhost:3001) in your browser.

---

## 🔒 Security & Privacy
- **Row-Level Security:** Enforced at database level (`auth.uid() = user_id`).
- **Encrypted Storage:** File paths isolated by user ID partition.
- **Server-Side AI:** OpenAI API keys are kept strictly on the server; client never touches secret credentials.
