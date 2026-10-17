# FarmerOS — Implementation Progress (Web PWA Architecture)

This document tracks implementation status across the 10 build stages. Progress is updated at the conclusion of each prompt.

---

## Overall Summary
- **Current Active Stage**: Step 4A (Farms, Plots & Boundary Measurement) — Completed (13 Oct 2026)
- **Overall Completion**: Stage 1 Foundation in Progress
- **13 Oct 2026**: Continued development in VS Code with GitHub Copilot.

| Stage | Name | Status |
|---|---|---|
| **Stage 1** | **Foundation (Digital Farm & Land Registry)** | 🟡 In Progress (Step 1 Setup Completed) |
| **Stage 2** | **Crop Management & Daily Operations** | ⏳ Not Started |
| **Stage 3** | **Money & Farm Economics** | ⏳ Not Started |
| **Stage 4** | **Real-World Data Integration** | ⏳ Not Started |
| **Stage 5** | **AI Intelligence & Trusted Copilot** | ⏳ Not Started |
| **Stage 6** | **Farmer Ecosystem & Marketplaces** | ⏳ Not Started |
| **Stage 7** | **Precision Agriculture & IoT** | ⏳ Not Started |
| **Stage 8** | **AI Farm Digital Twin** | ⏳ Not Started |
| **Stage 9** | **Village & Regional Intelligence** | ⏳ Not Started |
| **Stage 10** | **Advanced Farm Operating System** | ⏳ Not Started |

---

## Detailed Stage Checklists

