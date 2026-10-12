# FarmerOS — Master Feature Roadmap (Web PWA Architecture)

This roadmap organizes the 230 blueprint master features and the 16 newly added core farmer-problem capabilities into an engineering build sequence for the Next.js PWA web application. Each phase is strictly self-contained and builds upon the preceding foundational layers.

---

## Stage Sequence Overview

```
1. Foundation ──────► 2. Crop Management ──────► 3. Money
        │
        ▼
4. Real-World Data ──► 5. AI Intelligence ──► 6. Ecosystem
        │
        ▼
7. Precision Ag ────► 8. Digital Twin ─────► 9. Regional ────► 10. Advanced OS
```

---

## 1. Stage 1: Foundation (Digital Farm & Land Registry)

*Objective: Establish core identity, multi-farm hierarchy, spatial boundary geometry, immutable versioning, evidence vault, and offline synchronization in the Next.js web application.*

### Features:
- **1.1 Identity & Account Core**:
  - `Smart Farmer Profile` (Features #1, #55): Personal profile, family farming profile, language preference (EN/MR/HI via `next-intl`), service preferences.
  - `Multi-Language Core` (Feature #4): `next-intl` route-based internationalization (`/[locale]/...`).
  - `Multi-Farm Management` (Feature #3): Support for multiple owned, leased, or rented farms with persistent active farm state.
- **1.2 Land & Plot Spatial Topology**:
  - `Digital Farm Profile` (Feature #8): Metadata, address, village, taluka, district.
  - `GPS Farm Centroid` (Feature #9): Geolocation API capture with accuracy filtering.
  - `Multiple Plot Mapping` (Feature #12): Sub-dividing farms into distinct operational plots.
  - `Land-Use Map` (Feature #16): Classification of crop area, fallow land, water bodies, paths.
- **1.3 Digital Boundary & Survey Engine (Core Problem Group #1)**:
  - `Interactive Boundary Mapping` (Feature #10): Leaflet/MapLibre polygon drawing and GPS walking survey mode via HTML5 Geolocation WatchPosition.
  - `Automatic Area Measurement` (Feature #11): Turf.js geodesic calculation in acres, hectares, gunthas, sq meters.
  - `Boundary Side Measurement` (Core #1.C): Precise length calculation for each side (North, South, East, West).
  - `Boundary Straightness / Alignment Record` (Core #1.D): Line curvature analysis based on recorded GPS coordinates.
  - `Boundary Version History` (Core #1.E, Append-Only): Immutable `boundary_versions` table preserving historical surveys.
  - `Boundary Evidence Pack` (Core #1.F, Feature #13): Geo-tagged photos/videos for North/South/East/West boundary markers, witness notes.
  - `Boundary Comparison` (Core #1.G): Visual and numerical comparison between survey revisions.
  - `Dispute Documentation Mode` (Core #1.I, Core #15): Chronological export of boundary geometry and evidence for peaceful neighbor dispute resolution.
- **1.4 Governance, Security & Documents**:
  - `Farm Document Vault` (Feature #14): Encrypted storage for 7/12 extracts, khata certificates, water agreements.
  - `Farm Sharing & Granular Access Control` (Feature #17, #207): Revocable viewer/advisor/worker access via Supabase RLS.
  - `Farm History Timeline` (Feature #15): Master chronological changelog of all farm events.
  - `Audit Log & Personal Data Controls` (Features #206, #208, #210): Security tracking, data export, account deletion.
  - `Offline-First PWA & IndexedDB Sync` (Feature #7): Service Worker caching, IndexedDB local store, and background outbox sync queue.

---

## 2. Stage 2: Crop Management & Daily Operations

*Objective: Track the lifecycle of crops from seed to harvest, logging daily field actions, watering, and crop-protection applications.*

### Features:
- **2.1 Crop Agronomy Lifecycle**:
  - `Crop Planning & Variety Management` (Features #19, #20): Planning plots, seed variety, hybrid selection.
  - `Crop Sowing Record` (Feature #21): Date, seed rate, seed treatment, sowing method.
  - `Crop Growth Stage Tracker` (Feature #22): Establishment, vegetative, flowering, fruit development, maturity.
  - `Crop Calendar & Task Manager` (Features #23, #24, #76): Auto-generated agronomic schedules and daily tasks.
  - `Crop Diary & Event Log` (Features #25, #80, Core #4, #12): Fast field logging in under 60 seconds.
  - `Crop Photo Timeline & Visual Journal` (Features #26, #81, Core #10, #13): Visual photo journal by plot and date.
  - `Crop Rotation & Intercropping Planners` (Features #27, #28): Soil nitrogen balance and companion crop planning.
  - `Harvest Readiness Tracker` (Feature #29): Observation-based maturity tracking.
- **2.2 Water & Irrigation Operations (Core Problem Group #2)**:
  - `Water Source Registry` (Feature #38): Borewells, open wells, farm ponds, canals.
  - `Crop-Specific Irrigation Schedule` (Core #2.A, Feature #39): Plot-level watering frequency and duration.
  - `Irrigation History & Calendar` (Core #2.B, #2.C): Historical timeline of watering events.
  - `Drip & Sprinkler Micro-Irrigation Log` (Feature #40): Pressure, operating hours, emitter spacing.
  - `Irrigation Cost Tracking` (Core #2.G): Electricity bills, pump fuel costs, canal cess.
- **2.3 Crop-Protection & Spray Operations (Core Problem Group #3)**:
  - `Spray & Medicine Record` (Core #3.A, Feature #78): Product, active ingredient, target pest, dosage entered by farmer, method, cost.
  - `Spray Calendar & History` (Core #3.B, #3.C): Recurring spray schedules and plot-level timeline.
  - `Product & Input Inventory` (Core #3.D, #8): Stock tracking, purchase cost, batch usage, expiry alerts.
  - `Spray Cost Analysis` (Core #3.E): Cost per acre and total season chemical expenditure.
  - `Safe-Advisory Guardrails` (Feature #64, Core #3.G): Display of official CIBRC label directions; strict prohibition of AI chemical invention.
- **2.4 Operations & Farm Tasks**:
  - `Labour Task Assignment & Machinery Log` (Features #77, #79): Assigning workers and tractor hours.
  - `Farm Work Reminder Engine` (Core #9): Prioritized alerts (High/Medium/Low) with snooze and Web Speech audio prompts.
  - `QR / Tag-Based Plot Identification` (Feature #82): Instant field log access via camera QR scanning.

---

## 3. Stage 3: Money & Farm Economics

*Objective: Transform FarmerOS into a financial ledger connecting every field operation to cost, revenue, and net profit with Recharts visualizations.*

### Features:
- **3.1 Budgeting & Cost Accounting (Core Problem Group #5)**:
  - `Crop-Wise Budget Creation` (Core #5.A): Pre-season expense projection (seeds, fertilizer, labor, sprays, fuel).
  - `Actual Expense Tracking` (Feature #83, Core #5.B): Ledger entry linked to Farm → Plot → Crop → Season.
  - `Budget vs. Actual Variance Engine` (Core #5.C, #5.D): Category-wise real-time variance (+/- ₹).
  - `Budget Alerts & Forecast Final Cost` (Core #5.E, #5.G): Proactive overrun warnings and projected total cost.
  - `Crop-Wise Cost per Acre Calculation` (Feature #84): True unit economics of cultivation.
  - `Labour, Machinery & Input Cost Tracking` (Features #85, #86, #87): Sub-categorized operational ledgers.
- **3.2 Harvest Lots & Revenue Realization**:
  - `Harvest Lot Management` (Feature #145): Lot/batch creation, date harvested, plot origin, gross yield.
  - `Quality Grading Record` (Feature #146): Moisture level, size grading, foreign matter %.
  - `Revenue Tracking` (Feature #88): Sales transactions, buyer name, payment mode, receipts.
- **3.3 Profitability & Financial Health (Core Problem Group #6, #7, #14)**:
  - `Crop-Wise Profit/Loss Dashboard` (Feature #89, Core #6.A–6.E): Realized P&L per plot and per acre rendered with Recharts.
  - `Crop & Season Comparison` (Core #6.F, #6.G, Feature #93): Comparative profitability across crops and historical years.
  - `Break-Even Calculator` (Feature #90): Minimum yield and selling price required to cover recorded costs.
  - `What-If Financial Simulator` (Feature #91, Core #6.I): Scenario testing (e.g., price drop -15%, yield shock -20%).
  - `Cash-Flow Calendar` (Feature #92): Timeline of expected expenses and receivables.
  - `Farmer Financial Health Dashboard` (Core #7): Unified portfolio view separating *Actual*, *Estimated*, and *Forecast* figures.
  - `Farm Performance Scorecard` (Core #11): Explainable composite score (Budget Control, Resource Efficiency, Profitability).

---

## 4. Stage 4: Real-World Data Integration

*Objective: Connect the farm to external physical realities: weather forecasts, APMC market feeds, soil testing, and government programs.*

### Features:
- **4.1 Hyperlocal Weather Intelligence**:
  - `Hyperlocal Weather Dashboard` (Feature #46): Current conditions at farm GPS coordinates.
  - `Rainfall & Evapotranspiration Forecast` (Feature #47): Hourly and 7-day precipitation probabilities with Recharts curves.
  - `Extreme Weather Alerts` (Feature #48): Thunderstorm, frost, heatwave, gale-force wind alerts.
  - `Spray Window Advisor` (Feature #49, Core #3.F): Weather suitability indicators (wind speed, rain probability) prior to spraying.
  - `Harvest Weather Risk` (Feature #50): Moisture warnings for drying and threshing.
  - `Disaster Impact Record` (Feature #53): Geotagged damage documentation for crop losses.
- **4.2 Market & Price Intelligence**:
  - `Mandi / APMC Price Dashboard` (Feature #94): Daily modal, min, and max rates with timestamp and source.
  - `MSP Information Hub` (Feature #96): Current government Minimum Support Prices by crop.
  - `Nearby Mandi Comparison & Transport Estimator` (Features #97, #98): Distance and freight cost calculation.
  - `Net Realization Calculator` (Feature #99): True return after transport, cess, bag charges, and commissions.
  - `Price Trend Visualization` (Feature #102): Historical price charts across regional markets.
  - `Selling Decision Assistant` (Feature #103): Explainable market options based on storage cost vs. anticipated return.
  - `e-NAM Integration / Linking` (Feature #95): Official links and procedures for national electronic marketing.
- **4.3 Soil Intelligence & Input Discovery**:
  - `Soil Profile & Soil Test Upload` (Features #30, #31): Laboratory parameter recording (pH, EC, OC, N-P-K, micronutrients).
  - `AI Soil Report Explanation` (Feature #32): Plain-language interpretation of soil test parameters.
  - `Soil Health History & Nutrient Planning` (Features #34, #35): Season-over-season comparison using university guidelines.
  - `Input Price Comparison & Local Dealer Directory` (Features #104–108, #110): Certified retail rates and total cost comparisons.
- **4.4 Government & Financial Programs**:
  - `Government Scheme Finder & Eligibility Assistant` (Features #136, #137): Scheme criteria matched to farmer profile.
  - `Required Documents Checklist & Official Portal Routing` (Features #138, #139): Links to official portals (no intermediary scraping).
  - `Scheme Deadline Alerts & Kisan Credit Information` (Features #140, #142): Official timelines and interest subvention details.
- **4.5 Data Provenance & Trust Framework**:
  - `Source Registry & Data Freshness Indicator` (Features #200, #201): Explicit labeling of data age and provider.

---

## 5. Stage 5: AI Intelligence & Trusted Copilot

*Objective: Provide an agronomic AI Copilot with strict guardrails, multi-language Web Speech API audio, confidence scoring, and human expert escalation.*

### Features:
- **5.1 AI Crop Health & Disease Screening**:
  - `Crop Disease & Pest Image Screening` (Features #54, #55): Mobile camera capture and indicative visual symptom identification.
  - `Nutrient-Stress Screening` (Feature #56): Visual deficiency screening (chlorosis, purpling, necrosis).
  - `Disease Confidence & Severity Scoring` (Features #57, #58): Explicit uncertainty display (e.g., "68% match with Early Blight").
  - `Explainable AI Result` (Feature #65): Transparent display of visual cues and missing diagnostic data.
  - `Treatment Knowledge Cards` (Feature #63): Verified cultural, biological, and approved chemical management cards.
- **5.2 Safe AI Farm Copilot**:
  - `Personal Farm AI Assistant` (Feature #66): Contextual awareness of the farmer's plots, crops, and growth stages.
  - `Voice Farm Assistant & Local-Language AI` (Features #68, #69, #5): Voice input/output in Marathi, Hindi, and English using Web Speech API.
  - `RAG Agricultural Knowledge Base` (Feature #70): Retrieval-Augmented Generation anchored in verified ICAR/SAU package of practices.
  - `Source-Cited Advice` (Features #71, #202): Direct citation of trusted agricultural literature.
  - `Safe-Advisory Guardrails` (Features #64, #204): Complete refusal to hallucinate chemical dosages or off-label applications.
  - `Daily Farm Briefing` (Feature #75): Morning briefing summarizing weather, tasks, market trends, and risk alerts.
- **5.3 Human-in-the-Loop Escalation**:
  - `Expert Escalation Workflow` (Features #60, #73, #203): One-tap routing of ambiguous/high-risk cases to human agronomists.
  - `AI Quality & Calibration Dashboard` (Feature #216): Tracking model confidence, feedback, and expert corrections.

---

## 6. Stage 6: Farmer Ecosystem & Marketplaces

*Objective: Connect farmers with verified community knowledge, human experts, agricultural labor, machinery rentals, and transport services.*

### Features:
- **6.1 Community & Expert Network**:
  - `Farmer Social Feed & Crop Communities` (Features #111, #112): Safe field sharing by crop type (Onion, Pomegranate, Cotton).
  - `Experienced Farmer Network & Q&A` (Features #113, #114): Mentorship and peer answers clearly marked as experiential.
  - `Best-Practice Library & Local Success Stories` (Features #115, #116): Regionally verified agronomic techniques.
  - `Agriculture Expert Directory & Consultation` (Features #118–122, #213): Paid/free case submission with photo history sharing.
- **6.2 Agricultural Labor Marketplace**:
  - `Labor Worker Profile & Farm Job Posting` (Features #123, #124): Worker skills, wage expectations, seasonal jobs.
  - `Nearby Worker Discovery & Application` (Features #125, #126): Radius-based discovery and simple job requests.
  - `Labor Availability Calendar & Mutual Ratings` (Features #127, #128): Trust badges and completed job reviews.
- **6.3 Machinery & Equipment Sharing**:
  - `Machinery Rental & Custom Hiring Centre (CHC) Discovery` (Features #130, #131): Local tractor, harvester, boom sprayer access.
  - `Tractor / Equipment Booking` (Feature #132): Booking calendar for machinery.
  - `Machinery Cost Calculator` (Feature #134): Own vs. rent break-even analysis.
  - `Machinery Operator Marketplace` (Feature #135): Finding certified operators for specialized machinery.
- **6.4 Post-Harvest Logistics & Storage**:
  - `Transport Marketplace & Booking` (Features #152, #153): Connecting with local pickup and mini-truck drivers.
  - `Route Planning & Load Optimization` (Features #154, #155): Vehicle capacity matching and transit distance.
  - `Storage & Cold Storage Discovery` (Features #147, #148): Locating licensed warehouses and cold storage units.
  - `Post-Harvest Loss Tracking` (Feature #150): Recording shrinkage and transit loss metrics.

---

## 7. Stage 7: Precision Agriculture & IoT

*Objective: Transition from farm-wide assumptions to plot-level precision using satellite remote sensing, drone scans, and IoT telemetry.*

### Features:
- **7.1 Satellite Remote Sensing**:
  - `Satellite Farm Monitoring` (Feature #157): Integration with Sentinel-2 / Landsat open earth observation feeds.
  - `Vegetation Index Dashboard (NDVI / EVI)` (Feature #158): Temporal vegetation vigor and canopy density tracking.
  - `Field Anomaly Detection` (Feature #159): Identifying sub-plot variation requiring in-person scouting.
- **7.2 Drone & Spatial Zones**:
  - `Drone Image Analysis` (Feature #160): High-resolution multispectral and RGB flight imagery upload and orthomosaics.
  - `Precision Input Management Zones` (Feature #161): Partitioning fields into high/medium/low vigor zones.
  - `Variable-Rate Application (VRA) Planning` (Feature #162): Zone-specific fertilizer and spray recommendations.
  - `Yield Mapping` (Feature #163): Spatial yield capture per plot zone.
- **7.3 IoT & In-Situ Farm Sensors**:
  - `Soil Moisture & Temperature Sensor Integration` (Features #164, #165): Telemetry ingestion from affordable IoT probes.
  - `Water Level & Weather Station Integration` (Features #166, #167): Borewell sensor and farm weather station data.
  - `Sensor Health Monitoring & IoT Alert Engine` (Features #168, #169): Battery health, telemetry staleness, threshold alerts.

---

## 8. Stage 8: AI Farm Digital Twin

*Objective: Create a comprehensive virtual model of the farm that synthesizes all historical and live telemetry to forecast risks and simulate outcomes.*

### Features:
- **8.1 Plot-Level Digital Twin State Model**:
  - `Digital Twin Farm & Plot Representation` (Features #170, #171, Core #16): Complete state model combining land geometry, crop stage, soil chemistry, moisture, weather history, and inputs.
  - `Farm Digital Twin Timeline` (Feature #181): Seasonal timeline slider showing historical virtual state progression.
- **8.2 Holistic Farm Health & Risk Prediction**:
  - `Farm Health Score & Crop Health Score` (Features #172, #173): Explainable composite index (0–100) with drill-down factors.
  - `Risk Prediction Engine` (Feature #174): Multi-factor risk detection across operational, climatic, and biological dimensions.
  - `Disease Risk Forecast` (Feature #179): Epidemiological model evaluating canopy moisture, humidity, and temperature.
  - `Water Demand Forecast` (Feature #178): 7-day crop evapotranspiration water budget projection.
- **8.3 Forecasting & Interactive What-If Simulation**:
  - `Yield & Revenue Forecast` (Features #175, #176, #177): Scenario-based yield and net return projections with explicit uncertainty intervals.
  - `Farm What-If Simulator` (Feature #180): Dynamic sandbox ("What if sowing is delayed 10 days?", "What if urea is reduced by 25%?").
  - `AI Farm Manager` (Feature #182): Daily synthesized operational brief highlighting prioritized interventions.

---

## 9. Stage 9: Village & Regional Intelligence

*Objective: Aggregate privacy-preserving farm data to detect macro disease signals, coordinate water resources, and assist in insurance claims.*

### Features:
- **9.1 Regional & Community Intelligence**:
  - `Village Crop Map` (Feature #183): Anonymized village-level acreage distribution by crop.
  - `Regional Disease Signal & Alert Network` (Features #61, #62, #184): Privacy-preserving cluster detection warning nearby farmers of incoming pests.
  - `Regional Weather & Water Stress Maps` (Features #185, #186): District/taluka drought and groundwater tracking.
  - `Crop Demand Signal & Community Alerts` (Features #187, #188): Aggregated sowing statistics and emergency weather alerts.
- **9.2 Insurance & Risk Resilience**:
  - `Crop Insurance Information Hub` (Features #141, #195): Pradhan Mantri Fasal Bima Yojana (PMFBY) guidelines and notification dates.
  - `Digital Crop Evidence Pack` (Feature #196): Standardized, timestamped PDF export with boundary survey, sowing receipts, and geotagged crop photos.
  - `Weather & Disaster Timeline` (Feature #197): Synchronized timeline of recorded extreme weather and field event logs.
  - `Insurance Data Preparation` (Feature #199): Organizing claim documentation packages for official submission.
- **9.3 Climate-Smart & Sustainable Agriculture**:
  - `Water & Input Efficiency Scores` (Features #189, #190): Metric benchmarking against regional best practices.
  - `Soil Health Improvement Tracker` (Feature #191): Organic carbon and nutrient enhancement over 3–5 year horizons.
  - `Natural Farming & Carbon Library` (Features #192, #193, #194): Verified protocols for ZBNF, mulching, bio-fertilizers, and future carbon tracking.

---

## 10. Stage 10: Advanced Farm Operating System

*Objective: Future-ready platform capabilities connecting agricultural robotics, autonomous equipment, drone spraying networks, and multimodal edge AI.*

### Features:
- **10.1 Autonomous Hardware & Fleet Integration**:
  - `Drone Service Network` (Feature #221): On-demand booking of certified agricultural drone spraying operators.
  - `Smart Tractor & Telematics Integration` (Feature #223): Ingestion of ISOBUS / CAN-bus telemetry from smart machinery.
  - `Farm Robotics & Autonomous Machinery Support` (Features #222, #224): Integration interfaces for automated weeding and harvesting robots.
- **10.2 Next-Generation Geospatial & AI Systems**:
  - `Digital Crop Survey Support` (Feature #225): Data exports matching official state digital agriculture registry schemas.
  - `Geospatial Decision Engine` (Feature #226): Multi-layer GIS overlay engine (slope, soil texture, satellite vigor, micro-climate).
  - `Hyperlocal & Multimodal AI Models` (Features #227, #228): Fine-tuned edge models comprehending speech, dialect, imagery, and tabular logs.
  - `Predictive & Autonomous Farm Operations` (Features #229, #230): Closed-loop operational engine that anticipates maintenance and proactively requests farmer confirmation.
- **10.3 Enterprise & Platform Administration**:
  - `Admin Dashboard & User Verification` (Features #211, #212, #213): Identity vetting for farmers, agronomists, and suppliers.
  - `Content & Marketplace Moderation` (Features #214, #215): Fraud detection, spam filtering, and seed dealer verification.
  - `Agricultural Knowledge Base Management` (Feature #218): Curating and publishing approved university RAG documents.
  - `Platform Alert Management & Global Analytics` (Features #219, #220): System-wide alert dispatch and outcome analytics.
