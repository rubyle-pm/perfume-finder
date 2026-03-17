# UI design-token

## Typos Systems

**Heading Font Pairing:**

- **Primary (Main Headlines):** GT America Bold or Sohne Bold — clean, geometric sans-serif with precise digital rendering and strong hierarchy
- **Accent (Subheadings & Emphasis):** Canela Medium or Domaine Display Regular — refined serif with elegant curves, used strategically for sophistication. Keep minimal to avoid clutter.

**Body Text:**

- **Primary:** SF Pro Text or Inter Regular (16–18px) — optimized for screen legibility with a calm, neutral presence
- **Secondary/Small Print:** Same family at 14px with increased letter-spacing (0.02–0.03em) for clarity

**Hierarchy Example:**

- **H1:** GT America Bold (or Sohne Bold), 48–64px, with one elegant serif accent word inline
- **H2:** Canela Medium or Domaine Display Regular, 32–40px
- **H3:** GT America Medium, 24–28px
- **Body:** SF Pro Text Regular, 16–18px
- **Button/UI Labels:** Inter Medium or SF Pro Medium, all caps with tight tracking (+0.05–0.08em)

**Digital-Core Refinements:**

- **Line-height:** 1.2–1.4 for headings, 1.5–1.6 for body
- **Letter-spacing:** +0.05–0.08em on all-caps UI elements
- **Weight contrast:** High contrast between heading weights and body text for clear hierarchy
- **Color:** Monochrome or cool neutral palette with restrained accent color for interactive states
- **Rendering:** Smooth anti-aliasing for premium, native-feeling sharpness

This balances **New York editorial elegance** (serif + sans contrast, refined proportions) with **iOS-level precision** — clean, minimal, and digitally polished.

![image.png](UI%20design-token/70c0025a-e873-4491-bc68-d37547df3d65.png)

![image.png](UI%20design-token/image.png)

![image.png](UI%20design-token/image%201.png)

![image.png](UI%20design-token/image%202.png)

![image.png](UI%20design-token/image%203.png)

## Mobile-First Guidelines

> All layouts must be designed **mobile-first**. Start with the mobile layout, then progressively enhance for tablet and desktop. The default UI must work perfectly on small screens.
> 

**Layout**

Use single column layout on mobile. Content follows vertical scroll order: Hero → Primary action → Content blocks → Cards / results. No sidebars or multi-column layouts on mobile.

**Responsive breakpoints (Tailwind)**

| Breakpoint | Prefix | Columns |
| --- | --- | --- |
| Mobile | *(base)* | 1 |
| Tablet | `md:` | 2 |
| Desktop | `lg:` | 3 |

**Touch targets**

- Minimum button height: **44px**
- Minimum spacing between tappable elements: **8–12px**
- Primary action buttons: **full-width on mobile**, large rounded shape

**Quiz / multi-step flow**

Use a **sticky bottom CTA button** on the quiz — question content + answer options scroll freely above, Continue button stays fixed at bottom. This is the primary usability pattern for one-handed mobile interaction.

**Spacing**

8px baseline grid. Common vertical spacing: 16px / 24px / 32px. Layouts should feel breathable, not dense.

**Typography scale (mobile)**

| Role | Class |
| --- | --- |
| Heading | `text-2xl` |
| Section title | `text-xl` |
| Body | `text-base` |
| Caption | `text-sm` |

**Images**

Perfume images: square aspect ratio, large on mobile, centered within card. Avoid small thumbnails. Use lazy loading.

**Performance**

Prefer optimized images, lazy loading, and lightweight components. Avoid heavy animations on mobile.

> **UX goal:** A user should be able to complete the quiz, view recommendations, and explore perfumes using one hand and simple scrolling.
> 

---

## Web layout & Elements

The web should feel like **iOS core components translated to desktop**: clean, minimal, and “digital-core” polished. The overall impression is **lightweight and precise**, with generous whitespace, tight typography, and a calm, premium interface that lets content and imagery breathe. *"iOS core components translated to desktop. Neutral palette, cool tones, Inter font. Card surfaces with soft shadows. No heavy borders. Micro-interactions on hover. Premium editorial feel, not decorative."*

- **Minimalist layout, modular grid:** Clear sections built from cards and panels, consistent spacing, and strong alignment.
- **iOS-inspired UI elements:** Rounded rectangles or pill buttons, segmented controls, subtle dividers, and clean form inputs.
- **Soft, elevated surfaces:** Card-like layers with gentle shadows or blur, avoiding heavy borders.
- **Neutral palette + high-contrast accents:** Mostly monochrome or cool neutrals, with restrained accent color for focus states, highlights, and key actions.
- **Micro-interactions over decoration:** Smooth hover and focus states, subtle transitions, and minimal animations that reinforce clarity and responsiveness.
- **Premium, modern tech mood:** Crisp, editorial, and slightly futuristic without looking noisy or overly experimental

![image.png](UI%20design-token/9aeadf9b-001d-4b5b-a800-dee6b92a73a1.png)

![image.png](UI%20design-token/ebc898dd-50f5-4c5e-8ab5-a6bd73ecbca3.png)

![image.png](UI%20design-token/image%204.png)

![Multi-choice with images & 3-4-words description](UI%20design-token/image%205.png)

Multi-choice with images & 3-4-words description

![Quiz choices review ](UI%20design-token/c96a694c-ef2e-420f-9d12-094097039277.png)

Quiz choices review 

![image.png](UI%20design-token/9660c8ec-65e9-4d87-b001-cd107a6a3cb9.png)

![image.png](UI%20design-token/image%206.png)

![Radio-button quiz](UI%20design-token/image%207.png)

Radio-button quiz

![image.png](UI%20design-token/image%208.png)

## Result pages

### Result 1: The Archetype

![image.png](UI%20design-token/image%209.png)

![image.png](UI%20design-token/image%2010.png)

![image.png](UI%20design-token/image%2011.png)

![image.png](UI%20design-token/image%2012.png)

### Sub-page: Final review all answers

![image.png](UI%20design-token/image%2013.png)

### Result 2: Perfume Recommendations

One-page that show all 3 recommended perfumes in an exploratory narrative & layout. No 3 cards then hover or click to see details. Show a summary with 3 cards at the end of the page.

- **Imagery for perfume scent profile:**

Byredo inspo - Botanical, mysterious, bold image of organic perfume ingredients. Minimal words, short keywords of 1-2 texts to describe.

![Screenshot 2026-03-05 at 00.12.48.png](UI%20design-token/Screenshot_2026-03-05_at_00.12.48.png)

![Screenshot 2026-03-05 at 00.14.52.png](UI%20design-token/Screenshot_2026-03-05_at_00.14.52.png)