### Stage 1: Foundation (Digital Farm & Land Registry) — Status: 🟡 In Progress
- [x] 1.1 Next.js 16+ (App Router) + TypeScript scaffolding with Tailwind CSS v4 & shadcn/ui (Completed: 12 Oct 2026)
- [x] 1.2 `next-intl` localization setup (English, Marathi, Hindi with JSON dictionary catalogs & language switcher) (Completed: 12 Oct 2026)
- [x] 1.3 Supabase backend client configuration (`lib/supabase/client.ts`, `server.ts`), environment credentials, and PostGIS/pgcrypto migration file `0001_enable_extensions.sql` (Completed: 12 Oct 2026)
- [x] 1.4 Row Level Security (RLS) policies for the private farmer profiles table (Step 3; migration must be run manually)
- [ ] 1.5 IndexedDB local database schema & repositories (`idb` / Dexie.js)
- [ ] 1.6 Service Worker PWA setup (manifest, offline shell caching, sync queue)
- [ ] 1.7 Client-side outbox sync queue manager & online/offline connectivity listener
- [x] 1.8 Farmer authentication (email/password via Supabase Auth) & smart farmer profile (Step 3; phone OTP remains for a later provider decision)
- [ ] 1.9 Multi-farm & multi-plot hierarchy management with persistent active farm state
- [ ] 1.10 Interactive Leaflet/MapLibre map container with OpenStreetMap tiles
- [ ] 1.11 GPS walking survey mode (Geolocation API) & manual polygon drawing
- [ ] 1.12 Geodesic area calculation (Turf.js: acres, hectares, gunthas, sq meters)
- [ ] 1.13 Boundary side lengths & straightness/curvature measurement
- [ ] 1.14 Append-only boundary versioning (`boundary_versions` table)
- [ ] 1.15 Boundary evidence vault (geo-tagged N/S/E/W photos, videos, notes)
- [ ] 1.16 Boundary survey comparison engine (version diffs)
- [ ] 1.17 Dispute documentation mode & PDF evidence pack export
- [ ] 1.18 Farm document vault (7/12 extracts, khata records)
- [ ] 1.19 Revocable farm sharing with granular roles (viewer, advisor, worker)
- [ ] 1.20 Master farm history timeline
- [x] 1.21 Centralized `AnalyticsService` for product & error event logging (`lib/analytics/index.ts`) (Completed: 12 Oct 2026)
- [x] Step 2 Design system, app shell, translated dashboard placeholders, PWA manifest/service worker, and navigation analytics (Completed: 13 Oct 2026)
- [x] Step 3 Login, email/password authentication, private farmer profile, language preference, and profile RLS migration (Completed: 13 Oct 2026; run `supabase/migrations/0002_profiles.sql` manually in the Supabase SQL Editor)
- [x] Step 4A Farms, plots, PostGIS boundary measurement, GPS walking mode, and append-only survey history (Completed: 13 Oct 2026; run `supabase/migrations/0003_farms_plots_surveys.sql` manually in the Supabase SQL Editor)
- [x] Step 4A polish: primary contrast, map start/location, large-area confirmation, redirect, satellite layers, and place search (Completed: 13 Oct 2026; no database changes)
- [x] Step 4A bug fix: render geolocation map control inside `MapContainer` for editable and read-only boundary maps (Completed: 13 Oct 2026; no database changes)
- [x] Step 4A map search/GPS repair: village search focuses the first result, street/satellite selection is always available, and GPS requests fresh high-accuracy readings (Completed: 13 Oct 2026; no database changes)
- [x] Step 4A map navigation repair: village results use validated animated recentering with bounded zoom, and satellite mode includes place labels (Completed: 14 Oct 2026; no database changes)
- [x] Step 4A small-place search repair: village/hamlet results use exact coordinates, settlement-aware zoom, and a persistent searched-place label (Completed: 14 Oct 2026; no database changes)
- [x] Step 4A-Places: own GeoNames village search, stable map controls, import staging, and translated fallback/error handling (Completed: 16 Oct 2026; run `supabase/migrations/0004_places_search.sql` manually)
- [x] Fresh start: Esri maps (Step A) — Isolated Esri ArcGIS Satellite & Place Search test route at `/[locale]/dev/map-test` (returns 404 in production). Leaflet setup with one active `TileLayer` at a time, `World_Imagery` (maxNativeZoom: 19) and `World_Street_Map` (maxNativeZoom: 18) with official Esri attribution, non-stored India place search (`findAddressCandidates`), draggable pin with clearly separated Latitude/Longitude and coordinate conversion helper (`lib/geo/esri-coords.ts`), browser geolocation with accuracy display, and service worker dev unregister + production caching exclusions for ArcGIS/Supabase. No database or existing page changes. (Completed: 17 Oct 2026; no database changes)
- [x] Step A2: Village / Place Name Labels on Satellite Map (`/[locale]/dev/map-test`) — Official Esri hybrid labels overlay using the ArcGIS Location Platform Static Basemap Tiles Service (`arcgis/imagery/labels`) with `World_Boundaries_and_Places` fallback, rendered above satellite imagery on a custom Leaflet pane (zIndex 350, `pointer-events: none` to never block clicks) with maxNativeZoom: 19. "Labels: ON/OFF" switch with localStorage persistence. "Name this place" custom label input with high-contrast daylight halo/outline for unmapped hamlets. Search result marker with persistent label. Live dev debug monitor for zoom level, map center lat/lon, and active layer attribution. No database changes. (Completed: 17 Oct 2026; no database changes)
- [x] Step B: Design Reset (Modern, Farmer-Friendly Look) — Visual system and shell design reset aligned with `docs/DESIGN_SYSTEM.md` and `docs/ui-reference/`. Upgraded `app/globals.css` with agricultural palette (#2E7D32 primary, #1B5E20 forest dark, #4CAF50 leaf green, #FAF8F5 warm cream background, pastel accents, WCAG AA/AAA sunlight contrast, `--shadow-card` soft elevation). Redesigned `AppHeader` (compact, sticky, notifications, language switcher), mobile-first `BottomNav` with elevated central AI button and active state pill, desktop `DashboardSidebar`, and compact `LanguageSwitcher`. Created `PageContainer` and `ActionTile` with pastel icons, short words, and coming-soon indicators. Redesigned `EmptyState`, `StatCard`, `SectionHeader`, `DataStatusBadge`, and `ProvenanceBadge` with icon support. Updated `FarmAreaChart`, `Card`, and `Button` (enforcing minimum 48px touch targets, active press feedback). Refreshed dashboard views with full next-intl English/Marathi/Hindi support. No database or API changes. (Completed: 17 Oct 2026; no database changes)
- [x] Step C: Master Feature Sidebar, Mobile Drawer, Profile Navigation & Government Registry Integration — Implemented comprehensive desktop sidebar and mobile sliding drawer (`DashboardSidebar` + `useSidebar`) organizing all developed routes and future planned capabilities across the 10 blueprint stages (Core, Crop & Field Operations, Finance & Mandi, Government & Schemes, AI & Precision, Ecosystem, and GIS Tools). Added profile icon button with completion indicator to `AppHeader`. Expanded `ProfileForm` to capture all official Indian government registry and comprehensive farming information (AgriStack Farmer ID, Aadhaar last-4, Gender, DOB, Social Category, Banking & Aadhaar-seeded DBT, PM-KISAN ID, KCC Limit, PMFBY Policy, Ration Card, Soil Health Card, Total Land Acres, Farming Method, Irrigation Source, Machinery, Livestock, Storage). Expanded `FarmForm` with official revenue land record fields (Hissa / Sub-division number, 8-A Khata number, Soil classification, Gunthas, Irrigation source, and Pump/Power type). Created migration `0005_government_profile_farm_fields.sql` with graceful fallback handling. Complete next-intl localization in English, Marathi, and Hindi. (Completed: 17 Oct 2026; run `supabase/migrations/0005_government_profile_farm_fields.sql` manually in Supabase SQL editor)
- [x] Step C-Fix: Boundary Map Zoom Reset & Deep Zoom Capacity (Levels 19–22) — 
  1) Fixed the issue where adding boundary points caused the map to zoom out and reset position: decoupled `searchPlace` from `points` state using `pointsRef` and query tracking (`lastSearchTermRef`), cleared active `focus` upon clicking `onAdd` or `onMove`, and added signature deduplication in `MapController` so the map never flies back to the village centroid.
  2) Fixed the grey "Map data not yet available" tiles when zooming into rural farmland: verified across rural India (Maharashtra villages: Niphad, Yeola, Khedle Zunge, Rahata, Kopargaon, Jalna, Vidarbha, etc.) that Esri satellite imagery natively exists up to zoom 18, and requests for zoom 19 return the 2,521-byte "Map data not yet available" error graphic. Set `maxNativeZoom={18}` on both `boundary-map.tsx` and `esri-map-view.tsx` with `maxZoom={22}`. Leaflet now requests verified high-res zoom 18 tiles from the network and smoothly scales them up through zoom levels 19, 20, 21, and 22 via CSS without ever requesting missing tiles or showing placeholder errors.
  3) Enlarged boundary map canvas height to `h-[460px] sm:h-[520px]`. (Completed: 17 Oct 2026; no database changes)




