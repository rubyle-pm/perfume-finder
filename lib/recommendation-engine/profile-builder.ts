import type {
  BudgetTier,
  ClosetAesthetic,
  Descriptor,
  DislikeNote,
  GenderPref,
  MbtiType,
  Mood,
  MusicGenre,
  RisingSign,
  ScentType,
  Signal,
  StyleIcon,
  UseCase,
  WeekendVibe,
} from "./vocabulary";
import {
  BUDGET_TIERS,
  CLOSET_AESTHETICS,
  DISLIKE_NOTES,
  DISLIKE_NOTE_DESCRIPTOR_MAP,
  GENDER_PREFS,
  MBTI_DIMENSION_SIGNAL_MAP,
  MBTI_TYPES,
  MOODS,
  MUSIC_GENRES,
  RISING_SIGNS,
  RISING_SIGN_SIGNAL_MAP,
  SCENT_TYPES,
  SCENT_TYPE_DESCRIPTOR_MAP,
  SIGNALS,
  STYLE_ICONS,
  USE_CASES,
  WEEKEND_VIBES,
} from "./vocabulary";
import { signalsToDescriptors } from "./signal-descriptor-map";
import type { UserProfile } from "./types";

export interface QuizAnswers {
  gender_pref?: GenderPref | string;
  use_case?: UseCase | string;
  mood?: Mood | string;
  scent_type?: ScentType | string;
  dislike_note?: DislikeNote[] | DislikeNote | string[] | string;
  weekend_vibe?: WeekendVibe | string;
  style_icon?: StyleIcon | string;
  mbti?: MbtiType | string;
  music?: MusicGenre | string;
  closet_aesthetic?: ClosetAesthetic | string;
  rising_sign?: RisingSign | string;
  budget?: BudgetTier | string;
}

const SIGNAL_WEIGHT = {
  mood: 1.2,
  style_icon: 1.2,
  closet_aesthetic: 1.0,
  weekend_vibe: 0.8,
  mbti: 0.6,
  music: 0.3,
  rising_sign: 0.2,
} as const;

const MAX_PROFILE_SIGNALS = 8;

const MUSIC_SIGNAL_MAP: Record<MusicGenre, Signal[]> = {
  pop: ["playful", "modern"],
  indie: ["nostalgic", "free_spirited", "introspective"],
  rnb_soul: ["sensual", "warm"],
  jazz: ["sophisticated", "warm"],
  classical: ["elegant", "intellectual"],
  kpop: ["playful", "modern"],
  hiphop: ["bold", "cool"],
  electronic: ["edgy", "modern"],
  folk_acoustic: ["grounded", "warm"],
  alternative: ["edgy", "introspective"],
  latin: ["playful", "warm"],
  musical_theatre: ["glamorous", "playful"],
};

const WEEKEND_VIBE_SIGNAL_MAP: Record<WeekendVibe, Signal[]> = {
  cozy_solo_cafe: ["cozy", "introspective"],
  museum_gallery: ["intellectual", "enigmatic"],
  hiking_outdoor: ["grounded", "free_spirited"],
  long_brunch: ["playful", "warm"],
  home_reset: ["minimal", "grounded"],
  spontaneous_road_trip: ["free_spirited", "easy_going"],
  book_blanket_hermit: ["introspective", "nostalgic", "cozy"],
  late_night_social: ["bold", "glamorous"],
};

const CLOSET_SIGNAL_MAP: Record<ClosetAesthetic, Signal[]> = {
  cottage_core: ["romantic", "soft"],
  streetwear_hiphop: ["bold", "edgy"],
  modern_parisian_chic: ["elegant", "effortless"],
  y2k_trendy: ["playful", "modern"],
  scandinavian_minimal: ["minimal", "cool"],
  old_money_european: ["elegant", "sophisticated"],
  clean_sporty: ["easy_going", "cool"],
  experimental: ["edgy", "enigmatic"],
  dark_academia: ["intellectual", "mysterious"],
  sensual_glamour: ["sensual", "glamorous"],
};

const STYLE_ICON_SIGNAL_MAP: Record<StyleIcon, Signal[]> = {
  clean_girl: ["minimal", "soft"],
  soft_girl_next_door: ["soft", "romantic"],
  modern_feminine: ["modern", "elegant"],
  effortless_chic: ["effortless", "elegant"],
  timeless_elegance: ["elegant", "sophisticated"],
  classic_bombshell: ["glamorous", "sensual"],
  sporty_glam: ["bold", "cool"],
  boho_indie: ["free_spirited", "effortless"],
  rebellious_gen_z: ["edgy", "bold"],
  coquette: ["romantic", "playful"],
  modern_masculinity: ["modern", "confident"],
  pretty_prince: ["soft", "elegant"],
  boy_next_door_casual: ["easy_going", "warm"],
  mature_low_key: ["grounded", "sophisticated"],
  dark_intellectual_male: ["mysterious", "intellectual"],
  old_money_masculine: ["sophisticated", "confident"],
  quiet_luxury_feminine: ["elegant", "minimal"],
  rugged_masculine: ["bold", "grounded"],
  street_culture: ["edgy", "cool"],
  old_school_menace: ["menacing", "enigmatic"],
  candy_girl_first_love: ["soft", "playful"],
  dark_intellectual_female: ["mysterious", "intellectual"],
};

const MOOD_SIGNAL_MAP: Record<Mood, Signal[]> = {
  complicated_seductive_intellectual: ["sensual", "intellectual", "mysterious"],
  soft_romantic_nostalgic: ["soft", "romantic", "nostalgic"],
  bold_confident_present: ["bold", "confident", "glamorous"],
  effortless_cool_woke_up_like_this: ["effortless", "cool", "minimal"],
  playful_warm_unexpected: ["playful", "warm", "enigmatic"],
  grounded_calm_quiet_luxury: ["grounded", "introspective", "elegant"],
  mysterious_edgy_artistic: ["mysterious", "edgy", "menacing"],
};

