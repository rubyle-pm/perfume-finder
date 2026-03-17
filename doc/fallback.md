# 🛡️ Fallback Architecture — Production-Grade Recommendation Engine

**Status:** Final  
**Version:** 1.0  
**Last Updated:** March 2026

---

## Design Principles

- **Guarantee:** System ALWAYS returns 1 archetype + 3 recommendations
- **Determinism:** Recommendation scoring remains deterministic
- **AI isolation:** AI is used only for narrative; core logic never depends on it
- **Predictable fallbacks:** Fallback order is fixed and logged

---

## 1. Edge Case Map

| Stage | Failure Condition | Probability | Impact | Fallback Strategy |
|-------|-------------------|-------------|--------|-------------------|
| **Quiz** | Missing answer for required question | Low | Profile incomplete | Default to neutral value (e.g. `unisex`, empty arrays) |
| **Quiz** | Invalid / unknown option_id | Low | Signal not found | Skip that question, use remaining signals |
| **Signal aggregation** | All identity questions skipped (free-text failures) | Low | Empty signals | Use scent_type descriptors → reverse lookup → derive signals; or default to `minimal, soft, effortless` |
| **Archetype inference** | Perfect tie (identical scores) | Medium | Ambiguous archetype | Tie-break: higher cumulative weight; if still tied, lexical order of archetype id |
| **Archetype inference** | Top score < 0.65 (weak match) | Medium | Weak archetype | AI signal coherence (Tier 2A); on AI fail → use top by score anyway |
| **Descriptor derivation** | Reverse lookup returns empty | Low | No descriptors | Fallback to scent_type only; if empty → use `clean, fresh, soft` |
| **Descriptor derivation** | Descriptor explosion (too many) | Medium | Score collapse | **Descriptor cap** (max 8); top-weight filtering |
| **Candidate filtering** | Pool empty after all filters | High | No candidates | **Pool recovery** — relax filters in fixed order (Level 1) |
| **Candidate filtering** | Best Match pool empty | Medium | No rational pick | Relax budget 1.2×; relax dislikes |
| **Candidate filtering** | Aspirational pool empty | High | No ideal match | Convert to **Iconic Pick** — same pool as Best Match, pick by popularity + signal match |
| **Candidate filtering** | Wildcard pool empty (no adjacent) | Medium | No wildcard | **Novelty fallback** — pick by novelty score from Best Match pool, exclude best/rational |
| **Scoring** | All scores = 0 (descriptor mismatch) | Low | Random selection | Use popularity_score as tie-breaker; ensure min 1 candidate |
| **Result selection** | Duplicate across slots | Medium | Only 1–2 unique | **Controlled reuse** — fill slot with next-best; document which slot reused |
| **AI narrative** | Timeout / error / invalid response | Medium | No copy | **Template fallback** — archetype name + perfume names + canned phrases |
| **AI semantic match** | Free-text mapping fails / low confidence | Low | Skip signals | Skip injection; remaining questions suffice |

---

## 2. Fallback Priority Tree

```
Level 0 — NORMAL
├─ All pools ≥ 3 unique candidates
├─ Archetype score ≥ 0.65
└─ AI narrative succeeds
   → Result: normal_result

Level 1 — SOFT CONSTRAINT RELAXATION
├─ Pool empty or < 3
├─ Relax filters in order:
│   1. Budget +20%
│   2. Ignore scent_dislikes
│   3. Allow cross-gender (feminine ↔ masculine via unisex)
│   4. Drop descriptor match threshold (0.3 → 0.1)
└─ Re-run candidate filtering
   → Result: relaxed_filter_result

Level 2 — ALTERNATIVE SCORING
├─ Best Match pool still empty after L1
│   → Use full unfiltered pool, score by descriptor + use_case
├─ Aspirational pool empty
│   → Iconic Pick: pick from Best pool by popularity + signal_match
├─ Wildcard pool empty
│   → Novelty Pick: max novelty from Best pool, exclude best match
└─ Slot duplicate after selection
   → Next-best non-duplicate
   → Result: fallback_slot_*

Level 3 — TEMPLATE NARRATIVE
├─ AI timeout / error / invalid
└─ Use templates:
    archetype: "{archetype.name} — {canned_intro}"
    perfume: "A great fit for your {archetype.name} profile."
    wildcard: "An exploratory pick that expands your scent horizons."
   → Result: ai_narrative_fallback

Level 4 — SYSTEM-SAFE GUARANTEE
├─ Pool still empty after L1
├─ Use ENTIRE catalog
├─ No filters (except optionally keep gender if dataset allows)
├─ Pick by: popularity_score DESC, take top 3 unique
└─ Archetype: default "The Curious Explorer" (catch-all)
   → Result: system_safe_result
```

---

## 3. Candidate Pool Recovery System

### Relaxation Order (Deterministic)

| Step | Filter | Relaxation | When |
|------|--------|------------|------|
| 1 | Budget | `max × 1.2` (Best, Wildcard); `max × 1.5` (Aspirational) | Pool empty |
| 2 | scent_dislikes | Ignore dislike filter | Pool still empty |
| 3 | Gender | If feminine/masculine, add unisex-only; if still empty, allow cross-gender | Pool still empty |
| 4 | Descriptor match | N/A (scoring, not filter) | — |
| 5 | Full catalog | Drop all filters | Pool still empty after 1–3 |

### Per-Slot Rules

- **Best Match:** Apply relaxations 1→2→3→5. Score: descriptor + use_case.
- **Aspirational:** Apply same relaxations for its price band (`max × 1.3` base). If empty → **Iconic Pick**.
- **Wildcard:** Same as Best for budget. Adjacency required. If no adjacent → **Novelty Pick**.

