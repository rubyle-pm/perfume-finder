import { Music } from "lucide-react"

export const SCORING_WEIGHTS = {

  rational: {
    descriptor: 0.4,
    use_case: 0.3,
    mbti: 0.2,
  },

  aspirational: {
    descriptor: 0.3,
    style_signal: 0.2,
    premium: 0.3,
    mood: 0.2,
  },

  wildcard: {
    adjacent: 0.4,
    descriptor: 0.1,
    music: 0.2,
    novelty: 0.3,
  }

} as const

export const MIN_SCORE_TO_SHOW = 0.25
export const FALLBACK_THRESHOLD = 0.25
