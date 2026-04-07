import type {
  BudgetTier,
  Descriptor,
  GenderPref,
  GenderTag,
  PerfumeTier,
  RecommendationType,
  Signal,
  UseCase,
} from "./vocabulary";

import { SIGNALS, DESCRIPTORS, USE_CASES } from "./vocabulary";

// ---------------------------------------------------------------------------
// NORMALIZATION UTILS
// Boundary layer: raw JSON → strictly typed engine values
// toSnakeCase covers format variants (hyphens, spaces, slashes, mixed case)
// Unknown values are dropped with a dev warning — never silently scored as 0
// ---------------------------------------------------------------------------

function toSnakeCase(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

export function normalizeSignal(raw: string): Signal | null {
  const normalized = toSnakeCase(raw);
  if (SIGNALS.includes(normalized as Signal)) return normalized as Signal;
  if (process.env.NODE_ENV !== "production")
    console.warn(`[vocab] Unknown signal: "${raw}" → "${normalized}"`);
  return null;
}

export function normalizeDescriptor(raw: string): Descriptor | null {
  const normalized = toSnakeCase(raw);
  if (normalized === "soft") return "powdery";
  if (DESCRIPTORS.includes(normalized as Descriptor)) return normalized as Descriptor;
  if (process.env.NODE_ENV !== "production")
    console.warn(`[vocab] Unknown descriptor: "${raw}" → "${normalized}"`);
  return null;
}

export function normalizeUseCase(raw: string): UseCase | null {
  const normalized = toSnakeCase(raw);
  if (USE_CASES.includes(normalized as UseCase)) return normalized as UseCase;
  if (process.env.NODE_ENV !== "production")
    console.warn(`[vocab] Unknown use_case: "${raw}" → "${normalized}"`);
  return null;
}

// ---------------------------------------------------------------------------
// NORMALIZED PERFUME — engine-ready shape
// Strictly typed, validated, and ready for scoring
// ---------------------------------------------------------------------------  

export interface Perfume {
  id: string;
  name: string;
  brand: string;
  price_vnd: number;
  tier: PerfumeTier;
  family_primary: string;
  family_secondary?: string | null;
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  descriptors: Descriptor[];
  use_cases: UseCase[];
  style_tags: Signal[];
  gender_tags: GenderTag[];
  popularity_score: number;
  // UI display fields — not used by scoring engine
  concentration?: string;
  volume_ml?: number;
  size_variant_of?: string | null;
}

export function normalizePerfume(raw: any): Perfume {      // NORMALIZE JSON → normalized Perfume
  const rawDescriptors = Array.isArray(raw.descriptors) ? raw.descriptors : [];
  const expandedRawDescriptors = rawDescriptors.flatMap((descriptor: string) =>
    toSnakeCase(descriptor) === "soft" ? ["powdery", "floral"] : [descriptor],
  );
  const normalizedDescriptors = Array.from(
    new Set(expandedRawDescriptors.map(normalizeDescriptor).filter(Boolean) as Descriptor[]),
  );

  return {
    id: raw.id,
    name: raw.name,
    brand: raw.brand,
    price_vnd: raw.price_vnd,
    tier: raw.tier as PerfumeTier,
    family_primary: raw.family_primary,
    family_secondary: raw.family_secondary ?? null,
    top_notes: raw.top_notes,
    heart_notes: raw.heart_notes,
    base_notes: raw.base_notes,
    descriptors: normalizedDescriptors,
    use_cases: raw.use_cases.map(normalizeUseCase).filter(Boolean) as UseCase[],
    style_tags: raw.style_tags.map(normalizeSignal).filter(Boolean) as Signal[],
    gender_tags: raw.gender_tags as GenderTag[],
    popularity_score: raw.popularity_score,
    concentration: raw.concentration,
    volume_ml: raw.volume_ml,
    size_variant_of: raw.size_variant_of ?? null,
  };
}

// ---------------------------------------------------------------------------
// USER PROFILE — input to scoring, matches quiz answers
// ---------------------------------------------------------------------------  

export interface UserProfile {
  price_range: BudgetTier;
  scent_type: Descriptor[];
  derived_descriptors: Descriptor[];
  scent_dislikes: Descriptor[];
  gender_pref: GenderPref;
  use_case: UseCase;
  // Canonical scoring representation: all overlap scoring should use this.
  signals: Signal[];
  // Source-level debug metadata, still in the same Signal vocabulary.
  mood_signals: Signal[];
  style_signals: Signal[];
  music_signals: Signal[];
  rising_sign_signals: Signal[];
  closet_aesthetic_signals: Signal[];
  mbti_signals: Signal[];
}

// ---------------------------------------------------------------------------
// RECOMMENDATION CANDIDATE — one perfume with scoring metadata
// ---------------------------------------------------------------------------  

export interface RecommendationMatchSignals {
  descriptors?: Descriptor[];
  signals?: Signal[];
  use_case?: UseCase;
}

export interface RecommendationCandidate {
  type: RecommendationType;
  perfume: Perfume;
  score: number;
  matchSignals: RecommendationMatchSignals;
}

export interface RecommendationScoreBreakdown {
  type: RecommendationType;
  total: number;
  descriptor_match?: number;
  use_case_match?: number;
  mbti_match?: number;
  mood_match?: number;
  signal_match?: number;
  premium_factor?: number;
  adjacent_score?: number;
  music_signal_match?: number;
  novelty?: number;
  unisex_bonus?: number;
}

export interface RecommendationResult {
  topPick: RecommendationCandidate;
  alternatives: RecommendationCandidate[];
  explanation: string;
  scoreBreakdown: RecommendationScoreBreakdown[];
}
