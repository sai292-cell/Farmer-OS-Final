# FarmerOS — Project Brief

## 1. Executive Summary & Vision

**FarmerOS** is an open, modular, offline-first **Farm Operating System** purpose-built as a responsive, mobile-first Progressive Web App (PWA) for Indian farmers, specifically smallholders operating on entry-level smartphones and spotty 2G/3G/4G connectivity.

Rather than serving as another generic agriculture chatbot, FarmerOS acts as a complete digital farm recordkeeper, operational log, financial ledger, and decision-support engine. It connects real physical land measurements to daily operations, hyper-local agronomic conditions, real-time market realizations, and trusted, explainable intelligence—accessible directly in the mobile browser or installed as a standalone PWA.

---

## 2. The 5 Daily Farmer Questions

FarmerOS is designed around empowering a farmer to answer five core questions each day:

1. **What is happening in my farm?**  
   *Current state of land, plots, crops, growth stages, soil moisture, ongoing tasks, and recent field events.*
2. **What should I do today?**  
   *Prioritized, actionable daily crop tasks, timely watering schedules, weather-safe spray windows, and labor assignments.*
3. **What risk may happen next?**  
   *Early warnings for extreme weather (rain/frost/hail), localized pest or disease outbreaks, water deficits, and market volatility.*
4. **Where can I buy, sell, or get services at a better value?**  
   *Verified net market realization (factoring in haulage and market deductions), price comparisons on inputs, certified machinery rentals, and available labor.*
5. **How can I increase income while reducing unnecessary cost and risk?**  
   *Crop-wise profit/loss ledgers, input use efficiency, cost-benefit simulations, and verified government scheme opportunities.*

---

## 3. Real-World Differentiators

FarmerOS distinguishes itself from superficial farm utilities through twelve architectural and domain-specific differentiators:

1. **Farm-First, Not Chatbot-First**  
   Built around a structured, digital farm and plot database. The AI is a contextual layer on top of verified farm records—not an isolated text prompt.
2. **Hierarchical Topology (Farmer → Farm → Plot → Crop → Season)**  
   Reflects true agricultural complexity. One farmer can own or lease multiple farms, subdivided into distinct plots with different crops, soil types, and sowing dates.
3. **Evidence Vault & Append-Only History**  
   Boundaries, measurements, field photos, and spray actions are saved immutably with timestamps, GPS coordinates, and historical versioning. Old data is never silently overwritten.
4. **Decision Support, Not False Certainty**  
   All advisories, forecasts, and screenings display confidence levels, state the underlying assumptions, cite trusted sources, and suggest expert review when uncertainty exists.
5. **Net Realization, Not Just Headline Price**  
   Market comparisons calculate true take-home earnings by subtracting transport distance costs, mandi loading fees, commissions, and moisture grade adjustments.
6. **Hyper-Local & Context-Aware**  
   Advisories factor in the farmer's specific plot coordinates, recorded growth stage, actual irrigation history, soil profile, and regional weather.
7. **Human + AI Symbiosis**  
   AI handles rapid initial screening and data aggregation, while high-risk, ambiguous, or critical agronomic decisions seamlessly escalate to human agricultural extension officers and verified domain experts.
8. **Offline-First PWA Architecture**  
   All daily logging (tasks, irrigation, sprays, expenses, boundaries) functions seamlessly without an active internet connection using a Service Worker and local IndexedDB database, queueing mutations for background synchronization to Supabase.
9. **Privacy & Data Sovereignty by Default**  
   Land boundaries, financial ledgers, and crop yields are private to the farmer. Row-Level Security (RLS) enforces strict tenant isolation. Sharing with advisors, banks, or insurers is explicit, granular, and revocable.
10. **Explainable Predictions**  
    Predictions (yield forecasts, water demand, disease risks) state *why* they were generated and identify the factors that could change the outcome.
11. **Continuous Outcome Tracking**  
    FarmerOS compares recommendations against actual field outcomes (e.g., recorded yields, harvest prices, actual pest control success), establishing a true feedback loop.
12. **Farmer Economics First**  
    Every capability directly addresses farmer viability: saving expenditure, minimizing crop loss, conserving water/energy, boosting market realization, or securing legitimate entitlements.

---

## 4. Non-Negotiable Product Rules

Every contributor, agent, and service in FarmerOS must strictly uphold these inviolable constraints:

- **Rule 1: Never invent market prices.**  
  Market prices must come from verified APMC/e-NAM feeds with visible date/time stamps and sources. If unavailable, mark explicitly as *Unavailable* or *Historical*.
- **Rule 2: Never invent government scheme eligibility.**  
  Scheme criteria, subsidies, and deadlines must be sourced from official gazettes and departmental portals.
- **Rule 3: AI image screening is never a laboratory-confirmed diagnosis.**  
  Visual scanning of crops or pests is an indicative screening tool. It must always display confidence percentages and explicit uncertainty indicators.
- **Rule 4: Never generate unsupported pesticide, fungicide, or herbicide doses.**  
  Chemical recipes, dosage per acre, mixing ratios, and harvest waiting periods (PHI) must never be hallucinated by an LLM. Instructions must match official Central Insecticide Board & Registration Committee (CIBRC) labels or verified university packages of practice.
- **Rule 5: Never guarantee yield, profit, disease outcome, or price.**  
  Farming is subject to biological and climatic variability; guarantees are strictly prohibited.
- **Rule 6: Never deploy fake "live" data in production.**  
  All mock or simulated data must be explicitly flagged during development and prohibited from production. Missing telemetry must be labeled *Estimated*, *Historical*, or *Unavailable*.
- **Rule 7: Boundary and GPS mapping is a digital recordkeeping tool, not a legal survey.**  
  In-app boundaries must state clearly that they serve as farmer management records and evidence documentation, not legal cadastral titles or government-certified surveys.
- **Rule 8: Irrigation advice must never use static "water every X days" rules.**  
  Watering recommendations must state the dynamic factors evaluated: growth stage, recent rainfall, forecast evapotranspiration, soil type, and method.
- **Rule 9: Show timestamp and source on every time-sensitive data point.**  
  Weather observations, market rates, satellite passes, and sensor readings must clearly show *when* they were retrieved and *from where*.
- **Rule 10: Support human expert escalation for high-risk decisions.**  
  When AI confidence is low or crop damage risk is severe, direct the farmer to verified human experts or local Krishi Vigyan Kendras (KVK).
- **Rule 11: Design strictly for low-end smartphones and low-literacy users.**  
  Maintain a minimal JavaScript bundle size (<150KB initial JS), lightweight DOM rendering, high-contrast visual cues, large touch targets (minimum 48dp), Web Speech API audio read-aloud support, and multi-language availability (English, Marathi, Hindi).
- **Rule 12: Maintain append-only measurement and audit records.**  
  Historical boundary polygons, side measurements, evidence photos, and financial adjustments must preserve historical versions.
