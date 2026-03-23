"use client";

import { useState, useRef, useEffect } from "react";
import { QuizQuestionCard } from "@/components/quiz/quiz-question-card";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";

// Sample questions matching actual quiz-config.ts structure
// Quiz types from config:
// - single: gender_pref, use_case, mood, scent_type, weekend_vibe, mbti, closet_aesthetic, rising_sign, budget
// - multi: dislike_note
// - hybrid: style_icon, music (with images)
const DEMO_QUESTIONS = [
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
  {
    id: "mood",
    kind: "single" as const,
    questionText: "What mood do you want your scent to project?",
    questionImageUrl: "/images/quiz/mood-banner.jpg",
    options: [
      { value: "complicated_seductive_intellectual", label: "Seductive & intellectual", emoji: "🖤", subtitle: "Complicated, alluring" },
      { value: "soft_romantic_nostalgic", label: "Romantic & nostalgic", emoji: "💕", subtitle: "Soft, dreamy" },
      { value: "bold_confident_present", label: "Bold & confident", emoji: "👑", subtitle: "Unapologetically present" },
      { value: "effortless_cool_woke_up_like_this", label: "Effortless & cool", emoji: "🏙️", subtitle: "Woke up like this" },
      { value: "playful_warm_unexpected", label: "Playful & warm", emoji: "😈", subtitle: "A bit unexpected" },
    ],
  },
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
    ],
  },
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
      { value: "book_blanket_hermit", label: "Book & blanket", emoji: "😶‍🌫️", subtitle: "Withdraw from the world" },
    ],
  },
  {
    id: "style_icon",
    kind: "hybrid" as const,
    questionText: "Who is your style icon?",
    options: [
      { value: "clean_girl", label: "Clean girl", emoji: "✨", subtitle: "Hailey Bieber", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop" },
      { value: "soft_girl_next_door", label: "Soft, girl-next-door", emoji: "🌸", subtitle: "Rose", imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop" },
      { value: "modern_feminine", label: "Modern feminine", emoji: "💅", subtitle: "Zendaya", imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop" },
      { value: "effortless_chic", label: "Effortless chic", emoji: "🥐", subtitle: "Dakota Johnson", imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop" },
      { value: "timeless_elegance", label: "Timeless elegance", emoji: "🎬", subtitle: "Audrey Hepburn", imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop" },
      { value: "boho_indie", label: "Boho indie", emoji: "🌻", subtitle: "Zoe Kravitz", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
    ],
  },
  {
    id: "music",
    kind: "hybrid" as const,
    questionText: "What's your favourite genre - or a song you're playing on repeat?",
    options: [
      { value: "pop", label: "Pop", emoji: "🎤", imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop" },
      { value: "indie", label: "Indie", emoji: "🎸", imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop" },
      { value: "rnb_soul", label: "R&B / Soul", emoji: "🎷", imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop" },
      { value: "jazz", label: "Jazz", emoji: "🎺", imageUrl: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop" },
      { value: "classical", label: "Classical", emoji: "🎻", imageUrl: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop" },
      { value: "kpop", label: "K-pop", emoji: "💜", imageUrl: "https://images.unsplash.com/photo-1619983081563-430f63602796?w=400&h=400&fit=crop" },
    ],
  },
  {
    id: "closet_aesthetic",
    kind: "single" as const,
    questionText: "How does your staple closet look?",
    questionImageUrl: "/images/quiz/closet-banner.jpg",
    options: [
      { value: "cottage_core", label: "Cottage core", emoji: "🌾", subtitle: "Soft, romantic, nature" },
      { value: "streetwear_hiphop", label: "Streetwear", emoji: "🧢", subtitle: "Urban, bold, expressive" },
      { value: "modern_parisian_chic", label: "Parisian chic", emoji: "🥖", subtitle: "Effortless, timeless" },
      { value: "scandinavian_minimal", label: "Scandinavian minimal", emoji: "🤍", subtitle: "Clean lines, neutral" },
      { value: "old_money_european", label: "Old money", emoji: "🏛️", subtitle: "Classic, refined" },
      { value: "dark_academia", label: "Dark academia", emoji: "📚", subtitle: "Intellectual, moody" },
    ],
  },
  {
    id: "budget",
    kind: "single" as const,
    questionText: "What is your budget for 50ml?",
    questionImageUrl: "/images/quiz/budget-banner.jpg",
    options: [
      { value: "2_000_000_to_3_500_000", label: "2,000,000 - 3,500,000 VND", emoji: "💰" },
      { value: "3_500_000_to_5_000_000", label: "3,500,000 - 5,000,000 VND", emoji: "💎" },
      { value: "over_5_000_000", label: "Over 5,000,000 VND", emoji: "✨" },
    ],
  },
];

type AnswerMap = Record<string, string | string[]>;

export default function QuizDemoPage() {
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
    // Auto-advance for single-select questions
    if (currentQuestion.kind === "single") {
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
    <main className="min-h-dvh bg-gradient-to-b from-[#f8fafc] to-[#eef2f7]">
      {/* Progress bar - sticky at top */}
      <div className="sticky top-0 z-20 h-1 w-full bg-slate-200">
        <div
          className="h-full bg-gradient-to-r from-slate-900 to-slate-700 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto max-w-[720px] px-4 pb-32 pt-6 md:px-6">
        {/* Header - To-do style from reference */}
        <header className="mb-8 flex items-center justify-between">
          {/* Left side: Quiz title (italic serif) + Question selector dropdown */}
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl italic text-slate-900">Quiz</span>
            
            {/* Question number dropdown - white box with border */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 rounded-full border-2 border-slate-900 bg-white px-3 py-1 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
              >
                {currentQuestionIndex + 1}/{totalQuestions}
                <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute left-0 top-full z-30 mt-2 w-64 rounded-2xl border-2 border-slate-200 bg-white py-2 shadow-lg">
                  {DEMO_QUESTIONS.map((q, index) => {
                    const hasAnswer = !!answers[q.id];
                    const isCurrent = index === currentQuestionIndex;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => goToQuestion(index)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 ${
                          isCurrent ? "bg-slate-100" : ""
                        }`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 text-xs font-semibold ${
                          isCurrent ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-600"
                        }`}>
                          {index + 1}
                        </span>
                        <span className="flex-1 truncate text-slate-700">
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

          {/* Right side: Back button (black pill) */}
          <button
            type="button"
            onClick={() => window.location.href = "/"}
            className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
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
          questionImageUrl={currentQuestion.kind !== "hybrid" ? currentQuestion.questionImageUrl : undefined}
        />
      </div>

      {/* Sticky bottom navigation */}
      {isMultiOrHybrid && (
        <div className="fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/95 to-transparent px-4 pb-6 pt-4">
          <div className="mx-auto flex max-w-[720px] gap-3">
            {!isFirstQuestion && (
              <button
                type="button"
                onClick={goToPrevious}
                className="flex h-12 items-center justify-center gap-2 rounded-full border-2 border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
            <button
              type="button"
              onClick={goToNext}
              disabled={!hasCurrentAnswer || isLastQuestion}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-slate-900 text-sm font-bold uppercase tracking-[0.06em] text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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
