# 🗃️ Data Model

# Dataset Overview

The system uses **four datasets** (adjacency map merged into Descriptor–Signal mapping).

| # | Dataset | Purpose |
| --- | --- | --- |
| 1 | Perfume dataset | Recommendation candidates |
| 2 | Quiz option mapping | Quiz answers → identity signals + filter fields + practical fields |
| 3 | Descriptor–signal mapping | Scent descriptor ↔ identity signals + adjacent descriptors |
| 4 | Archetype dataset | Identity cluster (especially icon_style, rising sign & mbti) → result screen copy |

> **Why no separate adjacency dataset:** The `adjacent[]` field lives directly on each descriptor entry in the Descriptor–Signal mapping. This removes one dataset, one import, and one join operation — with zero impact on recommendation logic. Wildcard scoring reads `adjacent[]` from the same object it already uses.
> 

---

# Controlled Vocabulary

**Controlled vocabulary** = the fixed set of allowed values for signals and descriptors. Every dataset that uses signals or descriptors must reference only values from these lists. No free-text allowed.

> If Cursor generates a signal or descriptor value not in these lists, the engine will silently return score = 0 with no error. Always validate new dataset entries against this vocabulary.
> 

## Signal vocabulary (~25 values)

Signals represent identity, personality, and aesthetic dimensions. Every signal must appear in at least one archetype AND be reachable by at least 2–3 quiz answers. Dead signals (not reachable from any quiz answer) must be removed.

```jsx
romantic       minimal        bold           soft
confident      effortless     nostalgic      playful
grounded       introspective  edgy           sensual
intellectual   free-spirited  elegant        mysterious
warm           cool           vintage        modern
cozy           enigmatic.     menacing.      easy-going
sophisticated. glamorous 
```

> `clean` and `fresh` are **descriptor** values only — they must not appear in the signal vocabulary. Never mix the two vocabularies.
> 

## Descriptor vocabulary (~25 values)

Descriptors represent scent characteristics only. Never mix with signal vocabulary.

```jsx
fresh      clean      floral     powdery    woody
sweet      citrus     green      smoky      musky
aquatic    gourmand   spicy      resin      leather
tobacco    iris       rose       jasmine    vanilla
amber      oud        bergamot   vetiver    sandalwood
```

## Use case vocabulary (5–8 values)

```
office
daily casual
evening
outdoor / sporty
special occasion
travel
home-body 
```

## Gender tag vocabulary

```
feminine
masculine
unisex
```

## Style icon options (quiz question: style_icon)

Predefined list shown in UI. "Someone else" option triggers free-text + AI Layer B.

```jsx
  | Archetype               | Icon                         |
  | ----------------------- | ---------------------------- |
 1| Clean girl              | Hailey Bieber                |
 2| Soft, girl-next-door    | Rosé                         |
 3| Modern feminine         | Zendaya                      |
 4| Effortless chic         | Dakota Johnson / Jane Birkin |
 5| Timeless elegance       | Audrey Hepburn               |
 6| Classic Bombshell       | Monica Bellucci              |
 7| Sporty glam             | Bella Hadid                  |
 8| Boho indie              | Zoë Kravitz                  |
 9| Rebellious, Gen Z       | Billie Eilish                |
10| Coquette                | Elle Fanning                 |
11| Modern masculinity.     | Timothée / Harry Style       |
12| Pretty prince           | Cha Eun Woo                  |
13| Boy-next-door, casual   | Hứa Quang Hán                |
14| Mature, low-key         | Gong Yoo                     |
15| Dark intellectual       | Robert Pattinson             |
16| Old money masculine     | Theo Jame                    |
17| Quiet luxury feminine   | Song Hye Kyo                 |
18| Rugged masculine        | Tom Hardy / Henry Cavill     |
19| Street culture          | A$AP Rocky                   |
20| Old-school menace       | Cillian Murphy               |
21| Candy girl, first love. | Won Young                    |
22| Dark intellectual       | Anya Taylor-Joy              |

```

## Closet aesthetic options (quiz question: closet_aesthetic)

Merged from previous aesthetic + closet_piece questions. Options reflect overall aesthetic identity.