---

## 4. Recommendation Slot Fallbacks

| Slot | Primary Logic | Fallback | Fallback Logic |
|------|---------------|----------|----------------|
| **Best Match** | Rational score (0.6×desc + 0.4×use_case) | Relax filters → use full pool | Score same formula; if pool still empty → pick by popularity |
| **Aspirational** | Aspirational score (price band 1.0–1.3×) | **Iconic Pick** | Use Best Match pool; score = 0.5×signal_match + 0.5×popularity; exclude Best Match pick |
| **Wildcard** | Wildcard score (adjacent + novelty) | **Novelty Pick** | Use Best Match pool; score = novelty; exclude Best + Aspirational; pick max novelty |

### Iconic Pick (Aspirational Fallback)

- Trigger: Aspirational pool empty after relaxation.
- Pool: Best Match candidates (post-relaxation).
- Score: `0.5 × signal_match + 0.5 × popularity_score`
- Exclude: Best Match perfume.
- Purpose: "A beloved classic aligned with your style."

### Novelty Pick (Wildcard Fallback)

- Trigger: No candidates with adjacent descriptors.
- Pool: Best Match candidates.
- Score: `novelty = 1 - descriptor_overlap / len(user.descriptors)`
- Exclude: Best Match, Aspirational.
- Purpose: "Something different but still compatible."

---

## 5. Duplicate Prevention System

### Rules

1. **Primary:** Select 3 unique perfumes. After picking each slot, add to `excluded_ids`.
2. **Best Match:** Never duplicated (first pick).
3. **Aspirational:** If top pick == Best → take next highest aspirational.
4. **Wildcard:** If top pick in {Best, Aspirational} → take next highest wildcard.

### Controlled Reuse (Last Resort)

- If pool has < 3 unique perfumes after all relaxations:
  - Fill slots in order: Best → Aspirational → Wildcard.
  - Reuse: Aspirational may reuse Best only if pool size = 1; Wildcard may reuse Best or Aspirational if pool size ≤ 2.
  - Set `slot_fallback: "reuse"` and `reused_from: "best_match"` (or similar) for logging.

---

## 6. AI Failure Handling

| AI Use Case | Failure Mode | Fallback |
|-------------|--------------|----------|
| Tier 1 narrative | Timeout, error, invalid JSON | Template narrative |
| Tier 2A signal coherence | Same | Skip; use original archetype |
| Tier 2B semantic match (free-text) | Low confidence, timeout | Skip signal injection |
| Tier 2C archetype blend | Same as Tier 1 | Use single archetype description |

### Template Narrative Fallback

```
archetype.description:
  "You gravitate toward scents that feel {archetype.signals.join(', ')}. 
   Here are three perfumes we think you'll love."

perfume.explanation (generic):
  best_match:  "A close match to your scent preferences."
  ideal_match: "A statement scent aligned with your style."
  wildcard:    "An exploratory pick to expand your horizons."

wildcard_insight:
  "This scent offers something a little different—worth exploring."
```

---

## 7. Descriptor Stabilization

### Rules

| Rule | Implementation | Purpose |
|------|----------------|---------|
| **Cap** | `user.descriptors` capped at 8 | Prevents score collapse from overlap formula |
| **Prioritization** | Take: scent_type (Q4) first, then signal-derived, by weight | Preserve user intent |
| **Normalization** | `overlap / min(len(user.descriptors), len(perfume.descriptors))` optionally | Avoid penalizing large perfume descriptor sets |
| **Empty guard** | If `user.descriptors` empty → default `['clean','soft','fresh']` | Always have denominator > 0 |

### Formula Guard

```
descriptor_match = len(intersection) / max(1, len(user.descriptors))
```

Ensures no division by zero when user has no descriptors (after fallback).

---

## 8. Frontend State Handling

```typescript
type ResultUIState =
  | "normal_result"           // All good
  | "relaxed_filter_result"   // Filters relaxed, show "We expanded our search"
  | "fallback_archetype"      // Archetype from tie-break or default
  | "fallback_slot_iconic"    // Aspirational = Iconic Pick
  | "fallback_slot_novelty"   // Wildcard = Novelty Pick
  | "ai_narrative_fallback"   // Template copy used
  | "system_safe_result";     // Full catalog, default archetype
```

### API Response Extension

```json
{
  "archetype": { ... },
  "recommendations": [ ... ],
  "meta": {
    "ui_state": "normal_result",
    "fallbacks": {
      "pool_relaxation": [],
      "slot_fallbacks": {},
      "ai_fallback": false
    }
  }
}
```

---

## 9. Logging Schema

```typescript
interface FallbackLog {
  fallback_trigger: string;   // e.g. "pool_empty", "aspirational_empty"
  fallback_type: string;      // e.g. "budget_relax", "iconic_pick"
  stage: string;              // e.g. "candidate_filter", "result_selection"
  timestamp: string;
  session_id?: string;
  context?: Record<string, unknown>;
}
```

Every fallback triggers a log entry for analytics and debugging.

---

## 10. Integration: AI Failure Handling

When calling AI for narrative generation:

```typescript
try {
  const narrative = await generateAINarrative(archetype, recommendations);
  return { ...result, narrative, meta: { ...meta, fallbacks: { ...meta.fallbacks, ai_fallback: false } } };
} catch (e) {
  // Timeout, rate limit, invalid response
  const template = applyTemplateNarrative(result.archetype, result.recommendations);
  return {
    ...result,
    narrative: template,
    meta: { ...meta, ui_state: "ai_narrative_fallback", fallbacks: { ...meta.fallbacks, ai_fallback: true } },
  };
}
```

Import `applyTemplateNarrative` from `lib/recommendation_engine/template_narrative`.
