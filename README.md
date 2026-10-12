# FarmerOS

**FarmerOS** is an open, modular, responsive mobile-first **Farm Operating System** Progressive Web App (PWA) purpose-built for Indian farmers, specifically smallholders operating on entry-level smartphones and spotty connectivity.

---

## Tech Stack (Step 1 Foundation)
- **Frontend**: Next.js 16+ (App Router) + TypeScript + Tailwind CSS v4
- **UI & Components**: shadcn/ui primitives + Lucide Icons
- **State & Data Fetching**: TanStack Query (React Query v5)
- **Forms & Validation**: React Hook Form + Zod
- **Localization**: `next-intl` (English, Marathi, Hindi with route-based localization `/[locale]/...`)
- **Backend**: Supabase (PostgreSQL with PostGIS, Auth, Storage, Row Level Security, Edge Functions)
- **Analytics Foundation**: Centralized `AnalyticsService` logging product events

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+ / v22+
- **npm**: v9+ / v10+ / v12+

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```bash
cp .env.example .env.local
```
Ensure `.env.local` contains:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Installation
Install project dependencies:
```bash
npm install
```

### 4. Running Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. It will automatically redirect to the default locale (`/en`). You can switch between English (`/en`), Marathi (`/mr`), and Hindi (`/hi`) using the language switcher.

### 5. Production Build
To validate type safety and compile the production bundle:
```bash
npm run build
npm start
```

---

## Supabase Database Setup
Before deploying data tables in later steps, run the foundation extension migration in your Supabase SQL Editor:
- Execute [`supabase/migrations/0001_enable_extensions.sql`](supabase/migrations/0001_enable_extensions.sql) to enable `postgis` and `pgcrypto` and create the timestamp update function.

---

## Documentation
- [`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md) — Product vision, 5 daily farmer questions, and non-negotiable rules
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — System architecture, outbox sync pattern, and security model
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — Color tokens, typography, card elevation, and UI components
- [`docs/FEATURE_ROADMAP.md`](docs/FEATURE_ROADMAP.md) — Complete 10-stage engineering roadmap
- [`docs/PROGRESS.md`](docs/PROGRESS.md) — Implementation progress checklist