```jsx
Cottage Core         Streetwear / Hip-hop     Modern Parisian Chic
Y2K and trendy       Scandinavian minimal     Old Money / European elegant
Clean & sporty       Experimential.           Dark Academia
Sensual glamour 
```

## Music genre options (quiz question: music)

Genre picker — primary input. Free-text (song/artist name) is optional fallback → AI maps to genre bucket → signals. Same fallback logic as style_icon.

```jsx
Pop                  Indie                R&B / Soul
Jazz                 Classical            K-pop
Hip-hop              Electronic           Folk / Acoustic
Alternative          Latin                Musical Theatre
```

## Scent type options (quiz question: scent_type)

Moodboard images — single-select. Each image is pre-mapped in backend to 1–2 descriptor values. No text labels shown to user.

```jsx
[image: Fresh & airy]      → descriptors: fresh, aquatic
[image: Warm & cozy]       → descriptors: vanilla, amber
[image: Floral & feminine] → descriptors: floral, powdery
[image: Dark & mysterious] → descriptors: smoky, oud
[image: Clean & minimal]   → descriptors: clean, musky
[image: Earthy & natural]  → descriptors: woody, vetiver
```

> Exact image set and descriptor mappings to be finalized during data prep. Each image must map to descriptors in the controlled vocabulary only.
> 

## Dislike note options (quiz question: dislike_note)

Multi-select. Framed as felt scent experiences — no technical note knowledge required. Each option maps to descriptor vocab in the backend.

| Option (hiển thị) | Backend maps to |
| --- | --- |
| Mùi hoa nồng | floral, powdery, rose, jasmine |
| Ngọt như kẹo bánh | sweet, gourmand, vanilla |
| Khói, thuốc lá, cay | smoky, tobacco, leather, spicy |
| Trầm hương, nhựa cây | oud, resin, incense |
| Mùi biển, xà phòng | aquatic, clean, fresh |
| Mùi trái cây | citrus, fruity, bergamot |
| Mùi đất, gỗ ẩm | vetiver, patchouli, woody, earthy |
| Xạ hương | musky, musk |

> Framing principle: each option describes a felt scent experience, not a note name. Users who don't know perfume vocabulary can still make meaningful exclusions.
> 

> Backend matching: if any perfume's top/heart/base notes map to a descriptor in this list, that perfume is excluded from all 3 recommendation slots.
> 

## Weekend vibe options (quiz question: weekend_vibe)

Single-select. Options cover lifestyle and emotional signal dimensions underrepresented by mood and style_icon.

```jsx
Cozy solo project in a cafe          Museum or gallery wandering
Hiking or outdoor adventure          Long brunch with close friends
Home reset: cleaning, organizing     Spontaneous road trip
Book + blanket, full hermit mode     Late night social, out till 2am
```

## Mood options (quiz question: mood)

Single-select. Each option is a blended emotional + aesthetic statement that maps to 2–3 signals.

```jsx
Complicated, seductive yet intellectual
Soft, romantic and a little nostalgic
Bold, confident, unapologetically present
Effortless, cool, like you woke up like this
Playful, warm, and a bit unexpected
Grounded, calm, quiet luxury
Mysterious, edgy, with an artistic edge
```

> Signal mappings for mood options to be defined during data prep. Each option should map to 2–3 non-overlapping signals.
> 

> Archetype names (e.g. "Effortless Muse") are **display labels only** — they do not participate in scoring and have no controlled vocabulary. Only the `signals[]` inside each archetype must use the signal vocabulary above.
> 

---

# Perfume Dataset

All recommendation candidates.

**Schema:**

| Field | Type | Description |
| --- | --- | --- |
| id | string | Unique perfume identifier |
| name | string | Perfume name |
| brand | string | Brand name |
| price | number | Retail price (VND) |
| family_primary | string | Main fragrance family |
| family_secondary | string | Optional secondary family |
| top_notes | string[] | Fragrance pyramid – top |
| heart_notes | string[] | Fragrance pyramid – heart |
| base_notes | string[] | Fragrance pyramid – base |
| descriptors | string[] | Scent descriptors — **controlled vocabulary** |
| use_cases | string[] | Recommended occasions — **controlled vocabulary** |
| style_tags | string[] | Identity tags for aspirational scoring — **signal vocabulary** |
| gender_tags | string[] | Gender orientation — **controlled vocabulary** (`feminine`, `masculine`, `unisex`) |
| popularity_score | number | 0.0–1.0 — retained as metadata for display/sorting, not used in scoring |

