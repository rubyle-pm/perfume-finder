"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runRecommendationPipeline = runRecommendationPipeline;
var candidate_filter_1 = require("./candidate-filter");
var result_select_1 = require("./result-select");
var scoring_1 = require("./scoring");
var scoring_config_1 = require("./scoring-config");
function pickUnique(ranked, usedIds, usedBrands) {
    var winner = null;
    var winnerAdjustedScore = -Infinity;
    for (var _i = 0, ranked_1 = ranked; _i < ranked_1.length; _i++) {
        var item = ranked_1[_i];
        var perfume = item.candidate.perfume;
        if (usedIds.has(perfume.id))
            continue;
        var repeatPenalty = usedBrands.has(perfume.brand) ? 0.1 : 0;
        var adjustedScore = item.candidate.score - repeatPenalty;
        if (adjustedScore > winnerAdjustedScore) {
            winnerAdjustedScore = adjustedScore;
            winner = item;
        }
    }
    if (!winner)
        return null;
    usedIds.add(winner.candidate.perfume.id);
    usedBrands.add(winner.candidate.perfume.brand);
    return winner;
}
function selectInitialSlots(rationalRanked, aspirationalRanked, wildcardRanked) {
    var used = new Set();
    var usedBrands = new Set();
    var rational = pickUnique(rationalRanked, used, usedBrands);
    var aspirational = pickUnique(aspirationalRanked, used, usedBrands);
    var wildcard = pickUnique(wildcardRanked, used, usedBrands);
    return { rational: rational, aspirational: aspirational, wildcard: wildcard };
}
function fillMissingWithConfidentCandidates(current, rankedPools) {
    var next = __assign({}, current);
    var usedIds = new Set();
    var usedBrands = new Set();
    for (var _i = 0, _a = [next.rational, next.aspirational, next.wildcard]; _i < _a.length; _i++) {
        var slot = _a[_i];
        if (!slot)
            continue;
        usedIds.add(slot.candidate.perfume.id);
        usedBrands.add(slot.candidate.perfume.brand);
    }
    var globalRanked = rankedPools
        .flat()
        .filter(function (item, index, all) {
        return all.findIndex(function (other) { return other.candidate.perfume.id === item.candidate.perfume.id; }) === index;
    })
        .sort(function (a, b) { return b.candidate.score - a.candidate.score; });
    var pickNext = function () {
        var winner = null;
        var winnerAdjustedScore = -Infinity;
        for (var _i = 0, globalRanked_1 = globalRanked; _i < globalRanked_1.length; _i++) {
            var item = globalRanked_1[_i];
            var perfume = item.candidate.perfume;
            var repeatPenalty = (usedBrands.has(perfume.brand) ? 0.1 : 0) +
                (usedIds.has(perfume.id) ? 0.1 : 0);
            var adjustedScore = item.candidate.score - repeatPenalty;
            if (adjustedScore > winnerAdjustedScore) {
                winnerAdjustedScore = adjustedScore;
                winner = item;
            }
        }
        if (!winner)
            return null;
        usedIds.add(winner.candidate.perfume.id);
        usedBrands.add(winner.candidate.perfume.brand);
        return winner;
    };
    if (!next.rational)
        next.rational = pickNext();
    if (!next.aspirational)
        next.aspirational = pickNext();
    if (!next.wildcard)
        next.wildcard = pickNext();
    return next;
}
function runRecommendationPipeline(perfumes, profile) {
    if (perfumes.length === 0) {
        throw new Error("runRecommendationPipeline requires at least one perfume");
    }
    var rationalPool = (0, candidate_filter_1.filterCandidates)(perfumes, profile, "rational");
    var aspirationalPool = (0, candidate_filter_1.filterCandidates)(perfumes, profile, "aspirational");
    var wildcardPool = (0, candidate_filter_1.filterCandidates)(perfumes, profile, "wildcard");
    var rationalRanked = (0, scoring_1.rankCandidates)(rationalPool, profile, "rational")
        .filter(function (item) { return item.candidate.score >= scoring_config_1.MIN_SCORE_TO_SHOW; });
    var aspirationalRanked = (0, scoring_1.rankCandidates)(aspirationalPool, profile, "aspirational")
        .filter(function (item) { return item.candidate.score >= scoring_config_1.MIN_SCORE_TO_SHOW; });
    var wildcardRanked = (0, scoring_1.rankCandidates)(wildcardPool, profile, "wildcard")
        .filter(function (item) { return item.candidate.score >= scoring_config_1.MIN_SCORE_TO_SHOW; });
    var initial = selectInitialSlots(rationalRanked, aspirationalRanked, wildcardRanked);
    var confidentFilled = fillMissingWithConfidentCandidates(initial, [
        rationalRanked,
        aspirationalRanked,
        wildcardRanked,
    ]);
    if (!confidentFilled.rational || !confidentFilled.aspirational || !confidentFilled.wildcard) {
        throw new Error("Not enough confident recommendations");
    }
    var slots = {
        bestFit: confidentFilled.rational.candidate,
        idealMatch: confidentFilled.aspirational.candidate,
        wildcard: confidentFilled.wildcard.candidate,
    };
    var scoreBreakdown = [
        confidentFilled.rational.breakdown,
        confidentFilled.aspirational.breakdown,
        confidentFilled.wildcard.breakdown,
    ];
    return (0, result_select_1.buildResult)({
        profile: profile,
        slots: slots,
        scoreBreakdown: scoreBreakdown,
    });
}
