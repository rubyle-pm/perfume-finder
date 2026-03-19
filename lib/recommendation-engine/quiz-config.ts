import type {
  BudgetTier,
  ClosetAesthetic,
  DislikeNote,
  GenderPref,
  MbtiType,
  Mood,
  MusicGenre,
  QuestionId,
  RisingSign,
  ScentType,
  StyleIcon,
  UseCase,
  WeekendVibe,
} from "./vocabulary";
import {
  BUDGET_TIERS,
  CLOSET_AESTHETICS,
  DISLIKE_NOTES,
  GENDER_PREFS,
  MBTI_TYPES,
  MOODS,
  MUSIC_GENRES,
  QUESTION_IDS,
  RISING_SIGNS,
  SCENT_TYPES,
  STYLE_ICONS,
  USE_CASES,
  WEEKEND_VIBES,
} from "./vocabulary";

type QuizQuestionKind = "single" | "multi" | "hybrid";

interface BaseQuizQuestion<T extends QuestionId, V extends string> {
  id: T;
  kind: QuizQuestionKind;
  options: readonly V[];
}

export type QuizQuestion =
  | BaseQuizQuestion<"gender_pref", GenderPref>
  | BaseQuizQuestion<"use_case", UseCase>
  | BaseQuizQuestion<"mood", Mood>
  | BaseQuizQuestion<"scent_type", ScentType>
  | BaseQuizQuestion<"dislike_note", DislikeNote>
  | BaseQuizQuestion<"weekend_vibe", WeekendVibe>
  | BaseQuizQuestion<"style_icon", StyleIcon>
  | BaseQuizQuestion<"mbti", MbtiType>
  | BaseQuizQuestion<"music", MusicGenre>
  | BaseQuizQuestion<"closet_aesthetic", ClosetAesthetic>
  | BaseQuizQuestion<"rising_sign", RisingSign>
  | BaseQuizQuestion<"budget", BudgetTier>;

type DisplayLabelValue =
  | GenderPref
  | UseCase
  | Mood
  | ScentType
  | DislikeNote
  | WeekendVibe
  | StyleIcon
  | MusicGenre
  | ClosetAesthetic
  | RisingSign
  | BudgetTier;

