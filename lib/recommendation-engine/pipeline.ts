console.log("🔥 TEST PIPELINE");
import { filterCandidates } from "./candidate-filter";
import { buildResult, type EngineResult } from "./result-select";
import { rankCandidates, type ScoredCandidate } from "./scoring";
import type { Perfume, RecommendationScoreBreakdown, UserProfile } from "./types";
import { MIN_SCORE_TO_SHOW } from "./scoring-config";
import { applyFallbackAdvanced } from "./fallback";

interface SlotSelection {
  rational: ScoredCandidate | null;
  aspirational: ScoredCandidate | null;
  wildcard: ScoredCandidate | null;
}

function pickUnique(           // avoid dup brand & ids 
  ranked: ScoredCandidate[],
  usedIds: Set<string>,
  usedBrands: Set<string>,
): ScoredCandidate | null {
  let winner: ScoredCandidate | null = null;
  let winnerAdjustedScore = -Infinity;

  for (const item of ranked) {
    const perfume = item.candidate.perfume;
    if (usedIds.has(perfume.id)) continue;

    const repeatPenalty = usedBrands.has(perfume.brand) ? 0.1 : 0;
    const adjustedScore = item.candidate.score - repeatPenalty;

    if (adjustedScore > winnerAdjustedScore) {
      winnerAdjustedScore = adjustedScore;
      winner = item;
    }
  }

  if (!winner) return null;

  usedIds.add(winner.candidate.perfume.id);
  usedBrands.add(winner.candidate.perfume.brand);

  return winner;
}

function selectInitialSlots(
  rationalRanked: ScoredCandidate[],
  aspirationalRanked: ScoredCandidate[],
  wildcardRanked: ScoredCandidate[],
): SlotSelection {
  const usedIds = new Set<string>();
  const usedBrands = new Set<string>();

  // ✅ STEP 1: luôn pick bestFit trước
  const rational = pickUnique(rationalRanked, usedIds, usedBrands);

  // ✅ STEP 2: aspirational phải khác bestFit
  let aspirational: ScoredCandidate | null = null;
  for (const item of aspirationalRanked) {
    const p = item.candidate.perfume;
  
    if (!usedIds.has(p.id) && !usedBrands.has(p.brand)) {
      aspirational = item;
      usedIds.add(p.id);
      usedBrands.add(p.brand);
      break;
    }
  }

  // ✅ STEP 3: wildcard phải khác cả 2
  let wildcard: ScoredCandidate | null = null;
  for (const item of wildcardRanked) {
    const id = item.candidate.perfume.id;
    if (!usedIds.has(id)) {
      wildcard = item;
      usedIds.add(id);
      usedBrands.add(item.candidate.perfume.brand);
      break;
    }
  }

  return { rational, aspirational, wildcard };
}

function enforceUniqueSlots(
  selected: {
    rational: ScoredCandidate | null;
    aspirational: ScoredCandidate | null;
    wildcard: ScoredCandidate | null;
  },
  ranked: {
    rational: ScoredCandidate[];
    aspirational: ScoredCandidate[];
    wildcard: ScoredCandidate[];
  }
) {
  const usedIds = new Set<string>();

  const rational = selected.rational;

  function similarity(a: ScoredCandidate, b: ScoredCandidate) {
    const aDesc = new Set(a.candidate.perfume.descriptors);
    const bDesc = new Set(b.candidate.perfume.descriptors);

    const intersection = [...aDesc].filter(x => bDesc.has(x));
    const union = new Set([...aDesc, ...bDesc]);

    return intersection.length / union.size;
  }

  function pick(
    current: ScoredCandidate | null,
    pool: ScoredCandidate[],
    fallbackPools: ScoredCandidate[][],
    type: "rational" | "aspirational" | "wildcard"
  ): ScoredCandidate | null {

    // 1. giữ nếu hợp lệ
    if (current && !usedIds.has(current.candidate.perfume.id)) {
      usedIds.add(current.candidate.perfume.id);
      return current;
    }

    // 2. try own pool
    for (const item of pool) {
      if (!usedIds.has(item.candidate.perfume.id)) {
        usedIds.add(item.candidate.perfume.id);
        return item;
      }
    }

    // 3. cross-pool fallback
    const crossPool = fallbackPools
      .flat()
      .filter(item => !usedIds.has(item.candidate.perfume.id));

    if (crossPool.length === 0) return current;

    let best: ScoredCandidate | null = null;

    if (type === "wildcard") {
      // 🎯 pick most different from rational
      best = crossPool.sort((a, b) => {
        const simA = rational ? similarity(a, rational) : 0;
        const simB = rational ? similarity(b, rational) : 0;
        return simA - simB;
      })[0];
    } else {
      // 🎯 pick highest popularity (fallback safe choice)
      best = crossPool.sort((a, b) => {
        return (b.candidate.perfume.popularity_score || 0)
             - (a.candidate.perfume.popularity_score || 0);
      })[0];
    }

    if (best) {
      usedIds.add(best.candidate.perfume.id);
      return best;
    }

    return current;
  }

  return {
    rational: pick(selected.rational, ranked.rational, [
      ranked.aspirational,
      ranked.wildcard,
    ], "rational"),

    aspirational: pick(selected.aspirational, ranked.aspirational, [
      ranked.rational,
      ranked.wildcard,
    ], "aspirational"),

    wildcard: pick(selected.wildcard, ranked.wildcard, [
      ranked.rational,
      ranked.aspirational,
    ], "wildcard"),
  };
}

