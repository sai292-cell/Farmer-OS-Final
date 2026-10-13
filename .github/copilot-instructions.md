# FarmerOS Copilot Instructions

## Project summary

FarmerOS is a responsive, mobile-first Progressive Web App for Indian farmers. It is an offline-first farm operating system for farm records, plots, crop operations, financial records, trusted decision support, and verified external data. The feature source of truth is [`docs/FarmerOS_Advanced_Real_World_Feature_Blueprint.txt`](../docs/FarmerOS_Advanced_Real_World_Feature_Blueprint.txt).

## Tech stack

- Next.js App Router and TypeScript
- Tailwind CSS and shadcn/ui
- TanStack Query, React Hook Form, and Zod
- Supabase PostgreSQL/PostGIS, Auth, Storage, Row Level Security, and Edge Functions
- `next-intl` with English (`en`), Marathi (`mr`), and Hindi (`hi`)
- Leaflet or MapLibre for open-source maps
- IndexedDB with an offline background-sync queue
- Recharts for in-app analytics
- A centralized analytics service for product events

## Folder structure

- `app/` - Next.js App Router pages, layouts, route handlers, and PWA entry points
- `components/` - reusable UI, layout, map, chart, and shared components
- `lib/` - Supabase, IndexedDB, sync, analytics, geospatial, and utility modules
- `hooks/` - reusable client hooks
- `messages/` - `next-intl` dictionaries for `en`, `mr`, and `hi`
- `public/` - static assets and offline/PWA assets
- `supabase/` - database migrations, Edge Functions, and seed data
- `docs/` - project documentation, roadmap, blueprint, and progress tracking
- `.vscode/` - shared VS Code workspace recommendations and settings

## How we work

1. Work step by step, feature by feature.
2. Do only what the current prompt asks.
3. Never build ahead or scaffold later features.
4. Use the blueprint as the only source of truth for product features, rules, data flow, and roadmap.
5. Preserve existing behavior and use the project's established patterns.
6. At the end of every step, provide exactly:
   - What was built.
   - Files changed.
   - Exactly how to run and test it.
   - Manual actions required from the user, including keys, accounts, or dashboard settings.
   - Confirmation that `docs/PROGRESS.md` was updated.
7. After that five-part summary, stop and wait for the next prompt.

Progress documentation belongs in [`docs/PROGRESS.md`](../docs/PROGRESS.md). Every feature must emit analytics events through the central analytics service and, where data exists, provide in-app analytics charts.

## Non-negotiable product rules

1. Never invent market prices. Market prices require a verified source, date/time, and source attribution.
2. Never invent government scheme eligibility, criteria, subsidies, or deadlines.
3. AI image screening is never a lab-confirmed diagnosis. Always show confidence scores and explicit uncertainty, and support human expert escalation for high-risk decisions.
4. Never invent pesticide, fungicide, or herbicide doses, mixing ratios, or waiting periods. Use only verified product labels or official packages of practice.
5. Never guarantee yield, profit, disease outcome, or market price.
6. Never use fake live data in production. If data is unavailable, label it clearly as `Actual`, `Estimated`, `Forecast`, `Historical`, `Simulated`, or `Unavailable` as appropriate.
7. GPS and boundary features are digital measurement and recordkeeping tools, never legal proof of ownership or legal surveys.
8. Irrigation advice must never use fixed “water every X days” rules. Show the dynamic factors evaluated.
9. Show the date/time on every time-sensitive data point.
10. Keep farmer land and financial data private by default. Enforce RLS on all tables; sharing must be explicit, granular, and revocable.
11. Every record carries provenance: farmer-entered, AI suggestion, verified, or expert-confirmed.
12. Every external data point stores and displays its source, fetched time, and freshness.
13. Keep physical observations separate from analytical predictions.
14. Audit-log sensitive changes and important AI recommendations and corrections.
15. Design for low-end smartphones: small initial bundles, lightweight DOM, high-contrast daylight readability, touch targets of at least 48px, and English/Marathi/Hindi support from day one. Use icons and audio where appropriate.
16. Preserve the Farmer → Farm → Plot → Crop → Season chain wherever possible for activities, expenses, photos, sprays, irrigation, harvests, and sales.
17. Boundary and measurement history is append-only. Never overwrite an old survey version without preserving it.
18. Do not hard-code user-facing strings. Use `next-intl` message dictionaries for all UI copy.
19. Never expose secret keys in source code, client bundles, logs, documentation, commits, or chat. Keep environment values in ignored local files and use only public client-safe variables where appropriate.

