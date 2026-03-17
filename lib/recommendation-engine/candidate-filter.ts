import type { Perfume, UserProfile } from "./types";
import type { RecommendationType } from "./vocabulary";
import { BUDGET_TIER_MAX } from "./vocabulary";

function normalize(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function normalizeDescriptorAliases(raw: string): string[] {
  const normalized = normalize(raw);
  if (normalized === "soft") return ["powdery", "floral"];
  return [normalized];
}

function priceCeiling(profile: UserProfile, type: RecommendationType): number {
  const baseMax = BUDGET_TIER_MAX[profile.price_range];
  if (!Number.isFinite(baseMax)) return Number.POSITIVE_INFINITY;
  if (type === "aspirational") return baseMax * 1.3;
  return baseMax;
}

function matchGender(perfume: Perfume, profile: UserProfile): boolean {
  const tags = new Set(perfume.gender_tags);
  if (profile.gender_pref === "unisex") return tags.has("unisex");
  return tags.has(profile.gender_pref) || tags.has("unisex");
}

function hasDislikedNote(perfume: Perfume, profile: UserProfile): boolean {
  if (profile.scent_dislikes.length === 0) return false;
  const blocked = new Set(profile.scent_dislikes.flatMap((d) => normalizeDescriptorAliases(d)));
  const notes = [
    ...perfume.top_notes,
    ...perfume.heart_notes,
    ...perfume.base_notes,
    ...perfume.descriptors,
  ].flatMap((note) => normalizeDescriptorAliases(note));
  return notes.some((n) => blocked.has(n));
}

export interface FilterOptions {
  minCandidates?: number;
  maxCandidates?: number;
  ignoreDislikes?: boolean;
}

export function filterCandidates(
  perfumes: Perfume[],
  profile: UserProfile,
  type: RecommendationType,
  options: FilterOptions = {},
): Perfume[] {
  const minCandidates = options.minCandidates ?? Math.min(8, perfumes.length);
  const maxCandidates = options.maxCandidates ?? 40;
  const ignoreDislikes = options.ignoreDislikes ?? false;
  const ceiling = priceCeiling(profile, type);

  let filtered = perfumes.filter((perfume) => {
    if (!matchGender(perfume, profile)) return false;
    if (perfume.price_vnd > ceiling) return false;
    if (!ignoreDislikes && hasDislikedNote(perfume, profile)) return false;
    return true;
  });

  // If strict disliked-note filtering makes pool too small, relax that filter.
  if (!ignoreDislikes && filtered.length < minCandidates) {
    filtered = perfumes.filter((perfume) => {
      if (!matchGender(perfume, profile)) return false;
      if (perfume.price_vnd > ceiling) return false;
      return true;
    });
  }

  if (filtered.length <= maxCandidates) return filtered;
  return filtered
    .slice()
    .sort((a, b) => b.popularity_score - a.popularity_score)
    .slice(0, maxCandidates);
}
