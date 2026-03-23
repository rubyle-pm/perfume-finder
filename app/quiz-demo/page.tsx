"use client";

import { useState } from "react";
import { QuizQuestionCard } from "@/components/quiz/quiz-question-card";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Sample questions with iOS emojis matching the quiz data shape
const DEMO_QUESTIONS = [
  {
    id: "gender_pref",
    kind: "single" as const,
    questionText: "What kind of scent profile are you drawn to?",
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
    options: [
      { value: "fresh_airy", label: "Fresh & airy", emoji: "🌬️", subtitle: "Light, breezy notes" },
      { value: "warm_cozy", label: "Warm & cozy", emoji: "🧣", subtitle: "Inviting, comforting" },
      { value: "floral_feminine", label: "Floral & feminine", emoji: "🌷", subtitle: "Romantic, delicate" },
      { value: "dark_mysterious", label: "Dark & mysterious", emoji: "🌙", subtitle: "Intriguing, complex" },
      { value: "clean_minimal", label: "Clean & minimal", emoji: "🧊", subtitle: "Crisp, understated" },
      { value: "earthy_natural", label: "Earthy & natural", emoji: "🌿", subtitle: "Grounded, organic" },
    ],
  },
  {
    id: "dislike_note",
    kind: "multi" as const,
    questionText: "Are there notes you want to avoid?",
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
    id: "mood",
    kind: "single" as const,
    questionText: "What mood do you want your scent to project?",
    options: [
      { value: "complicated_seductive_intellectual", label: "Seductive & intellectual", emoji: "🖤", subtitle: "Complicated, alluring" },
      { value: "soft_romantic_nostalgic", label: "Romantic & nostalgic", emoji: "💕", subtitle: "Soft, dreamy" },
      { value: "bold_confident_present", label: "Bold & confident", emoji: "👑", subtitle: "Unapologetically present" },
      { value: "effortless_cool_woke_up_like_this", label: "Effortless & cool", emoji: "😎", subtitle: "Woke up like this" },
      { value: "playful_warm_unexpected", label: "Playful & warm", emoji: "🎈", subtitle: "A bit unexpected" },
    ],
  },
  {
    id: "weekend_vibe",
    kind: "single" as const,
    questionText: "How would you describe your perfect weekend me-time?",
    options: [
      { value: "cozy_solo_cafe", label: "Cozy solo cafe", emoji: "☕", subtitle: "Creative projects, quiet time" },
      { value: "museum_gallery", label: "Museum wandering", emoji: "🖼️", subtitle: "Art, culture, inspiration" },
      { value: "hiking_outdoor", label: "Outdoor adventure", emoji: "🏔️", subtitle: "Nature, exploration" },
      { value: "long_brunch", label: "Long brunch", emoji: "🥐", subtitle: "Friends, good food" },
      { value: "home_reset", label: "Home reset", emoji: "🏠", subtitle: "Cleaning, organizing" },
      { value: "book_blanket_hermit", label: "Book & blanket", emoji: "📚", subtitle: "Withdraw from the world" },
    ],
  },
  {
    id: "budget",
    kind: "single" as const,
    questionText: "What is your budget for 50ml?",
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

  const totalQuestions = DEMO_QUESTIONS.length;
  const currentQuestion = DEMO_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

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
        {/* Header with question counter */}
        <header className="mb-8 flex items-center justify-between">
          <p className="text-sm font-semibold tracking-wide text-slate-500">
            {currentQuestionIndex + 1}/{totalQuestions}
          </p>
          <p className="text-xs font-medium uppercase tracking-[0.06em] text-slate-400">
            Scent Finder
          </p>
        </header>

        {/* Question Card */}
        <QuizQuestionCard
          key={currentQuestion.id}
          id={currentQuestion.id}
          questionText={currentQuestion.questionText}
          kind={currentQuestion.kind}
          options={currentQuestion.options}
          selectedValues={answers[currentQuestion.id] || (currentQuestion.kind === "multi" ? [] : "")}
          onSelect={(value) => handleSelect(currentQuestion.id, value)}
          maxSelections={3}
          onSelectionComplete={handleSelectionComplete}
        />
      </div>

      {/* Sticky bottom navigation */}
      <div className="fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/95 to-transparent px-4 pb-6 pt-4">
        <div className="mx-auto flex max-w-[720px] items-center gap-3">
          {/* Back button */}
          <button
            type="button"
            onClick={goToPrevious}
            disabled={isFirstQuestion}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous question"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Next/Continue button */}
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
    </main>
  );
}
