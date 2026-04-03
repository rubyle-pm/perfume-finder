# DESIGN_CONTEXT.md — Scent Statement Finder

Use this file as opening context for every AI prompt (v0, Cursor, Claude).
When doing heavy visual work, also attach 2–3 reference screenshots alongside this file.

---

## Project Summary

"Scent Statement Finder" — a mobile-first perfume recommendation web app for a boutique.
Users complete a 12-question quiz → get a scent archetype → see 3 curated perfume recommendations with editorial AI-generated copy and direct shop links.

**Aesthetic:** New York editorial meets iOS precision. Premium, minimal, slightly poetic. Inspired by Byredo and boutique fragrance culture. Never generic, never decorative for its own sake.

---

## Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript + React 19
- **Deployment:** Vercel
- **Fonts:** Inter (body/UI), Playfair Display (serif accent) — Google Fonts
- **Images:** Placeholder gradients only (no real assets yet)

---

## Color Palette — Light

| Token | Value | Usage |
|-------|-------|-------|
| Page background | `#f8fafc` → `#eef2f7` gradient | Full page |
| Surface / card | `rgba(255,255,255,0.90)` | Cards, panels |
| Surface hover | `#f1f5f9` | Hover state |
| Border default | `#cbd5e1` | Card borders |
| Border active | `#0f172a` | Selected state |
| Text primary | `#0f172a` | Headlines, main body |
| Text secondary | `#334155` | Descriptions, sublabels |
| Text muted | `#64748b` | Captions, question numbers |
| CTA button bg | `#0f172a` | Primary action button |
| CTA button text | `#ffffff` | — |
| Progress bar fill | `linear-gradient(90deg, #0f172a, #334155)` | — |
| Tag/pill bg | `#f1f5f9` | Descriptor tags |
| Tag border | `#e2e8f0` | — |

---

## Typography

| Role | Font | Size | Weight | Notes |
|------|------|------|--------|-------|
| H1 | Inter | 30–40px | 700 | Page titles |
| H2 | Playfair Display | 28–36px | 500 | Archetype name, editorial moments only |
| H3 / card title | Inter | 20px | 600 | Quiz question text, perfume names |
| Body | Inter | 15–16px | 400 | Answer options, descriptions |
| Label / caption | Inter | 12px | 600 | ALL CAPS, `tracking-[0.06em]` |
| Button | Inter | 13–14px | 700 | ALL CAPS, `tracking-[0.06em]` |

- Line height: 1.2–1.35 headings, 1.55–1.65 body
- Render: smooth antialiasing, native-feeling crispness

---

## Spacing & Layout

- Base grid: 8px
- Page padding: `px-4` mobile, `px-6` tablet+
- Max content width: `max-w-[720px]` centered
- Card padding: `p-[14px]` mobile, `p-6` desktop
- Gap between cards: `gap-3`
- Page bottom padding: `pb-28` (clears sticky CTA button)

---

## Component Patterns

### Cards / Surfaces
```
bg: rgba(255,255,255,0.90)
border: 1px solid #cbd5e1
border-radius: 16px (rounded-2xl)
box-shadow: 0 8px 24px rgba(15,23,42,0.06)
```

### Primary CTA Button (sticky bottom)
```
bg: #0f172a
color: #ffffff
border-radius: 9999px (rounded-full)
min-height: 48px
width: 100%
font: Inter 700, ALL CAPS, tracking-[0.06em]
position: fixed, bottom: 0
padding: 12px, max-w-[720px] centered
fade-in gradient above: from transparent → #f8fafc
disabled: opacity 0.5, not-allowed cursor
```

### Quiz Answer Options
```
Normal:   border #cbd5e1, bg #ffffff
Selected: border 1.5px #0f172a, bg #e2e8f0
min-height: 44px (touch target)
border-radius: 12px
padding: 10px 12px
font: Inter 15px
gap between options: 8px
```

### Progress Bar
```
height: 4px
track: #e2e8f0
fill: linear-gradient(90deg, #0f172a, #334155)
border-radius: 999px
position: sticky top-0
transition: width 300ms ease
```

### Descriptor Tags / Pills
```
bg: #f1f5f9
border: 1px solid #e2e8f0
border-radius: 9999px
padding: px-3 py-1
font: Inter 12px medium
color: #475569
```

---

## Image Placeholders

No real images yet. Use gradient boxes at correct aspect ratios so layout doesn't need restructuring when real images arrive.

- **Perfume bottle:** `aspect-[1/1.4]`, `bg-gradient-to-b from-slate-200 to-slate-300`
- **Moodboard / scent card (square):** `aspect-square`, `bg-gradient-to-br from-stone-200 to-zinc-300`
- **Full-width banner:** `aspect-[16/7]`, `bg-gradient-to-r from-slate-200 via-stone-200 to-zinc-200`

