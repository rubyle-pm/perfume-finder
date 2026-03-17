"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyFallback = applyFallback;
const candidate_filter_1 = require("./candidate-filter");
const scoring_1 = require("./scoring");
function isWeak(candidate, minScore) {
    return !candidate || candidate.candidate.score < minScore;
}
function pickUnique(ranked, usedIds, usedBrands, minScore) {
    for (const item of ranked) {
        const perfume = item.candidate.perfume;
        if (usedIds.has(perfume.id))
            continue;
        if (usedBrands.has(perfume.brand))
            continue;
        if (item.candidate.score < minScore)
            continue;
        usedIds.add(perfume.id);
        usedBrands.add(perfume.brand);
        return item;
    }
    for (const item of ranked) {
        const perfume = item.candidate.perfume;
        if (usedIds.has(perfume.id))
            continue;
        if (usedBrands.has(perfume.brand))
            continue;
        usedIds.add(perfume.id);
        usedBrands.add(perfume.brand);
        return item;
    }
    for (const item of ranked) {
        const perfume = item.candidate.perfume;
        if (usedIds.has(perfume.id))
            continue;
        if (item.candidate.score < minScore)
            continue;
        usedIds.add(perfume.id);
        usedBrands.add(perfume.brand);
        return item;
    }
    for (const item of ranked) {
        const perfume = item.candidate.perfume;
        if (usedIds.has(perfume.id))
            continue;
        usedIds.add(perfume.id);
        usedBrands.add(perfume.brand);
        return item;
    }
    return null;
}
function refillSlot(perfumes, profile, type, usedIds, usedBrands, minScore) {
    const relaxedFiltered = (0, candidate_filter_1.filterCandidates)(perfumes, profile, type, {
        maxCandidates: 200,
        ignoreDislikes: true,
    });
    const relaxedRanked = (0, scoring_1.rankCandidates)(relaxedFiltered, profile, type);
    const fromRelaxed = pickUnique(relaxedRanked, usedIds, usedBrands, minScore);
    if (fromRelaxed)
        return fromRelaxed;
    const globalRanked = (0, scoring_1.rankCandidates)(perfumes, profile, type);
    return pickUnique(globalRanked, usedIds, usedBrands, 0);
}
function applyFallback(params) {
    const { perfumes, profile, current } = params;
    const minScore = params.minScore ?? 0.2;
    const usedIds = new Set();
    const usedBrands = new Set();
    if (current.rational && current.rational.candidate.score >= minScore) {
        usedIds.add(current.rational.candidate.perfume.id);
        usedBrands.add(current.rational.candidate.perfume.brand);
    }
    if (current.aspirational && current.aspirational.candidate.score >= minScore) {
        usedIds.add(current.aspirational.candidate.perfume.id);
        usedBrands.add(current.aspirational.candidate.perfume.brand);
    }
    if (current.wildcard && current.wildcard.candidate.score >= minScore) {
        usedIds.add(current.wildcard.candidate.perfume.id);
        usedBrands.add(current.wildcard.candidate.perfume.brand);
    }
    const next = { ...current };
    if (isWeak(next.rational, minScore)) {
        next.rational = refillSlot(perfumes, profile, "rational", usedIds, usedBrands, minScore);
    }
    if (isWeak(next.aspirational, minScore)) {
        next.aspirational = refillSlot(perfumes, profile, "aspirational", usedIds, usedBrands, minScore);
    }
    if (isWeak(next.wildcard, minScore)) {
        next.wildcard = refillSlot(perfumes, profile, "wildcard", usedIds, usedBrands, minScore);
    }
    return next;
}
