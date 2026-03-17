# 📋 PRD — Scent Statement Finder (MVP)

## Scent Statement Finder

|  |  |
| --- | --- |
| **Status** | Final |
| **Version** | v1.0 |
| **Last Updated** | March 2026 |
| **Author** | Ruby |

---

## 1. Overview

**Scent Statement Finder** is a personalized perfume recommendation mobile-first web app for a perfume boutique. Users complete a short quiz that captures their scent preferences and lifestyle signals. An AI layer interprets the results and surfaces the most relevant perfumes from the shop's catalog, presented with editorial language and a minimal, modern aesthetic.

---

## 2. Problem Statement

Customers browsing perfume online lack the sensory context of an in-store experience. 

Without guidance, they rely on generic marketing copy or overwhelming product grids. The result: low conversion, high return rates, and missed discovery of niche or complex scents that would actually suit them.

**Scent Statement Finder** replicates the feel of a knowledgeable soulmate who knows how to capture the essence of your charisma and elevate it into a bottle — understanding, confident, personalized, and a little bit surprising.

---

## 3. Goals

### 3.1 Product Goals

- Deliver relevant, personalized perfume recommendations via a quiz-based flow
- Present results with editorial language that captivates user on emotional & aspirational level
- Support up to ~100 concurrent users at MVP launch

### 3.2 Non-Goals (MVP)

- Instagram image scan / aesthetic vibe detection → deferred to v2
- Different quiz set for gift buyers → deferred to v2
- Analytics tracking (to save user profile, track CVS, etc) → deferred to v2
- Account creation or saved preferences
- Direct e-commerce checkout integration, only link to external e-com page from the result.

---

## 4. Target Users

| Segment | Description |
| --- | --- |
| Pragmatic buyer | Shoppers who know exactly the type of perfume they want, based on favorite scent, use cases & budget |
| Curious discoverers | Shoppers who want guidance but don't know where to start |
| Fragrance enthusiasts | Know what they like but want to find new options aligned to their taste |

---

## 5. User Flow

1. User lands on **Home page**
2. User taps **Start Quiz**
3. User answers **quiz questions**
4. System processes answers and derives **user preference signals**
5. System determines **user scent archetype**
6. System calculates **perfume matches**
7. System selects **three recommendations**
8. User sees **Result Page 1 — Archetype Reveal**
9. User taps **See my scent statement**
10. User sees **Result Page 2 — Perfume Recommendations**
11. User can:
    - view perfume details
    - click **Shop** to visit retailer site
    - restart quiz

---

## 6. Quiz List

Each question covers a **distinct signal dimension** to prevent signal collision. Identity questions use **single-select** to preserve signal weight integrity.

| # | Question | Input Type | Signal Dimension | UX guide | Option Example |
| --- | --- | --- | --- | --- | --- |
| 1 | What kind of scent profile are you drawn to? | Single-select | Hard filter (gender_pref) | Radio button | Feminine / Masculine / Unisex |
| 2 | When are you gonna wear this fragrance most? | Single-select | Usage context | Radio button | In the office |
| 3 | What mood do you want your scent to project? | Single-select | Emotional tone with a blend of aesthetics for identity | Cards with image & 3-4 words | Complicated, seductive yet intellectual |
| 4 | Which kinds of scent do you gravitate toward? | Single-select  | Descriptor preference — maps directly to scent descriptors, not signals | Cards with image & 3-4 words | Moodboard images (e.g. Fresh & airy / Warm & cozy / Dark & mysterious) |
| 5 | Are there notes you actively dislike or want to avoid? | Multi-select | Hard filter (`dislike_note`) | Cards with image & 1 key word | Fresh / Clean / Sensual / Fruity / Floral |
| 6 | How would you describe your perfect weekend me-time? | Single-select | Vibe & mood for identity | Radio buttons | Do personal project in a cozy cafe with a cup of bạc xỉu |
| 7 | Who is your style icon? | Hybrid (predefined list + free text) | Cultural/aesthetic reference | Cards with image & 1 key word + 1 free text box | Jennie / Rosie / Kendall Jenner / Timothee Chalamet / Dakota Johnson |
| 8 | What is your MBTI | Single-select | Personality signal for identity | Radio buttons | INFJ / ENFJ |
| 9 | What is your favorite song of all time or recent jam? | Hybrid: genre picker + optional free text | Identity signal via music taste | Radio buttons + free text box | Genre: Pop / R&B / Indie / Jazz / K-pop... OR free-text song/artist → AI maps to genre |
| 10 | How does your staple closet look like | Single-select | Identity signal | Cards with image & 1 key word | Cottage Core / Streetwear, or hiphop / Modern Parisian Chic / Y2K and trendy / Simple Scandinavian and functional office-look / Old-money inspired, European, elegant with focus on silhouette & material / Clean & relaxed, a bit sporty / Colorful or unexpected / Academia |
| 11 | What is your rising sign? | Single-select | Identity signal (atmospheric / vibe layer) | Radio buttons | Aries / Taurus / Gemini... |
| 12 | What is your budget for 50-70ml? | Single-select | Hard filter (price range) — strict for Best Match & Wildcard; max +30% for Ideal Match | Radio buttons | 4 ranges: <2M, 2M-3.5, 3.5M-5M, >5M |

