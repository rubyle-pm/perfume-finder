# ⚙️ Recommendation Logic

# Product Goal

The system generates **1 archetype result** and **3 perfume recommendations**.

| Type | Purpose |
| --- | --- |
| Rational / Best match | Practical fit |
| Aspirational / Ideal match | Identity upgrade |
| Wildcard | Scent exploration |

User flow: **Quiz → Archetype → 3 Perfumes**

---

# Core Concepts

Two semantic spaces power the engine.

- **Descriptor space** → scent logic (represents smell)
- **Signal space** → identity logic (represents identity / vibe)

> These two spaces are kept separate. Descriptors match scent. Signals match identity. They connect only via the Descriptor–Signal mapping. Never mix descriptor values with signal values.
> 

---

# Quiz → User Profile

The quiz has **12 questions** split into three types:

| Type | Questions | Output |
| --- | --- | --- |
| Identity | mood, scent_type, weekend_vibe, style_icon, music, mbti, rising_sign, closet_aesthetic | `user.signals[]` (weighted aggregation) |
| Practical | use_case | `user.use_case` (direct) |
| Filter | gender_pref, dislike_note, budget | `user.gender_pref`, `user.scent_dislikes[]`, `user.price_range` (direct) |

> `budget` is now a **hard filter**, not a practical scoring field. It sets `user.price_range` which is applied as a strict filter before scoring — not as a scoring weight.
> 

> `scent_type` maps to `user.descriptors[]` directly, bypassing signal aggregation.
> 

**Resulting user profile shape:**

```jsx
price_range         string      e.g. "100–150"
scent_type          string[]    from Q4 moodboard selection — maps directly to user.descriptors
scent_dislikes      string[]    from dislike_note answer
gender_pref         string      "feminine" | "masculine" | "unisex"
use_case            string      e.g. "office"
signals             string[]    top 5 by weighted score
```

> `scent_type` (Q4) maps directly to `user.descriptors`, bypassing signal aggregation. It is a descriptor-level input, not a signal-level input. This is the only identity question that feeds descriptors directly.
> 

**Example user profile:**

```jsx
price_range: 100–150
scent_type: [floral, musky]
scent_dislikes: [oud, tobacco]
gender_pref: feminine
use_case: office
signals: [romantic, minimal, soft, effortless, introspective]
```

**Signal aggregation:**

Each identity question contributes signals with a weight. Signals are merged and summed across all answers. Top 5 signals by weighted score become `user.signals`.

```
signal_score["romantic"] = sum of signal_weight for all answers that contribute "romantic"
```

Signal weights by question (see Data Model for full mapping):

- style_icon, mood: 1.2 (highest confidence — direct identity statement)
- closet_aesthetic: 1.0
- weekend_vibe: 0.8
- mbti: 0.6
- music: 0.3 (reserved primarily for wildcard — low weight prevents influence on archetype/ideal match)
- rising_sign: 0.2 (reserved primarily for wildcard — near-tiebreaker only)

> `scent_type` (Q4) has no signal_weight — it contributes descriptors directly, not signals.
> 

---

# Archetype Inference

Archetype is inferred by comparing `user.signals` against each archetype's signal list.

**Scoring formula:**

```
archetype_score = overlapping_signals / archetype.signal_count
```

**Example:**

```
user.signals:             romantic, minimal, soft, effortless, introspective

Effortless Muse signals:  minimal, soft, effortless    → overlap = 3 → score = 3/3 = 1.0
Modern Icon signals:      bold, confident, minimal     → overlap = 1 → score = 1/3 = 0.33
Romantic Dreamer signals: romantic, soft, nostalgic    → overlap = 2 → score = 2/3 = 0.67
```

→ Highest score = **Effortless Muse**

**Tie-breaking:** select archetype with higher cumulative `signal_weight` from user profile.

---

# Descriptor Preference Derivation

After archetype inference, user signals are converted to scent descriptors via **reverse lookup** in the Descriptor–Signal mapping.

