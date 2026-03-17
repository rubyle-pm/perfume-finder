"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scorePerfume = scorePerfume;
exports.rankCandidates = rankCandidates;
var scoring_config_1 = require("./scoring-config");
var intent_scoring_1 = require("./intent-scoring");
function overlapRatio(a, b) {
    if (a.length === 0)
        return 0;
    var bSet = new Set(b);
    var hit = 0;
    for (var _i = 0, a_1 = a; _i < a_1.length; _i++) {
        var item = a_1[_i];
        if (bSet.has(item))
            hit += 1;
    }
    return hit / a.length;
}
function userTier(profile) {
    if (profile.price_range === "2_000_000_to_3_500_000")
        return 2;
    if (profile.price_range === "3_500_000_to_5_000_000")
        return 3;
    return 4;
}
function premiumFactor(perfume, profile) {
    var baseTier = userTier(profile);
    if (perfume.tier > baseTier)
        return 1;
    if (perfume.tier === baseTier)
        return 0.6;
    return 0.3;
}
function deriveAdjacentDescriptors(descriptors) {
    var out = new Set();
    for (var _i = 0, descriptors_1 = descriptors; _i < descriptors_1.length; _i++) {
        var descriptor = descriptors_1[_i];
        if (descriptor === "fresh")
            out.add("aquatic");
        if (descriptor === "aquatic")
            out.add("fresh");
        if (descriptor === "floral")
            out.add("powdery");
        if (descriptor === "powdery")
            out.add("floral");
        if (descriptor === "woody")
            out.add("vetiver");
        if (descriptor === "vetiver")
            out.add("woody");
        if (descriptor === "musky")
            out.add("clean");
        if (descriptor === "clean")
            out.add("musky");
        if (descriptor === "amber")
            out.add("vanilla");
        if (descriptor === "vanilla")
            out.add("amber");
        if (descriptor === "smoky")
            out.add("oud");
        if (descriptor === "oud")
            out.add("smoky");
    }
    return Array.from(out);
}
function scoreRational(perfume, profile) {
    var descriptorMatch = overlapRatio(profile.scent_type, perfume.descriptors);
    var useCaseMatch = perfume.use_cases.includes(profile.use_case) ? 1 : 0;
    var mbtiMatch = overlapRatio(profile.mbti_signals, perfume.style_tags);
    var moodMatch = overlapRatio(profile.mood_signals, perfume.style_tags);
    var intentScore = (0, intent_scoring_1.computeIntentScore)(profile.scent_type, perfume.descriptors);
    var total = scoring_config_1.SCORING_WEIGHTS.rational.descriptor * descriptorMatch + // scoring.config
        scoring_config_1.SCORING_WEIGHTS.rational.use_case * useCaseMatch +
        scoring_config_1.SCORING_WEIGHTS.rational.mbti * mbtiMatch +
        scoring_config_1.SCORING_WEIGHTS.rational.mood * moodMatch +
        0.05 * intentScore;
    return {
        type: "rational",
        total: total,
        descriptor_match: descriptorMatch,
        use_case_match: useCaseMatch,
        mbti_match: mbtiMatch,
        mood_match: moodMatch,
    };
}
function scoreAspirational(perfume, profile) {
    var descriptorMatch = overlapRatio(profile.scent_type, perfume.descriptors);
    var signalMatch = overlapRatio(profile.signals, perfume.style_tags);
    var intentScore = (0, intent_scoring_1.computeIntentScore)(profile.scent_type, perfume.descriptors);
    var premium = premiumFactor(perfume, profile);
    var total = scoring_config_1.SCORING_WEIGHTS.aspirational.descriptor * descriptorMatch + // scoring.config
        scoring_config_1.SCORING_WEIGHTS.aspirational.style_signal * signalMatch +
        scoring_config_1.SCORING_WEIGHTS.aspirational.premium * premium +
        0.12 * intentScore;
    if (signalMatch < 0.25)
        total *= 0.1;
    return {
        type: "aspirational",
        total: total,
        descriptor_match: descriptorMatch,
        signal_match: signalMatch,
        premium_factor: premium,
    };
}
function scoreWildcard(perfume, profile) {
    var descriptorMatch = overlapRatio(profile.scent_type, perfume.descriptors);
    var adjacent = deriveAdjacentDescriptors(profile.scent_type);
    var adjacentScore = overlapRatio(adjacent, perfume.descriptors);
    var styleSignalMatch = overlapRatio(profile.style_signals, perfume.style_tags);
    var musicSignalMatch = overlapRatio(profile.music_signals, perfume.style_tags);
    var risingSignSignalMatch = overlapRatio(profile.rising_sign_signals, perfume.style_tags);
    var novelty = 1 - descriptorMatch;
    var total = scoring_config_1.SCORING_WEIGHTS.wildcard.adjacent * adjacentScore + //scoring.config 
        scoring_config_1.SCORING_WEIGHTS.wildcard.rising_sign * risingSignSignalMatch +
        scoring_config_1.SCORING_WEIGHTS.wildcard.style_signal * styleSignalMatch +
        scoring_config_1.SCORING_WEIGHTS.wildcard.descriptor * descriptorMatch +
        scoring_config_1.SCORING_WEIGHTS.wildcard.music * musicSignalMatch +
        scoring_config_1.SCORING_WEIGHTS.wildcard.novelty * novelty;
    return {
        type: "wildcard",
        total: total,
        descriptor_match: descriptorMatch,
        adjacent_score: adjacentScore,
        music_signal_match: musicSignalMatch,
        novelty: novelty,
    };
}
function scorePerfume(perfume, profile, type) {
    var breakdown = type === "rational"
        ? scoreRational(perfume, profile)
        : type === "aspirational"
            ? scoreAspirational(perfume, profile)
            : scoreWildcard(perfume, profile);
    return {
        candidate: {
            type: type,
            perfume: perfume,
            score: breakdown.total,
            matchSignals: {
                descriptors: profile.scent_type.filter(function (d) { return perfume.descriptors.includes(d); }),
                signals: profile.signals.filter(function (s) { return perfume.style_tags.includes(s); }),
                use_case: perfume.use_cases.includes(profile.use_case) ? profile.use_case : undefined,
            },
        },
        breakdown: breakdown,
    };
}
function rankCandidates(perfumes, profile, type) {
    return perfumes
        .map(function (perfume) { return scorePerfume(perfume, profile, type); })
        .sort(function (a, b) {
        if (b.candidate.score !== a.candidate.score) {
            return b.candidate.score - a.candidate.score;
        }
        return b.candidate.perfume.popularity_score - a.candidate.perfume.popularity_score;
    });
}
