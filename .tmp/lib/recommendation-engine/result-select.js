"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildResult = buildResult;
var vocabulary_1 = require("./vocabulary");
function inferTopArchetype(profile) {
    if (profile.signals.length === 0)
        return null;
    var winner = null;
    var winnerScore = -1;
    for (var _i = 0, _a = Object.entries(vocabulary_1.ARCHETYPE_SIGNAL_MAP); _i < _a.length; _i++) {
        var _b = _a[_i], archetype = _b[0], signals = _b[1];
        var hits = signals.filter(function (s) { return profile.signals.includes(s); })
            .length;
        var score = hits / signals.length;
        if (score > winnerScore) {
            winner = archetype;
            winnerScore = score;
        }
    }
    return winner;
}
function buildExplanation(slots) {
    return [
        "Best Fit: ".concat(slots.bestFit.perfume.name),
        "Ideal Match: ".concat(slots.idealMatch.perfume.name),
        "Wildcard: ".concat(slots.wildcard.perfume.name),
    ].join(" | ");
}
function buildResult(params) {
    var profile = params.profile, slots = params.slots, scoreBreakdown = params.scoreBreakdown;
    return {
        topPick: slots.bestFit,
        alternatives: [slots.idealMatch, slots.wildcard],
        explanation: buildExplanation(slots),
        scoreBreakdown: scoreBreakdown,
        slots: slots,
        topPickArchetype: inferTopArchetype(profile),
    };
}