## User Flow Diagram

```
┌─────────────────────────────────┐
│           HOME PAGE             │
│   headline · CTA button         │
└──────────────┬──────────────────┘
               │  tap Start Quiz
               ▼
┌─────────────────────────────────┐
│        QUIZ QUESTIONS           │
│  progress · question · next     │
└──────────────┬──────────────────┘
               │  review answers
               ▼
┌─────────────────────────────────┐
│        QUIZ ANSWER REVIEW       │
│   list of all chosen choices    │
└──────────────┬──────────────────┘
               │  submit answers
               ▼
┌─────────────────────────────────┐
│       LOADING  (transition)     │
│  "Finding your scent match..."  │
└──────────────┬──────────────────┘
               │
               ▼
╔═════════════════════════════════╗
║        SYSTEM  PROCESSING       ║
║  1. derive scent signals        ║
║  2. determine archetype         ║
║  3. calculate top 3 matches     ║
╚══════════════╤══════════════════╝
               │
               ▼
┌─────────────────────────────────┐
│  RESULT PAGE 1 — ARCHETYPE      │
│  archetype name · description   │
│  scent vibe explanation         │
│  [ See my scent matches ]  CTA  │
└──────────────┬──────────────────┘
               │  tap CTA
               ▼
┌─────────────────────────────────┐
│  RESULT PAGE 2 — RECOMMENDATIONS│
│  Best Match · Ideal · Wildcard  │
│  image · name · explanation     │
│  [ View perfume ]  [ Shop ]     │
└───┬────────────┬──────────┬─────┘
    │            │          │
    ▼            ▼          ▼
┌────────┐  ┌─────────┐  ┌──────────────┐
│PERFUME │  │RETAILER │  │ RESTART QUIZ │
│DETAIL  │  │SITE     │  │ ↩ Home Page  │
│(opt.)  │  │(ext.)   │  └──────────────┘
└───┬────┘  └─────────┘
    │
    ▼
┌─────────┐
│RETAILER │
│SITE     │
│(ext.)   │
└─────────┘
```

> **Legend** — `┌─┐` Page / Screen · `╔═╗` System Process · `(opt.)` Optional / out of critical path · `(ext.)` External site
> 

---

---

---

## 8. Pages

### Home

Entry point for the experience.

Elements:

- headline
- short description
- start quiz button

---

### Quiz Page

Tailored template for these 2 types of quiz questions: radio button and card.

Elements:

- progress indicator
- question text
- answer options
- next button

---

### Review Page

Summarize all chosen choices in one-page

Elements:

- 2-Column Image Grid of chosen choices
- back button
- next button

---

### Loading Page

Short transition while results are generated.

Elements:

- loading animation
- message (e.g. "Finding your scent match...")

---

### Result Page 1 — Archetype

Persuasion layer introducing the user's scent personality.

Elements:

- archetype name
- short description generated by AI, based-on signal cluster
- explanation of scent vibe
- CTA button to view recommendations

---

### Result Page 2 — Recommendations

Displays **three recommended perfumes**.

Recommendation roles:

- **Best Match** — closest match to user's scent identity

Copy: "Your scent, but better"

- **Ideal Match** — aspirational scent aligned with archetype

Copy: “Your Statement Scent”

- **Wildcard** — unexpected but compatible scent for exploration

Copy: “Your scent, but with a Twist”

Each card includes:

- perfume image
- perfume name
- brand & price
- short explanation generated by AI
- button: View perfume
- button: Shop

---

### Perfume Detail (Optional)

Basic information page for a perfume.

Elements:

- bottle image
- brand
- fragrance family
- notes
- description
- explanation of match
- store link

---

## 9. Data Model Overview

### Perfume Dataset

Each perfume contains basic information used for matching and display.

Example fields:

- perfume_id
- name
- brand
- image_url
- store_url
- price_range
- fragrance_family
- notes (top / middle / base)
- descriptor tags
- vibe tags
- season or occasion tags
- gender
- description

---

### Quiz Data

The quiz collects signals about the user across identity, practical constraints, and exploratory preferences.

Example question types include:

- style icon
- weekend vibe
- use case
- music taste
- budget
- MBTI personality type
- astrology sign
- representative closet piece
- disliked scent type
- gender preference

These answers are used to derive **user scent signals** and guide the recommendation process.

---

## 10. Commerce Integration

Each perfume recommendation includes a **Shop link** that redirects users to an external retailer or brand website.

The app does not process payments.

---

## 11. Out of Scope (MVP)

The following features are not included in the initial version:

**Account system**

- login
- saved results
- user profiles

**Advanced AI features**

- Instagram aesthetic scan
- image analysis
- machine learning personalization

**Analytics**

- analytics dashboard
- experimentation framework

**Content features**

- editorial perfume reviews
- community discussions
- articles or guides

---

## 12. MVP Success Criteria

The MVP is successful if:

- users complete the quiz in under 60 seconds
- the system produces three coherent perfume matches
- users engage with results pages
- users click shop links to retailer sites