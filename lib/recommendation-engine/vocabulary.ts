4/**
 * vocabulary.ts
 * Source of truth for all controlled enum values used across the
 * Scent Statement Finder recommendation engine.
 *
 * Every dataset field that references signals, descriptors, or any
 * categorical value MUST only use values from this file.
 * No free-text allowed. No invented values.
 * Do not mix signal vocabulary with descriptor vocabulary.
 *
 * Auto-generated from vocabulary.md — do not edit manually.
 */

// ---------------------------------------------------------------------------
// SIGNAL — 26 values
// Identity, personality, and aesthetic dimensions.
// Used in: perfume.style_tags, archetype.signals, quiz_option_mapping.signals,
//          descriptor_signal_map.signals, user.signals
// NOTE: "clean" and "fresh" are DESCRIPTOR values — never signals.
// ---------------------------------------------------------------------------

export const SIGNALS = [
  "romantic",
  "minimal",
  "bold",
  "soft",
  "confident",
  "effortless",
  "nostalgic",
  "playful",
  "grounded",
  "introspective",
  "edgy",
  "sensual",
  "intellectual",
  "free_spirited",
  "elegant",
  "mysterious",
  "warm",
  "cool",
  "vintage",
  "modern",
  "cozy",
  "enigmatic",
  "menacing",
  "easy_going",
  "sophisticated",
  "glamorous",
] as const;

export type Signal = (typeof SIGNALS)[number];

// ---------------------------------------------------------------------------
// DESCRIPTOR — 25 values
// Scent characteristics.
// Used in: perfume.descriptors, descriptor_signal_map.descriptor,
//          descriptor_signal_map.adjacent[], user.descriptors,
//          user.descriptors_adjacent
// ---------------------------------------------------------------------------

export const DESCRIPTORS = [
  "fresh",
  "clean",
  "floral",
  "powdery",
  "woody",
  "sweet",
  "citrus",
  "green",
  "smoky",
  "musky",
  "aquatic",
  "gourmand",
  "spicy",
  "resin",
  "leather",
  "tobacco",
  "iris",
  "rose",
  "jasmine",
  "vanilla",
  "amber",
  "oud",
  "bergamot",
  "vetiver",
  "sandalwood",
] as const;

export type Descriptor = (typeof DESCRIPTORS)[number];

// ---------------------------------------------------------------------------
// GENDER TAG — 3 values
// Gender orientation of a perfume.
// Used in: perfume.gender_tags, user.gender_pref
// ---------------------------------------------------------------------------

export const GENDER_TAGS = ["feminine", "masculine", "unisex"] as const;

export type GenderTag = (typeof GENDER_TAGS)[number];

// ---------------------------------------------------------------------------
// USE CASE — 7 values
// Recommended occasion / context.
// Used in: perfume.use_cases, user.use_case
// ---------------------------------------------------------------------------

export const USE_CASES = [
  "office",
  "daily_casual",
  "evening",
  "outdoor_sporty",
  "special_occasion",
  "travel",
  "home_body",
] as const;

export type UseCase = (typeof USE_CASES)[number];

// ---------------------------------------------------------------------------
// GENDER PREF — 3 values
// User's scent preference selection from the quiz.
// Maps directly to user.gender_pref.
// ---------------------------------------------------------------------------

export const GENDER_PREFS = ["feminine", "masculine", "unisex"] as const;

export type GenderPref = (typeof GENDER_PREFS)[number];

// ---------------------------------------------------------------------------
// SCENT TYPE — 6 options
// Moodboard image selection (Q4).
// Each value maps directly to descriptors in user.descriptors[].
// ---------------------------------------------------------------------------

export const SCENT_TYPES = [
  "fresh_airy",
  "warm_cozy",
  "floral_feminine",
  "dark_mysterious",
  "clean_minimal",
  "earthy_natural",
] as const;

export type ScentType = (typeof SCENT_TYPES)[number];

export const SCENT_TYPE_DESCRIPTOR_MAP: Record<ScentType, Descriptor[]> = {  // need more diverse 
  fresh_airy: ["fresh", "aquatic"],
  warm_cozy: ["vanilla", "amber"],
  floral_feminine: ["floral", "powdery"],
  dark_mysterious: ["smoky", "oud"],
  clean_minimal: ["clean", "musky"],
  earthy_natural: ["woody", "vetiver"],
};

// ---------------------------------------------------------------------------
// DISLIKE NOTE — 8 options
// Multi-select hard exclusion filter (Q5).
// Maps to descriptors used against perfume.top_notes / heart_notes / base_notes.
// ---------------------------------------------------------------------------

export const DISLIKE_NOTES = [
  "heavy_floral",
  "sweet_gourmand",
  "smoky_tobacco_spicy",
  "incense_resin",
  "aquatic_soapy",
  "fruity_citrus",
  "earthy_wet_wood",
  "musk",
] as const;

