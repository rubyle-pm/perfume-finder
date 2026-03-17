"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeSignal = normalizeSignal;
exports.normalizeDescriptor = normalizeDescriptor;
exports.normalizeUseCase = normalizeUseCase;
exports.normalizePerfume = normalizePerfume;
var vocabulary_1 = require("./vocabulary");
// ---------------------------------------------------------------------------
// NORMALIZATION UTILS
// Boundary layer: raw JSON → strictly typed engine values
// toSnakeCase covers format variants (hyphens, spaces, slashes, mixed case)
// Unknown values are dropped with a dev warning — never silently scored as 0
// ---------------------------------------------------------------------------
function toSnakeCase(raw) {
    return raw
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
}
function normalizeSignal(raw) {
    var normalized = toSnakeCase(raw);
    if (vocabulary_1.SIGNALS.includes(normalized))
        return normalized;
    if (process.env.NODE_ENV !== "production")
        console.warn("[vocab] Unknown signal: \"".concat(raw, "\" \u2192 \"").concat(normalized, "\""));
    return null;
}
function normalizeDescriptor(raw) {
    var normalized = toSnakeCase(raw);
    if (normalized === "soft")
        return "powdery";
    if (vocabulary_1.DESCRIPTORS.includes(normalized))
        return normalized;
    if (process.env.NODE_ENV !== "production")
        console.warn("[vocab] Unknown descriptor: \"".concat(raw, "\" \u2192 \"").concat(normalized, "\""));
    return null;
}
function normalizeUseCase(raw) {
    var normalized = toSnakeCase(raw);
    if (vocabulary_1.USE_CASES.includes(normalized))
        return normalized;
    if (process.env.NODE_ENV !== "production")
        console.warn("[vocab] Unknown use_case: \"".concat(raw, "\" \u2192 \"").concat(normalized, "\""));
    return null;
}
function normalizePerfume(raw) {
    var _a, _b;
    var rawDescriptors = Array.isArray(raw.descriptors) ? raw.descriptors : [];
    var expandedRawDescriptors = rawDescriptors.flatMap(function (descriptor) {
        return toSnakeCase(descriptor) === "soft" ? ["powdery", "floral"] : [descriptor];
    });
    var normalizedDescriptors = Array.from(new Set(expandedRawDescriptors.map(normalizeDescriptor).filter(Boolean)));
    return {
        id: raw.id,
        name: raw.name,
        brand: raw.brand,
        price_vnd: raw.price_vnd,
        tier: raw.tier,
        family_primary: raw.family_primary,
        family_secondary: (_a = raw.family_secondary) !== null && _a !== void 0 ? _a : null,
        top_notes: raw.top_notes,
        heart_notes: raw.heart_notes,
        base_notes: raw.base_notes,
        descriptors: normalizedDescriptors,
        use_cases: raw.use_cases.map(normalizeUseCase).filter(Boolean),
        style_tags: raw.style_tags.map(normalizeSignal).filter(Boolean),
        gender_tags: raw.gender_tags,
        popularity_score: raw.popularity_score,
        concentration: raw.concentration,
        volume_ml: raw.volume_ml,
        size_variant_of: (_b = raw.size_variant_of) !== null && _b !== void 0 ? _b : null,
    };
}
