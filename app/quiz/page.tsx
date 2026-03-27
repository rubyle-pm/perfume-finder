"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuizQuestionCard } from "@/components/quiz/quiz-question-card";
import { ArrowLeft, ArrowRight, ChevronDown, Home } from "lucide-react";

// All 12 quiz questions matching quiz-config.ts
const DEMO_QUESTIONS = [
  // Q1: gender_pref - single, no image options
  {
    id: "gender_pref",
    kind: "single" as const,
    questionText: "What kind of scent profile are you drawn to?",
    questionImageUrl: "/images/quiz/gender-pref-banner.jpg",
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
    questionImageUrl: "/images/quiz/use-case-banner.jpg",
    options: [
      { value: "office", label: "At work, office", emoji: "💼", subtitle: "Professional settings" },
      { value: "daily_casual", label: "Daily, casual wear", emoji: "👕", subtitle: "Everyday comfort" },
      { value: "evening", label: "Date night or hanging out late", emoji: "🌙", subtitle: "Evening occasions" },
      { value: "outdoor_sporty", label: "Outdoor, being active", emoji: "🏃", subtitle: "Sports & nature" },
      { value: "special_occasion", label: "Special social occasions", emoji: "🥂", subtitle: "Celebrations" },
      { value: "travel", label: "Traveling", emoji: "✈️", subtitle: "On the go" },
      { value: "home_body", label: "At home, comfy in my skin", emoji: "🛋️", subtitle: "Cozy vibes" },
    ],
  },
  // Q3: mood - hybrid with image options
  {
    id: "mood",
    kind: "hybrid" as const,
    questionText: "What mood do you want your scent to project?",
    options: [
      { value: "complicated_seductive_intellectual", label: "Seductive & intellectual", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" },
      { value: "soft_romantic_nostalgic", label: "Romantic & nostalgic", imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=400&fit=crop" },
      { value: "bold_confident_present", label: "Bold & confident", imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop" },
      { value: "effortless_cool_woke_up_like_this", label: "Effortless & cool", imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=400&fit=crop" },
      { value: "playful_warm_unexpected", label: "Playful & warm", imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop" },
      { value: "grounded_calm_quiet_luxury", label: "Grounded & calm", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop" },
      { value: "mysterious_edgy_artistic", label: "Mysterious & edgy", imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop" },
    ],
  },
  // Q4: scent_type - single, no image options
  {
    id: "scent_type",
    kind: "single" as const,
    questionText: "Which kinds of scent do you gravitate toward?",
    questionImageUrl: "/images/quiz/scent-type-banner.jpg",
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
    questionImageUrl: "/images/quiz/dislike-banner.jpg",
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
  // Q6: weekend_vibe - single, no image options
  {
    id: "weekend_vibe",
    kind: "single" as const,
    questionText: "How would you describe your perfect weekend me-time?",
    questionImageUrl: "/images/quiz/weekend-banner.jpg",
    options: [
      { value: "cozy_solo_cafe", label: "Cozy solo cafe", emoji: "☕", subtitle: "Creative projects, quiet time" },
      { value: "museum_gallery", label: "Museum wandering", emoji: "🖼️", subtitle: "Art, culture, inspiration" },
      { value: "hiking_outdoor", label: "Outdoor adventure", emoji: "🏔️", subtitle: "Nature, exploration" },
      { value: "long_brunch", label: "Long brunch", emoji: "🥐", subtitle: "Friends, good food" },
      { value: "home_reset", label: "Home-body", emoji: "🛋️", subtitle: "Cleaning, organizing" },
      { value: "spontaneous_road_trip", label: "Spontaneous road trip", emoji: "🚗", subtitle: "Adventure awaits" },
      { value: "book_blanket_hermit", label: "Book & blanket", emoji: "😶‍🌫️", subtitle: "Withdraw from the world" },
      { value: "late_night_social", label: "Late night social", emoji: "🍸", subtitle: "Out till 1am" },
    ],
  },
  // Q7: style_icon - hybrid with images, archetype text only (no star names)
  {
    id: "style_icon",
    kind: "hybrid" as const,
    questionText: "Who is your style icon?",
    options: [
      { value: "clean_girl", label: "Clean girl", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop" },
      { value: "soft_girl_next_door", label: "Soft, girl-next-door", imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop" },
      { value: "modern_feminine", label: "Modern feminine", imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop" },
      { value: "effortless_chic", label: "Effortless chic", imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop" },
      { value: "timeless_elegance", label: "Timeless elegance", imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop" },
      { value: "classic_bombshell", label: "Classic bombshell", imageUrl: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop" },
      { value: "sporty_glam", label: "Sporty glam", imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop" },
      { value: "boho_indie", label: "Boho indie", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
      { value: "rebellious_gen_z", label: "Rebellious, Gen Z", imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop" },
      { value: "coquette", label: "Coquette", imageUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop" },
      { value: "modern_masculinity", label: "Modern masculinity", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop" },
      { value: "pretty_prince", label: "Pretty prince", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" },
      { value: "dark_intellectual_male", label: "Dark intellectual", imageUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop" },
      { value: "old_money_masculine", label: "Old money masculine", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop" },
      { value: "quiet_luxury_feminine", label: "Quiet luxury feminine", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop" },
      { value: "street_culture", label: "Street culture", imageUrl: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&h=400&fit=crop" },
    ],
  },
  // Q8: mbti - mbti tag-pair layout
  {
    id: "mbti",
    kind: "mbti" as const,
    questionText: "What is your MBTI?",
    options: [
      { value: "INTJ", label: "INTJ" },
      { value: "INTP", label: "INTP" },
      { value: "ENTJ", label: "ENTJ" },
      { value: "ENTP", label: "ENTP" },
      { value: "INFJ", label: "INFJ" },
      { value: "INFP", label: "INFP" },
      { value: "ENFJ", label: "ENFJ" },
      { value: "ENFP", label: "ENFP" },
      { value: "ISTJ", label: "ISTJ" },
      { value: "ISFJ", label: "ISFJ" },
      { value: "ESTJ", label: "ESTJ" },
      { value: "ESFJ", label: "ESFJ" },
      { value: "ISTP", label: "ISTP" },
      { value: "ISFP", label: "ISFP" },
      { value: "ESTP", label: "ESTP" },
      { value: "ESFP", label: "ESFP" },
    ],
  },
  // Q9: music - single, no image options (changed from hybrid)
  {
    id: "music",
    kind: "single" as const,
    questionText: "What's your favourite genre - or a song you're playing on repeat?",
    questionImageUrl: "/images/quiz/music-banner.jpg",
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
  // Q10: closet_aesthetic - hybrid with image options
  {
    id: "closet_aesthetic",
    kind: "hybrid" as const,
    questionText: "How does your staple closet look?",
    options: [
      { value: "cottage_core", label: "Cottage core", imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop" },
      { value: "streetwear_hiphop", label: "Streetwear / Hip-hop", imageUrl: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&h=400&fit=crop" },
      { value: "modern_parisian_chic", label: "Modern Parisian chic", imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop" },
      { value: "y2k_trendy", label: "Y2K and trendy", imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop" },
      { value: "scandinavian_minimal", label: "Scandinavian minimal", imageUrl: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=400&fit=crop" },
      { value: "old_money_european", label: "Old money / European", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" },
      { value: "clean_sporty", label: "Clean & sporty", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop" },
      { value: "experimental", label: "Experimental", imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop" },
      { value: "dark_academia", label: "Dark academia", imageUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop" },
      { value: "sensual_glamour", label: "Sensual glamour", imageUrl: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop" },
    ],
  },
  // Q11: rising_sign - hybrid with image options
  {
    id: "rising_sign",
    kind: "hybrid" as const,
    questionText: "What is your rising sign?",
    options: [
      { value: "aries", label: "Aries", emoji: "♈", imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=400&fit=crop" },
      { value: "taurus", label: "Taurus", emoji: "♉", imageUrl: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400&h=400&fit=crop" },
      { value: "gemini", label: "Gemini", emoji: "♊", imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=400&fit=crop" },
      { value: "cancer", label: "Cancer", emoji: "♋", imageUrl: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400&h=400&fit=crop" },
      { value: "leo", label: "Leo", emoji: "♌", imageUrl: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&h=400&fit=crop" },
      { value: "virgo", label: "Virgo", emoji: "♍", imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=400&fit=crop" },
      { value: "libra", label: "Libra", emoji: "♎", imageUrl: "https://images.unsplash.com/photo-1490730141103-6cac27abb37f?w=400&h=400&fit=crop" },
      { value: "scorpio", label: "Scorpio", emoji: "♏", imageUrl: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=400&h=400&fit=crop" },
      { value: "sagittarius", label: "Sagittarius", emoji: "♐", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=400&fit=crop" },
      { value: "capricorn", label: "Capricorn", emoji: "♑", imageUrl: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400&h=400&fit=crop" },
      { value: "aquarius", label: "Aquarius", emoji: "♒", imageUrl: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=400&h=400&fit=crop" },
      { value: "pisces", label: "Pisces", emoji: "♓", imageUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&h=400&fit=crop" },
    ],
  },
  // Q12: budget - single, no image options
  {
    id: "budget",
    kind: "single" as const,
    questionText: "What is your budget for 50ml?",
    questionImageUrl: "/images/quiz/budget-banner.jpg",
    options: [
      { value: "2_000_000_to_3_500_000", label: "2,000,000 - 3,500,000 VND", emoji: "💰", subtitle: "Entry luxury" },
      { value: "3_500_000_to_5_000_000", label: "3,500,000 - 5,000,000 VND", emoji: "💎", subtitle: "Mid-range luxury" },
      { value: "over_5_000_000", label: "Over 5,000,000 VND", emoji: "✨", subtitle: "Premium selection" },
    ],
  },
];

type AnswerMap = Record<string, string | string[]>;

export default function QuizDemoPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalQuestions = DEMO_QUESTIONS.length;
  const currentQuestion = DEMO_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

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
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function goToNext() {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Last question — save answers and go to loading
      sessionStorage.setItem("quiz_answers", JSON.stringify(answers));
      router.push("/loading");
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

  function handleSelectionComplete() {
    // Auto-advance for single-select and mbti questions
    if (currentQuestion.kind === "single" || currentQuestion.kind === "mbti") {
      goToNext();
    }
  }

  const hasCurrentAnswer = (() => {
    const answer = answers[currentQuestion.id];
    if (Array.isArray(answer)) {
      return answer.length > 0;
    }
    return !!answer;
  })();

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isMultiOrHybrid = currentQuestion.kind === "multi" || currentQuestion.kind === "hybrid";

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
                className="ds-btn ds-btn-sm border border-[#1C1917]"
              >
                {currentQuestionIndex + 1}/{totalQuestions}
                <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute left-0 top-full z-30 mt-2 w-64 rounded-2xl border-2 border-[#E7E5E4] bg-white py-2 shadow-lg">
                  {DEMO_QUESTIONS.map((q, index) => {
                    const hasAnswer = !!answers[q.id];
                    const isCurrent = index === currentQuestionIndex;
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
                        {hasAnswer && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right side: Home button (black pill) */}
          <button
            type="button"
            onClick={() => window.location.href = "/"}
            className="ds-btn ds-btn-sm"
          >
            <Home className="h-3.5 w-3.5" />
            Home
          </button>
        </header>

        {/* Question Card */}
        <QuizQuestionCard
          key={currentQuestion.id}
          id={currentQuestion.id}
          questionText={currentQuestion.questionText}
          kind={currentQuestion.kind}
          options={currentQuestion.options}
          selectedValues={answers[currentQuestion.id] || (isMultiOrHybrid ? [] : "")}
          onSelect={(value) => handleSelect(currentQuestion.id, value)}
          maxSelections={3}
          onSelectionComplete={handleSelectionComplete}
          questionImageUrl={currentQuestion.kind !== "hybrid" && currentQuestion.kind !== "mbti" ? currentQuestion.questionImageUrl : undefined}
        />
      </div>

      {/* Sticky bottom navigation */}
      {isMultiOrHybrid && (
        <div className="fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#FAFAF8] via-[#FAFAF8]/90 to-transparent px-4 pb-6 pt-4">
          <div className="mx-auto flex max-w-[720px] gap-3">
            {!isFirstQuestion && (
              <button
                type="button"
                onClick={goToPrevious}
                className="ds-btn ds-btn-ghost"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
            <button
              type="button"
              onClick={goToNext}
              disabled={!hasCurrentAnswer}
              className="ds-btn ds-btn-primary flex-1 text-sm font-bold uppercase tracking-[0.06em] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLastQuestion ? "See Results" : "Continue"}
              {!isLastQuestion && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
