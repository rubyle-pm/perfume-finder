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

export const QUIZ_CONFIG: readonly QuizQuestion[] = [     //entry point for UI 
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
