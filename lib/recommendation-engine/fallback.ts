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

export function applyFallback(params: {
  perfumes: Perfume[];
  profile: UserProfile;
  current: SlotSelection;
  minScore?: number;
}): SlotSelection {
  const { perfumes, profile, current } = params;
  const minScore = params.minScore ?? 0.2;

  const usedIds = new Set<string>();
  const usedBrands = new Set<string>();
  if (current.rational && current.rational.candidate.score >= minScore) {
    usedIds.add(current.rational.candidate.perfume.id);
    usedBrands.add(current.rational.candidate.perfume.brand);
  }
  if (current.aspirational && current.aspirational.candidate.score >= minScore) {
    usedIds.add(current.aspirational.candidate.perfume.id);
    usedBrands.add(current.aspirational.candidate.perfume.brand);
  }
  if (current.wildcard && current.wildcard.candidate.score >= minScore) {
    usedIds.add(current.wildcard.candidate.perfume.id);
    usedBrands.add(current.wildcard.candidate.perfume.brand);
  }

  const next: SlotSelection = { ...current };

  if (isWeak(next.rational, minScore)) {
    next.rational = refillSlot(perfumes, profile, "rational", usedIds, usedBrands, minScore);
  }
  if (isWeak(next.aspirational, minScore)) {
    next.aspirational = refillSlot(perfumes, profile, "aspirational", usedIds, usedBrands, minScore);
  }
  if (isWeak(next.wildcard, minScore)) {
    next.wildcard = refillSlot(perfumes, profile, "wildcard", usedIds, usedBrands, minScore);
  }

  return next;
}