**Example:**

```
romantic  → floral, powdery
minimal   → clean, soft
soft      → powdery, clean
```

**Final user descriptor profile** = signal-derived descriptors + `scent_type` descriptors from Q4 (deduplicated):

```
clean / soft / floral / powdery
```

> This combined list is the input for all three scoring functions.
> 

---

# Candidate Filtering

Hard filters run **before scoring**. Budget filtering is applied **per recommendation type** since price range differs by slot.

**Shared filters (applied to all candidates before any scoring):**

| Filter | Rule |
| --- | --- |
| Disliked notes | Remove if any top/heart/base note appears in `user.scent_dislikes` |
| Gender | Remove if `user.gender_pref` is not in `perfume.gender_tags` AND `perfume.gender_tags` does not include `unisex` |

**Budget filter — applied per recommendation type:**

| Recommendation | Price rule |
| --- | --- |
| Best Fit (Rational) | `perfume.price ≤ user.price_range.max` — strict, within budget only |
| Wildcard | `perfume.price ≤ user.price_range.max` — strict, same as Best Match |
| Ideal Match (Aspirational) | `perfume.price ≤ user.price_range.max × 1.3` — allows aspirational premium |

**Gender filter logic:**

```jsx
if user.gender_pref == "unisex":
    no filter applied → only usisex pool 

if user.gender_pref == "feminine":
    keep if "feminine" in perfume.gender_tags OR "unisex" in perfume.gender_tags
    // masculine-only perfumes are removed entirely

if user.gender_pref == "masculine":
    keep if "masculine" in perfume.gender_tags OR "unisex" in perfume.gender_tags
    // feminine-only perfumes are removed entirely
```

> Gender is a **hard filter, not a score**. A masculine-tagged perfume will never appear in a feminine user's results even if its scent score is the highest. This prevents UX breakage.
> 

**Unisex priority for wildcard:**

Within wildcard scoring, unisex perfumes receive a small bonus to encourage exploratory recommendations that feel inclusive and boundary-pushing:

```jsx
unisex_bonus = 0.05 if "unisex" in perfume.gender_tags else 0
wildcard_score += unisex_bonus
```

This nudges the wildcard slot toward gender-fluid options without overriding scent logic.

---

# Rational Recommendation / Best Fit

**Goal:** Best practical fit for the user's current profile.

> Budget is a **hard filter** for this slot — only perfumes within `user.price_range.max` are candidates. Budget is not a scoring weight.
> 

```jsx
rational_score = 0.5 × descriptor_match + 0.3 × use_case_match + 0.2 x mood_signal
```

**Descriptor match:**

```
overlap(user.descriptors, perfume.descriptors) / len(user.descriptors)
```

**Use case match:**

```
1.0  if user.use_case in perfume.use_cases
0.0  if not
```

---

# Aspirational Recommendation / Ideal Match

**Goal:** Identity upgrade — scent that's slightly beyond current comfort zone but still identity-compatible.

**Rules:**

- Price between `price_range.max × 1.0` and `price_range.max × 1.3`
- `descriptor_match > 0.3` (still scent-compatible)
- Matches identity signals via `style_tags`

> `perfume.style_tags` uses the same signal vocabulary as `user.signals`. Aspirational `signal_match` compares `user.signals` against `perfume.style_tags`.
> 

```jsx
aspirational_score =
  0.4 × descriptor_match
  0.4 × signal_match            ← user.signals vs perfume.style_tags
  0.2 × premium_factor
```

**Signal match:**

```
overlap(user.signals, perfume.style_tags) / len(user.signals)
```

**Premium factor:**

```
0.8  luxury brand ("Le Labo",
        "Byredo",
        "Frederic Malle",
        "Diptyque",
        "Kilian Paris",
        "Xerjoff",
        "Roja Parfums",
        "Maison Francis Kurkdjian",
        "Amouage",
        "Creed",
        "Nasomatto")
0.6  popularity score > 0.90
0.7  tier 4 price 
```