Replace with Next.js `<Image>` when assets are ready — layout should not need restructuring.

---

## Mobile-First Rules

- Design for 390px width first (iPhone 14)
- Single column layout, no sidebars
- Sticky bottom CTA on all quiz and result pages
- All touch targets minimum 44px height, minimum 8px apart
- No horizontal scroll ever

---

## Reference UI Descriptions

*(Attach actual screenshots when doing heavy visual work. These descriptions are the baseline.)*

### Quiz — Radio Button Question Card
Single card per question. Small ALL-CAPS label "Question N" in muted color above question text. Question text is large (20px+), semibold, dark. Answer options are full-width rows with radio input + label, separated by 8px gaps. Selected option has a dark border and light gray background. Card has white surface, soft shadow, 16px radius. Feels like an iOS settings panel — clean, touch-friendly, no clutter.

### Quiz — Card with Images (Moodboard Style)
Used for scent_type and mood questions. Options are a 2-column grid of image cards (square or portrait). Each card has an image (placeholder gradient for now) and a 2–4 word label below. Selected state has a dark border ring. Feels editorial, like a magazine mood board.

### Quiz — Progress Bar
Thin 4px bar pinned to top of viewport. Fills left-to-right as questions are answered. Monochrome dark fill on light gray track. No percentage text — purely visual.

### Quiz — Choices Review Page
A 2-column image grid showing all chosen answers. Each cell shows the option image (or gradient placeholder) with the chosen label. Back and Next buttons at bottom. Feels like a photo grid summary — compact, visual.

### Result Page 1 — Archetype Reveal
Hero moment. Large serif font (Playfair Display) for archetype name. Tagline in italic below. 2–3 sentence AI-generated description in body text. Calm, editorial — like the opening spread of a magazine feature. Single centered column, generous whitespace. CTA button at bottom: "See My Scent Matches."

### Result Page 2 — Perfume Recommendations
Three perfumes shown as a vertical scrolling narrative (not a 3-card grid). Each perfume section has: large image area (placeholder gradient), perfume name in large text, brand + price in secondary text, AI-generated 2-sentence reason in italic, descriptor pills in a wrapping row, two buttons (View Perfume / Shop). At the very bottom, a compact 3-card summary grid. Feels like reading a curated editorial feature, not a product grid.

Perfume imagery direction: Botanical, mysterious, bold — organic ingredients closeup, minimal text, 1–2 keyword descriptors overlaid. Inspired by Byredo's visual language.

### General UI Feel
Inspired by iOS core components translated to desktop. Rounded rectangles, clean form inputs, subtle dividers. Soft elevated surfaces with gentle shadows, no heavy borders. Neutral light palette with high-contrast dark accents. Micro-interactions on hover (subtle border brightening, slight background lift). Premium, modern — crisp and editorial without being experimental or noisy.

---

## Key Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `app/page.tsx` | Landing — headline + Start Quiz CTA |
| `/quiz` | `app/quiz/quiz-page.tsx` | 12-question quiz flow |
| `/results` | `app/results/result-page.tsx` | Archetype reveal + 3 perfume recommendations |

---

## Engine Data Shape

API route `/api/recommend` (POST) returns:

```typescript
{
  topPickArchetype: ArchetypeId,         // e.g. "effortless_muse"
  slots: {
    bestFit: RecommendationCandidate,    // label: "YOUR SCENT"
    idealMatch: RecommendationCandidate, // label: "YOUR STATEMENT SCENT"
    wildcard: RecommendationCandidate,   // label: "YOUR SCENT, WITH A TWIST"
  },
  narrative: {
    archetype_description: string,       // 3 sentences max
    best_fit_reason: string,             // 2 sentences max
    ideal_match_reason: string,
    wildcard_reason: string,
    is_template_fallback: boolean,
  }
}
```

Each `RecommendationCandidate`:
```typescript
{
  perfume: {
    name: string,
    brand: string,
    price_vnd: number,
    descriptors: string[],   // display as pills
    top_notes: string[],
    heart_notes: string[],
    base_notes: string[],
  },
  score: number,
}
```

Archetype display names + taglines: `ARCHETYPE_DISPLAY` in `lib/recommendation-engine/archetype-display.ts`

Quiz questions + options: `QUIZ_CONFIG` + `DISPLAY_LABELS` + `QUESTION_DISPLAY` in `lib/recommendation-engine/quiz-config.ts`

---

## Hard Rules for AI Tools

- Do not change any logic, state handlers, or imports in `lib/recommendation-engine/`
- Do not add new npm dependencies without checking `package.json` first
- Do not use white-only flat backgrounds — always use the `#f8fafc → #eef2f7` gradient on the page
- Keep the sticky bottom CTA pattern on quiz and results pages
- Never remove the `scrollToNext` auto-advance behavior on radio selection
- Tailwind only for new work — remove inline style objects and replace with Tailwind classes
