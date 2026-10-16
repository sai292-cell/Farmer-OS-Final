# FarmerOS — Workspace Rules & Behavioral Constraints

## HOW WE WORK
- We build this project STEP BY STEP, FEATURE BY FEATURE. The user will send one prompt per step.
- Do ONLY what the current prompt asks. Do not build ahead and do not scaffold features from later steps.
- At the end of every step:
  1. Summarise what was built.
  2. List the files changed.
  3. Detail exactly how to run and test it.
  4. Specify any manual action required (keys, accounts, dashboard settings).
  5. Update docs/PROGRESS.md, then STOP and wait for the user's next prompt.
- If something is ambiguous, make the most reasonable choice, state it clearly, and continue. Ask the user only if it truly blocks progress.
- Preserve existing behavior and use the project's established patterns.

## TECH STACK & ARCHITECTURE
- Platform: Responsive, mobile-first Progressive Web App (PWA) website.
- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS.
- UI & Charts: shadcn/ui, Recharts.
- State, Forms & Validation: TanStack Query (React Query), React Hook Form + Zod.
- Maps: Leaflet / MapLibre (free, open-source, polygon drawing & GPS walking mode).
- Backend: Supabase (Postgres + PostGIS, Auth, Storage, Row Level Security, Edge Functions).
- Offline-First: PWA (Service Worker) + IndexedDB local storage with a background sync queue.
- Localization: English, Marathi, Hindi from day one (`next-intl`, no hardcoded user strings).
- Analytics: One central analytics service for product events, plus in-app analytics dashboards with charts (Recharts).
- Low-End Phone Optimization: Small initial JS bundles (<150KB gzip), lazy loading, virtualized lists, daylight contrast, large touch targets (minimum 48px).
- Project Structure: Next.js web application lives in the project root; `supabase/` for migrations and Edge Functions; `docs/` for project documentation.

## SOURCE OF TRUTH
- Read `docs/FarmerOS_Advanced_Real_World_Feature_Blueprint.txt` fully. It is the only source for features, rules, data flow, and roadmap. Do not invent features outside it.
- The images in `docs/ui-reference/` are VISUAL REFERENCE ONLY. Take the look and feel (clean agriculture theme, green palette, soft rounded cards, large readable numbers, pastel category tiles, friendly icons, bottom navigation with a central AI button). Do NOT copy their features, screens, data, or labels.

## NON-NEGOTIABLE PRODUCT RULES (from the blueprint)
1. Never invent market prices. Market prices must come from verified sources with date/time and source attribution.
2. Never invent government scheme eligibility or deadlines.
3. AI image screening is never a lab-confirmed diagnosis. Always show confidence scores and explicit uncertainty, and support human expert escalation for high-risk decisions.
4. Never invent pesticide, fungicide, or herbicide doses, mixing ratios, or waiting periods. Recommendations must come from verified product labels or official packages of practice.
5. Never guarantee yield, profit, disease outcome, or market price.
6. No fake "live" data in production. If real data is unavailable, label it Actual, Estimated, Forecast, Historical, Simulated, or Unavailable as appropriate.
7. Boundary and GPS features are a digital measurement and recordkeeping tool. Never claim legal proof of ownership or a legal survey.
8. Irrigation advice must never use fixed "water every X days" rules; always show the dynamic factors evaluated.
9. Show date and time on every time-sensitive data point.
10. Support human expert escalation for high-risk decisions.
11. Keep farmer land and financial data private by default. Enforce Row Level Security (RLS) on all tables; sharing is explicit, granular, and revocable.
12. Every record carries provenance: farmer-entered / AI suggestion / verified / expert-confirmed.
13. Every external data point stores source + fetched time and displays freshness in the UI.
14. Keep physical observations strictly separate from analytical predictions.
15. Audit-log sensitive changes. Log important AI recommendations and corrections.
16. Design for low-end smartphones: compact web footprint, lightweight DOM, large touch targets (minimum 48px), high-contrast daylight readability, multi-language from day one (English, Marathi, Hindi), and icons/audio (Web Speech API) for low literacy.
17. Core chain: Farmer -> Farm -> Plot -> Crop -> Season. Every activity, expense, photo, spray, irrigation, harvest, and sale links to farm + plot + crop + season wherever possible.
18. Boundary and measurement history is APPEND-ONLY. Never overwrite old survey versions without preserving them.
19. Do not hard-code user-facing strings. Use `next-intl` message dictionaries for all UI copy.
20. Never expose secret keys in source code, client bundles, logs, documentation, commits, or chat. Keep environment values in ignored local files (.env.local). Use only NEXT_PUBLIC_ prefixed variables in client-side code. Never use or ask for the Supabase service_role key.

## ANALYTICS RULES
- Every feature must emit analytics events through the central `AnalyticsService` (`lib/analytics/index.ts`).
- Never log search text, coordinates, or personal data in analytics events. Log only event names and safe metadata (e.g., method name, layer type — never the farmer's location or typed query).
- Where data exists, in-app analytics dashboards must use Recharts.

## HONESTY & BOUNDARY RULES
- The boundary map is a digital measurement and record-keeping tool. It does not prove ownership, title, or constitute a legal survey. Show the legal notice on every boundary screen.
- GPS and boundary features must clearly state they are for farm management records and evidence documentation only.
- Boundary and measurement history is append-only: re-measuring creates a new version row; never overwrite or delete historical survey versions.

## KEYS & SECRETS
- Never use or ask for the Supabase `service_role` / `secret` key. Browser clients use only the `anon` key.
- Never put tile API secrets or geocoding API keys in client-side code or NEXT_PUBLIC_ variables.
- Keep all secrets in `.env.local` (gitignored).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
