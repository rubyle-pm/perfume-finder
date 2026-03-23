"use client";

import { useState, useRef, useEffect } from "react";
import { QuizQuestionCard } from "@/components/quiz/quiz-question-card";
import { ArrowRight, ChevronDown, X } from "lucide-react";

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
      { value: "warm_cozy", label: "Warm & cozy", emoji: "🫦", subtitle: "Inviting, comforting" },
      { value: "floral_feminine", label: "Floral & feminine", emoji: "🌷", subtitle: "Romantic, delicate" },
      { value: "dark_mysterious", label: "Dark & mysterious", emoji: "🌙", subtitle: "Intriguing, complex" },
      { value: "clean_minimal", label: "Clean & minimal", emoji: "🛁", subtitle: "Crisp, understated" },
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
      { value: "effortless_cool_woke_up_like_this", label: "Effortless & cool", emoji: "🏙️", subtitle: "Woke up like this" },
      { value: "playful_warm_unexpected", label: "Playful & warm", emoji: "😈", subtitle: "A bit unexpected" },
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
      { value: "home_reset", label: "Home-body", emoji: "🛋️", subtitle: "Cleaning, organizing" },
      { value: "book_blanket_hermit", label: "Book & blanket", emoji: "😶‍🌫️", subtitle: "Withdraw from the world" },
    ],
  },
  {
    id: "icon_style",
    kind: "multi" as const,
    questionText: "Which style icons resonate with you?",
    options: [
      { value: "audrey_hepburn", label: "Audrey Hepburn", emoji: "🎬", subtitle: "Timeless elegance" },
      { value: "david_bowie", label: "David Bowie", emoji: "⚡", subtitle: "Bold, avant-garde" },
      { value: "jane_birkin", label: "Jane Birkin", emoji: "🧺", subtitle: "Effortless French chic" },
      { value: "rihanna", label: "Rihanna", emoji: "💄", subtitle: "Fearless, trend-setting" },
      { value: "timothee_chalamet", label: "Timothee Chalamet", emoji: "🎭", subtitle: "Modern romantic" },
      { value: "zendaya", label: "Zendaya", emoji: "🌟", subtitle: "Versatile, fashion-forward" },
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
  {
    id: "favorite_notes",
    kind: "multi" as const,
    questionText: "Which scent notes speak to you? Pick your favorites.",
    options: [
      { value: "bergamot", label: "Bergamot", emoji: "🍋", subtitle: "Bright citrus, zesty" },
      { value: "rose", label: "Rose", emoji: "🌹", subtitle: "Classic floral, romantic" },
      { value: "sandalwood", label: "Sandalwood", emoji: "🪵", subtitle: "Creamy, warm wood" },
      { value: "vanilla", label: "Vanilla", emoji: "🍦", subtitle: "Sweet, comforting" },
      { value: "oud", label: "Oud", emoji: "🪔", subtitle: "Rich, mysterious" },
      { value: "jasmine", label: "Jasmine", emoji: "🤍", subtitle: "Heady white floral" },
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
            
            {/* Question number dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 rounded-full border-2 border-slate-900 bg-white px-3 py-1 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
              >
                {currentQuestionIndex + 1}/{totalQuestions}
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute left-0 top-full z-30 mt-2 w-48 rounded-xl border-2 border-slate-200 bg-white py-1 shadow-lg">
                  {DEMO_QUESTIONS.map((q, index) => {
                    const hasAnswer = !!answers[q.id];
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => goToQuestion(index)}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50 ${
                          index === currentQuestionIndex ? "bg-slate-100 font-medium" : ""
                        }`}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-300 text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="flex-1 truncate text-slate-700">
                          {q.questionText.slice(0, 25)}...
                        </span>
                        {hasAnswer && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-slate-900" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right side: Back to home button (black pill) */}
          <button
            type="button"
            onClick={() => window.location.href = "/"}
            className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            <X className="h-3.5 w-3.5" />
            Exit
          </button>
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

      {/* Sticky bottom navigation - only Continue button for multi-select */}
      {currentQuestion.kind === "multi" && (
        <div className="fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/95 to-transparent px-4 pb-6 pt-4">
          <div className="mx-auto max-w-[720px]">
            <button
              type="button"
              onClick={goToNext}
              disabled={!hasCurrentAnswer || isLastQuestion}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-900 text-sm font-bold uppercase tracking-[0.06em] text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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