> **Price standardization:** All prices are based on **50ml** — the smallest size commonly available across all brands in this dataset. Formula: USD retail × 26,000 VND. Replace with actual shop/distributor price before going live.
> 

> **`style_tags` vs `descriptors`**: `descriptors` = scent characteristics. `style_tags` = identity/aesthetic traits. They use different vocabularies and are never mixed.
> 

> **`gender_tags`**: A perfume can have multiple tags (e.g. `["feminine", "unisex"]`). Used as a **hard filter**, not a scoring weight.
> 

**Example entry:**

```jsx
id: byredo-gypsy-water
name: Gypsy Water
brand: Byredo
price: 180

family_primary: woody

top_notes: bergamot, lemon
heart_notes: incense, pine
base_notes: sandalwood, vanilla

descriptors: woody, fresh, musky
use_cases: daily, outdoor
style_tags: minimal, effortless
gender_tags: unisex
popularity_score: 0.82
```

---

# Quiz Option Mapping

Maps each quiz answer to identity signals or directly to practical user profile fields.

### **12 quiz questions:**

| # | question_id | Question (PRD) | Type | Input | Maps to |
| --- | --- | --- | --- | --- | --- |
| 1 | gender_pref | Gender / scent preference | filter | Single-select | user.gender_pref (direct) |
| 2 | use_case | When are you gonna wear this fragrance most? | practical | Single-select | user.use_case (direct) |
| 3 | mood | What mood do you want your scent to project? | identity | Single-select | signals[] (weight 1.2) |
| 4 | scent_type | Which kinds of scent do you gravitate toward? | descriptor | Single-select (moodboard image) | user.descriptors[] (direct — bypasses signal aggregation) |
| 5 | dislike_note | Are there notes you actively want to avoid? | filter | Multi-select | user.scent_dislikes[] (direct) |
| 6 | weekend_vibe | How would you describe your perfect weekend me-time? | identity | Single-select | signals[] (weight 0.8) |
| 7 | style_icon | Who is your style icon? | identity | Hybrid: predefined list + free text | signals[] (weight 1.2) — free text via AI Layer B |
| 8 | mbti | What is your MBTI? | identity | Single-select (16 types) | signals[] (weight 0.6) |
| 9 | music | What is your favorite song / recent jam? | identity | Hybrid: genre picker + optional free text | signals[] (weight 0.3) — free text via AI Layer B logic |
| 10 | closet_aesthetic | How does your staple closet look like? | identity | Single-select | signals[] (weight 1.0) |
| 11 | rising_sign | What is your rising sign? | identity | Single-select (12 signs) | signals[] (weight 0.2) |
| 12 | budget | What is your budget for 50ml? | filter | Single-select | user.price_range (direct — hard filter per slot, not a scoring weight) |

> Questions of type `filter` bypass signal aggregation and map directly to user profile fields. Only `identity` questions contribute to `user.signals[]`.
> 

> `scent_type` (Q4) is a special `descriptor` type — bypasses signal aggregation, maps directly to `user.descriptors[]` via moodboard image pre-mapping.
> 

> `budget` is a `filter` type — sets `user.price_range` used as a hard filter before scoring. Applied strictly (`≤ price_range.max`) for Best Match and Wildcard. Applied as soft ceiling (`≤ price_range.max × 1.3`) for Ideal Match only.
> 

**Quiz input type rules:**

