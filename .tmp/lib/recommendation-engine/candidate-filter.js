"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterCandidates = filterCandidates;
var vocabulary_1 = require("./vocabulary");
function normalize(raw) {
    return raw
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
}
function normalizeDescriptorAliases(raw) {
    var normalized = normalize(raw);
    if (normalized === "soft")
        return ["powdery", "floral"];
    return [normalized];
}
function priceCeiling(profile, type) {
    var baseMax = vocabulary_1.BUDGET_TIER_MAX[profile.price_range];
    if (!Number.isFinite(baseMax))
        return Number.POSITIVE_INFINITY;
    if (type === "aspirational")
        return baseMax * 1.3;
    return baseMax;
}
function matchGender(perfume, profile) {
    var tags = new Set(perfume.gender_tags);
    if (profile.gender_pref === "unisex")
        return tags.has("unisex");
    return tags.has(profile.gender_pref) || tags.has("unisex");
}
function hasDislikedNote(perfume, profile) {
    if (profile.scent_dislikes.length === 0)
        return false;
    var blocked = new Set(profile.scent_dislikes.flatMap(function (d) { return normalizeDescriptorAliases(d); }));
    var notes = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], perfume.top_notes, true), perfume.heart_notes, true), perfume.base_notes, true), perfume.descriptors, true).flatMap(function (note) { return normalizeDescriptorAliases(note); });
    return notes.some(function (n) { return blocked.has(n); });
}
function filterCandidates(perfumes, profile, type, options) {
    var _a, _b, _c;
    if (options === void 0) { options = {}; }
    var minCandidates = (_a = options.minCandidates) !== null && _a !== void 0 ? _a : Math.min(8, perfumes.length);
    var maxCandidates = (_b = options.maxCandidates) !== null && _b !== void 0 ? _b : 40;
    var ignoreDislikes = (_c = options.ignoreDislikes) !== null && _c !== void 0 ? _c : false;
    var ceiling = priceCeiling(profile, type);
    var filtered = perfumes.filter(function (perfume) {
        if (!matchGender(perfume, profile))
            return false;
        if (perfume.price_vnd > ceiling)
            return false;
        if (!ignoreDislikes && hasDislikedNote(perfume, profile))
            return false;
        return true;
    });
    // If strict disliked-note filtering makes pool too small, relax that filter.
    if (!ignoreDislikes && filtered.length < minCandidates) {
        filtered = perfumes.filter(function (perfume) {
            if (!matchGender(perfume, profile))
                return false;
            if (perfume.price_vnd > ceiling)
                return false;
            return true;
        });
    }
    if (filtered.length <= maxCandidates)
        return filtered;
    return filtered
        .slice()
        .sort(function (a, b) { return b.popularity_score - a.popularity_score; })
        .slice(0, maxCandidates);
}