export const DISPLAY_LABELS: Record<DisplayLabelValue, string> = {   // UI option display
  feminine: "Feminine",
  masculine: "Masculine",
  unisex: "Unisex",

  office: "At work, office",
  daily_casual: "Daily, casual wear",
  evening: "Date night or hanging out late",
  outdoor_sporty: "Outdoor, being active or sporty",
  special_occasion: "Special social occasions",
  travel: "Traveling",
  home_body: "At home, comfy in my skin",

  complicated_seductive_intellectual: "Complicated, seductive yet intellectual",
  soft_romantic_nostalgic: "Soft, romantic, may be a little nostalgic",
  bold_confident_present: "Bold, confident, unapologetically present",
  effortless_cool_woke_up_like_this: "Effortless, cool, like you woke up like this",
  playful_warm_unexpected: "Playful, warm, and a bit unexpected",
  grounded_calm_quiet_luxury: "Grounded, calm, with quiet luxury aura",
  mysterious_edgy_artistic: "Mysterious, edgy, sometimes with a artistic edge",

  fresh_airy: "Fresh & airy",
  warm_cozy: "Warm & cozy",
  floral_feminine: "Floral & feminine",
  dark_mysterious: "Dark & mysterious",
  clean_minimal: "Clean & minimal",
  earthy_natural: "Earthy & natural",

  heavy_floral: "Heavy floral",
  sweet_gourmand: "Sweet, like candy or pastry",
  smoky_tobacco_spicy: "Smoky, tobacco, or spicy",
  incense_resin: "Incense & resin, aromatherapy",
  aquatic_soapy: "Aquatic or soapy",
  fruity_citrus: "Fruity & citrus",
  earthy_wet_wood: "Earthy, wet wood",
  musk: "Musk",

  cozy_solo_cafe: "Cozy solo project in a cafe",
  museum_gallery: "Museum or gallery wandering",
  hiking_outdoor: "Hiking or outdoor adventure",
  long_brunch: "Long brunch & hang out with friends",
  home_reset: "Home reset — cleaning, organising",
  spontaneous_road_trip: "Spontaneous road trip",
  book_blanket_hermit: "Book and blanket, withdraw from the world",
  late_night_social: "Late night social, out till 1am",

  clean_girl: "Clean girl — Hailey Bieber",
  soft_girl_next_door: "Soft, girl-next-door — Rosé",
  modern_feminine: "Modern feminine — Zendaya",
  effortless_chic: "Effortless chic — Dakota Johnson",
  timeless_elegance: "Timeless elegance — Audrey Hepburn",
  classic_bombshell: "Classic bombshell — Monica Bellucci",
  sporty_glam: "Sporty glam — Bella Hadid",
  boho_indie: "Boho indie — Zoë Kravitz",
  rebellious_gen_z: "Rebellious, Gen Z — Billie Eilish",
  coquette: "Coquette — Elle Fanning",
  modern_masculinity: "Modern masculinity — Timothée Chalamet / Harry Styles",
  pretty_prince: "Pretty prince — Cha Eun Woo",
  boy_next_door_casual: "Boy-next-door, casual — Hứa Quang Hán",
  mature_low_key: "Mature, low-key — Gong Yoo",
  dark_intellectual_male: "Dark intellectual — Robert Pattinson",
  old_money_masculine: "Old money masculine — Theo James",
  quiet_luxury_feminine: "Quiet luxury feminine — Song Hye Kyo",
  rugged_masculine: "Rugged masculine — Tom Hardy",
  street_culture: "Street culture — A$AP Rocky",
  old_school_menace: "Old-school menace — Cillian Murphy as Thomas Shelby",
  candy_girl_first_love: "Candy girl, first love — Wonyoung",
  dark_intellectual_female: "Dark intellectual — Anya Taylor-Joy",

  pop: "Pop",
  indie: "Indie",
  rnb_soul: "R&B / Soul",
  jazz: "Jazz",
  classical: "Classical",
  kpop: "K-pop",
  hiphop: "Hip-hop",
  electronic: "Electronic",
  folk_acoustic: "Folk / Acoustic",
  alternative: "Alternative",
  latin: "Latin",
  musical_theatre: "Musical Theatre",

  cottage_core: "Cottage core",
  streetwear_hiphop: "Streetwear / Hip-hop",
  modern_parisian_chic: "Modern Parisian chic",
  y2k_trendy: "Y2K and trendy",
  scandinavian_minimal: "Scandinavian minimal",
  old_money_european: "Old money / European elegant",
  clean_sporty: "Clean & sporty",
  experimental: "Experimental",
  dark_academia: "Dark academia",
  sensual_glamour: "Sensual glamour",

  aries: "Aries",
  taurus: "Taurus",
  gemini: "Gemini",
  cancer: "Cancer",
  leo: "Leo",
  virgo: "Virgo",
  libra: "Libra",
  scorpio: "Scorpio",
  sagittarius: "Sagittarius",
  capricorn: "Capricorn",
  aquarius: "Aquarius",
  pisces: "Pisces",

  "2_000_000_to_3_500_000": "2,000,000 – 3,500,000 VND",
  "3_500_000_to_5_000_000": "3,500,000 – 5,000,000 VND",
  over_5_000_000: "Over 5,000,000 VND",
} as const;

export const QUESTION_DISPLAY: Record<QuestionId, string> = {   //UI quiz display
  gender_pref: "What kind of scent profile are you drawn to?",
  use_case: "When will you wear this fragrance most?",
  mood: "What mood do you want your scent to project?",
  scent_type: "Which kinds of scent do you gravitate toward?",
  dislike_note: "Are there notes you want to avoid?",
  weekend_vibe: "How would you describe your perfect weekend me-time?",
  style_icon: "Who is your style icon?",
  mbti: "What is your MBTI?",
  music: "What's your favourite genre — or a song you're playing on repeat?",
  closet_aesthetic: "How does your staple closet look?",
  rising_sign: "What is your rising sign?",
  budget: "What is your budget for 50ml?",
} as const;

export const QUIZ_CONFIG: readonly QuizQuestion[] = [     //entry point for UI design
  { id: "gender_pref", kind: "single", options: GENDER_PREFS },
  { id: "use_case", kind: "single", options: USE_CASES },
  { id: "mood", kind: "single", options: MOODS },
  { id: "scent_type", kind: "single", options: SCENT_TYPES },
  { id: "dislike_note", kind: "multi", options: DISLIKE_NOTES },
  { id: "weekend_vibe", kind: "single", options: WEEKEND_VIBES },
  { id: "style_icon", kind: "hybrid", options: STYLE_ICONS },
  { id: "mbti", kind: "single", options: MBTI_TYPES },
  { id: "music", kind: "hybrid", options: MUSIC_GENRES },
  { id: "closet_aesthetic", kind: "single", options: CLOSET_AESTHETICS },
  { id: "rising_sign", kind: "single", options: RISING_SIGNS },
  { id: "budget", kind: "single", options: BUDGET_TIERS },
] as const;

export const QUIZ_QUESTION_IDS: readonly QuestionId[] = QUESTION_IDS;
