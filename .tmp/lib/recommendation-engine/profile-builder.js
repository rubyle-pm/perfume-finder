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
exports.buildUserProfile = buildUserProfile;
var vocabulary_1 = require("./vocabulary");
var SIGNAL_WEIGHT = {
    mood: 1.2,
    style_icon: 1.2,
    closet_aesthetic: 1.0,
    weekend_vibe: 0.8,
    mbti: 0.6,
    music: 0.3,
    rising_sign: 0.2,
};
var MAX_PROFILE_SIGNALS = 8;
var MUSIC_SIGNAL_MAP = {
    pop: ["playful", "modern"],
    indie: ["nostalgic", "free_spirited", "introspective"],
    rnb_soul: ["sensual", "warm"],
    jazz: ["sophisticated", "warm"],
    classical: ["elegant", "intellectual"],
    kpop: ["playful", "modern"],
    hiphop: ["bold", "cool"],
    electronic: ["edgy", "modern"],
    folk_acoustic: ["grounded", "warm"],
    alternative: ["edgy", "introspective"],
    latin: ["playful", "warm"],
    musical_theatre: ["glamorous", "playful"],
};
var WEEKEND_VIBE_SIGNAL_MAP = {
    cozy_solo_cafe: ["cozy", "introspective"],
    museum_gallery: ["intellectual", "enigmatic"],
    hiking_outdoor: ["grounded", "free_spirited"],
    long_brunch: ["playful", "warm"],
    home_reset: ["minimal", "grounded"],
    spontaneous_road_trip: ["free_spirited", "easy_going"],
    book_blanket_hermit: ["introspective", "nostalgic", "cozy"],
    late_night_social: ["bold", "glamorous"],
};
var CLOSET_SIGNAL_MAP = {
    cottage_core: ["romantic", "soft"],
    streetwear_hiphop: ["bold", "edgy"],
    modern_parisian_chic: ["elegant", "effortless"],
    y2k_trendy: ["playful", "modern"],
    scandinavian_minimal: ["minimal", "cool"],
    old_money_european: ["elegant", "sophisticated"],
    clean_sporty: ["easy_going", "cool"],
    experimental: ["edgy", "enigmatic"],
    dark_academia: ["intellectual", "mysterious"],
    sensual_glamour: ["sensual", "glamorous"],
};
var STYLE_ICON_SIGNAL_MAP = {
    clean_girl: ["minimal", "soft"],
    soft_girl_next_door: ["soft", "romantic"],
    modern_feminine: ["modern", "elegant"],
    effortless_chic: ["effortless", "elegant"],
    timeless_elegance: ["elegant", "sophisticated"],
    classic_bombshell: ["glamorous", "sensual"],
    sporty_glam: ["bold", "cool"],
    boho_indie: ["free_spirited", "effortless"],
    rebellious_gen_z: ["edgy", "bold"],
    coquette: ["romantic", "playful"],
    modern_masculinity: ["modern", "confident"],
    pretty_prince: ["soft", "elegant"],
    boy_next_door_casual: ["easy_going", "warm"],
    mature_low_key: ["grounded", "sophisticated"],
    dark_intellectual_male: ["mysterious", "intellectual"],
    old_money_masculine: ["sophisticated", "confident"],
    quiet_luxury_feminine: ["elegant", "minimal"],
    rugged_masculine: ["bold", "grounded"],
    street_culture: ["edgy", "cool"],
    old_school_menace: ["menacing", "enigmatic"],
    candy_girl_first_love: ["soft", "playful"],
    dark_intellectual_female: ["mysterious", "intellectual"],
};
var MOOD_SIGNAL_MAP = {
    complicated_seductive_intellectual: ["sensual", "intellectual", "mysterious"],
    soft_romantic_nostalgic: ["soft", "romantic", "nostalgic"],
    bold_confident_present: ["bold", "confident", "glamorous"],
    effortless_cool_woke_up_like_this: ["effortless", "cool", "minimal"],
    playful_warm_unexpected: ["playful", "warm", "enigmatic"],
    grounded_calm_quiet_luxury: ["grounded", "introspective", "elegant"],
    mysterious_edgy_artistic: ["mysterious", "edgy", "menacing"],
};
function toSnakeCase(raw) {
    return raw
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
}
function pickOne(raw, allowed) {
    if (typeof raw !== "string")
        return null;
    var normalized = toSnakeCase(raw);
    return allowed.includes(normalized) ? normalized : null;
}
function pickMany(raw, allowed) {
    if (!raw)
        return [];
    var values = Array.isArray(raw) ? raw : [raw];
    var out = [];
    var seen = new Set();
    for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
        var value = values_1[_i];
        var picked = pickOne(value, allowed);
        if (!picked || seen.has(picked))
            continue;
        seen.add(picked);
        out.push(picked);
    }
    return out;
}
function addSignals(score, signals, weight) {
    var _a;
    for (var _i = 0, signals_1 = signals; _i < signals_1.length; _i++) {
        var signal = signals_1[_i];
        score.set(signal, ((_a = score.get(signal)) !== null && _a !== void 0 ? _a : 0) + weight);
    }
}
function mbtiSignals(mbti) {
    var _a;
    var dimensions = mbti.split("");
    var out = [];
    var seen = new Set();
    for (var _i = 0, dimensions_1 = dimensions; _i < dimensions_1.length; _i++) {
        var key = dimensions_1[_i];
        var signals = (_a = vocabulary_1.MBTI_DIMENSION_SIGNAL_MAP[key]) !== null && _a !== void 0 ? _a : [];
        for (var _b = 0, signals_2 = signals; _b < signals_2.length; _b++) {
            var signal = signals_2[_b];
            if (seen.has(signal))
                continue;
            seen.add(signal);
            out.push(signal);
        }
    }
    return out;
}
function buildUserProfile(answers) {
    var _a, _b, _c;
    var genderPref = (_a = pickOne(answers.gender_pref, vocabulary_1.GENDER_PREFS)) !== null && _a !== void 0 ? _a : vocabulary_1.GENDER_PREFS[vocabulary_1.GENDER_PREFS.length - 1];
    var useCase = (_b = pickOne(answers.use_case, vocabulary_1.USE_CASES)) !== null && _b !== void 0 ? _b : vocabulary_1.USE_CASES[0];
    var priceRange = (_c = pickOne(answers.budget, vocabulary_1.BUDGET_TIERS)) !== null && _c !== void 0 ? _c : vocabulary_1.BUDGET_TIERS[0];
    var scentType = pickOne(answers.scent_type, vocabulary_1.SCENT_TYPES);
    var scentTypeDescriptors = scentType
        ? __spreadArray([], vocabulary_1.SCENT_TYPE_DESCRIPTOR_MAP[scentType], true) : [];
    var dislikeNotes = pickMany(answers.dislike_note, vocabulary_1.DISLIKE_NOTES);
    var scentDislikes = Array.from(new Set(dislikeNotes.flatMap(function (key) { return vocabulary_1.DISLIKE_NOTE_DESCRIPTOR_MAP[key]; })));
    var score = new Map();
    var mood = pickOne(answers.mood, vocabulary_1.MOODS);
    var moodSignals = mood ? MOOD_SIGNAL_MAP[mood] : [];
    if (moodSignals.length > 0)
        addSignals(score, moodSignals, SIGNAL_WEIGHT.mood);
    var weekend = pickOne(answers.weekend_vibe, vocabulary_1.WEEKEND_VIBES);
    var weekendSignals = weekend ? WEEKEND_VIBE_SIGNAL_MAP[weekend] : [];
    if (weekendSignals.length > 0)
        addSignals(score, weekendSignals, SIGNAL_WEIGHT.weekend_vibe);
    var styleIcon = pickOne(answers.style_icon, vocabulary_1.STYLE_ICONS);
    var styleSignals = styleIcon ? STYLE_ICON_SIGNAL_MAP[styleIcon] : [];
    if (styleSignals.length > 0)
        addSignals(score, styleSignals, SIGNAL_WEIGHT.style_icon);
    var music = pickOne(answers.music, vocabulary_1.MUSIC_GENRES);
    var musicSignals = [];
    if (music) {
        musicSignals = MUSIC_SIGNAL_MAP[music];
        addSignals(score, musicSignals, SIGNAL_WEIGHT.music);
    }
    var closet = pickOne(answers.closet_aesthetic, vocabulary_1.CLOSET_AESTHETICS);
    var closetSignals = closet ? CLOSET_SIGNAL_MAP[closet] : [];
    if (closetSignals.length > 0)
        addSignals(score, closetSignals, SIGNAL_WEIGHT.closet_aesthetic);
    var mbti = pickOne(answers.mbti, vocabulary_1.MBTI_TYPES);
    var mbtiResolvedSignals = mbti ? mbtiSignals(mbti) : [];
    if (mbtiResolvedSignals.length > 0)
        addSignals(score, mbtiResolvedSignals, SIGNAL_WEIGHT.mbti);
    var risingSign = pickOne(answers.rising_sign, vocabulary_1.RISING_SIGNS);
    var risingSignSignals = [];
    if (risingSign) {
        risingSignSignals = vocabulary_1.RISING_SIGN_SIGNAL_MAP[risingSign];
        addSignals(score, risingSignSignals, SIGNAL_WEIGHT.rising_sign);
    }
    var signals = Array.from(score.entries())
        .sort(function (a, b) {
        if (b[1] !== a[1])
            return b[1] - a[1];
        return vocabulary_1.SIGNALS.indexOf(a[0]) - vocabulary_1.SIGNALS.indexOf(b[0]);
    })
        .slice(0, MAX_PROFILE_SIGNALS)
        .map(function (_a) {
        var signal = _a[0];
        return signal;
    });
    return {
        price_range: priceRange,
        scent_type: scentTypeDescriptors,
        scent_dislikes: scentDislikes,
        gender_pref: genderPref,
        use_case: useCase,
        signals: signals,
        mood_signals: moodSignals,
        style_signals: styleSignals,
        music_signals: musicSignals,
        rising_sign_signals: risingSignSignals,
        closet_aesthetic_signals: closetSignals,
        mbti_signals: mbtiResolvedSignals,
    };
}
