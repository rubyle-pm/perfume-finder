"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildResult = buildResult;
const vocabulary_1 = require("./vocabulary");
function inferTopArchetype(profile) {
    if (profile.signals.length === 0)
        return null;
    let winner = null;
    let winnerScore = -1;
    for (const [archetype, signals] of Object.entries(vocabulary_1.ARCHETYPE_SIGNAL_MAP)) {
        const hits = signals.filter((s) => profile.signals.includes(s))
            .length;
        const score = hits / signals.length;
        if (score > winnerScore) {
            winner = archetype;
            winnerScore = score;
        }
    }
    return winner;
}
function buildExplanation(slots) {
    return [
        `Best Fit: ${slots.bestFit.perfume.name}`,
        `Ideal Match: ${slots.idealMatch.perfume.name}`,
        `Wildcard: ${slots.wildcard.perfume.name}`,
    ].join(" | ");
}
function buildResult(params) {
    const { profile, slots, scoreBreakdown } = params;
    return {
        topPick: slots.bestFit,
        alternatives: [slots.idealMatch, slots.wildcard],
        explanation: buildExplanation(slots),
        scoreBreakdown,
        slots,
        topPickArchetype: inferTopArchetype(profile),
    };
}
