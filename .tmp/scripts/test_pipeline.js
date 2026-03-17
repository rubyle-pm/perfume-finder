"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const candidate_filter_1 = require("../lib/recommendation-engine/candidate-filter");
const pipeline_1 = require("../lib/recommendation-engine/pipeline");
const profile_builder_1 = require("../lib/recommendation-engine/profile-builder");
const scoring_1 = require("../lib/recommendation-engine/scoring");
const types_1 = require("../lib/recommendation-engine/types");
const PERSONAS = [
    {
        name: "DATE_NIGHT_SEXY",
        answers: {
            gender_pref: "masculine",
            use_case: "evening",
            mood: "complicated_seductive_intellectual",
            scent_type: "dark_mysterious",
            dislike_note: ["aquatic_soapy", "fruity_citrus"],
            weekend_vibe: "late_night_social",
            style_icon: "old_money_masculine",
            mbti: "ENTJ",
            music: "rnb_soul",
            closet_aesthetic: "sensual_glamour",
            rising_sign: "scorpio",
            budget: "3_500_000_to_5_000_000",
        },
    },
    {
        name: "OFFICE_MINIMAL",
        answers: {
            gender_pref: "feminine",
            use_case: "office",
            mood: "grounded_calm_quiet_luxury",
            scent_type: "clean_minimal",
            dislike_note: ["sweet_gourmand", "smoky_tobacco_spicy"],
            weekend_vibe: "home_reset",
            style_icon: "quiet_luxury_feminine",
            mbti: "ISTJ",
            music: "classical",
            closet_aesthetic: "scandinavian_minimal",
            rising_sign: "virgo",
            budget: "2_000_000_to_3_500_000",
        },
    },
    {
        name: "FRESH_SUMMER",
        answers: {
            gender_pref: "masculine",
            use_case: "outdoor_sporty",
            mood: "effortless_cool_woke_up_like_this",
            scent_type: "fresh_airy",
            dislike_note: ["incense_resin", "musk"],
            weekend_vibe: "hiking_outdoor",
            style_icon: "boy_next_door_casual",
            mbti: "ENFP",
            music: "electronic",
            closet_aesthetic: "clean_sporty",
            rising_sign: "sagittarius",
            budget: "2_000_000_to_3_500_000",
        },
    },
    {
        name: "ROMANTIC_FLORAL",
        answers: {
            gender_pref: "feminine",
            use_case: "special_occasion",
            mood: "soft_romantic_nostalgic",
            scent_type: "floral_feminine",
            dislike_note: ["smoky_tobacco_spicy"],
            weekend_vibe: "long_brunch",
            style_icon: "coquette",
            mbti: "INFP",
            music: "indie",
            closet_aesthetic: "cottage_core",
            rising_sign: "libra",
            budget: "3_500_000_to_5_000_000",
        },
    },
    {
        name: "WOODY_ELEGANT",
        answers: {
            gender_pref: "masculine",
            use_case: "office",
            mood: "grounded_calm_quiet_luxury",
            scent_type: "earthy_natural",
            dislike_note: ["sweet_gourmand", "aquatic_soapy"],
            weekend_vibe: "museum_gallery",
            style_icon: "mature_low_key",
            mbti: "INTJ",
            music: "jazz",
            closet_aesthetic: "old_money_european",
            rising_sign: "capricorn",
            budget: "over_5_000_000",
        },
    },
    {
        name: "BOLD_NIGHT_OUT",
        answers: {
            gender_pref: "feminine",
            use_case: "evening",
            mood: "bold_confident_present",
            scent_type: "dark_mysterious",
            dislike_note: ["aquatic_soapy"],
            weekend_vibe: "late_night_social",
            style_icon: "classic_bombshell",
            mbti: "ESTP",
            music: "hiphop",
            closet_aesthetic: "sensual_glamour",
            rising_sign: "leo",
            budget: "over_5_000_000",
        },
    },
    {
        name: "CLEAN_SKIN_SCENT",
        answers: {
            gender_pref: "feminine",
            use_case: "daily_casual",
            mood: "effortless_cool_woke_up_like_this",
            scent_type: "clean_minimal",
            dislike_note: ["smoky_tobacco_spicy", "incense_resin"],
            weekend_vibe: "cozy_solo_cafe",
            style_icon: "clean_girl",
            mbti: "ISFJ",
            music: "pop",
            closet_aesthetic: "clean_sporty",
            rising_sign: "cancer",
            budget: "2_000_000_to_3_500_000",
        },
    },
    {
        name: "SWEET_GOURMAND",
        answers: {
            gender_pref: "feminine",
            use_case: "special_occasion",
            mood: "playful_warm_unexpected",
            scent_type: "warm_cozy",
            dislike_note: ["aquatic_soapy"],
            weekend_vibe: "book_blanket_hermit",
            style_icon: "candy_girl_first_love",
            mbti: "ENFP",
            music: "pop",
            closet_aesthetic: "y2k_trendy",
            rising_sign: "taurus",
            budget: "2_000_000_to_3_500_000",
        },
    },
];
function loadPerfumes() {
    const dataPath = (0, node_path_1.resolve)(process.cwd(), "perfume-data/example_perfumes.json");
    const raw = JSON.parse((0, node_fs_1.readFileSync)(dataPath, "utf8"));
    return raw.map((row) => (0, types_1.normalizePerfume)(row));
}
function descriptorOverlapRatio(a, b) {
    if (a.length === 0)
        return 0;
    const bSet = new Set(b);
    let hit = 0;
    for (const item of a) {
        if (bSet.has(item))
            hit += 1;
    }
    return hit / a.length;
}
function runPersona(perfumes, persona) {
    const profile = (0, profile_builder_1.buildUserProfile)(persona.answers);
    const rationalPool = (0, candidate_filter_1.filterCandidates)(perfumes, profile, "rational");
    const aspirationalPool = (0, candidate_filter_1.filterCandidates)(perfumes, profile, "aspirational");
    const wildcardPool = (0, candidate_filter_1.filterCandidates)(perfumes, profile, "wildcard");
    const rationalRanked = (0, scoring_1.rankCandidates)(rationalPool, profile, "rational");
    const aspirationalRanked = (0, scoring_1.rankCandidates)(aspirationalPool, profile, "aspirational");
    const wildcardRanked = (0, scoring_1.rankCandidates)(wildcardPool, profile, "wildcard");
    const result = (0, pipeline_1.runRecommendationPipeline)(perfumes, profile);
    const picks = [result.slots.bestFit, result.slots.idealMatch, result.slots.wildcard];
    const brandSet = new Set(picks.map((slot) => slot.perfume.brand));
    const descriptorSet = new Set(picks.flatMap((slot) => slot.perfume.descriptors));
    const descriptorOverlap = picks.map((slot) => descriptorOverlapRatio(profile.scent_type, slot.perfume.descriptors));
    const poolStats = [
        {
            slot: "rational",
            candidates: rationalPool.length,
            top_score: Number((rationalRanked[0]?.candidate.score ?? 0).toFixed(3)),
            top_name: rationalRanked[0]?.candidate.perfume.name ?? "-",
        },
        {
            slot: "aspirational",
            candidates: aspirationalPool.length,
            top_score: Number((aspirationalRanked[0]?.candidate.score ?? 0).toFixed(3)),
            top_name: aspirationalRanked[0]?.candidate.perfume.name ?? "-",
        },
        {
            slot: "wildcard",
            candidates: wildcardPool.length,
            top_score: Number((wildcardRanked[0]?.candidate.score ?? 0).toFixed(3)),
            top_name: wildcardRanked[0]?.candidate.perfume.name ?? "-",
        },
    ];
    const pickRows = picks.map((slot, index) => ({
        rank: index + 1,
        slot: index === 0 ? "bestFit" : index === 1 ? "idealMatch" : "wildcard",
        perfume: slot.perfume.name,
        brand: slot.perfume.brand,
        score: Number(slot.score.toFixed(3)),
        use_cases: slot.perfume.use_cases.join(","),
        descriptors: slot.perfume.descriptors.join(","),
        style_tags: slot.perfume.style_tags.join(","),
    }));
    console.log("\n============================================================");
    console.log(`PERSONA: ${persona.name}`);
    console.log("============================================================");
    console.table(poolStats);
    console.log("Top picks:");
    console.table(pickRows);
    console.log("Archetypes:");
    console.log(`- rational: ${result.slots.bestFit.perfume.name}`);
    console.log(`- aspirational: ${result.slots.idealMatch.perfume.name}`);
    console.log(`- wildcard: ${result.slots.wildcard.perfume.name}`);
    console.log(`- inferred_top_pick_archetype: ${result.topPickArchetype ?? "none"}`);
    console.log("Diagnostics:");
    console.table([
        {
            metric: "empty_pool_count",
            value: [rationalPool, aspirationalPool, wildcardPool].filter((p) => p.length === 0).length,
        },
        {
            metric: "brand_diversity_in_top3",
            value: `${brandSet.size}/3`,
        },
        {
            metric: "descriptor_diversity_in_top3",
            value: descriptorSet.size,
        },
        {
            metric: "avg_profile_descriptor_overlap",
            value: Number((descriptorOverlap.reduce((sum, value) => sum + value, 0) / descriptorOverlap.length).toFixed(3)),
        },
    ]);
}
function main() {
    const perfumes = loadPerfumes();
    console.log(`Loaded perfumes: ${perfumes.length}`);
    console.log(`Running personas: ${PERSONAS.length}`);
    for (const persona of PERSONAS) {
        runPersona(perfumes, persona);
    }
}
main();
