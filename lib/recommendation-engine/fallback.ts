import { filterCandidates } from "./candidate-filter";
import { rankCandidates, type ScoredCandidate } from "./scoring";
import type { Perfume, UserProfile } from "./types";
import type { RecommendationType } from "./vocabulary";

export interface SlotSelection {
  rational: ScoredCandidate | null;
  aspirational: ScoredCandidate | null;
  wildcard: ScoredCandidate | null;
}

function isWeak(candidate: ScoredCandidate | null, minScore: number): boolean {
  return !candidate || candidate.candidate.score < minScore;
}

function pickUnique(
  ranked: ScoredCandidate[],
  usedIds: Set<string>,
  usedBrands: Set<string>,
  minScore: number,
): ScoredCandidate | null {
  for (const item of ranked) {
    const perfume = item.candidate.perfume;
    if (usedIds.has(perfume.id)) continue;
    if (usedBrands.has(perfume.brand)) continue;
    if (item.candidate.score < minScore) continue;
    usedIds.add(perfume.id);
    usedBrands.add(perfume.brand);
    return item;
  }
  for (const item of ranked) {
    const perfume = item.candidate.perfume;
    if (usedIds.has(perfume.id)) continue;
    if (usedBrands.has(perfume.brand)) continue;
    usedIds.add(perfume.id);
    usedBrands.add(perfume.brand);
    return item;
  }
  for (const item of ranked) {
    const perfume = item.candidate.perfume;
    if (usedIds.has(perfume.id)) continue;
    if (item.candidate.score < minScore) continue;
    usedIds.add(perfume.id);
    usedBrands.add(perfume.brand);
    return item;
  }
  for (const item of ranked) {
    const perfume = item.candidate.perfume;
    if (usedIds.has(perfume.id)) continue;
    usedIds.add(perfume.id);
    usedBrands.add(perfume.brand);
    return item;
  }
  return null;
}

function refillSlot(
  perfumes: Perfume[],
  profile: UserProfile,
  type: RecommendationType,
  usedIds: Set<string>,
  usedBrands: Set<string>,
  minScore: number,
): ScoredCandidate | null {
  const relaxedFiltered = filterCandidates(perfumes, profile, type, {
    maxCandidates: 200,
    ignoreDislikes: true,
  });
  const relaxedRanked = rankCandidates(relaxedFiltered, profile, type);
  const fromRelaxed = pickUnique(relaxedRanked, usedIds, usedBrands, minScore);
  if (fromRelaxed) return fromRelaxed;

  const globalRanked = rankCandidates(perfumes, profile, type);
  return pickUnique(globalRanked, usedIds, usedBrands, 0);
}

export function applyFallbackAdvanced({ perfumes, profile, current }: any) {
  let fallbackLevel = "none";

  function refill(type: any) {
    const filtered = filterCandidates(perfumes, profile, type);
    const ranked = rankCandidates(filtered, profile, type);

    // 1. STRICT (descriptor > 0)
    let pool = ranked.filter(
      (item: any) =>
        item.breakdown &&
        item.breakdown.descriptor_match &&
        item.breakdown.descriptor_match > 0
    );

    if (pool.length > 0) return pool[0];

    // 2. ADJACENT
    pool = ranked.filter(
      (item: any) =>
        item.breakdown &&
        item.breakdown.adjacent_score &&
        item.breakdown.adjacent_score > 0.3
    );

    if (pool.length > 0) {
      fallbackLevel = "adjacent";
      return pool[0];
    }

    // 3. INTENT
    pool = ranked.filter(
      (item: any) => item.candidate && item.candidate.score > 0.3
    );

    if (pool.length > 0) {
      fallbackLevel = "intent";
      return pool[0];
    }

    return null;
  }

  return {
    rational: current.rational || refill("rational"),
    aspirational: current.aspirational || refill("aspirational"),
    wildcard: current.wildcard || refill("wildcard"),
    fallbackLevel,
  };
}