| question_id | Input type | Reason |
| --- | --- | --- |
| gender_pref | Single-select | Hard filter — maps to 1 value, no signal generated |
| use_case | Single-select | Practical — maps to 1 value |
| mood | Single-select | Generates signals — single select prevents inflation |
| scent_type | Single-select (moodboard image) | Maps to descriptors directly — each image pre-mapped to descriptor values |
| dislike_note | **Multi-select** | Hard filter only — bypasses signal aggregation, safe to multi-select |
| weekend_vibe | Single-select | Generates signals — single select |
| style_icon | **Hybrid: predefined list + "Someone else" free text** | Predefined → lookup. Free text → AI Layer B. Single selection only |
| mbti | Single-select (16 types shown) | Generates signals via MBTI - signal mapping |
| music | **Hybrid: genre picker + optional song/artist free text** | Genre → lookup. Free text → AI Layer B logic. Same fallback as style_icon |
| closet_aesthetic | Single-select | Generates signals — single select |
| rising_sign | Single-select (12 signs shown) | Generates signals via element-signal mapping |
| budget | Single-select | Hard filter — sets price_range applied per slot before scoring |

> **Why single select for all identity questions:** Multiple selections from one question each contribute full signal weight — making 1 question behave like 2+. This inflates the signal pool and skews archetype inference. Single select keeps each question contributing exactly 1 weight unit.
> 

> **style_icon and music hybrid (AI Layer B):** Predefined/genre selection → deterministic lookup, no AI call. Free-text → AI semantic match constrained to controlled signal vocabulary → confidence check (threshold 0.6) → if low: disclaimer + re-prompt → max 1 retry → if still low: skip signal injection for that question. Remaining 6 identity questions provide sufficient signal mass.
> 

**Schema:**

| Field | Type | Description |
| --- | --- | --- |
| question_id | string | Quiz question identifier |
| option_label | string | Answer shown to user |
| signals | string[] | Signals contributed (empty for practical/filter questions) |
| signal_weight | number | Weight per signal (default 1.0) |
| maps_to | string | For practical/filter: target user profile field |
| maps_value | string | For practical/filter: value written to that field |

### **Gender pref options (quiz question: gender_pref)**

Phrasing avoids gender-identity sensitivity by framing as scent preference, not personal identity.

```jsx
Question: "What kind of scent profile are you drawn to?"

Feminine          → gender_pref: feminine
Masculine         → gender_pref: masculine  
I like both       → gender_pref: unisex
```

> Unisex = no filter applied, full candidate pool. Feminine = blocks masculine-only. Masculine = blocks feminine-only. See Recommendation Logic → Candidate Filtering for full gender filter logic.
> 

### **Signal weight guidelines:**

| question_id | signal_weight | Rationale |
| --- | --- | --- |
| mood | 1.2 | Direct emotional/identity statement |
| style_icon | 1.2 | Direct cultural identity reference |
| closet_aesthetic | 1.0 | Strong behavioral + aesthetic signal |
| music | 0.3 | Reserved primarily for wildcard scoring — low weight prevents skewing archetype and ideal match |
| weekend_vibe | 0.8 | Mood/lifestyle signal |
| mbti | 0.6 | Personality, intrinsic-value signal |
| rising_sign | 0.2 | Reserved primarily for wildcard scoring — near-tiebreaker only |
| scent_type | n/a | Descriptor input, not signal input |
| gender_pref | n/a | Hard filter, not signal |
| dislike_note | n/a | Hard filter, not signal |
| use_case | n/a | Practical field, not signal |
| budget | n/a | Hard filter (price_range), not signal |

### **MBTI → signal mapping:**

Use data from “Archetype implication” to direct AI-layer surface UI copy in archetype result. 

If chosen MBTI is different from chosen style_icon, then prioritize MBTI and add-in extended characteristics from style_icon to create nuance to the Archetype result.

| MBTI dimension | Archetype implication | Signals |
| --- | --- | --- |
| **E** extrovert | outward energy | bold, playful, confident |
| **I** introvert | inward energy | introspective, mysterious |
| **S** sensing | grounded realism | grounded, easy-going |
| **N** intuition | abstract / artistic | intellectual, enigmatic |
| **T** thinking | structured | cool, refined |
| **F** feeling | emotional warmth | romantic, warm |
| **J** judging | polished | elegant, sophisticated |
| **P** perceiving | free energy | effortless, free-spirited |

### **Rising sign → signal mapping:**