---

# Wildcard Recommendation

**Goal:** Introduce the user to a scent family they haven't tried but might love.

**Rules:**

- Exclude disliked notes (same hard filter as candidate filtering)
- Budget: strict filter `price ≤ user.price_range.max` (same as Best Match)
- Must have at least 1 adjacent descriptor (from `adjacent[]` in Descriptor–Signal mapping)
- Should NOT overlap heavily with rational pick: `descriptor_match vs rational < 0.5`

**Adjacent descriptor score:**

```
user.descriptors_adjacent = flatten(descriptor_map[d].adjacent for d in user.descriptors)

adjacent_score = overlap(user.descriptors_adjacent, perfume.descriptors) / len(user.descriptors_adjacent)
```

> `user.descriptors_adjacent` is built from the `adjacent[]` field in Descriptor–Signal mapping — the same dataset, no separate file needed.
> 

**Music signal match:**

Music answer contributes signals via Quiz Option Mapping. Those signals match against `perfume.style_tags`.

```
music_signal_match = overlap(music_signals, perfume.style_tags) / len(music_signals)
```

**Novelty score:**

```
novelty = 1 - overlap(user.descriptors, perfume.descriptors) / len(user.descriptors)
```

Higher novelty = less overlap with user's existing taste = more exploratory.

```
wildcard_score =
  0.4 × adjacent_score
  0.3 × music_signal_match
  0.2 × descriptor_match
  0.1 × novelty
```

---

# Result Selection

```
rational     = perfume with max(rational_score)
aspirational = perfume with max(aspirational_score)
wildcard     = perfume with max(wildcard_score)
```

**Duplicate handling — all 3 cases:**

```
if wildcard     == rational     → wildcard     = next highest wildcard_score
if wildcard     == aspirational → wildcard     = next highest wildcard_score
if rational     == aspirational → aspirational = next highest aspirational_score
```

Final output = **3 unique perfumes**.

---

# AI Layer

The AI layer has two tiers: **narrative** (baseline) and **enhanced personalization** (optional upgrade).

> In all cases: AI does NOT select or rank perfumes. Scoring is always deterministic. AI only interprets and explains.
> 

---

## Tier 1 — Narrative (Baseline)

AI receives the processed user profile and 3 selected perfumes, and generates editorial copy.

**Input:**

```jsx
user.archetype
user.signals
user.descriptors
3 selected perfumes (with scores and category: rational / aspirational / wildcard)
```

**Output:**

- Archetype description (1–2 sentences)
- Per-perfume reasoning (1 sentence each)
- Wildcard insight: why this might surprise you

> Always pass the **processed** user profile — never raw quiz answers. This keeps AI output consistent and prevents prompt drift.
> 

---

## Tier 2 — Enhanced Personalization (Optional)

Four approaches to make results more nuanced, in order of implementation difficulty:

**A. AI-assisted signal coherence check** *(conditional — only triggers when top archetype score < 0.65)*

After initial archetype scoring runs, if the top score is below threshold (indicating a 2-way or 3-way tie / contradictory signals), AI reviews the full signal set and detects dominant clusters. AI then boosts weights of the dominant cluster's signals before re-running archetype scoring.

```jsx
Trigger condition:  top archetype_score < 0.65
Input:              user.signals with raw weights
Output:             adjusted signal weights → archetype scoring re-runs once
```

> **Why conditional:** ~80% of users will have a clear dominant archetype (score ≥ 0.65) and never trigger this path — no AI call, no latency. The remaining ~20% with contradictory or spread signals are the ones who benefit most. This keeps costs low while solving the actual problem.
> 

> **What A fixes in practice:** Without A, a user with `bold + romantic + soft + confident + edgy` hits a 3-way tie → archetype is chosen by cumulative weight tiebreaker → feels arbitrary. With A, the dominant cluster (e.g. `bold + confident + edgy`) wins deliberately → archetype inference feels accurate. This also improves descriptor derivation: focused cluster → focused descriptor list → better rational recommendation match.
> 

