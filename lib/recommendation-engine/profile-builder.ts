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
  scent_type?: ScentType[] | ScentType | string[] | string;  // now multi (max 2)
  dislike_note?: DislikeNote[] | DislikeNote | string[] | string;
  weekend_vibe?: WeekendVibe | string;
  style_icon?: StyleIcon[] | StyleIcon | string[] | string;  // now multi (max 2)
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
  book_and_blanket: ["introspective", "nostalgic", "cozy"],
  brunch: ["playful", "warm"],
  cozy_social: ["warm", "easy_going", "cozy", "playful"],
  home_reset: ["minimal", "grounded"],
  museum: ["intellectual", "enigmatic"],
  nightlife: ["easy_going", "free_spirited"],
  outdoor: ["grounded", "free_spirited"],
  roadtrip: ["free_spirited", "easy_going"],
  solo_cafe: ["cozy", "introspective"],
};

const CLOSET_SIGNAL_MAP: Record<ClosetAesthetic, Signal[]> = {
  cottage_core: ["romantic", "soft"],
  streetwear_hiphop: ["bold", "edgy"],
  modern_parisian_chic: ["elegant", "effortless"],
  y2k_trendy: ["playful", "modern"],
  scandinavian_minimal: ["minimal", "cool"],
  old_money_european: ["elegant", "sophisticated"],
  clean_sporty: ["easy_going", "cool"],
  rusty: ["grounded", "edgy"],
  dark_academia: ["intellectual", "mysterious"],
  sensual_glamour: ["sensual", "glamorous"],
  retro_chic: ["playful", "vintage"],
  urban_modern: ["modern", "confident"],
  smart_casual: ["easy_going", "minimal"],
  refined_office: ["sophisticated", "minimal"],
};

const STYLE_ICON_SIGNAL_MAP: Record<StyleIcon, Signal[]> = {
  anya_taylor_joy: ["intellectual", "mysterious", "enigmatic"],
  robert_pattinson: ["intellectual", "mysterious", "enigmatic"],
  theo_james: ["elegant", "sophisticated", "grounded"],
  song_hye_kyo: ["elegant", "sophisticated", "grounded"],
  asap_rocky: ["bold", "cool", "edgy"],
  bella_hadid: ["bold", "cool", "edgy"],
  hailey_bieber: ["minimal", "cool", "modern"],
  tom_hardy: ["grounded", "minimal", "menacing"],
  kim_go_eun: ["intellectual", "grounded", "minimal"],
  gong_yoo: ["intellectual", "grounded", "minimal"],
  billie_eilish: ["edgy", "bold", "introspective"],
  g_dragon: ["edgy", "bold", "introspective"],
  dakota_johnson: ["effortless", "elegant", "cool"],
  jacob_elordi: ["effortless", "elegant", "cool"],
  wonyoung: ["romantic", "soft", "playful"],
  cha_eun_woo: ["romantic", "soft", "playful"],
  rose_park: ["soft", "warm", "modern"],
  hua_quang_han: ["soft", "warm", "modern"],
  monica_bellucci: ["sensual", "glamorous", "bold", "warm"],
  austin_butler: ["sensual", "glamorous", "bold", "warm"],
  zoe_kravitz: ["free_spirited", "playful", "artistic" as any], // Adding artistic if it exists, otherwise similar signals
  brad_pitt: ["free_spirited", "effortless", "grounded"],
  zendaya: ["bold", "confident", "modern"],
  harry_styles: ["bold", "confident", "modern"],
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

  // scent_type: now multi-select (max 2) — merge descriptor arrays
  const scentTypes = pickMany(answers.scent_type, SCENT_TYPES);
  const scentTypeDescriptors: Descriptor[] = Array.from(
    new Set(scentTypes.flatMap((st) => SCENT_TYPE_DESCRIPTOR_MAP[st])),
  );

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

  // style_icon: now multi-select (max 2) — merge signal arrays
  const styleIcons = pickMany(answers.style_icon, STYLE_ICONS);
  const styleSignals = Array.from(
    new Set(styleIcons.flatMap((si) => STYLE_ICON_SIGNAL_MAP[si])),
  ) as Signal[];
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
