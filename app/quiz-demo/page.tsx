"use client";

import { useState } from "react";
import { QuizQuestionCard } from "@/components/quiz/quiz-question-card";

// Sample questions matching the quiz data shape
const DEMO_QUESTIONS = [
  {
    id: "gender_pref",
    kind: "single" as const,
    questionText: "What kind of scent profile are you drawn to?",
    options: [
      { value: "feminine", label: "Feminine" },
      { value: "masculine", label: "Masculine" },
      { value: "unisex", label: "Unisex" },
    ],
  },
  {
    id: "scent_type",
    kind: "single" as const,
    questionText: "Which kinds of scent do you gravitate toward?",
    options: [
      { value: "fresh_airy", label: "Fresh & airy" },
      { value: "warm_cozy", label: "Warm & cozy" },
      { value: "floral_feminine", label: "Floral & feminine" },
      { value: "dark_mysterious", label: "Dark & mysterious" },
      { value: "clean_minimal", label: "Clean & minimal" },
      { value: "earthy_natural", label: "Earthy & natural" },
    ],
  },
  {
    id: "dislike_note",
    kind: "multi" as const,
    questionText: "Are there notes you want to avoid?",
    options: [
      { value: "heavy_floral", label: "Heavy floral" },
      { value: "sweet_gourmand", label: "Sweet, like candy or pastry" },
      { value: "smoky_tobacco_spicy", label: "Smoky, tobacco, or spicy" },
      { value: "incense_resin", label: "Incense & resin, aromatherapy" },
      { value: "aquatic_soapy", label: "Aquatic or soapy" },
      { value: "fruity_citrus", label: "Fruity & citrus" },
      { value: "earthy_wet_wood", label: "Earthy, wet wood" },
      { value: "musk", label: "Musk" },
    ],
  },
  {
    id: "mood",
    kind: "single" as const,
    questionText: "What mood do you want your scent to project?",
    options: [
      { value: "complicated_seductive_intellectual", label: "Complicated, seductive yet intellectual" },
      { value: "soft_romantic_nostalgic", label: "Soft, romantic, may be a little nostalgic" },
      { value: "bold_confident_present", label: "Bold, confident, unapologetically present" },
      { value: "effortless_cool_woke_up_like_this", label: "Effortless, cool, like you woke up like this" },
      { value: "playful_warm_unexpected", label: "Playful, warm, and a bit unexpected" },
    ],
  },
];

type AnswerMap = Record<string, string | string[]>;

export default function QuizDemoPage() {
  const [answers, setAnswers] = useState<AnswerMap>({});

  function handleSelect(questionId: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-[720px] px-4 py-8 pb-32 font-sans md:px-6">
        {/* Header */}
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-500">
            Component Demo
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900">
            Quiz Question Card
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Interactive demo showing both single-select (radio) and multi-select (checkbox) modes
          </p>
        </header>

        {/* Progress indicator */}
        <div className="sticky top-0 z-10 mb-4 h-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-gradient-to-r from-slate-900 to-slate-700 transition-all duration-300"
            style={{
              width: `${(Object.keys(answers).filter((k) => {
                const v = answers[k];
                return Array.isArray(v) ? v.length > 0 : !!v;
              }).length / DEMO_QUESTIONS.length) * 100}%`,
            }}
          />
        </div>

        {/* Questions */}
        <div className="grid gap-3">
          {DEMO_QUESTIONS.map((question, index) => (
            <QuizQuestionCard
              key={question.id}
              id={question.id}
              questionNumber={index + 1}
              questionText={question.questionText}
              kind={question.kind}
              options={question.options}
              selectedValues={answers[question.id] || (question.kind === "multi" ? [] : "")}
              onSelect={(value) => handleSelect(question.id, value)}
              maxSelections={3}
            />
          ))}
        </div>

        {/* Current State Display */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Current Selections
          </h3>
          <pre className="overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
            {JSON.stringify(answers, null, 2) || "{}"}
          </pre>
        </div>

        {/* Sticky CTA */}
        <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent px-4 py-3">
          <div className="mx-auto max-w-[720px]">
            <button
              type="button"
              disabled={Object.keys(answers).length < DEMO_QUESTIONS.length}
              className="w-full rounded-full bg-slate-900 py-3 text-sm font-bold uppercase tracking-[0.06em] text-white transition-opacity hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