**Cursor implementation notes for A:**

1. Run archetype scoring once deterministically
2. Check if `max(archetype_scores) < 0.65`
3. If false → skip A entirely, proceed to descriptor derivation
4. If true → call AI with `user.signals + weights`, prompt constrains output to signal vocab only, returns `adjusted_weights`
5. Validate adjusted_weights (all signals must be in controlled vocabulary, no new signals injected)
6. Re-run archetype scoring with adjusted weights
7. Proceed with winner — no further AI calls in this path

**B. Hybrid free-text semantic match (style_icon + music)** *(AI only for free-text path — applies to both Q7 and Q9)*

Both questions use a **hybrid input** model. AI is only called when user enters free text — the predefined/genre path is always deterministic.

**style_icon (Q7):** predefined list of ~12–15 options + "Someone else" free-text fallback.

**music (Q9):** genre picker (primary) + optional song/artist free-text.

```jsx
// style_icon
Predefined option selected:
    → Quiz Option Mapping lookup → signals[] (deterministic, weight 1.2)

"Someone else" + free text entered:
    → AI semantic match call
    → Input:  free-text input + full signal controlled vocabulary
    → Output: signals[] constrained to controlled vocab + confidence score
    → if confidence ≥ 0.6: inject signals with weight 1.2
    → if confidence < 0.6: flag = true → show disclaimer + re-prompt UI

// music
Genre picker selected:
    → Quiz Option Mapping lookup → signals[] (deterministic, weight 0.3)

Song/artist free text entered:
    → AI semantic match call (same logic as style_icon)
    → Output: signals[] constrained to controlled vocab + confidence score
    → if confidence ≥ 0.6: inject signals with weight 0.3
    → if confidence < 0.6: flag = true → show disclaimer + re-prompt UI
```

**Fallback behavior (identical for both questions):**

Do not inject any signals. Flag the input and surface a disclaimer on the quiz UI with an example of a valid input, prompting the user to re-enter. Re-call AI with the new input. If confidence is still low after one retry, skip signal injection for that question entirely — the remaining 6 identity questions still provide enough signal mass for archetype inference.

```jsx
Fallback flow (style_icon):
    confidence < 0.6
    → show: "Look like this star is not born yet — try Dakota Johnson, Jennie, or Hứa Quang Hán"
    → user re-enters → re-call AI
    → if still < 0.6: skip style_icon signals, proceed with other questions

Fallback flow (music):
    confidence < 0.6
    → show: "We couldn't map this song — try JazzHop or "Cruel Summer" by Taylor Swift"
    → user re-enters → re-call AI
    → if still < 0.6: skip music free-text signals, proceed with other questions
```

**AI prompt constraints for B (critical for Cursor):**

- Always pass the full signal controlled vocabulary list in the prompt
- Instruct AI to return ONLY signals from that list — no invented signals
- Return a confidence score (0.0–1.0) alongside signals
- Threshold: 0.6
- Edge cases: niche/unknown people, fictional characters, non-person inputs, non-English celebrities, obscure songs — confidence score will naturally be lower

**Cursor implementation notes for B:**

1. style_icon: render predefined options + "Someone else" → if free text submitted → AI call → confidence check → inject or fallback
2. music: render genre picker (primary) + optional free-text field → if genre selected → standard lookup, no AI call → if free text submitted → AI call → confidence check → inject at weight 0.3 or fallback
3. Both questions: same AI call structure, same confidence threshold, same max-1-retry rule
4. Parse AI response: validate all returned signals are in controlled vocab, check confidence
5. If confidence ≥ 0.6 → inject into signal aggregation at question's weight
6. If confidence < 0.6 → show inline disclaimer, prompt re-entry
7. Max 1 retry per question → if still low, skip and continue quiz

**C. Archetype blend explanation** *(medium effort, richer UX)*

Instead of showing only the top archetype, AI receives the top 2–3 archetype scores and generates a blend description.