export type DislikeNote = (typeof DISLIKE_NOTES)[number];

export const DISLIKE_NOTE_DESCRIPTOR_MAP: Record<DislikeNote, Descriptor[]> = {
  heavy_floral: ["floral", "powdery", "rose", "jasmine"],
  sweet_gourmand: ["sweet", "gourmand", "vanilla"],
  smoky_tobacco_spicy: ["smoky", "tobacco", "leather", "spicy"],
  incense_resin: ["oud", "resin"],
  aquatic_soapy: ["aquatic", "clean", "fresh"],
  fruity_citrus: ["citrus", "bergamot"],
  earthy_wet_wood: ["vetiver", "woody"],
  musk: ["musky"],
};

// ---------------------------------------------------------------------------
// CLOSET AESTHETIC — 10 values
// Single-select identity question (Q10).
// Maps to signals via quiz option mapping.
// ---------------------------------------------------------------------------

export const CLOSET_AESTHETICS = [
  "cottage_core",
  "streetwear_hiphop",
  "modern_parisian_chic",
  "y2k_trendy",
  "scandinavian_minimal",
  "old_money_european",
  "clean_sporty",
  "experimental",
  "dark_academia",
  "sensual_glamour",
] as const;

export type ClosetAesthetic = (typeof CLOSET_AESTHETICS)[number];

// ---------------------------------------------------------------------------
// MUSIC — 12 values
// Genre picker selection (Q9). Primary input; maps to signals via quiz option mapping.
// Free-text fallback (song/artist name) routes through AI Layer B.
// ---------------------------------------------------------------------------

export const MUSIC_GENRES = [
  "pop",
  "indie",
  "rnb_soul",
  "jazz",
  "classical",
  "kpop",
  "hiphop",
  "electronic",
  "folk_acoustic",
  "alternative",
  "latin",
  "musical_theatre",
] as const;

export type MusicGenre = (typeof MUSIC_GENRES)[number];

// ---------------------------------------------------------------------------
// WEEKEND VIBE — 8 values
// Single-select lifestyle question (Q6).
// Maps to signals via quiz option mapping.
// ---------------------------------------------------------------------------

export const WEEKEND_VIBES = [
  "cozy_solo_cafe",
  "museum_gallery",
  "hiking_outdoor",
  "long_brunch",
  "home_reset",
  "spontaneous_road_trip",
  "book_blanket_hermit",
  "late_night_social",
] as const;

export type WeekendVibe = (typeof WEEKEND_VIBES)[number];

// ---------------------------------------------------------------------------
// MOOD — 7 values
// Single-select identity question (Q3).
// Maps to 2–3 signals each; highest weight alongside style_icon.
// ---------------------------------------------------------------------------

export const MOODS = [
  "complicated_seductive_intellectual",
  "soft_romantic_nostalgic",
  "bold_confident_present",
  "effortless_cool_woke_up_like_this",
  "playful_warm_unexpected",
  "grounded_calm_quiet_luxury",
  "mysterious_edgy_artistic",
] as const;

export type Mood = (typeof MOODS)[number];

// ---------------------------------------------------------------------------
// STYLE ICON — 22 values
// Predefined selection (Q7). Maps to signals via quiz option mapping.
// "Someone else" free-text routes through AI Layer B.
// ---------------------------------------------------------------------------

export const STYLE_ICONS = [
  "clean_girl",
  "soft_girl_next_door",
  "modern_feminine",
  "effortless_chic",
  "timeless_elegance",
  "classic_bombshell",
  "sporty_glam",
  "boho_indie",
  "rebellious_gen_z",
  "coquette",
  "modern_masculinity",
  "pretty_prince",
  "boy_next_door_casual",
  "mature_low_key",
  "dark_intellectual_male",
  "old_money_masculine",
  "quiet_luxury_feminine",
  "rugged_masculine",
  "street_culture",
  "old_school_menace",
  "candy_girl_first_love",
  "dark_intellectual_female",
] as const;

export type StyleIcon = (typeof STYLE_ICONS)[number];

// ---------------------------------------------------------------------------
// MBTI — 16 types
// Single-select personality question (Q8).
// Each type is decomposed into 4 dimension signals (E/I, S/N, T/F, J/P).
// ---------------------------------------------------------------------------

export const MBTI_TYPES = [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
] as const;

export type MbtiType = (typeof MBTI_TYPES)[number];

export type MbtiDimension = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";

export const MBTI_DIMENSION_SIGNAL_MAP: Record<MbtiDimension, Signal[]> = {
  E: ["bold", "playful", "confident"],
  I: ["introspective", "mysterious"],
  S: ["grounded", "easy_going"],
  N: ["intellectual", "enigmatic"],
  T: ["cool", "sophisticated"],
  F: ["romantic", "warm"],
  J: ["elegant", "sophisticated"],
  P: ["effortless", "free_spirited"],
};

