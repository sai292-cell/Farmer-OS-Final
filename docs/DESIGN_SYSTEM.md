# FarmerOS — Design System & Visual Specification (Web / Tailwind CSS)

## 1. Design Philosophy & Visual Principles

The visual language of FarmerOS is directly inspired by modern, clean agricultural design paradigms (as captured in the visual reference materials) while addressing the practical realities of Indian smallholder farmers accessing the platform via mobile web:

1. **Clean Agriculture Aesthetics**: Fresh, vibrant green palette balanced with soft mint and warm earthy neutrals, conveying vitality, trust, and professional precision.
2. **Soft Rounded Geometries**: Rounded card containers (`rounded-2xl` to `rounded-3xl`, 16px–24px) and pill-shaped badges (`rounded-full`) that feel approachable, modern, and friendly.
3. **High-Contrast Daylight Readability**: Specially tuned for outdoor sunlight visibility on inexpensive smartphone displays (minimum WCAG AA, targeting AAA for key metrics).
4. **Large, Readable Numbers**: Core quantitative metrics (temperatures, harvest weights, rupee balances, percentages) are presented with prominent, bold numerical typography.
5. **Low-Literacy First**: Heavy reliance on recognizable icons (Lucide icons), color-coded status chips, and dedicated audio read-aloud buttons for all text-heavy advisories.
6. **Mobile-First Bottom Navigation**: A dock-style fixed bottom navigation bar featuring an elevated, prominent central AI action button (for camera screening and voice copilot).

---

## 2. Color Palette & Tailwind CSS Tokens

```
Palette Architecture:
┌──────────────────────┬──────────────────────┬──────────────────────┐
│   Primary Greens     │    Pastel Accents    │   Semantic Status    │
│  Forest: #1B5E20     │  Mint:   #D8EED8     │  Verified: #2E7D32   │
│  Emerald:#2E7D32     │  Peach:  #FFE2D1     │  Warning:  #F57C00   │
│  Light:  #4CAF50     │  Sky:    #DCEBFA     │  Alert:    #D32F2F   │
│  MintBg: #F2F8F2     │  Lavender:#EDE0F5    │  Info:     #0288D1   │
└──────────────────────┴──────────────────────┴──────────────────────┘
```

### 2.1 Primary & Neutral Tokens (Tailwind Configuration)
```typescript
// tailwind.config.ts color tokens
colors: {
  primary: {
    DEFAULT: "#2E7D32", // Vibrant Agricultural Emerald
    dark: "#1B5E20",    // Deep Forest Green
    light: "#4CAF50",   // Fresh Leaf Green
    surface: "#E8F5E9", // Light Emerald Card Tint
  },
  background: "#F4F7F4", // Soft Mint-Grey App Background
  surface: "#FFFFFF",    // Crisp Pure White Cards
  text: {
    primary: "#1A201C",   // High-contrast near-black
    secondary: "#526056", // Muted slate green
    muted: "#78877D",     // Timestamps & metadata
  },
  border: {
    subtle: "#E1E8E1",    // Delicate 1px borders
    active: "#A5D6A7",
  },
  pastel: {
    mint: "#D8EED8",
    peach: "#FFE2D1",
    sky: "#DCEBFA",
    lavender: "#EDE0F5",
    amber: "#FFF3C4",
    rose: "#FFDEE2",
  },
  status: {
    verified: "#2E7D32",
    actual: "#1565C0",
    forecast: "#7B1FA2",
    warning: "#F57C00",
    alert: "#D32F2F",
    unavailable: "#757575",
  }
}
```

---

## 3. Typography Hierarchy

The typography system uses **`Outfit`** (Latin/English) paired with **`Noto Sans Devanagari`** (Marathi & Hindi) loaded via `next/font/google`.

| Style Name | Font Size | Weight | Line Height | Application |
|---|---|---|---|---|
| **Display Hero Metrics** | 34px (`text-3xl` / `text-4xl`) | Bold (700) | 40px | Headline metrics (e.g., `₹1,45,000`, `16,540 kg`, `2.4 ac`). |
| **Display Secondary** | 24px–26px (`text-2xl`) | SemiBold (600) | 32px | Secondary metrics, temperature displays (e.g., `28°C`, `94%`). |
| **Page Title** | 20px–22px (`text-xl`) | Bold (700) | 28px | Mobile screen headers, dialog titles. |
| **Card Header** | 18px (`text-lg`) | SemiBold (600) | 24px | Card titles, section headers. |
| **Subheading** | 15px (`text-base`) | Medium (500) | 20px | Subsection labels, form labels. |
| **Body Standard** | 14px (`text-sm`) | Regular (400) | 20px | Explanations, diary logs, advisory text. |
| **Body Bold** | 14px (`text-sm`) | SemiBold (600) | 20px | Emphasized body text, list item titles. |
| **Caption / Badge** | 12px (`text-xs`) | SemiBold (600) | 16px | Provenance tags, category chips, status pills. |
| **Micro Timestamp** | 10px–11px | Regular (400) | 14px | "Updated 2h ago • Source: APMC Pune". |