**Step 4A manual database note:** `0003_farms_plots_surveys.sql` must be run
manually once in the Supabase SQL Editor after migrations 0001 and 0002.

### Stage 2: Crop Management & Daily Operations — Status: ⏳ Not Started
- [ ] 2.1 Crop master catalog & variety/hybrid registry
- [ ] 2.2 Plot-level crop planning & sowing records
- [ ] 2.3 Crop growth stage tracker (establishment to maturity)
- [ ] 2.4 Crop agronomic calendar & automated task generator
- [ ] 2.5 Daily crop diary & 60-second quick event logger
- [ ] 2.6 Visual crop photo journal with plot & date filtering
- [ ] 2.7 Crop rotation & intercropping planners
- [ ] 2.8 Harvest readiness indicator
- [ ] 2.9 Water source registry (borewells, open wells, canals, ponds)
- [ ] 2.10 Crop-specific irrigation schedule & watering logs
- [ ] 2.11 Irrigation calendar & overdue watering alerts
- [ ] 2.12 Micro-irrigation logs (drip & sprinkler tracking)
- [ ] 2.13 Irrigation cost calculation (electricity, fuel, labor)
- [ ] 2.14 Spray & medicine application log (product, target, dose, method)
- [ ] 2.15 Spray calendar & recurring treatment schedules
- [ ] 2.16 Product & chemical inventory manager (purchase, usage, stock, expiry)
- [ ] 2.17 Spray cost analysis per acre and season
- [ ] 2.18 Safe-advisory guardrails & official label direction viewer
- [ ] 2.19 Labor task assignment & machinery operation logs
- [ ] 2.20 Farm work reminder engine with Web Speech API audio prompts
- [ ] 2.21 QR / physical plot identification camera scanner