// ---------------------------------------------------------------------------
// RISING SIGN — 12 values
// Single-select question (Q11). 12 standard astrological signs.
// Each sign maps to signals via element mapping.
// ---------------------------------------------------------------------------

export const RISING_SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const;

export type RisingSign = (typeof RISING_SIGNS)[number];

export const RISING_SIGN_SIGNAL_MAP: Record<RisingSign, Signal[]> = {
  aries: ["bold", "confident", "edgy"],
  taurus: ["sensual", "grounded", "elegant"],
  gemini: ["playful", "modern"],
  cancer: ["soft", "romantic", "warm", "cozy"],
  leo: ["glamorous", "confident", "bold"],
  virgo: ["minimal", "sophisticated"],
  libra: ["elegant", "romantic"],
  scorpio: ["mysterious", "introspective", "sensual", "enigmatic"],
  sagittarius: ["free_spirited", "bold", "effortless"],
  capricorn: ["sophisticated", "grounded", "confident"],
  aquarius: ["edgy", "intellectual", "modern"],
  pisces: ["romantic", "soft", "playful"],
};

// ---------------------------------------------------------------------------
// BUDGET_TIERS — quiz Q12 + perfume tier, dùng chung 3 ranges
// Single-select filter (Q12). Maps directly to user.price_range (VND, 50 ml).
// All prices are standardized to 50 ml. Formula: USD retail × 26,000 VND.
export const BUDGET_TIERS = [
  "2_000_000_to_3_500_000",
  "3_500_000_to_5_000_000",
  "over_5_000_000",
] as const;

export type BudgetTier = (typeof BUDGET_TIERS)[number];

// Max value của từng tier — dùng để tính aspirational price ceiling
export const BUDGET_TIER_MAX: Record<BudgetTier, number> = {
  "2_000_000_to_3_500_000": 3_500_000,
  "3_500_000_to_5_000_000": 5_000_000,
  "over_5_000_000": Infinity,
};

// Tier 4 = >5M = premium — boost multiplier trong aspirational scoring
export const PREMIUM_TIER: PerfumeTier = 4;

// PERFUME_TIER — trust từ dataset, map 1-1 với BUDGET_TIERS
// 2 = 2–3.5M / 3 = 3.5–5M / 4 = >5M
export const PERFUME_TIERS = [2, 3, 4] as const;
export type PerfumeTier = (typeof PERFUME_TIERS)[number];

// ---------------------------------------------------------------------------
// ARCHETYPE ID — 11 values
// Unique identifier for each archetype.
// Used in: archetype.id, user.archetype
// ---------------------------------------------------------------------------

export const ARCHETYPE_IDS = [
  "effortless_muse",
  "clean_minimalist",
  "romantic_dreamer",
  "modern_icon",
  "quiet_luxury",
  "dark_intellectual",
  "the_sensualist",
  "edge_walker",
  "free_spirit",
  "sporty_glam",
  "coquette",
] as const;

export type ArchetypeId = (typeof ARCHETYPE_IDS)[number];

export const ARCHETYPE_SIGNAL_MAP: Record<ArchetypeId, Signal[]> = {
  effortless_muse: ["effortless", "cool", "free_spirited"],
  clean_minimalist: ["minimal", "cool", "sophisticated"],
  romantic_dreamer: ["romantic", "soft", "nostalgic"],
  modern_icon: ["bold", "confident", "modern"],
  quiet_luxury: ["elegant", "sophisticated", "grounded"],
  dark_intellectual: ["intellectual", "mysterious", "enigmatic"],
  the_sensualist: ["sensual", "glamorous", "bold"],
  edge_walker: ["edgy", "menacing", "enigmatic"],
  free_spirit: ["free_spirited", "warm", "playful"],
  sporty_glam: ["bold", "easy_going", "cool"],
  coquette: ["playful", "warm", "romantic"],
};

// ---------------------------------------------------------------------------
// QUESTION ID — 12 values
// Canonical identifiers for all 12 quiz questions.
// ---------------------------------------------------------------------------

export const QUESTION_IDS = [
  "gender_pref",
  "use_case",
  "mood",
  "scent_type",
  "dislike_note",
  "weekend_vibe",
  "style_icon",
  "mbti",
  "music",
  "closet_aesthetic",
  "rising_sign",
  "budget",
] as const;

export type QuestionId = (typeof QUESTION_IDS)[number];

// ---------------------------------------------------------------------------
// RECOMMENDATION TYPE — 3 values
// The three recommendation slot identifiers used in result output and scoring.
// ---------------------------------------------------------------------------

export const RECOMMENDATION_TYPES = [
  "rational",
  "aspirational",
  "wildcard",
] as const;

export type RecommendationType = (typeof RECOMMENDATION_TYPES)[number];