---

## 4. Spacing, Shapes & Elevation

### 4.1 Spacing & Grid System
- **Base Grid**: 8px increment (micro-spacing allowed at 4px).
- **Scale**: `gap-1` (4px), `gap-2` (8px), `gap-4` (16px), `gap-6` (24px), `gap-8` (32px).
- **Padding**: Cards use `p-4` (16px) or `p-5` (20px). Screen gutters use `px-4` on mobile.

### 4.2 Touch Target Ergonomics
- **Minimum Target**: `min-h-[48px] min-w-[48px]` for all clickable icons, checkboxes, and chips.
- **Primary Action Buttons**: Height `h-14` (56px) with full-width layout (`w-full rounded-2xl`).
- **Target Audience Consideration**: Designed for farmers with rough hands, field gloves, or outdoor sunlight glare.

### 4.3 Corner Radii & Soft Shadows
- **Cards**: `rounded-2xl` (16px) to `rounded-3xl` (24px).
- **Pills / Badges**: `rounded-full`.
- **Soft Diffused Elevation**:
  ```css
  box-shadow: 0 4px 20px -2px rgba(27, 94, 32, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04);
  ```

---

## 5. Iconography & Charts

- **Icons**: Lucide React (`lucide-react`) rounded outline glyphs:
  - 🌾 `Sprout`, `Wheat` for crops and plots.
  - 💧 `Droplets` for irrigation logs.
  - 🛡️ `ShieldCheck`, `SprayCan` for crop protection and verified provenance.
  - 🚜 `Tractor` for machinery and rentals.
  - 🪙 `IndianRupee` for finances and budgets.
  - ☁️☀️ `CloudSun`, `CloudRain` for weather and spray windows.
  - 🔊 `Volume2` for Web Speech API audio read-aloud buttons.
  - ✨ `Sparkles`, `Camera` for AI scanner and copilot.
- **Charts with Recharts**:
  - Soft green gradients (`defs` LinearGradient from `#2E7D32` to `#E8F5E9`).
  - Rounded bar charts (`radius={[8, 8, 0, 0]}`).
  - High-contrast tooltip cards with readable numbers and explicit labels: `[Actual]`, `[Estimated]`, `[Forecast]`.

---

## 6. Mobile-First Bottom Navigation with Central AI Button

A signature visual element of FarmerOS is the mobile-first bottom navigation dock with an elevated central AI action button:

```
┌────────────────────────────────────────────────────────┐
│   [🏠 Home]    [🌱 Farms]   [✨ AI Scan]   [💰 Money]  [👥 More] │
│                           (Elevated FAB)               │
└────────────────────────────────────────────────────────┘
```
- **Central Button Attributes**:
  - Size: `w-14 h-14` (56px × 56px) circular container.
  - Gradient Fill: `bg-gradient-to-tr from-primary-dark to-primary`.
  - Icon: White camera/sparkle icon (`w-7 h-7 text-white`).
  - Elevated Shadow: `shadow-lg shadow-primary/30 -translate-y-5 border-4 border-background`.
  - Interaction: Single tap opens the AI Camera Scanner & Voice Farm Copilot modal.

---

## 7. Component Inventory (shadcn/ui + Custom Primitives)

1. **`FarmerHeader`**:
   - Sticky top bar with greeting, active farm switcher dropdown, weather chip, and offline sync indicator icon.
2. **`MetricOverviewCard`**:
   - Soft card displaying hero metric, unit, label, provenance badge, and micro Recharts trend sparkline.
3. **`PastelCategoryTile`**:
   - Soft pastel background card featuring a friendly Lucide icon, category title, active count or alert badge.
4. **`ActionTaskCard`**:
   - Daily to-do card with rounded checkbox, task title, plot badge, due time, priority indicator, and tap-to-listen speaker button.
5. **`DataProvenanceBadge`**:
   - Pill badge showing origin: `👨‍🌾 Farmer Entered`, `🤖 AI Suggestion`, `✅ Verified`, or `🔬 Lab Confirmed`.
6. **`DataFreshnessTag`**:
   - Caption tag: `"Updated 45 mins ago • Source: APMC Pune"`.
7. **`AudioReadAloudButton`**:
   - Speaker button invoking Web Speech API Text-to-Speech in the active locale (Marathi, Hindi, English).
8. **`EvidencePhotoCard`**:
   - Responsive thumbnail with embedded GPS coordinates, compass direction tag (North/South/East/West), timestamp overlay, and modal preview.
9. **`LeafletMapContainer`**:
   - Mobile-optimized touch map container supporting polygon drawing, vertex dragging, and GPS location tracking.