### Stage 3: Money & Farm Economics — Status: ⏳ Not Started
- [ ] 3.1 Pre-season crop-wise budget creator
- [ ] 3.2 Cultivation expense tracker linked to Farm → Plot → Crop → Season
- [ ] 3.3 Real-time budget vs. actual variance engine
- [ ] 3.4 Category-wise budget alerts & overrun warnings
- [ ] 3.5 Forecast final cultivation cost calculator
- [ ] 3.6 True cost per acre calculation engine
- [ ] 3.7 Sub-categorized labor, machinery, and input expense ledgers
- [ ] 3.8 Harvest lot management & batching
- [ ] 3.9 Quality grading & moisture recording
- [ ] 3.10 Harvest sales & revenue transaction ledger
- [ ] 3.11 Realized crop-wise profit/loss dashboard rendered with Recharts
- [ ] 3.12 Comparative crop & multi-season financial benchmarking
- [ ] 3.13 Cultivation break-even calculator
- [ ] 3.14 What-if financial simulator (price/yield shock testing)
- [ ] 3.15 Operational cash-flow calendar
- [ ] 3.16 Farmer financial health dashboard (Actual vs. Estimated vs. Forecast)
- [ ] 3.17 Farm performance explainable scorecard

### Stage 4: Real-World Data Integration — Status: ⏳ Not Started
- [ ] 4.1 Hyperlocal farm weather dashboard & current conditions
- [ ] 4.2 Precipitation & evapotranspiration forecasts with Recharts curves
- [ ] 4.3 Extreme weather early warning alert system
- [ ] 4.4 Pre-spray weather window advisor
- [ ] 4.5 Harvest weather risk indicators
- [ ] 4.6 Disaster damage impact documentation
- [ ] 4.7 Mandi / APMC daily price dashboard with timestamp & source
- [ ] 4.8 Official Minimum Support Price (MSP) reference catalog
- [ ] 4.9 Nearby mandi distance & transport cost estimator
- [ ] 4.10 Net market realization calculator
- [ ] 4.11 Regional mandi price trend visualizer
- [ ] 4.12 Selling decision assistant
- [ ] 4.13 Soil test profile & laboratory report uploader
- [ ] 4.14 Plain-language soil report interpreter
- [ ] 4.15 Soil health history & nutrient planning
- [ ] 4.16 Input price comparison & local dealer directory
- [ ] 4.17 Government scheme finder & eligibility checker
- [ ] 4.18 Scheme document checklist & official application routing
- [ ] 4.19 Scheme deadline alerts & Kisan Credit finance info
- [ ] 4.20 Data source registry & freshness indicators

### Stage 5: AI Intelligence & Trusted Copilot — Status: ⏳ Not Started
- [ ] 5.1 AI crop disease & pest image screening module via camera upload
- [ ] 5.2 Nutrient deficiency visual screening
- [ ] 5.3 Disease confidence percentage & severity estimation
- [ ] 5.4 Explainable AI diagnostic breakdown
- [ ] 5.5 Verified treatment knowledge cards
- [ ] 5.6 Context-aware personal farm AI assistant
- [ ] 5.7 Multi-language voice assistant (Marathi, Hindi, English via Web Speech API)
- [ ] 5.8 RAG knowledge base grounded in university agricultural packages
- [ ] 5.9 Source citations for all agronomic advice
- [ ] 5.10 Chemical hallucination guardrails & safety refusal engine
- [ ] 5.11 Daily morning farm briefing engine
- [ ] 5.12 Human agronomist escalation workflow
- [ ] 5.13 AI recommendation quality & calibration dashboard

