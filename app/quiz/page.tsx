"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QuizQuestionCard } from "@/components/quiz/quiz-question-card";
import { ChevronDown } from "lucide-react";
import type { QuizOption } from "@/components/quiz/quiz-question-card";

// All 12 quiz questions matching quiz-config.ts
const DEMO_QUESTIONS = [
  // Q1: gender_pref - single, no image options
  {
    id: "gender_pref",
    kind: "single" as const,
    questionText: "What kind of scent profile are you drawn to?",
    questionImageUrl: "/quiz-image/quiz1.jpg",
    options: [
      { value: "feminine", label: "Feminine", emoji: "🌸", subtitle: "Soft, floral, elegant" },
      { value: "masculine", label: "Masculine", emoji: "🌲", subtitle: "Bold, woody, confident" },
      { value: "unisex", label: "Unisex", emoji: "✨", subtitle: "Balanced, versatile" },
    ],
  },
  // Q2: use_case - single, no image options
  {
    id: "use_case",
    kind: "single" as const,
    questionText: "When will you wear this fragrance most?",
    questionImageUrl: "/quiz-image/quiz2.jpg",
    options: [
      { value: "office", label: "At work & office", emoji: "💼", subtitle: "Professional settings" },
      { value: "daily_casual", label: "Daily, casual wear", emoji: "👕", subtitle: "Everyday comfort" },
      { value: "evening", label: "Date night or hanging out late", emoji: "🌙", subtitle: "Evening occasions" },
      { value: "outdoor_sporty", label: "Outdoor, being active", emoji: "🏃", subtitle: "Sports & nature" },
      { value: "special_occasion", label: "Special social occasions", emoji: "🥂", subtitle: "Celebrations" },
      { value: "travel", label: "Traveling", emoji: "✈️", subtitle: "On the go" },
      { value: "home_body", label: "At home, comfy in my skin", emoji: "🛋️", subtitle: "Cozy vibes" },
    ],
  },
  // Q3: mood - single select
  {
    id: "mood",
    kind: "single" as const,
    questionText: "What mood do you want your scent to project?",
    questionImageUrl: "/quiz-image/quiz3.jpg",
    options: [
      { value: "complicated_seductive_intellectual", label: "Seductive yet intellectual", emoji: "🍷", subtitle: "Deep and complex" },
      { value: "soft_romantic_nostalgic", label: "Romantic, a bit nostalgic", emoji: "🕊️", subtitle: "Soft and delicate" },
      { value: "bold_confident_present", label: "Bold and confident", emoji: "🦁", subtitle: "Commanding presence" },
      { value: "effortless_cool_woke_up_like_this", label: "Effortless and cool", emoji: "😎", subtitle: "Relaxed charm" },
      { value: "playful_warm_unexpected", label: "Playful and warm", emoji: "✨", subtitle: "Bright and inviting" },
      { value: "grounded_calm_quiet_luxury", label: "Grounded, calm, loudly quiet", emoji: "🧘", subtitle: "Quiet luxury" },
      { value: "mysterious_edgy_artistic", label: "Mysterious, edgy, might be artistic", emoji: "🌑", subtitle: "Artistic aura" },
    ],
  },
  // Q4: scent_type - multi, max 2 options
  {
    id: "scent_type",
    kind: "multi" as const,
    questionText: "Which kinds of scent do you gravitate toward?",
    questionImageUrl: "/quiz-image/quiz4.jpg",
    maxSelections: 2,
    options: [
      { value: "fresh_airy", label: "Fresh & airy", emoji: "🌬️", subtitle: "Light, breezy notes" },
      { value: "warm_cozy", label: "Warm & cozy", emoji: "🫦", subtitle: "Inviting, comforting" },
      { value: "floral_feminine", label: "Floral & feminine", emoji: "🌷", subtitle: "Romantic, delicate" },
      { value: "dark_mysterious", label: "Dark & mysterious", emoji: "🌙", subtitle: "Intriguing, complex" },
      { value: "clean_minimal", label: "Clean & minimal", emoji: "🛁", subtitle: "Crisp, understated" },
      { value: "earthy_natural", label: "Earthy & natural", emoji: "🌿", subtitle: "Grounded, organic" },
    ],
  },
  // Q5: dislike_note - multi, no image options
  {
    id: "dislike_note",
    kind: "multi" as const,
    questionText: "Are there notes you want to avoid?",
    questionImageUrl: "/quiz-image/quiz5.jpg",
    options: [
      { value: "heavy_floral", label: "Heavy floral", emoji: "🌺", subtitle: "Overpowering blooms" },
      { value: "sweet_gourmand", label: "Sweet gourmand", emoji: "🍬", subtitle: "Candy, pastry notes" },
      { value: "smoky_tobacco_spicy", label: "Smoky & spicy", emoji: "🔥", subtitle: "Tobacco, smoke" },
      { value: "incense_resin", label: "Incense & resin", emoji: "🕯️", subtitle: "Aromatherapy notes" },
      { value: "aquatic_soapy", label: "Aquatic or soapy", emoji: "🌊", subtitle: "Ocean, clean soap" },
      { value: "fruity_citrus", label: "Fruity & citrus", emoji: "🍊", subtitle: "Bright fruit notes" },
      { value: "earthy_wet_wood", label: "Earthy, wet wood", emoji: "🪵", subtitle: "Forest floor" },
      { value: "musk", label: "Musk", emoji: "🫧", subtitle: "Skin-like notes" },
    ],
  },
  // Q6: weekend_vibe - hybrid image grid, max 1 option
  {
    id: "weekend_vibe",
    kind: "hybrid" as const,
    questionText: "How would you describe your perfect weekend me-time?",
    maxSelections: 1,
    options: [
      { value: "book_and_blanket", label: "Book & blanket, away from the world", imageUrl: "/quiz-image/quiz6/book-&-blanket.jpg" },
      { value: "brunch", label: "Long brunch with friends", imageUrl: "/quiz-image/quiz6/brunch.jpg" },
      { value: "cozy_social", label: "Cozy indoor boardgame night", imageUrl: "/quiz-image/quiz6/cozy-social.jpg" },
      { value: "home_reset", label: "Weekend home reset", imageUrl: "/quiz-image/quiz6/home-reset.jpg" },
      { value: "museum", label: "Museum & exhibition wandering", imageUrl: "/quiz-image/quiz6/museum.jpg" },
      { value: "nightlife", label: "Late night hangouts", imageUrl: "/quiz-image/quiz6/nightlife.jpg" },
      { value: "outdoor", label: "Outdoor adventure", imageUrl: "/quiz-image/quiz6/outdoor.jpg" },
      { value: "roadtrip", label: "Spontaneous road trip", imageUrl: "/quiz-image/quiz6/roadtrip.jpg" },
      { value: "solo_cafe", label: "Solo cafe, reading or doing side quests", imageUrl: "/quiz-image/quiz6/solo-cafe.jpg" },
    ],
  },
  // Q7: style_icon - hybrid image grid, single select
  {
    id: "style_icon",
    kind: "hybrid" as const,
    questionText: "Who is your style icon?",
    maxSelections: 1,
    options: [
      { value: "anya_taylor_joy", label: "Anya Taylor-Joy", subtitle: "Dark academia, poetic", imageUrl: "/quiz-image/quiz7/anya-dark.jpg", gender: "female", pairId: "dark_academia", imagePosition: "center 20%" },
      { value: "robert_pattinson", label: "Robert Pattinson", subtitle: "Dark academia, poetic", imageUrl: "/quiz-image/quiz7/robert-dark.jpg", gender: "male", pairId: "dark_academia", imagePosition: "center 15%" },
      { value: "theo_james", label: "Theo James", subtitle: "Classic gentlemen, refined", imageUrl: "/quiz-image/quiz7/james-classic.jpg", gender: "male", pairId: "elegant", imagePosition: "center 10%" },
      { value: "song_hye_kyo", label: "Song Hye Kyo", subtitle: "Classic elegance, refined", imageUrl: "/quiz-image/quiz7/SHK-classic.jpg", gender: "female", pairId: "elegant", imagePosition: "center 25%" },
      { value: "asap_rocky", label: "A$AP Rocky", subtitle: "Streetwear, off-duty cool", imageUrl: "/quiz-image/quiz7/asap-streetwear.jpg", gender: "male", pairId: "streetwear", imagePosition: "center 15%" },
      { value: "bella_hadid", label: "Bella Hadid", subtitle: "Streetwear, off-duty cool", imageUrl: "/quiz-image/quiz7/bella-streetwear.jpg", gender: "female", pairId: "streetwear", imagePosition: "center 20%" },
      { value: "hailey_bieber", label: "Hailey Bieber", subtitle: "Clean girl, inner glow", imageUrl: "/quiz-image/quiz7/hailey-clean.jpg", gender: "female", pairId: "minimal", imagePosition: "center 15%" },
      { value: "tom_hardy", label: "Tom Hardy", subtitle: "Raw, rugged masculine", imageUrl: "/quiz-image/quiz7/hardy-rugged.jpg", gender: "male", pairId: "minimal", imagePosition: "center 10%" },
      { value: "kim_go_eun", label: "Kim Go Eun", subtitle: "Quiet, gentle, intellectual", imageUrl: "/quiz-image/quiz7/kge-lowkey.jpg", gender: "female", pairId: "intellectual", imagePosition: "center 25%" },
      { value: "gong_yoo", label: "Gong Yoo", subtitle: "Quiet, gentle, intellectual", imageUrl: "/quiz-image/quiz7/gongyoo-lowkey.jpg", gender: "male", pairId: "intellectual", imagePosition: "center 15%" },
      { value: "billie_eilish", label: "Billie Eilish", subtitle: "Rebellious, introspective, edgy", imageUrl: "/quiz-image/quiz7/billie-rebel.jpg", gender: "female", pairId: "rebel", imagePosition: "center 20%" },
      { value: "g_dragon", label: "G-Dragon", subtitle: "Rebellious, introspective, edgy", imageUrl: "/quiz-image/quiz7/gd-rebel.jpg", gender: "male", pairId: "rebel", imagePosition: "center 15%" },
      { value: "dakota_johnson", label: "Dakota Johnson", subtitle: "Effortless chic, European", imageUrl: "/quiz-image/quiz7/dakota-effortless.jpg", gender: "female", pairId: "effortless", imagePosition: "center 20%" },
      { value: "jacob_elordi", label: "Jacob Elordi", subtitle: "Effortless chic, European", imageUrl: "/quiz-image/quiz7/jarcob-effortless.jpg", gender: "male", pairId: "effortless", imagePosition: "center 15%" },
      { value: "wonyoung", label: "Wonyoung", subtitle: "Candy girl, dreamy vibe", imageUrl: "/quiz-image/quiz7/wonyoung-dreamy.jpg", gender: "female", pairId: "sweet", imagePosition: "center 25%" },
      { value: "cha_eun_woo", label: "Cha Eun Woo", subtitle: "Pretty boy, dreamy vibe", imageUrl: "/quiz-image/quiz7/CEW-dreamy.jpg", gender: "male", pairId: "sweet", imagePosition: "center 10%" },
      { value: "rose_park", label: "Rosé", subtitle: "Soft glow, girl-next-door vibe", imageUrl: "/quiz-image/quiz7/rosie-soft.jpg", gender: "female", pairId: "soft", imagePosition: "center 15%" },
      { value: "hua_quang_han", label: "Hứa Quang Hán", subtitle: "Soft glow, boyfriend material", imageUrl: "/quiz-image/quiz7/HQH-soft.jpg", gender: "male", pairId: "soft", imagePosition: "center 20%" },
      { value: "monica_bellucci", label: "Monica Bellucci", subtitle: "Sensual, slow-burn", imageUrl: "/quiz-image/quiz7/monica-sensual.jpg", gender: "female", pairId: "sensual", imagePosition: "center 20%" },
      { value: "austin_butler", label: "Austin Butler", subtitle: "Sensual, slow-burn", imageUrl: "/quiz-image/quiz7/austin-sensual.jpg", gender: "male", pairId: "sensual", imagePosition: "center 15%" },
      { value: "zoe_kravitz", label: "Zoë Kravitz", subtitle: "Indie, relaxed, a bit artsy", imageUrl: "/quiz-image/quiz7/zoe-indie.jpg", gender: "female", pairId: "indie", imagePosition: "center 20%" },
      { value: "brad_pitt", label: "Brad Pitt", subtitle: "Indie, relaxed fit, playful", imageUrl: "/quiz-image/quiz7/brad-indie.jpg", gender: "male", pairId: "indie", imagePosition: "center 15%" },
      { value: "zendaya", label: "Zendaya", subtitle: "Modern feminine, confident", imageUrl: "/quiz-image/quiz7/zendaya-modern.jpg", gender: "female", pairId: "modern", imagePosition: "center 25%" },
      { value: "harry_styles", label: "Harry Styles", subtitle: "Modern masculine, expressive", imageUrl: "/quiz-image/quiz7/harry-modern.jpg", gender: "male", pairId: "modern", imagePosition: "center 15%" },
    ],
  },
  // Q8: mbti - single-select pill layout with emoji
  {
    id: "mbti",
    kind: "pill" as const,
    questionText: "What is your MBTI?",
    questionImageUrl: "/quiz-image/quiz8.jpg",
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
  // Q9: music - single, no image options (changed from hybrid)
  {
    id: "music",
    kind: "single" as const,
    questionText: "What's your favourite genre - or a song you're playing on repeat?",
    questionImageUrl: "/quiz-image/quiz9.jpg",
    options: [
      { value: "pop", label: "Pop", emoji: "🎤", subtitle: "Chart hits, catchy melodies" },
      { value: "indie", label: "Indie", emoji: "🎸", subtitle: "Alternative, underground" },
      { value: "rnb_soul", label: "R&B / Soul", emoji: "🎷", subtitle: "Smooth, soulful vibes" },
      { value: "jazz", label: "Jazz", emoji: "🎺", subtitle: "Classic, improvisational" },
      { value: "classical", label: "Classical", emoji: "🎻", subtitle: "Timeless compositions" },
      { value: "kpop", label: "K-pop", emoji: "💜", subtitle: "Korean pop culture" },
      { value: "hiphop", label: "Hip-hop", emoji: "🎧", subtitle: "Beats, flow, culture" },
      { value: "electronic", label: "Electronic", emoji: "🎹", subtitle: "Synths, beats, drops" },
      { value: "folk_acoustic", label: "Folk / Acoustic", emoji: "🪕", subtitle: "Organic, storytelling" },
      { value: "alternative", label: "Alternative", emoji: "🎵", subtitle: "Genre-defying sounds" },
      { value: "latin", label: "Latin", emoji: "💃", subtitle: "Rhythmic, passionate" },
      { value: "musical_theatre", label: "Musical Theatre", emoji: "🎭", subtitle: "Broadway & beyond" },
    ],
  },
  // Q10: closet_aesthetic - hybrid with image options, max 2
  {
    id: "closet_aesthetic",
    kind: "hybrid" as const,
    questionText: "How does your staple closet look?",
    maxSelections: 2,
    options: [
      // Female
      { value: "dark_academia", label: "Dark Academia", imageUrl: "/quiz-image/quiz10/female/academia.jpg", gender: "female", pairId: "academia" },
      { value: "modern_parisian_chic", label: "Modern Parisian chic", imageUrl: "/quiz-image/quiz10/female/chic.jpg", gender: "female", pairId: "chic" },
      { value: "cottage_core", label: "Cottage core", imageUrl: "/quiz-image/quiz10/female/cottage.jpg", gender: "female", pairId: "cottage_core" },
      { value: "sensual_glamour", label: "Sensual glamour", imageUrl: "/quiz-image/quiz10/female/glam.jpg", gender: "female", pairId: "glam" },
      { value: "refined_office", label: "Refined office", imageUrl: "/quiz-image/quiz10/female/office.jpg", gender: "female", pairId: "office" },
      { value: "old_money_european", label: "Old money / European", imageUrl: "/quiz-image/quiz10/female/old-money.jpg", gender: "female", pairId: "old_money" },
      { value: "retro_chic", label: "Retro, grandpa style", imageUrl: "/quiz-image/quiz10/female/retro.jpg", gender: "female", pairId: "retro" },
      { value: "scandinavian_minimal", label: "Scandinavian minimal", imageUrl: "/quiz-image/quiz10/female/scandi.jpg", gender: "female", pairId: "scandi" },
      { value: "smart_casual", label: "Smart casual", imageUrl: "/quiz-image/quiz10/female/smart-casual.jpg", gender: "female", pairId: "smart_casual" },
      { value: "clean_sporty", label: "Athleisure", imageUrl: "/quiz-image/quiz10/female/sporty.jpg", gender: "female", pairId: "sporty" },
      { value: "streetwear_hiphop", label: "Streetwear / Hip-hop", imageUrl: "/quiz-image/quiz10/female/streetwear.jpg", gender: "female", pairId: "streetwear" },
      { value: "urban_modern", label: "Urban modern", imageUrl: "/quiz-image/quiz10/female/urban.jpg", gender: "female", pairId: "urban" },
      { value: "y2k_trendy", label: "Y2K and trendy", imageUrl: "/quiz-image/quiz10/female/y2k.jpg", gender: "female", pairId: "y2k" },

      // Male
      { value: "dark_academia", label: "Dark Academia", imageUrl: "/quiz-image/quiz10/male/academia.jpg", gender: "male", pairId: "academia" },
      { value: "modern_parisian_chic", label: "Modern Parisian chic", imageUrl: "/quiz-image/quiz10/male/chic-european.jpg", gender: "male", pairId: "chic" },
      { value: "sensual_glamour", label: "Sensual glamour", imageUrl: "/quiz-image/quiz10/male/glam.jpg", gender: "male", pairId: "glam" },
      { value: "old_money_european", label: "Old money / European", imageUrl: "/quiz-image/quiz10/male/old-money.jpg", gender: "male", pairId: "old_money" },
      { value: "retro_chic", label: "Retro, grandpa style", imageUrl: "/quiz-image/quiz10/male/retro.jpg", gender: "male", pairId: "retro" },
      { value: "rusty", label: "Rusty, rugged", imageUrl: "/quiz-image/quiz10/male/rusty.jpg", gender: "male", pairId: "rusty" },
      { value: "scandinavian_minimal", label: "Scandinavian minimal", imageUrl: "/quiz-image/quiz10/male/scandi.jpg", gender: "male", pairId: "scandi" },
      { value: "smart_casual", label: "Smart casual", imageUrl: "/quiz-image/quiz10/male/smart-casual.jpg", gender: "male", pairId: "smart_casual" },
      { value: "clean_sporty", label: "Athleisure", imageUrl: "/quiz-image/quiz10/male/sporty.jpg", gender: "male", pairId: "sporty" },
      { value: "streetwear_hiphop", label: "Streetwear / Hip-hop", imageUrl: "/quiz-image/quiz10/male/streetwear.jpg", gender: "male", pairId: "streetwear" },
      { value: "urban_modern", label: "Urban modern", imageUrl: "/quiz-image/quiz10/male/urban.jpg", gender: "male", pairId: "urban" },
      { value: "y2k_trendy", label: "Y2K and trendy", imageUrl: "/quiz-image/quiz10/male/y2k.jpg", gender: "male", pairId: "y2k" },
    ],
  },
  // Q11: rising_sign - single-select pill layout with emoji (same style as MBTI)
  {
    id: "rising_sign",
    kind: "pill" as const,
    questionText: "What is your rising sign?",
    questionImageUrl: "/quiz-image/quiz11.jpg",
    options: [
      { value: "aries", label: "Aries", emoji: "♈" },
      { value: "taurus", label: "Taurus", emoji: "♉" },
      { value: "gemini", label: "Gemini", emoji: "♊" },
      { value: "cancer", label: "Cancer", emoji: "♋" },
      { value: "leo", label: "Leo", emoji: "♌" },
      { value: "virgo", label: "Virgo", emoji: "♍" },
      { value: "libra", label: "Libra", emoji: "♎" },
      { value: "scorpio", label: "Scorpio", emoji: "♏" },
      { value: "sagittarius", label: "Sagittarius", emoji: "♐" },
      { value: "capricorn", label: "Capricorn", emoji: "♑" },
      { value: "aquarius", label: "Aquarius", emoji: "♒" },
      { value: "pisces", label: "Pisces", emoji: "♓" },
    ],
  },
  // Q12: budget - single, no image options
  {
    id: "budget",
    kind: "single" as const,
    questionText: "What is your budget for 50ml?",
    questionImageUrl: "/quiz-image/quiz12.jpg",
    options: [
      { value: "2_000_000_to_3_500_000", label: "2,000,000 - 3,500,000 VND", emoji: "💰", subtitle: "Entry luxury" },
      { value: "3_500_000_to_5_000_000", label: "3,500,000 - 5,000,000 VND", emoji: "💎", subtitle: "Mid-range luxury" },
      { value: "over_5_000_000", label: "Over 5,000,000 VND", emoji: "✨", subtitle: "Premium selection" },
    ],
  },
];

// Questions that MUST be answered before results can be generated
const MANDATORY_QUESTION_IDS = new Set([
  "gender_pref",  // Q1
  "use_case",     // Q2
  "mood",         // Q3
  "scent_type",   // Q4
  "dislike_note", // Q5
  "weekend_vibe", // Q6
  "budget",       // Q12
]);

type AnswerMap = Record<string, string | string[]>;

/** Helper: does an answer entry count as "answered" */
function hasAnswer(answers: AnswerMap, id: string): boolean {
  const a = answers[id];
  if (Array.isArray(a)) return a.length > 0;
  return !!a;
}

function QuizDemoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalQuestions = DEMO_QUESTIONS.length;
  const currentQuestion = DEMO_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Restore saved answers and jump to ?q=N on load
  useEffect(() => {
    const saved = sessionStorage.getItem("quiz_answers");
    if (saved) {
      try { setAnswers(JSON.parse(saved)); } catch { /* ignore */ }
    }
    const qParam = searchParams.get("q");
    if (qParam !== null) {
      const idx = parseInt(qParam, 10);
      if (!isNaN(idx) && idx >= 0 && idx < DEMO_QUESTIONS.length) {
        setCurrentQuestionIndex(idx);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add auto-scroll effect: scroll to top when question changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentQuestionIndex]);

  // True when user was sent here from the review page to edit one question
  const fromReview = searchParams.get("from") === "review";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(questionId: string, value: string | string[]) {
    const updated = { ...answers, [questionId]: value };
    setAnswers(updated);
    // Keep sessionStorage in sync so review page always has latest answers
    sessionStorage.setItem("quiz_answers", JSON.stringify(updated));
  }

  function goToNext() {
    // If editing from review, always go back to review after any advance
    if (fromReview) {
      router.push("/quiz/review");
      return;
    }
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Last question — handleSelect already saved to sessionStorage; just navigate
      router.push("/quiz/review");
    }
  }

  function goToPrevious() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }

  function goToQuestion(index: number) {
    setCurrentQuestionIndex(index);
    setIsDropdownOpen(false);
  }

  // Auto-advance for single & pill; ALSO for hybrid single selects
  function handleSelectionComplete() {
    const isSingleSelectionHybrid =
      (currentQuestion.id === "weekend_vibe" || currentQuestion.id === "style_icon") &&
      (currentQuestion as { maxSelections?: number }).maxSelections === 1;
    if (
      currentQuestion.kind === "single" ||
      currentQuestion.kind === "pill" ||
      isSingleSelectionHybrid
    ) {
      // Add a tiny delay for visual feedback before auto-advancing
      setTimeout(() => goToNext(), 400);
    }
  }

  // Check mandatory questions are all answered
  const missingMandatory = DEMO_QUESTIONS.filter(
    (q) => MANDATORY_QUESTION_IDS.has(q.id) && !hasAnswer(answers, q.id),
  );
  const allMandatoryAnswered = missingMandatory.length === 0;

  const hasCurrentAnswer = hasAnswer(answers, currentQuestion.id);

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isMultiOrHybrid = currentQuestion.kind === "multi" || currentQuestion.kind === "hybrid";
  const currentMaxSelections = (currentQuestion as { maxSelections?: number }).maxSelections;

  return (
    <main className="min-h-dvh bg-[#FAFAF8]">
      {/* Progress bar - sticky at top */}
      <div className="sticky top-0 z-20 h-1 w-full bg-[#e7e5e4]">
        <div
          className="h-full bg-gradient-to-r from-[#1C1917] to-[#44403C] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto max-w-[720px] px-4 pb-32 pt-6 md:px-6">
        {/* Header - To-do style from reference */}
        <header className="mb-8 flex items-center justify-between">
          {/* Left side: Quiz title (italic serif) + Question selector dropdown */}
          <div className="flex items-center gap-3">
            <span
              className="text-xl italic text-[#1c1917]"
              style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
            >
              Quiz
            </span>
            {/* Question number dropdown - white box with border */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="ds-btn ds-btn-glass ds-btn-sm"
                style={{
                  background: "rgba(235, 235, 235, 0.88)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  color: "#3C3C3E",
                  border: "1px solid rgba(255,255,255,0.6)",
                  boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.9), 0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                {currentQuestionIndex + 1}/{totalQuestions}
                <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute left-0 top-full z-30 mt-2 w-64 rounded-2xl border-2 border-[#E7E5E4] bg-white py-2 shadow-lg">
                  {/* Home link at top of list */}
                  <button
                    type="button"
                    onClick={() => { setIsDropdownOpen(false); window.location.href = "/"; }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#F5F5F4]"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 border-[#E7E5E4] text-[#57534E]">
                      👾
                    </span>
                    <span className="flex-1 text-[#44403C]">Welcome~</span>
                  </button>
                  <hr className="mx-4 border-t border-[#E7E5E4]" />
                  {DEMO_QUESTIONS.map((q, index) => {
                    const answered = hasAnswer(answers, q.id);
                    const isCurrent = index === currentQuestionIndex;
                    const isMandatory = MANDATORY_QUESTION_IDS.has(q.id);
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => goToQuestion(index)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#F5F5F4] ${isCurrent ? "bg-[#F5F5F4]" : ""}`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 text-xs font-semibold ${isCurrent ? "border-[#1C1917] bg-[#1C1917] text-white" : "border-[#E7E5E4] text-[#57534E]"}`}>
                          {index + 1}
                        </span>
                        <span className="flex-1 truncate text-[#44403C]">
                          {q.questionText.length > 30 ? q.questionText.slice(0, 30) + "..." : q.questionText}
                        </span>
                        {isMandatory && !answered && (
                          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-[#808080]">must</span>
                        )}
                        {answered && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right side: Back button — navigates to previous question */}
          {!isFirstQuestion ? (
            <button
              type="button"
              onClick={goToPrevious}
              className="ds-btn ds-btn-glass ds-btn-sm"
              style={{
                background: "rgba(235, 235, 235, 0.88)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                color: "#3C3C3E",
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.9), 0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              ← Back
            </button>
          ) : (
            <span />
          )}
        </header>

        {/* Question Card */}
        {(() => {
          let visibleOptions: QuizOption[] = (currentQuestion.options as QuizOption[]) ?? [];

          if (currentQuestion.id === "style_icon") {
            const genderPref = answers.gender_pref;
            if (genderPref === "feminine") {
              visibleOptions = visibleOptions.filter(o => o.gender === "female");
            } else if (genderPref === "masculine") {
              visibleOptions = visibleOptions.filter(o => o.gender === "male");
            } else {
              // Unisex: Surface specific representatives as requested
              const unisexRepresentatives = new Set([
                "anya_taylor_joy", "bella_hadid", "song_hye_kyo", "dakota_johnson",
                "cha_eun_woo", "zendaya", "zoe_kravitz", "g_dragon",
                "rose_park", "hailey_bieber", "gong_yoo", "monica_bellucci"
              ]);
              visibleOptions = visibleOptions.filter(o => unisexRepresentatives.has(o.value));
            }
          }

          if (currentQuestion.id === "closet_aesthetic") {
            const genderPref = answers.gender_pref;
            if (genderPref === "feminine") {
              visibleOptions = visibleOptions.filter(o => o.gender === "female");
            } else if (genderPref === "masculine") {
              visibleOptions = visibleOptions.filter(o => o.gender === "male");
            } else {
              // Unisex: Surface exactly 11 unique styles (pick best shot for each)
              const unisexPairs = [
                { pairId: "academia", gender: "female" },
                { pairId: "chic", gender: "male" },
                { pairId: "old_money", gender: "female" },
                { pairId: "scandi", gender: "male" },
                { pairId: "streetwear", gender: "female" },
                { pairId: "y2k", gender: "male" },
                { pairId: "sporty", gender: "female" },
                { pairId: "retro", gender: "male" },
                { pairId: "urban", gender: "female" },
                { pairId: "smart_casual", gender: "male" },
                { pairId: "glam", gender: "female" },
              ];
              visibleOptions = unisexPairs.map(p =>
                visibleOptions.find(o => o.pairId === p.pairId && o.gender === p.gender)
              ).filter(Boolean) as QuizOption[];
            }
          }

          return (
            <QuizQuestionCard
              key={currentQuestion.id}
              id={currentQuestion.id}
              questionText={currentQuestion.questionText}
              kind={currentQuestion.kind}
              options={visibleOptions}
              selectedValues={answers[currentQuestion.id] || (isMultiOrHybrid ? [] : "")}
              onSelect={(value: string | string[]) => handleSelect(currentQuestion.id, value)}
              maxSelections={currentMaxSelections ?? 3}
              onSelectionComplete={handleSelectionComplete}
              questionImageUrl={(currentQuestion as { questionImageUrl?: string }).questionImageUrl}
            />
          );
        })()}
      </div>

      {/* Sticky bottom navigation — for multi/hybrid, but NOT weekend_vibe (which auto-advances) */}
      {isMultiOrHybrid && currentQuestion.id !== "weekend_vibe" && (
        <div className="fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#FAFAF8] via-[#FAFAF8]/90 to-transparent px-4 pb-6 pt-4">
          <div className="mx-auto max-w-[720px]">
            {/* Mandatory warning — shown only on last question if gate not clear */}
            {isLastQuestion && !allMandatoryAnswered && (
              <div className="mb-3 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]">
                <strong>Almost there!</strong> Please answer the required questions first:{" "}
                {missingMandatory.map((q, i) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => goToQuestion(DEMO_QUESTIONS.indexOf(q))}
                    className="underline"
                  >
                    {i > 0 ? ", " : ""}
                    Q{DEMO_QUESTIONS.indexOf(q) + 1}
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={isLastQuestion && !allMandatoryAnswered ? undefined : goToNext}
                disabled={!hasCurrentAnswer || (isLastQuestion && !allMandatoryAnswered)}
                className="ds-btn ds-btn-primary w-full max-w-[360px] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLastQuestion ? "Review & finish" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/** Suspense wrapper required by Next.js App Router for useSearchParams */
export default function QuizPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#FAFAF8" }} />}>
      <QuizDemoPage />
    </Suspense>
  );
}