Use data from “Core Energy” to direct AI-layer surface UI copy in archetype result as secondary, extended characteristics to create more nuances to the Archetype result.

| Rising Sign | Core Energy | Signals | Archetype Example |
| --- | --- | --- | --- |
| Aries | Bold, dominant | bold, confident, edgy, energetic | Sporty glam (Bella Hadid), Rugged masculine (Hardy/Cavill) |
| Taurus | Sensual luxury | sensual, grounded, elegant, refined | Classic bombshell (Monica Bellucci) |
| Gemini | Playful modern | playful, witty, modern, curious | Modern masculinity (Timothée / Harry) |
| Cancer | Warm soft energy | soft, romantic, warm, cozy | Soft girl-next-door (Rosé), Boy-next-door (Hứa Quang Hán) |
| Leo | Radiant glamour | glamorous, confident, bold, charismatic | Modern feminine power (Zendaya) |
| Virgo | Clean refined | minimal, refined, polished, sophisticated | Clean girl (Hailey Bieber), Quiet luxury feminine (Song Hye Kyo) |
| Libra | Elegant aesthetic | elegant, romantic, balanced, charming | Effortless chic (Jane Birkin / Dakota Johnson), Pretty prince (Cha Eun Woo), Timeless elegance (Audrey Hepburn) |
| Scorpio | Dark intensity | mysterious, introspective, sensual, enigmatic | Dark intellectual (Robert Pattinson / Anya Taylor-Joy), Old-school menace (Cillian Murphy) |
| Sagittarius | Free spirit | free-spirited, bold, adventurous, effortless | Boho indie (Zoë Kravitz) |
| Capricorn | Elite composure | sophisticated, grounded, confident, composed | Old money masculine (Theo James), Mature low-key charisma (Gong Yoo) |
| Aquarius | Unconventional cool | edgy, intellectual, modern, rebellious | Rebellious Gen Z (Billie Eilish), Street culture (A$AP Rocky) |
| Pisces | Dreamy romantic | romantic, soft, dreamy, playful | Coquette (Elle Fanning), Candy girl (Wonyoung) |

**Signal aggregation rule:**

All signals from identity questions are merged. Weighted frequency is summed per signal.

```
signal_score["romantic"] = sum of signal_weight for each answer contributing "romantic"
```

Final `user.signals` = top 5 signals by weighted score.

**Examples:**

```jsx
// Identity questions → signals
question_id: mood
option_label: Soft, romantic and a little nostalgic
signals: romantic, soft, nostalgic
// ✓ COVERAGE FIX — mood options with updated signal mappings:
// "Bold, confident, unapologetically present" → bold, confident, glamorous  (+glamorous)
// "Grounded, calm, quiet luxury"              → grounded, introspective, elegant  (+introspective)
// "Mysterious, edgy, with an artistic edge"   → mysterious, edgy, menacing  (+menacing)
signal_weight: 1.2

question_id: style_icon
option_label: Jane Birkin
signals: romantic, effortless
signal_weight: 1.2

question_id: closet_aesthetic
option_label: Old Money / European elegant
signals: minimal, confident, elegant
signal_weight: 1.0

question_id: music
option_label: Indie
signals: nostalgic, free-spirited, introspective  // updated
signal_weight: 0.3

question_id: weekend_vibe
option_label: Book + blanket, full hermit mode
signals: introspective, nostalgic, cozy  // ✓ FIX: nostalgic added
signal_weight: 0.8

question_id: mbti
option_label: INFP → NF group
signals: romantic, introspective
signal_weight: 0.6

question_id: rising_sign
option_label: Scorpio → Water element
signals: romantic, introspective
signal_weight: 0.2

// Descriptor question → user.descriptors[] directly
question_id: scent_type
option_label: [image: Floral & feminine]
maps_to: descriptors
maps_value: [floral, powdery]

// Filter questions → user profile fields directly
question_id: gender_pref
option_label: Feminine
maps_to: gender_pref
maps_value: feminine

question_id: dislike_note
option_label: Oud
maps_to: scent_dislikes
maps_value: oud

question_id: budget
option_label: $100–150
maps_to: price_range
maps_value: 100–150

// Practical question → user profile fields directly
question_id: use_case
option_label: Office
maps_to: use_case
maps_value: office
```

