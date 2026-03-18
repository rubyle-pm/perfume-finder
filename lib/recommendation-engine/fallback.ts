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
    const usedIds = new Set();
    const usedBrands = new Set();
    
    // seed từ current
    if (current.rational) {
      usedIds.add(current.rational.candidate.perfume.id);
      usedBrands.add(current.rational.candidate.perfume.brand);
    }
    if (current.aspirational) {
      usedIds.add(current.aspirational.candidate.perfume.id);
      usedBrands.add(current.aspirational.candidate.perfume.brand);
    }
    if (current.wildcard) {
      usedIds.add(current.wildcard.candidate.perfume.id);
      usedBrands.add(current.wildcard.candidate.perfume.brand);
    }
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
        item.breakdown.adjacent_score > 0.2   // threshold fallback từ adjacent 
    );

    if (pool.length > 0) {
      fallbackLevel = "adjacent";
      return pool[0];
    }

    // 3. INTENT
    pool = ranked.filter(
      (item: any) => item.candidate && item.candidate.score > 0.2   //config pool fallback 
    );

    if (pool.length > 0) {
      fallbackLevel = "intent";
      return pool[0];
    }

    return null;
  }

  const usedIds = new Set<string>();
const usedBrands = new Set<string>();

// seed từ current
if (current.rational) {
  usedIds.add(current.rational.candidate.perfume.id);
  usedBrands.add(current.rational.candidate.perfume.brand);
}
if (current.aspirational) {
  usedIds.add(current.aspirational.candidate.perfume.id);
  usedBrands.add(current.aspirational.candidate.perfume.brand);
}
if (current.wildcard) {
  usedIds.add(current.wildcard.candidate.perfume.id);
  usedBrands.add(current.wildcard.candidate.perfume.brand);
}
  const rational = current.rational || refill("rational");
  const aspirational = current.aspirational || refill("aspirational");
  const wildcard = current.wildcard || refill("wildcard");
  
  // Degrade gracefully with explanation  
  function forcePick(
    type: RecommendationType,
    usedIds: Set<string>,
    usedBrands: Set<string>)
    {
    const filtered = filterCandidates(perfumes, profile, type);
    let ranked = rankCandidates(filtered, profile, type);
  
    // nếu filtered null → fallback full dataset
    if (ranked.length === 0) {
      console.log("⚠️ forcePick fallback to full dataset:", type);
      ranked = rankCandidates(perfumes, profile, type);
    }
  
    // ✅ ưu tiên unique id + brand
    for (const item of ranked) {
      const p = item.candidate.perfume;
      if (!usedIds.has(p.id) && !usedBrands.has(p.brand)) {
        usedIds.add(p.id);
        usedBrands.add(p.brand);
        return item;
      }
    }
  
    // ⚠️ fallback: chỉ unique id
    for (const item of ranked) {
      const p = item.candidate.perfume;
      if (!usedIds.has(p.id)) {
        usedIds.add(p.id);
        return item;
      }
    }
  
    // 🔥 last resort: pick bất kỳ
    return ranked[0] || null;
  }
  
  return {
    rational: rational || forcePick("rational", usedIds, usedBrands),
    aspirational: aspirational || forcePick("aspirational", usedIds, usedBrands),
    wildcard: wildcard || forcePick("wildcard", usedIds, usedBrands),
    fallbackLevel: fallbackLevel === "none" ? "intent" : fallbackLevel,
  }}
