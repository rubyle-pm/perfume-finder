import type {
  RecommendationCandidate,
  RecommendationResult,
  RecommendationScoreBreakdown,
  UserProfile,
} from "./types";
import type { ArchetypeId } from "./vocabulary";
import { ARCHETYPE_SIGNAL_MAP } from "./vocabulary";

export interface ResultSlots {
  bestFit: RecommendationCandidate;
  idealMatch: RecommendationCandidate;
  wildcard: RecommendationCandidate;
}

export interface EngineResult extends RecommendationResult {
  slots: ResultSlots;
  topPickArchetype: ArchetypeId | null;
}

function inferTopArchetype(profile: UserProfile): ArchetypeId | null {
  if (profile.signals.length === 0) return null;
  let winner: ArchetypeId | null = null;
  let winnerScore = -1;

  for (const [archetype, signals] of Object.entries(ARCHETYPE_SIGNAL_MAP) as Array<
    [ArchetypeId, readonly string[]]
  >) {
    // Enforce gender constraints to ensure the top pick is gender-appropriate
    if (archetype === "playful_sweetheart" && profile.gender_pref !== "feminine") continue;
    if (archetype === "playful_charmer" && profile.gender_pref === "feminine") continue;
    if (archetype === "modern_icon" && profile.gender_pref === "masculine") continue;

    const hits = signals.filter((s) => profile.signals.includes(s as typeof profile.signals[number]))
      .length;
    const score = hits / signals.length;
    if (score > winnerScore) {
      winner = archetype;
      winnerScore = score;
    }
  }
  return winner;
}

function buildExplanation(slots: ResultSlots): string {
  return [
    `Best Fit: ${slots.bestFit.perfume.name}`,
    `Ideal Match: ${slots.idealMatch.perfume.name}`,
    `Wildcard: ${slots.wildcard.perfume.name}`,
  ].join(" | ");
}

export function buildResult(params: {        //entry point for EngineResult 
  profile: UserProfile;
  slots: ResultSlots;
  scoreBreakdown: RecommendationScoreBreakdown[];
}): EngineResult {
  const { profile, slots, scoreBreakdown } = params;

  return {
    topPick: slots.bestFit,
    alternatives: [slots.idealMatch, slots.wildcard],
    explanation: buildExplanation(slots),
    scoreBreakdown,
    slots,
    topPickArchetype: inferTopArchetype(profile),
  };
}