### Stage 6: Farmer Ecosystem & Marketplaces — Status: ⏳ Not Started
- [ ] 6.1 Farmer community feed & crop-specific discussion groups
- [ ] 6.2 Experienced farmer mentorship network & peer Q&A
- [ ] 6.3 Best-practice agricultural library & local success stories
- [ ] 6.4 Verified agriculture expert directory & consultation booking
- [ ] 6.5 Agriculture labor worker profiles & farm job postings
- [ ] 6.6 Proximity-based labor worker search & applications
- [ ] 6.7 Labor availability calendar & two-way review system
- [ ] 6.8 Farm machinery rental & Custom Hiring Centre (CHC) directory
- [ ] 6.9 Tractor & equipment booking engine
- [ ] 6.10 Machine ownership vs. rental cost comparison calculator
- [ ] 6.11 Certified machine operator marketplace
- [ ] 6.12 Farm-to-market transport marketplace & vehicle booking
- [ ] 6.13 Transit route planning & vehicle load optimizer
- [ ] 6.14 Licensed warehouse & cold storage facility discovery
- [ ] 6.15 Post-harvest shrinkage & transit loss tracking

### Stage 7: Precision Agriculture & IoT — Status: ⏳ Not Started
- [ ] 7.1 Open satellite remote sensing pipeline (Sentinel-2 / Landsat)
- [ ] 7.2 Vegetation Index (NDVI / EVI) plot dashboard
- [ ] 7.3 Spatial field anomaly detection
- [ ] 7.4 Drone aerial imagery upload & orthomosaic viewer
- [ ] 7.5 Precision management zones (high/med/low vigor)
- [ ] 7.6 Variable-Rate Application (VRA) zone maps
- [ ] 7.7 Spatial yield mapping
- [ ] 7.8 IoT soil moisture & temperature probe telemetry ingestion
- [ ] 7.9 Borewell water level & on-farm weather station telemetry
- [ ] 7.10 Sensor health, staleness detection, and IoT threshold alerts

### Stage 8: AI Farm Digital Twin — Status: ⏳ Not Started
- [ ] 8.1 Plot-level digital twin virtual state model
- [ ] 8.2 Historical digital twin timeline replay
- [ ] 8.3 Explainable holistic farm health score & crop health score
- [ ] 8.4 Multi-dimensional risk prediction engine
- [ ] 8.5 Epidemiological disease risk forecast
- [ ] 8.6 7-Day crop evapotranspiration water demand forecast
- [ ] 8.7 Scenario-based yield and revenue forecast models
- [ ] 8.8 Interactive farm what-if simulator sandbox
- [ ] 8.9 AI Farm Manager operational prioritization brief

### Stage 9: Village & Regional Intelligence — Status: ⏳ Not Started
- [ ] 9.1 Anonymized village-level crop distribution map
- [ ] 9.2 Privacy-preserving regional pest/disease outbreak detection
- [ ] 9.3 Regional disease alert dispatch network
- [ ] 9.4 District/taluka weather risk & groundwater stress maps
- [ ] 9.5 Regional crop demand & sowing signals
- [ ] 9.6 Community emergency weather & calamity broadcasts
- [ ] 9.7 PMFBY crop insurance hub & notification rules
- [ ] 9.8 Automated digital crop insurance evidence pack generator
- [ ] 9.9 Weather event & field damage synchronized timeline
- [ ] 9.10 Water and input resource efficiency benchmark scorecards
- [ ] 9.11 Multi-season soil organic carbon & health tracker
- [ ] 9.12 Natural farming, sustainable practices & carbon record library

### Stage 10: Advanced Farm Operating System — Status: ⏳ Not Started
- [ ] 10.1 On-demand agricultural drone spraying service network
- [ ] 10.2 Smart tractor ISOBUS / CAN-bus telematics ingestion
- [ ] 10.3 Agricultural robotics & weeding equipment integration interface
- [ ] 10.4 Digital crop survey export matching state registry schemas
- [ ] 10.5 Geospatial multi-layer decision engine
- [ ] 10.6 Hyperlocal dialect & micro-climate edge AI models
- [ ] 10.7 Multimodal reasoning combining speech, images, maps, and ledgers
- [ ] 10.8 Autonomous predictive farm operations with confirmation loops
- [ ] 10.9 Admin console, user verification & KYC workflows
- [ ] 10.10 Marketplace content moderation & fraudulent dealer filters
- [ ] 10.11 Agricultural RAG knowledge base curation portal
- [ ] 10.12 Platform-wide telemetry & farmer outcome analytics dashboard
