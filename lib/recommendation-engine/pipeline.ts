import { filterCandidates } from "./candidate-filter";
import { buildResult, type EngineResult } from "./result-select";
import { rankCandidates, type ScoredCandidate } from "./scoring";
import type { Perfume, RecommendationScoreBreakdown, UserProfile } from "./types";
import { MIN_SCORE_TO_SHOW } from "./scoring-config";

interface SlotSelection {
  rational: ScoredCandidate | null;
  aspirational: ScoredCandidate | null;
  wildcard: ScoredCandidate | null;
}

function pickUnique(
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

  const rational = pickUnique(rationalRanked, used, usedBrands);
  const aspirational = pickUnique(aspirationalRanked, used, usedBrands);
  const wildcard = pickUnique(wildcardRanked, used, usedBrands);

  return { rational, aspirational, wildcard };
}

function fillMissingWithConfidentCandidates(
  current: SlotSelection,
  rankedPools: ScoredCandidate[][],
): SlotSelection {
  const next: SlotSelection = { ...current };

  const usedIds = new Set<string>();
  const usedBrands = new Set<string>();

  for (const slot of [next.rational, next.aspirational, next.wildcard]) {
    if (!slot) continue;
    usedIds.add(slot.candidate.perfume.id);
    usedBrands.add(slot.candidate.perfume.brand);
  }

  const globalRanked = rankedPools
    .flat()
    .filter(
      (item, index, all) =>
        all.findIndex((other) => other.candidate.perfume.id === item.candidate.perfume.id) === index,
    )
    .sort((a, b) => b.candidate.score - a.candidate.score);

  const pickNext = (): ScoredCandidate | null => {
    let winner: ScoredCandidate | null = null;
    let winnerAdjustedScore = -Infinity;

    for (const item of globalRanked) {
      const perfume = item.candidate.perfume;

      const repeatPenalty =
        (usedBrands.has(perfume.brand) ? 0.1 : 0) +
        (usedIds.has(perfume.id) ? 0.1 : 0);

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
  };

  if (!next.rational) next.rational = pickNext();
  if (!next.aspirational) next.aspirational = pickNext();
  if (!next.wildcard) next.wildcard = pickNext();

  return next;
}

export function runRecommendationPipeline(
  perfumes: Perfume[],
  profile: UserProfile,
): EngineResult {
  if (perfumes.length === 0) {
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

  const initial = selectInitialSlots(
    rationalRanked,
    aspirationalRanked,
    wildcardRanked,
  );

  const confidentFilled = fillMissingWithConfidentCandidates(initial, [
    rationalRanked,
    aspirationalRanked,
    wildcardRanked,
  ]);

  if (!confidentFilled.rational || !confidentFilled.aspirational || !confidentFilled.wildcard) {
    throw new Error("Not enough confident recommendations");
  }

  const slots = {
    bestFit: confidentFilled.rational.candidate,
    idealMatch: confidentFilled.aspirational.candidate,
    wildcard: confidentFilled.wildcard.candidate,
  };

  const scoreBreakdown: RecommendationScoreBreakdown[] = [
    confidentFilled.rational.breakdown,
    confidentFilled.aspirational.breakdown,
    confidentFilled.wildcard.breakdown,
  ];

  return buildResult({
    profile,
    slots,
    scoreBreakdown,
  });
}
