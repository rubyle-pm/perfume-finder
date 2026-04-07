import type { Perfume, RecommendationCandidate, RecommendationScoreBreakdown, UserProfile } from "./types";
import type { RecommendationType, Signal } from "./vocabulary";
import { SCORING_WEIGHTS } from "./scoring-config";
import { computeIntentScore } from "./intent-scoring";

function overlapRatio<T>(a: readonly T[], b: readonly T[]): number {
  if (a.length === 0) return 0;
  const bSet = new Set(b);
  let hit = 0;
  for (const item of a) {
    if (bSet.has(item)) hit += 1;
  }
  return hit / a.length;
}

function userTier(profile: UserProfile): number {
  if (profile.price_range === "2_000_000_to_3_500_000") return 2;
  if (profile.price_range === "3_500_000_to_5_000_000") return 3;
  return 4;
}

function premiumFactor(perfume: Perfume, profile: UserProfile): number {
  const baseTier = userTier(profile);
  if (perfume.tier > baseTier) return 1;
  if (perfume.tier === baseTier) return 0.6;
  return 0.3;
}

function deriveAdjacentDescriptors(descriptors: readonly string[]): string[] {
  const out = new Set<string>();
  for (const descriptor of descriptors) {
    if (descriptor === "fresh") out.add("aquatic");
    if (descriptor === "aquatic") out.add("fresh");
    if (descriptor === "floral") out.add("powdery");
    if (descriptor === "powdery") out.add("floral");
    if (descriptor === "woody") out.add("vetiver");
    if (descriptor === "vetiver") out.add("woody");
    if (descriptor === "musky") out.add("clean");
    if (descriptor === "clean") out.add("musky");
    if (descriptor === "amber") out.add("vanilla");
    if (descriptor === "vanilla") out.add("amber");
    if (descriptor === "smoky") out.add("oud");
    if (descriptor === "oud") out.add("smoky");
  }
  return Array.from(out);
}

function scoreRational(
  perfume: Perfume,
  profile: UserProfile,
): RecommendationScoreBreakdown {
  const descriptorMatch = overlapRatio(profile.derived_descriptors, perfume.descriptors);
  const useCaseMatch = perfume.use_cases.includes(profile.use_case) ? 1 : 0;
  const mbtiMatch = overlapRatio(profile.mbti_signals, perfume.style_tags);
  const intentScore = computeIntentScore(profile.derived_descriptors, perfume.descriptors);

  let total =
    SCORING_WEIGHTS.rational.descriptor * descriptorMatch +
    SCORING_WEIGHTS.rational.use_case * useCaseMatch +
    SCORING_WEIGHTS.rational.mbti * mbtiMatch +
    0.05 * intentScore;

  if (descriptorMatch === 0) {
    total *= 0.2;
  }

  return {
    type: "rational",
    total,
    descriptor_match: descriptorMatch,
    use_case_match: useCaseMatch,
    mbti_match: mbtiMatch,
  }
}

function scoreAspirational(
  perfume: Perfume,
  profile: UserProfile,
): RecommendationScoreBreakdown {
  const descriptorMatch = overlapRatio(profile.derived_descriptors, perfume.descriptors);
  const signalMatch = overlapRatio(profile.signals, perfume.style_tags);
  const moodMatch = overlapRatio(profile.mood_signals, perfume.style_tags);
  const intentScore = computeIntentScore(profile.derived_descriptors, perfume.descriptors);
  const premium = premiumFactor(perfume, profile);

  let total =
    SCORING_WEIGHTS.aspirational.descriptor * descriptorMatch +
    SCORING_WEIGHTS.aspirational.style_signal * signalMatch +
    SCORING_WEIGHTS.aspirational.premium * premium +
    SCORING_WEIGHTS.aspirational.mood * moodMatch +
    0.12 * intentScore;

  if (signalMatch < 0.25) total *= 0.1;
  if (descriptorMatch === 0 && intentScore < 0.3) {
    total *= 0.1;
  }

  return {
    type: "aspirational",
    total,
    descriptor_match: descriptorMatch,
    signal_match: signalMatch,
    mood_match: moodMatch,
    premium_factor: premium,
  };
}

function scoreWildcard(
  perfume: Perfume,
  profile: UserProfile,
): RecommendationScoreBreakdown {
  const descriptorMatch = overlapRatio(profile.derived_descriptors, perfume.descriptors);
  const adjacent = deriveAdjacentDescriptors(profile.derived_descriptors);
  const adjacentScore = overlapRatio(adjacent, perfume.descriptors);
  const musicSignalMatch = overlapRatio(profile.music_signals, perfume.style_tags);
  const novelty = 1 - descriptorMatch;

  let total =
    SCORING_WEIGHTS.wildcard.adjacent * adjacentScore +
    SCORING_WEIGHTS.wildcard.descriptor * descriptorMatch +
    SCORING_WEIGHTS.wildcard.music * musicSignalMatch +
    SCORING_WEIGHTS.wildcard.novelty * novelty;

  if (descriptorMatch === 0) {
    total *= 0.2;
  }

  return {
    type: "wildcard",
    total,
    descriptor_match: descriptorMatch,
    adjacent_score: adjacentScore,
    music_signal_match: musicSignalMatch,
    novelty,
  };
}

export interface ScoredCandidate {
  candidate: RecommendationCandidate;
  breakdown: RecommendationScoreBreakdown;
}

export function scorePerfume(
  perfume: Perfume,
  profile: UserProfile,
  type: RecommendationType,
): ScoredCandidate {
  const breakdown =
    type === "rational"
      ? scoreRational(perfume, profile)
      : type === "aspirational"
        ? scoreAspirational(perfume, profile)
        : scoreWildcard(perfume, profile);

  return {
    candidate: {
      type,
      perfume,
      score: breakdown.total,
      matchSignals: {
        descriptors: profile.scent_type.filter((d) => perfume.descriptors.includes(d)),
        signals: profile.signals.filter((s: Signal) => perfume.style_tags.includes(s)),
        use_case: perfume.use_cases.includes(profile.use_case) ? profile.use_case : undefined,
      },
    },
    breakdown,
  };
}

export function rankCandidates(
  perfumes: Perfume[],
  profile: UserProfile,
  type: RecommendationType,
): ScoredCandidate[] {
  return perfumes
    .map((perfume) => scorePerfume(perfume, profile, type))
    .sort((a, b) => {
      if (b.candidate.score !== a.candidate.score) {
        return b.candidate.score - a.candidate.score;
      }
      return b.candidate.perfume.popularity_score - a.candidate.perfume.popularity_score;
    });
}
