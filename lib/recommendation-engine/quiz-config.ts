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

type QuizQuestionKind = "single" | "multi" | "hybrid" | "pill";

interface BaseQuizQuestion<T extends QuestionId, V extends string> {
  id: T;
  kind: QuizQuestionKind;
  options: readonly V[];
  maxSelections?: number;
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

  book_and_blanket: "Book and blanket, withdraw from the world",
  brunch: "Long brunch & hang out with friends",
  cozy_social: "Cozy social gathering",
  home_reset: "Home reset — cleaning, organising",
  museum: "Museum or gallery wandering",
  nightlife: "Late night social",
  outdoor: "Hiking or outdoor adventure",
  roadtrip: "Spontaneous road trip",
  solo_cafe: "Cozy solo project in a cafe",

  anya_taylor_joy: "Anya Taylor-Joy (Dark academia, poetic)",
  robert_pattinson: "Robert Pattinson (Dark academia, poetic)",
  theo_james: "Theo James (Elegant, refined)",
  song_hye_kyo: "Song Hye Kyo (Elegant, refined)",
  asap_rocky: "A$AP Rocky (Streetwear, off-duty cool)",
  bella_hadid: "Bella Hadid (Streetwear, off-duty cool)",
  hailey_bieber: "Hailey Bieber (Raw, minimal)",
  tom_hardy: "Tom Hardy (Raw, minimal)",
  kim_go_eun: "Kim Go Eun (Quiet, gentle, intellectual)",
  gong_yoo: "Gong Yoo (Quiet, gentle, intellectual)",
  billie_eilish: "Billie Eilish (Rebel, introspective, edgy)",
  g_dragon: "G-Dragon (Rebel, introspective, edgy)",
  dakota_johnson: "Dakota Johnson (Effortless chic, European)",
  jacob_elordi: "Jacob Elordi (Effortless chic, European)",
  wonyoung: "Wonyoung (Sweet romantic, dreamy)",
  cha_eun_woo: "Cha Eun Woo (Sweet romantic, dreamy)",
  rose_park: "Rosé (Soft glow, girl/boyfriend material)",
  hua_quang_han: "Hứa Quang Hán (Soft glow, girl/boyfriend material)",
  monica_bellucci: "Monica Bellucci (Sensual, slow-burn)",
  austin_butler: "Austin Butler (Sensual, slow-burn)",
  zoe_kravitz: "Zoë Kravitz (Artsy, indie, relaxed)",
  brad_pitt: "Brad Pitt (Artsy, indie, relaxed)",
  zendaya: "Zendaya (Modern, confident)",
  harry_styles: "Harry Styles (Modern, confident)",

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
  rusty: "Rusty, rugged",
  dark_academia: "Dark academia",
  sensual_glamour: "Sensual glamour",
  retro_chic: "Retro, grandpa style",
  urban_modern: "Urban modern",
  smart_casual: "Smart casual",
  refined_office: "Refined office",

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

export const QUIZ_CONFIG: readonly QuizQuestion[] = [     //entry point of quiz type for UI design
  { id: "gender_pref", kind: "single", options: GENDER_PREFS },
  { id: "use_case", kind: "single", options: USE_CASES },
  { id: "mood", kind: "single", options: MOODS },
  { id: "scent_type", kind: "multi", maxSelections: 2, options: SCENT_TYPES },
  { id: "dislike_note", kind: "multi", options: DISLIKE_NOTES },
  { id: "weekend_vibe", kind: "single", options: WEEKEND_VIBES }, // user asked for Q3 and Q7, checking others
  { id: "style_icon", kind: "single", options: STYLE_ICONS },
  { id: "mbti", kind: "pill", options: MBTI_TYPES },
  { id: "music", kind: "single", options: MUSIC_GENRES },
  { id: "closet_aesthetic", kind: "hybrid", maxSelections: 2, options: CLOSET_AESTHETICS },
  { id: "rising_sign", kind: "pill", options: RISING_SIGNS },
  { id: "budget", kind: "single", options: BUDGET_TIERS },
] as const;

export const QUIZ_QUESTION_IDS: readonly QuestionId[] = QUESTION_IDS;