---

# Quiz Question — Signal Dimension Design

Each identity question is designed to cover a **distinct signal dimension**. This is intentional — if two questions map to the same signals with the same weight, one of them is redundant and weakens the engine's ability to differentiate users.

| Question | Primary signal dimension | Notes |
| --- | --- | --- |
| mood | Emotional tone + aesthetic identity | Highest weight alongside style_icon — directly expresses desired vibe |
| style_icon | Cultural identity cluster | Highest weight — most direct self-identification via reference person |
| closet_aesthetic | Behavioral + visual identity | Merged from previous closet_piece + aesthetic questions; covers lifestyle signals |
| music | Mood / emotional tone | Covers nostalgic, warm, cool — genre picker primary, free text optional |
| weekend_vibe | Lifestyle / emotional state | Covers grounded, playful, introspective — dimension less covered by mood/style_icon |
| mbti | Cognitive temperament | Covers introspective, grounded, playful — softer layer |
| rising_sign | Atmospheric / vibe | Softest layer — only meaningful as tiebreaker |
| scent_type | Scent descriptor preference | Not a signal dimension — maps directly to user.descriptors[] |

> **Design rule when adding quiz options:** Before assigning signals to a new option, check which signals it would generate and whether those signals are already heavily covered by higher-weight questions. If yes, consider mapping to secondary signals to improve coverage diversity.
> 

---

# Descriptor–Signal Mapping

Connects scent descriptors to identity signals **and** adjacent descriptors. Single dataset replaces two.

Used in two directions:

- **Reverse lookup** (signal → descriptors): Convert user signals into descriptor preferences for scoring
- **Forward lookup** (descriptor → signals): Convert explicit scent preferences into signals to strengthen archetype inference
- **Adjacency** (descriptor → adjacent[]): Power wildcard scent exploration

**Schema:**

| Field | Type | Description |
| --- | --- | --- |
| descriptor | string | Scent descriptor — **controlled vocabulary** |
| signals | string[] | Identity signals — **controlled vocabulary** |
| adjacent | string[] | Adjacent/exploratory descriptors — **controlled vocabulary** |

**Example entries:**

```
descriptor: clean
signals: minimal, soft
adjacent: aquatic, fresh

descriptor: floral
signals: romantic, soft
adjacent: powdery, sweet

descriptor: woody
signals: confident, grounded
adjacent: smoky, resin

descriptor: fresh
signals: effortless, soft
adjacent: green, citrus

descriptor: sweet
signals: romantic, playful
adjacent: gourmand, floral

descriptor: powdery
signals: romantic, nostalgic
adjacent: musky, floral
```

> Keep `adjacent[]` to **2–4 entries** per descriptor. Adjacent descriptors should feel like a plausible next step — not a complete departure from the user's taste.
> 

---

# Archetype Dataset

Used for archetype inference and result screen copy.

**Schema:**

| Field | Type | Description |
| --- | --- | --- |
| id | string | Unique identifier (slug) |
| name | string | Display name — no vocabulary constraint |
| signals | string[] | Defining signals — **controlled vocabulary** |
| description | string | Editorial copy (50 words) |

**Scoring:**

```
archetype_score = overlapping_signals / archetype.signal_count
```

Tie-breaking: archetype with higher cumulative signal weight from user profile wins.

**Examples:**

```
id: effortless-muse
name: Effortless Muse
signals: minimal, soft, effortless
description: You gravitate toward understated scents that feel intimate and natural.

id: modern-icon
name: Modern Icon
signals: bold, confident, minimal
description: You prefer statement scents that feel polished and self-assured.

id: romantic-dreamer
name: Romantic Dreamer
signals: romantic, soft, nostalgic
description: You're drawn to scents that feel like a memory — warm, intimate, and unmistakably feminine.
```

> **11 archetypes** — each developed from a male/female style icon pair. Each archetype has **3 core signals**. Every signal in the vocabulary must appear in at least one archetype. 1 archetype (Sporty Glam) is flagged for male pair completion in v2. The Coquette pair is now complete: Cha Eun Woo (Prince Charming).
> 

