"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
type AnswerMap = Record<string, string | string[]>;

// ─── Question metadata with emoji matching quiz/page.tsx ──────────────────────
const REVIEW_QUESTIONS = [
  {
    id: "gender_pref",
    label: "Scent profile I'm drawn to",
    mandatory: true,
    options: [
      { value: "feminine",  label: "Feminine",  emoji: "🌸" },
      { value: "masculine", label: "Masculine", emoji: "🌲" },
      { value: "unisex",    label: "Unisex",    emoji: "✨" },
    ],
  },
  {
    id: "use_case",
    label: "I'll wear this most for",
    mandatory: true,
    options: [
      { value: "office",           label: "At work",         emoji: "💼" },
      { value: "daily_casual",     label: "Daily & casual",  emoji: "👕" },
      { value: "evening",          label: "Date night",      emoji: "🌙" },
      { value: "outdoor_sporty",   label: "Outdoor & active",emoji: "🏃" },
      { value: "special_occasion", label: "Special occasions",emoji: "🥂" },
      { value: "travel",           label: "Traveling",       emoji: "✈️" },
      { value: "home_body",        label: "At home",         emoji: "🛋️" },
    ],
  },
  {
    id: "mood",
    label: "The mood I want to project",
    mandatory: true,
    options: [
      { value: "complicated_seductive_intellectual", label: "Seductive & intellectual", emoji: "🖤" },
      { value: "soft_romantic_nostalgic",            label: "Romantic & nostalgic",     emoji: "🌹" },
      { value: "bold_confident_present",             label: "Bold & confident",         emoji: "⚡" },
      { value: "effortless_cool_woke_up_like_this",  label: "Effortless & cool",        emoji: "😮‍💨" },
      { value: "playful_warm_unexpected",            label: "Playful & warm",           emoji: "🌻" },
      { value: "grounded_calm_quiet_luxury",         label: "Grounded & calm",          emoji: "🌾" },
      { value: "mysterious_edgy_artistic",           label: "Mysterious & edgy",        emoji: "🌑" },
    ],
  },
  {
    id: "scent_type",
    label: "Scents I gravitate toward",
    mandatory: true,
    options: [
      { value: "fresh_airy",      label: "Fresh & airy",      emoji: "🌬️" },
      { value: "warm_cozy",       label: "Warm & cozy",       emoji: "🫦" },
      { value: "floral_feminine", label: "Floral & feminine", emoji: "🌷" },
      { value: "dark_mysterious", label: "Dark & mysterious", emoji: "🌙" },
      { value: "clean_minimal",   label: "Clean & minimal",   emoji: "🛁" },
      { value: "earthy_natural",  label: "Earthy & natural",  emoji: "🌿" },
    ],
  },
  {
    id: "dislike_note",
    label: "Notes I'd rather avoid",
    mandatory: true,
    options: [
      { value: "heavy_floral",        label: "Heavy floral",       emoji: "🌺" },
      { value: "sweet_gourmand",      label: "Sweet gourmand",     emoji: "🍬" },
      { value: "smoky_tobacco_spicy", label: "Smoky & spicy",      emoji: "🔥" },
      { value: "incense_resin",       label: "Incense & resin",    emoji: "🕯️" },
      { value: "aquatic_soapy",       label: "Aquatic or soapy",   emoji: "🌊" },
      { value: "fruity_citrus",       label: "Fruity & citrus",    emoji: "🍊" },
      { value: "earthy_wet_wood",     label: "Earthy, wet wood",   emoji: "🪵" },
      { value: "musk",                label: "Musk",               emoji: "🫧" },
    ],
  },
  {
    id: "weekend_vibe",
    label: "My perfect Saturday looks like",
    mandatory: true,
    options: [
      { value: "book_and_blanket", label: "Book & blanket", emoji: "😶‍🌫️" },
      { value: "brunch",           label: "Long brunch",    emoji: "🥐" },
      { value: "cozy_social",      label: "Game night",     emoji: "🎲" },
      { value: "home_reset",       label: "Home reset",     emoji: "🛋️" },
      { value: "museum",           label: "Museum",         emoji: "🖼️" },
      { value: "nightlife",        label: "Late night",     emoji: "🍸" },
      { value: "outdoor",          label: "Outdoor",        emoji: "🏔️" },
      { value: "roadtrip",         label: "Road trip",      emoji: "🚗" },
      { value: "solo_cafe",        label: "Solo café",      emoji: "☕" },
    ],
  },
  {
    id: "style_icon",
    label: "My style feels like",
    mandatory: false,
    options: [
      { value: "anya_taylor_joy",  label: "Anya Taylor-Joy",  emoji: "📖" },
      { value: "robert_pattinson", label: "Robert Pattinson", emoji: "📖" },
      { value: "theo_james",       label: "Theo James",       emoji: "🏛️" },
      { value: "song_hye_kyo",     label: "Song Hye Kyo",     emoji: "🏛️" },
      { value: "asap_rocky",       label: "A$AP Rocky",       emoji: "🎿" },
      { value: "bella_hadid",      label: "Bella Hadid",      emoji: "🎿" },
      { value: "hailey_bieber",    label: "Hailey Bieber",    emoji: "🤍" },
      { value: "tom_hardy",        label: "Tom Hardy",        emoji: "🪵" },
      { value: "kim_go_eun",       label: "Kim Go Eun",       emoji: "📖" },
      { value: "gong_yoo",         label: "Gong Yoo",         emoji: "📖" },
      { value: "billie_eilish",    label: "Billie Eilish",    emoji: "🔥" },
      { value: "g_dragon",         label: "G-Dragon",         emoji: "🔥" },
      { value: "dakota_johnson",   label: "Dakota Johnson",   emoji: "✨" },
      { value: "jacob_elordi",     label: "Jacob Elordi",     emoji: "✨" },
      { value: "wonyoung",         label: "Wonyoung",         emoji: "🌹" },
      { value: "cha_eun_woo",      label: "Cha Eun Woo",      emoji: "🌹" },
      { value: "rose_park",        label: "Rosé",             emoji: "🌸" },
      { value: "hua_quang_han",    label: "Hứa Quang Hán",    emoji: "🌸" },
      { value: "monica_bellucci",  label: "Monica Bellucci",  emoji: "💄" },
      { value: "austin_butler",    label: "Austin Butler",    emoji: "💄" },
      { value: "zoe_kravitz",      label: "Zoë Kravitz",      emoji: "🌙" },
      { value: "brad_pitt",        label: "Brad Pitt",        emoji: "🌙" },
      { value: "zendaya",          label: "Zendaya",          emoji: "👗" },
      { value: "harry_styles",     label: "Harry Styles",     emoji: "👗" },
    ],
  },
  {
    id: "mbti",
    label: "My MBTI is",
    mandatory: false,
    options: [
      { value: "INTJ", label: "INTJ", emoji: "🏛️" },
      { value: "INTP", label: "INTP", emoji: "🔬" },
      { value: "ENTJ", label: "ENTJ", emoji: "👑" },
      { value: "ENTP", label: "ENTP", emoji: "⚡" },
      { value: "INFJ", label: "INFJ", emoji: "🌿" },
      { value: "INFP", label: "INFP", emoji: "🌙" },
      { value: "ENFJ", label: "ENFJ", emoji: "🌟" },
      { value: "ENFP", label: "ENFP", emoji: "🦋" },
      { value: "ISTJ", label: "ISTJ", emoji: "📐" },
      { value: "ISFJ", label: "ISFJ", emoji: "🤍" },
      { value: "ESTJ", label: "ESTJ", emoji: "🏗️" },
      { value: "ESFJ", label: "ESFJ", emoji: "🌻" },
      { value: "ISTP", label: "ISTP", emoji: "🔧" },
      { value: "ISFP", label: "ISFP", emoji: "🎨" },
      { value: "ESTP", label: "ESTP", emoji: "🎯" },
      { value: "ESFP", label: "ESFP", emoji: "🎉" },
    ],
  },
  {
    id: "music",
    label: "The soundtrack of my life",
    mandatory: false,
    options: [
      { value: "pop",             label: "Pop",             emoji: "🎤" },
      { value: "indie",           label: "Indie",           emoji: "🎸" },
      { value: "rnb_soul",        label: "R&B / Soul",      emoji: "🎷" },
      { value: "jazz",            label: "Jazz",            emoji: "🎺" },
      { value: "classical",       label: "Classical",       emoji: "🎻" },
      { value: "kpop",            label: "K-pop",           emoji: "💜" },
      { value: "hiphop",          label: "Hip-hop",         emoji: "🎧" },
      { value: "electronic",      label: "Electronic",      emoji: "🎹" },
      { value: "folk_acoustic",   label: "Folk / Acoustic", emoji: "🪕" },
      { value: "alternative",     label: "Alternative",     emoji: "🎵" },
      { value: "latin",           label: "Latin",           emoji: "💃" },
      { value: "musical_theatre", label: "Musical Theatre", emoji: "🎭" },
    ],
  },
  {
    id: "closet_aesthetic",
    label: "My wardrobe aesthetic is",
    mandatory: false,
    options: [
      { value: "dark_academia",        label: "Dark academia",        emoji: "📖" },
      { value: "modern_parisian_chic", label: "Parisian chic",         emoji: "🥐" },
      { value: "old_money_european",   label: "Old money",             emoji: "🏛️" },
      { value: "scandinavian_minimal", label: "Scandi minimal",        emoji: "🌿" },
      { value: "streetwear_hiphop",    label: "Streetwear",            emoji: "🧢" },
      { value: "y2k_trendy",           label: "Y2K & Trendy",          emoji: "💿" },
      { value: "clean_sporty",         label: "Clean sporty",          emoji: "⚡" },
      { value: "retro_chic",           label: "Retro, grandpa style",  emoji: "👴" },
      { value: "urban_modern",         label: "Urban modern",          emoji: "🏙️" },
      { value: "smart_casual",         label: "Smart casual",          emoji: "💼" },
      { value: "sensual_glamour",      label: "Sensual glamour",       emoji: "🌹" },
      { value: "cottage_core",         label: "Cottagecore",           emoji: "🌼" },
      { value: "refined_office",       label: "Refined office",        emoji: "👔" },
      { value: "rusty",                label: "Rusty, rugged",         emoji: "🪵" },
    ],
  },
  {
    id: "rising_sign",
    label: "My rising sign is",
    mandatory: false,
    options: [
      { value: "aries",       label: "Aries",       emoji: "♈" },
      { value: "taurus",      label: "Taurus",      emoji: "♉" },
      { value: "gemini",      label: "Gemini",      emoji: "♊" },
      { value: "cancer",      label: "Cancer",      emoji: "♋" },
      { value: "leo",         label: "Leo",         emoji: "♌" },
      { value: "virgo",       label: "Virgo",       emoji: "♍" },
      { value: "libra",       label: "Libra",       emoji: "♎" },
      { value: "scorpio",     label: "Scorpio",     emoji: "♏" },
      { value: "sagittarius", label: "Sagittarius", emoji: "♐" },
      { value: "capricorn",   label: "Capricorn",   emoji: "♑" },
      { value: "aquarius",    label: "Aquarius",    emoji: "♒" },
      { value: "pisces",      label: "Pisces",      emoji: "♓" },
    ],
  },
  {
    id: "budget",
    label: "My budget for 50ml",
    mandatory: true,
    options: [
      { value: "2_000_000_to_3_500_000", label: "2M – 3.5M VND",  emoji: "💰" },
      { value: "3_500_000_to_5_000_000", label: "3.5M – 5M VND",  emoji: "💎" },
      { value: "over_5_000_000",         label: "Over 5M VND",    emoji: "✨" },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hasAnswer(answers: AnswerMap, id: string): boolean {
  const a = answers[id];
  if (Array.isArray(a)) return a.length > 0;
  return !!a;
}

function getOptions(answers: AnswerMap, q: typeof REVIEW_QUESTIONS[number]) {
  const raw = answers[q.id];
  const vals = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return vals.map((v) => q.options.find((o) => o.value === v) ?? { value: v, label: v, emoji: "" });
}

// ─── Shared style tokens ───────────────────────────────────────────────────────
const font = "var(--font-inter), 'Inter', sans-serif";
const serif = "var(--font-playfair), 'Playfair Display', serif";

export default function ReviewPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("quiz_answers");
    if (saved) {
      try { setAnswers(JSON.parse(saved)); } catch { /* ignore */ }
    }
    setReady(true);
  }, []);

  const missingMandatory = REVIEW_QUESTIONS.filter(
    (q) => q.mandatory && !hasAnswer(answers, q.id),
  );
  const allMandatoryDone = missingMandatory.length === 0;

  function handleSubmit() {
    if (!allMandatoryDone) return;
    router.push("/loading");
  }

  /** Navigate to a question in edit mode — /quiz?q=N&from=review */
  function editQuestion(index: number) {
    router.push(`/quiz?q=${index}&from=review`);
  }

  if (!ready) return null;

  return (
    <main style={{ minHeight: "100dvh", background: "#FAFAF8" }}>

      {/* ── Progress bar: locked at 100% ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, height: 4, width: "100%", background: "#E7E5E4" }}>
        <div style={{ height: "100%", width: "100%", background: "linear-gradient(to right, #1C1917, #44403C)", transition: "width 0.3s ease-out" }} />
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 180px" }}>

        {/* ── Back ── */}
        <button
          type="button"
          onClick={() => router.back()}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "#57534E", background: "none", border: "none", cursor: "pointer", padding: "4px 0", marginBottom: 32, fontFamily: font }}
        >
          ← Back
        </button>

        {/* ── Title ── */}
        <h1 style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.25, letterSpacing: "-0.02em", color: "#1C1917", fontFamily: serif, margin: "0 0 40px" }}>
          Let&apos;s take a final look<br />at your profile!
        </h1>

        {/* ── Question rows ── */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {REVIEW_QUESTIONS.map((q, qIndex) => {
            const answered = hasAnswer(answers, q.id);
            const selected = getOptions(answers, q);

            return (
              <div
                key={q.id}
                style={{ borderTop: "0.5px solid #E7E5E4", padding: "20px 0", display: "flex", flexDirection: "column", gap: 12 }}
              >
                {/* Row header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#A8A29E", fontFamily: font, letterSpacing: "0.04em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                    {q.label}
                    {q.mandatory && !answered && (
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#BCBAB3" }}>
                        must
                      </span>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => editQuestion(qIndex)}
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 11, color: "#BCBAB3", textDecoration: "underline", flexShrink: 0, fontFamily: font }}
                  >
                    edit
                  </button>
                </div>

                {/* Pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {answered ? (
                    selected.map((opt) => (
                      <span
                        key={opt.value}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          borderRadius: 999,
                          border: "0.5px solid rgba(28,25,23,0.15)",
                          padding: "9px 18px",
                          background: "rgba(28,25,23,0.05)",
                          fontSize: 22,
                          fontWeight: 400,
                          color: "#1C1917",
                          letterSpacing: "-0.01em",
                          fontFamily: font,
                        }}
                      >
                        {opt.emoji && <span style={{ fontSize: 20, lineHeight: 1 }}>{opt.emoji}</span>}
                        {opt.label}
                      </span>
                    ))
                  ) : (
                    // Unanswered — ghosted placeholder pill
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => editQuestion(qIndex)}
                      onKeyDown={(e) => e.key === "Enter" && editQuestion(qIndex)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        borderRadius: 999,
                        border: "0.5px solid #D8D5CE",
                        padding: "9px 18px",
                        background: "transparent",
                        fontSize: 18,
                        color: "#D8D5CE",
                        letterSpacing: "-0.01em",
                        fontFamily: font,
                        filter: "blur(0.3px)",
                        opacity: 0.7,
                        cursor: "pointer",
                      }}
                    >
                      pick yours ✦
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Bottom border */}
          <div style={{ borderTop: "0.5px solid #E7E5E4" }} />
        </div>
      </div>

      {/* ── Sticky CTA bar ── */}
      <div style={{ position: "fixed", inset: "auto 0 0 0", zIndex: 10, background: "linear-gradient(to top, #FAFAF8 55%, rgba(250,250,248,0.96) 75%, transparent)", padding: "20px 16px 32px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          {/* Reminder banner — shown only when mandatory incomplete */}
          {!allMandatoryDone && (
            <div style={{ marginBottom: 14, padding: "14px 18px", borderRadius: 14, border: "0.5px solid #E7E5E4", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(10px)" }}>
              <p style={{ margin: 0, fontSize: 13, color: "#57534E", fontFamily: font, lineHeight: 1.65 }}>
                Way to go, you&apos;re nearly there! To be ready, fill in{" "}
                {missingMandatory.map((q, i) => {
                  const qIndex = REVIEW_QUESTIONS.indexOf(q);
                  return (
                    <span key={q.id}>
                      {i > 0 && ", "}
                      <button
                        type="button"
                        onClick={() => editQuestion(qIndex)}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, color: "#1C1917", fontWeight: 600, textDecoration: "underline", fontFamily: font }}
                      >
                        {q.label.toLowerCase()}
                      </button>
                    </span>
                  );
                })}
                . These can&apos;t be missed to translate you into your bottle.
              </p>
            </div>
          )}

          {/* CTA button */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allMandatoryDone}
              style={{
                width: "100%",
                maxWidth: 360,
                padding: "15px 24px",
                borderRadius: 999,
                border: "none",
                background: allMandatoryDone ? "#1C1917" : "#E7E5E4",
                color: allMandatoryDone ? "#FAFAF8" : "#BCBAB3",
                fontSize: 15,
                fontWeight: 500,
                letterSpacing: "-0.01em",
                cursor: allMandatoryDone ? "pointer" : "not-allowed",
                fontFamily: font,
                transition: "background 0.2s, color 0.2s",
              }}
            >
              I&apos;m ready →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
