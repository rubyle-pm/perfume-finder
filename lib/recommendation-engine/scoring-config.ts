export const SCORING_WEIGHTS = {

    rational: {
      descriptor: 0.4,
      use_case: 0.3,
      mbti: 0.2,
      mood: 0.1,
    },
  
    aspirational: {
      descriptor: 0.4,
      style_signal: 0.3,
      premium: 0.3,
    },
  
    wildcard: {
      adjacent: 0.3,
      rising_sign: 0.1,
      style_signal: 0.2,
      descriptor: 0.1,
      music: 0.1,
      novelty: 0.2,
    }
  
  } as const
  
  export const MIN_SCORE_TO_SHOW = 0.25
  export const FALLBACK_THRESHOLD = 0.25
