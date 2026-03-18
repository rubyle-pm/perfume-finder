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
  const used = new Set<string>();
  const usedBrands = new Set<string>();

  // ✅ STEP 1: luôn pick bestFit trước
  const rational = pickUnique(rationalRanked, used, usedBrands);

  // ✅ STEP 2: aspirational phải khác bestFit
  let aspirational: ScoredCandidate | null = null;
  for (const item of aspirationalRanked) {
    const id = item.candidate.perfume.id;
    if (!used.has(id)) {
      aspirational = item;
      used.add(id);
      usedBrands.add(item.candidate.perfume.brand);
      break;
    }
  }

  // ✅ STEP 3: wildcard phải khác cả 2
  let wildcard: ScoredCandidate | null = null;
  for (const item of wildcardRanked) {
    const id = item.candidate.perfume.id;
    if (!used.has(id)) {
      wildcard = item;
      used.add(id);
      usedBrands.add(item.candidate.perfume.brand);
      break;
    }
  }

  return { rational, aspirational, wildcard };
}

function selectSlotsStrict(
  rationalRanked: ScoredCandidate[],
  aspirationalRanked: ScoredCandidate[],
  wildcardRanked: ScoredCandidate[],
) {
  const usedIds = new Set();
  const usedBrands = new Set();

  // 1. BEST FIT
  const rational = rationalRanked[0] || null;
  if (rational) {
    usedIds.add(rational.candidate.perfume.id);
    usedBrands.add(rational.candidate.perfume.brand);
  }

  // 2. IDEAL MATCH — khác id + brand
  const aspirational =
    aspirationalRanked.find(item => {
      const p = item.candidate.perfume;
      return !usedIds.has(p.id) && !usedBrands.has(p.brand);
    }) || null;

  if (aspirational) {
    usedIds.add(aspirational.candidate.perfume.id);
    usedBrands.add(aspirational.candidate.perfume.brand);
  }

  // 3. WILDCARD — khác id (brand có thể trùng bestFit)
  const wildcard =
    wildcardRanked.find(item => {
      const p = item.candidate.perfume;
      return !usedIds.has(p.id);
    }) || null;

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
  
  const fallbackLevel = fallbackResult.fallbackLevel;
  
  if (
    !fallbackResult.rational ||
    !fallbackResult.aspirational ||
    !fallbackResult.wildcard
  ) {
    throw new Error("Fallback failed");
  }
  
  const slots = {
    bestFit: fallbackResult.rational.candidate,
    idealMatch: fallbackResult.aspirational.candidate,
    wildcard: fallbackResult.wildcard.candidate,
  };
  
  const scoreBreakdown = [
    fallbackResult.rational.breakdown,
    fallbackResult.aspirational.breakdown,
    fallbackResult.wildcard.breakdown,
  ];

  return buildResult({
    profile,
    slots,
    scoreBreakdown,
    // @ts-ignore, tech debt
    fallbackLevel,
  })}