function selectSlotsStrict(
  rationalRanked: ScoredCandidate[],
  aspirationalRanked: ScoredCandidate[],
  wildcardRanked: ScoredCandidate[],
) {
  const usedIds = new Set<string>();
  const usedBrands = new Set<string>();

  // 1. BEST FIT
  const rational = rationalRanked[0] || null;
  if (rational) {
    usedIds.add(rational.candidate.perfume.id);
    usedBrands.add(rational.candidate.perfume.brand);
  }

  // 2. IDEAL MATCH — khác id + brand
let aspirational: ScoredCandidate | null = null;

if (rational) {
  const adjusted = aspirationalRanked
    .map(item => {
      const same = item.candidate.perfume.id === rational.candidate.perfume.id;

      return {
        ...item,
        adjustedScore: item.candidate.score - (same ? 0.2 : 0),
      };
    })
    .sort((a, b) => b.adjustedScore - a.adjustedScore);

  aspirational =
    adjusted.find(item => !usedIds.has(item.candidate.perfume.id)) || null;
} else {
  aspirational =
    aspirationalRanked.find(item => !usedIds.has(item.candidate.perfume.id)) || null;
}

// help reduce similarity (bestFit, wildcard) 
function similarity(a: ScoredCandidate, b: ScoredCandidate) {
  const aDesc = new Set(a.candidate.perfume.descriptors);
  const bDesc = new Set(b.candidate.perfume.descriptors);

  const intersection = [...aDesc].filter(x => bDesc.has(x));
  const union = new Set([...aDesc, ...bDesc]);

  return intersection.length / union.size;
}

// 3. WILDCARD — khác id + phải đủ "khác vibe"
const wildcard =
  wildcardRanked.find(item => {
    const p = item.candidate.perfume;

    if (usedIds.has(p.id)) return false;

    const sim = rational
      ? similarity(item, rational)
      : 0;

    return sim < 0.4; // relax
  }) ||
  wildcardRanked.find(item => {
    const p = item.candidate.perfume;
    return !usedIds.has(p.id);
  }) ||
  null;

  return { rational, aspirational, wildcard };
}

export function runRecommendationPipeline(
  perfumes: Perfume[],
  profile: UserProfile,
): EngineResult {
  if (perfumes.length === 0) {
    console.log("🔥 RUN FUNCTION 2");
    throw new Error("runRecommendationPipeline requires at least one perfume");
  }

  const rationalPool = filterCandidates(perfumes, profile, "rational");
  const aspirationalPool = filterCandidates(perfumes, profile, "aspirational");
  const wildcardPool = filterCandidates(perfumes, profile, "wildcard");

  const rationalRanked = rankCandidates(rationalPool, profile, "rational")
    .filter((item) => item.candidate.score >= MIN_SCORE_TO_SHOW);

  const aspirationalRanked = rankCandidates(aspirationalPool, profile, "aspirational")
    .filter((item) => item.candidate.score >= MIN_SCORE_TO_SHOW);

  const wildcardRanked = rankCandidates(wildcardPool, profile, "wildcard")
    .filter((item) => item.candidate.score >= MIN_SCORE_TO_SHOW);

  const selected = selectSlotsStrict(
    rationalRanked,
    aspirationalRanked,
    wildcardRanked
  );

  const fallbackResult = applyFallbackAdvanced({
    perfumes,
    profile,
    current: selected,
  });
  const finalSelected = enforceUniqueSlots(
    fallbackResult,
    {
      rational: rationalRanked,
      aspirational: aspirationalRanked,
      wildcard: wildcardRanked,
    }
  );
  const fallbackLevel = fallbackResult.fallbackLevel;
  
  const slots = {
    bestFit: finalSelected.rational!.candidate,
    idealMatch: finalSelected.aspirational!.candidate,
    wildcard: finalSelected.wildcard!.candidate,
  };
  
  const scoreBreakdown = [
    finalSelected.rational!.breakdown,
    finalSelected.aspirational!.breakdown,
    finalSelected.wildcard!.breakdown,
  ];

  return buildResult({
    profile,
    slots,
    scoreBreakdown,
    // @ts-ignore, tech debt
    fallbackLevel,
  })}