"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FALLBACK_THRESHOLD = exports.MIN_SCORE_TO_SHOW = exports.SCORING_WEIGHTS = void 0;
exports.SCORING_WEIGHTS = {
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
        descriptor: 0.2,
        music: 0.1,
        novelty: 0.1,
    }
};
exports.MIN_SCORE_TO_SHOW = 0.3;
exports.FALLBACK_THRESHOLD = 0.25;