```jsx
Input:  [{archetype: "Effortless Muse", score: 0.8}, {archetype: "Romantic Dreamer", score: 0.6}]
Output: "You move between effortless minimalism and quiet romance..."
```

Does not change recommendation logic. Purely a result screen enhancement. 

Translate into the main language: Vietnamese. Only keep the name of archetype, style in English (for ex: Scandinavian minimalist; sporty chic, etc)

**D. Conversational refinement** *(high effort, best UX — v2 feature)*

After results are shown, user can respond: *"I prefer something less sweet"* or *"show me something bolder"*. AI re-interprets the feedback, adjusts descriptor weights or filters, and re-runs scoring without requiring a new quiz.

```jsx
Requires: session state, multi-turn prompt design
Output:  updated user.descriptors or filter overrides → re-score
```

**E. Photo/outfit vibe detection** *(medium effort, already in roadmap  — v2 feature)*

OpenAI Vision receives a user-uploaded photo and extracts visual aesthetic signals, which are merged into `user.signals` as an additional signal source with a defined weight.

```jsx
Input:  outfit photo
Output: signals[] with weight 0.9 → merged into signal aggregation pool
```

This runs in parallel with quiz signal aggregation, not as a replacement.

---

**Recommended priority:**

| Approach | Effort | Impact | When |
| --- | --- | --- | --- |
| A — Signal coherence check | Medium (conditional trigger) | High — fixes tie-breaking + descriptor focus | MVP |
| B — Style icon hybrid + semantic match | Medium (UI state + AI call) | High — covers complex identity inputs | MVP |
| C — Archetype blend | Medium | High UX | MVP |
| E — Photo vibe | Medium | Differentiating | v1.5 |
| D — Conversational | High | Best UX | v2 |

---

# Final System Flow

```jsx
Quiz (12 questions)
├── filter answers
│   ├── gender_pref (Q1)       → user.gender_pref (direct)
│   ├── dislike_note (Q5)      → user.scent_dislikes[] (direct)
│   └── budget (Q12)           → user.price_range (direct — hard filter per slot)
├── practical answers
│   └── use_case (Q2)          → user.use_case (direct)
└── identity answers
    ├── mood (Q3)              → signals[] (weight 1.2)
    ├── scent_type (Q4)        → user.descriptors[] directly (bypasses signals)
    ├── weekend_vibe (Q6)      → signals[] (weight 0.8)
    ├── style_icon (Q7)        → signals[] (weight 1.2) — free text via AI Layer B
    ├── mbti (Q8)              → signals[] (weight 0.6)
    ├── music (Q9)             → signals[] (weight 0.3) — free text via AI Layer B
    ├── closet_aesthetic (Q10) → signals[] (weight 1.0)
    └── rising_sign (Q11)      → signals[] (weight 0.2)

user.signals (top 5 by weighted score)
→ Archetype Dataset               → user.archetype
→ Descriptor–Signal Map (rev.)    → user.descriptors (merged with scent_type descriptors, deduplicated)

user.descriptors
→ Descriptor–Signal Map (adj.)    → user.descriptors_adjacent (wildcard input)

Candidate Pool (Perfume Dataset)
→ Shared hard filters: gender_tags, scent_dislikes
→ Per-slot budget filter:
    Best Match + Wildcard: price ≤ price_range.max
    Ideal Match:           price ≤ price_range.max × 1.3
→ Scoring:
    rational     = 0.5 × descriptor_match + 0.3 × use_case_match + 0.2 x mood_signal
    aspirational = 0.4 × descriptor_match + 0.3 × signal_match + 0.2 × premium price 
    wildcard     = 0.4 × adjacent_score + 0.3 × music_signal + 0.2 × descriptor_match + 0.1 × novelty
→ Duplicate check (3 cases)
→ 3 unique perfumes selected
→ AI Tier 1 narrative (always) + Tier 2 if triggered
→ Output: archetype + 3 perfumes
```
