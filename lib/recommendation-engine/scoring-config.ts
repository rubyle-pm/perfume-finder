import { Music } from "lucide-react"

export const SCORING_WEIGHTS = {

  rational: {
    descriptor: 0.4,
    use_case: 0.3,
    mbti: 0.2,
    mood: 0.1,
  },

  aspirational: {
    descriptor: 0.3,
    style_signal: 0.3,
    premium: 0.3,
  },

  wildcard: {
    adjacent: 0.4,
    descriptor: 0.2,
    music: 0.1,
    novelty: 0.3,
  }

} as const

export const MIN_SCORE_TO_SHOW = 0.25
export const FALLBACK_THRESHOLD = 0.25