**11 Archetypes:**

| id | name | ♀ icon | ♂ icon | signals |
| --- | --- | --- | --- | --- |
| effortless-muse | The Effortless Muse | Dakota Johnson / Jane Birkin | Timothée / Harry Styles | effortless, cool, free-spirited |
| clean-minimalist | The Clean Minimalist | Hailey Bieber | Gong Yoo | minimal, cool, sophisticated |
| romantic-dreamer | The Romantic Dreamer | Rosé | Cha Eun Woo | romantic, soft, nostalgic |
| modern-icon | The Modern Icon | Zendaya | Hứa Quang Hán | bold, confident, modern |
| quiet-luxury | Quiet Luxury | Song Hye Kyo | Theo James | elegant, sophisticated, grounded |
| dark-intellectual | The Dark Intellectual | Anya Taylor-Joy | Robert Pattinson | intellectual, mysterious, enigmatic |
| the-sensualist | The Sensualist | Monica Bellucci | Tom Hardy / Henry Cavill | sensual, glamorous, bold |
| edge-walker | The Edge Walker | Billie Eilish | Cillian Murphy | edgy, menacing, enigmatic |
| free-spirit | The Free Spirit | Zoë Kravitz | A$AP Rocky | free-spirited, warm, playful |
| sporty-glam | The Sporty Glam ⚠ | Bella Hadid | *(male pair TBD — v2)* | bold, easy-going, cool |
| coquette | The Coquette ⚠ | Elle Fanning / Won Young | *(male pair TBD — v2)* | playful, warm, romantic |

---

# Vocabulary Size Guidelines

| Layer | Vocabulary | Size |
| --- | --- | --- |
| Descriptors | Shared: perfume.descriptors, descriptor-signal map | ~25 |
| Signals | Shared: quiz mapping, archetype.signals, [perfume.style](http://perfume.style)_tags, descriptor-signal map | ~25 |
| Archetypes | — | 11 |
| Use cases | Shared: perfume.use_cases, user.use_case | 8 |
| Gender tags | Fixed: feminine / masculine / unisex | 3 |

> ⚠️ Before adding any new signal or descriptor value, verify it appears in ALL datasets that reference it. Inconsistent vocabulary breaks scoring silently.
> 

> ⚠️ Every signal in the vocabulary must be reachable from at least 2–3 quiz answers AND appear in at least 1 archetype. Run a coverage check before finalizing datasets.
> 

---

# Final Data Architecture

```jsx
Quiz Answers (12 questions)
├── identity questions  → Quiz Option Mapping → user.signals (weighted)
│   └── scent_type (Q4)  → moodboard image mapping → user.descriptors[] (direct)
├── practical questions → user.use_case (direct)
└── filter questions    → user.gender_pref, user.scent_dislikes[], user.price_range (direct)

user.signals
→ Descriptor–Signal Map (reverse) → user.descriptors
→ Archetype Dataset               → user.archetype

user.descriptors
→ Descriptor–Signal Map (adjacent) → user.descriptors_adjacent (wildcard)

Perfume Dataset
→ Shared hard filters: gender_tags, scent_dislikes
→ Per-slot budget filter:
    Best Match + Wildcard: price ≤ price_range.max
    Ideal Match:           price ≤ price_range.max × 1.3
→ Scoring: rational / aspirational / wildcard
→ 3 Recommendations
```

**Data roles:**

| Dataset | Role |
| --- | --- |
| Quiz Option Mapping | Signal generation entry point |
| Descriptor–Signal Map | Scent ↔ identity bridge + wildcard adjacency |
| Archetype Dataset | Identity clustering + result copy |
| Perfume Dataset | Candidate pool + scoring target |

---

# Design Principle

> **Descriptors** power scent logic.
> 

> **Signals** power identity logic.
> 

> **Archetypes** power narrative.
> 

> **Gender tags** are a hard filter — never a score.
> 

Separating these layers keeps the system interpretable, easy to tune, and scalable as the dataset grows. Never mix descriptor vocabulary with signal vocabulary.