function toSnakeCase(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function pickOne<T extends string>(raw: unknown, allowed: readonly T[]): T | null {
  if (typeof raw !== "string") return null;
  const normalized = toSnakeCase(raw);
  return (allowed as readonly string[]).includes(normalized) ? (normalized as T) : null;
}

function pickMany<T extends string>(raw: unknown, allowed: readonly T[]): T[] {
  if (!raw) return [];
  const values = Array.isArray(raw) ? raw : [raw];
  const out: T[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const picked = pickOne(value, allowed);
    if (!picked || seen.has(picked)) continue;
    seen.add(picked);
    out.push(picked);
  }
  return out;
}

function addSignals(
  score: Map<Signal, number>,
  signals: readonly Signal[],
  weight: number,
): void {
  for (const signal of signals) {
    score.set(signal, (score.get(signal) ?? 0) + weight);
  }
}

function mbtiSignals(mbti: MbtiType): Signal[] {
  const dimensions = mbti.split("") as Array<keyof typeof MBTI_DIMENSION_SIGNAL_MAP>;
  const out: Signal[] = [];
  const seen = new Set<Signal>();
  for (const key of dimensions) {
    const signals = MBTI_DIMENSION_SIGNAL_MAP[key] ?? [];
    for (const signal of signals) {
      if (seen.has(signal)) continue;
      seen.add(signal);
      out.push(signal);
    }
  }
  return out;
}

export function buildUserProfile(answers: QuizAnswers): UserProfile {
  const genderPref =
    pickOne(answers.gender_pref, GENDER_PREFS) ?? GENDER_PREFS[GENDER_PREFS.length - 1];
  const useCase = pickOne(answers.use_case, USE_CASES) ?? USE_CASES[0];
  const priceRange = pickOne(answers.budget, BUDGET_TIERS) ?? BUDGET_TIERS[0];

  const scentType = pickOne(answers.scent_type, SCENT_TYPES);
  const scentTypeDescriptors: Descriptor[] = scentType
    ? [...SCENT_TYPE_DESCRIPTOR_MAP[scentType]]
    : [];

  const dislikeNotes = pickMany(answers.dislike_note, DISLIKE_NOTES);
  const scentDislikes = Array.from(
    new Set(dislikeNotes.flatMap((key) => DISLIKE_NOTE_DESCRIPTOR_MAP[key])),
  );

  const score = new Map<Signal, number>();

  const mood = pickOne(answers.mood, MOODS);
  const moodSignals = mood ? MOOD_SIGNAL_MAP[mood] : [];
  if (moodSignals.length > 0) addSignals(score, moodSignals, SIGNAL_WEIGHT.mood);

  const weekend = pickOne(answers.weekend_vibe, WEEKEND_VIBES);
  const weekendSignals = weekend ? WEEKEND_VIBE_SIGNAL_MAP[weekend] : [];
  if (weekendSignals.length > 0) addSignals(score, weekendSignals, SIGNAL_WEIGHT.weekend_vibe);

  const styleIcon = pickOne(answers.style_icon, STYLE_ICONS);
  const styleSignals = styleIcon ? STYLE_ICON_SIGNAL_MAP[styleIcon] : [];
  if (styleSignals.length > 0) addSignals(score, styleSignals, SIGNAL_WEIGHT.style_icon);

  const music = pickOne(answers.music, MUSIC_GENRES);
  let musicSignals: Signal[] = [];
  if (music) {
    musicSignals = MUSIC_SIGNAL_MAP[music];
    addSignals(score, musicSignals, SIGNAL_WEIGHT.music);
  }

  const closet = pickOne(answers.closet_aesthetic, CLOSET_AESTHETICS);
  const closetSignals = closet ? CLOSET_SIGNAL_MAP[closet] : [];
  if (closetSignals.length > 0) addSignals(score, closetSignals, SIGNAL_WEIGHT.closet_aesthetic);

  const mbti = pickOne(answers.mbti, MBTI_TYPES);
  const mbtiResolvedSignals = mbti ? mbtiSignals(mbti) : [];
  if (mbtiResolvedSignals.length > 0) addSignals(score, mbtiResolvedSignals, SIGNAL_WEIGHT.mbti);

  const risingSign = pickOne(answers.rising_sign, RISING_SIGNS);
  let risingSignSignals: Signal[] = [];
  if (risingSign) {
    risingSignSignals = RISING_SIGN_SIGNAL_MAP[risingSign];
    addSignals(score, risingSignSignals, SIGNAL_WEIGHT.rising_sign);
  }

  const signals = Array.from(score.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return SIGNALS.indexOf(a[0]) - SIGNALS.indexOf(b[0]);
    })
    .slice(0, MAX_PROFILE_SIGNALS)
    .map(([signal]) => signal);

  const signalDerivedDescriptors = signalsToDescriptors(signals);
  const derivedDescriptors = Array.from(
    new Set([...scentTypeDescriptors, ...signalDerivedDescriptors]),
  ).slice(0, 8);

  return {
    price_range: priceRange,
    scent_type: scentTypeDescriptors,
    derived_descriptors: derivedDescriptors,
    scent_dislikes: scentDislikes,
    gender_pref: genderPref,
    use_case: useCase,
    signals,
    mood_signals: moodSignals,
    style_signals: styleSignals,
    music_signals: musicSignals,
    rising_sign_signals: risingSignSignals,
    closet_aesthetic_signals: closetSignals,
    mbti_signals: mbtiResolvedSignals,
  };
}
