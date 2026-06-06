# ARC Studios 🎮⚡

**AI-Powered Gamified Learning Platform**

> Learn through AI-generated comic lessons. Fight boss battles. Level up your knowledge.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.local.example` to `.env.local` and fill in your values:
```bash
cp .env.local.example .env.local
```

Required:
- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Your Supabase service role key (backend only)
- `GEMINI_API_KEY` — Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

> **Note:** Image generation uses [Pollinations.ai](https://pollinations.ai) — completely free, no API key needed!

### 3. Set Up Supabase Database
1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/migration.sql`
3. Go to **Storage** and create these buckets:
   - `comic-panels` (public)
   - `avatars` (public)
   - `verification-docs` (private)

### 4. Run the App
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── (app)/              # Protected app pages
│   │   ├── dashboard/      # XP, stats, quick actions
│   │   ├── lessons/        # AI comic lesson generator + viewer
│   │   ├── battle/         # Boss Fight Arena
│   │   ├── leaderboard/    # Global rankings
│   │   ├── profile/        # User profile + battle history
│   │   └── verify/         # College ID verification
│   ├── api/
│   │   └── lessons/generate/ # AI pipeline API route
│   ├── login/              # Auth pages
│   └── register/
├── components/
│   └── Sidebar.tsx         # Collapsible navigation
├── lib/
│   ├── supabase/           # Browser + server clients
│   ├── types.ts            # TypeScript types
│   └── game-engine.ts      # XP/Level/Boss formulas
└── store/
    └── battle-store.ts     # Zustand battle state
```

## 🧠 AI Pipeline

Topic → **Concept Agent** → **Script Agent** → **Image Prompts** → **Pollinations.ai** → **Question Agent** → Lesson + Boss Fight

## 🎮 Game Formulas

- **XP Gain**: `base_xp × difficulty × streak × combo`
- **Level**: `XP_required = 500 × n^1.8`
- **Boss HP**: `500 × (1 + 0.3 × level) × difficulty_factor`
- **Leaderboard Score**: `XP×0.5 + win_rate×1000×0.3 + streak×50×0.2`

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| State | Zustand (battle), React Query (data) |
| Backend | Next.js API Routes |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| AI Text | Google Gemini 1.5 Flash (free) |
| AI Images | Pollinations.ai (free, no key) |
| Animations | Framer Motion |
