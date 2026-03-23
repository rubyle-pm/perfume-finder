"use client";

import { Check } from "lucide-react";

export interface QuizOption {
  value: string;
  label: string;
  emoji?: string;
  subtitle?: string;
  imageUrl?: string;
}

export interface QuizQuestionCardProps {
  /** Unique question identifier */
  id: string;
  /** The question text to display */
  questionText: string;
  /** Selection mode: 'single' for radio, 'multi' for checkbox, 'hybrid' for image grid, 'mbti' for tag-pair layout */
  kind: "single" | "multi" | "hybrid" | "mbti";
  /** Array of options to display */
  options: QuizOption[];
  /** Currently selected value(s) - string for single/mbti, string[] for multi/hybrid */
  selectedValues: string | string[];
  /** Callback when selection changes */
  onSelect: (value: string | string[]) => void;
  /** Optional: Maximum selections allowed for multi-select/hybrid */
  maxSelections?: number;
  /** Optional: Callback after selection (e.g., for auto-advance on single select) */
  onSelectionComplete?: () => void;
  /** Optional: Question image displayed below question text (21:9 aspect ratio) */
  questionImageUrl?: string;
}

export function QuizQuestionCard({
  id,
  questionText,
  kind,
  options,
  selectedValues,
  onSelect,
  maxSelections = 3,
  onSelectionComplete,
  questionImageUrl,
}: QuizQuestionCardProps) {
  const isMulti = kind === "multi" || kind === "hybrid";
  const isHybrid = kind === "hybrid";
  const isMbti = kind === "mbti";
  const selectedArray = Array.isArray(selectedValues)
    ? selectedValues
    : selectedValues
      ? [selectedValues]
      : [];

  function handleOptionClick(value: string) {
    if (isMulti) {
      const isSelected = selectedArray.includes(value);
      let newValues: string[];

      if (isSelected) {
        newValues = selectedArray.filter((v) => v !== value);
      } else {
        if (selectedArray.length >= maxSelections) {
          return;
        }
        newValues = [...selectedArray, value];
      }
      onSelect(newValues);
    } else {
      onSelect(value);
      if (onSelectionComplete) {
        setTimeout(() => {
          onSelectionComplete();
        }, 300);
      }
    }
  }

  function isOptionSelected(value: string): boolean {
    return selectedArray.includes(value);
  }

  function isOptionDisabled(value: string): boolean {
    if (!isMulti) return false;
    return selectedArray.length >= maxSelections && !selectedArray.includes(value);
  }

  return (
    <div className="flex flex-col">
      {/* Question Text */}
      <h2 className="mb-6 font-serif text-[28px] font-medium leading-tight tracking-[-0.01em] text-slate-900 md:text-[32px]">
        {questionText}
      </h2>

      {/* Question Image - 21:9 aspect ratio placeholder BELOW question text */}
      {questionImageUrl && (
        <div className="mb-6 aspect-[21/9] w-full overflow-hidden rounded-2xl bg-slate-200">
          <img
            src={questionImageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Multi-select/Hybrid hint */}
      {isMulti && (
        <p className="mb-4 text-sm text-slate-500">
          Select up to {maxSelections}
          {selectedArray.length > 0 && (
            <span className="ml-1.5 font-medium text-slate-700">
              ({selectedArray.length}/{maxSelections})
            </span>
          )}
        </p>
      )}

      {/* MBTI Pill Grid Layout - white pills that turn dark when selected */}
      {isMbti ? (
        <div 
          className="flex flex-wrap gap-2.5" 
          role="radiogroup" 
          aria-labelledby={`question-${id}`}
        >
          {options.map((option) => {
            const selected = isOptionSelected(option.value);
            const description = MBTI_DESCRIPTIONS[option.value] || option.subtitle || option.label;

            return (
              <label
                key={option.value}
                className="cursor-pointer"
              >
                {/* Hidden input for accessibility */}
                <input
                  type="radio"
                  name={id}
                  value={option.value}
                  checked={selected}
                  onChange={() => handleOptionClick(option.value)}
                  className="sr-only"
                  aria-label={description}
                />

                {/* White outlined pill that turns dark when selected */}
                <span
                  className={`
                    flex h-11 items-center rounded-full border-2 px-5 text-[15px] font-medium
                    transition-all duration-200
                    ${selected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                    }
                  `}
                >
                  {description}
                </span>
              </label>
            );
          })}
        </div>
      ) : isHybrid ? (
        /* Hybrid Grid Layout - with images */
        <div 
          className="grid grid-cols-2 gap-3 md:grid-cols-3" 
          role="group" 
          aria-labelledby={`question-${id}`}
        >
          {options.map((option) => {
            const selected = isOptionSelected(option.value);
            const disabled = isOptionDisabled(option.value);

            return (
              <label
                key={option.value}
                className={`
                  group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border-2 
                  transition-all duration-200
                  ${selected
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-300 bg-white hover:border-slate-400"
                  }
                  ${disabled ? "cursor-not-allowed opacity-40" : ""}
                `}
              >
                {/* Hidden input for accessibility */}
                <input
                  type="checkbox"
                  name={id}
                  value={option.value}
                  checked={selected}
                  disabled={disabled}
                  onChange={() => handleOptionClick(option.value)}
                  className="sr-only"
                  aria-label={option.label}
                />

                {/* Image area */}
                {option.imageUrl ? (
                  <div className="aspect-square w-full overflow-hidden bg-slate-100">
                    <img
                      src={option.imageUrl}
                      alt={option.label}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center bg-slate-100">
                    {option.emoji ? (
                      <span className="text-[48px]">{option.emoji}</span>
                    ) : (
                      <span className="text-4xl text-slate-300">?</span>
                    )}
                  </div>
                )}

                {/* Text content */}
                <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <span
                      className={`
                        block truncate text-[13px] leading-tight transition-colors duration-150
                        ${selected ? "font-semibold text-slate-900" : "font-medium text-slate-800"}
                      `}
                    >
                      {option.label}
                    </span>
                  </div>

                  {/* Checkbox indicator */}
                  <span
                    className={`
                      flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 
                      transition-all duration-200
                      ${selected
                        ? "border-slate-900 bg-slate-900"
                        : "border-slate-300 bg-white group-hover:border-slate-400"
                      }
                    `}
                  >
                    {selected && (
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    )}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      ) : (
        /* Standard List Layout - single/multi */
        <div 
          className="flex flex-col gap-2.5" 
          role={isMulti ? "group" : "radiogroup"} 
          aria-labelledby={`question-${id}`}
        >
          {options.map((option) => {
            const selected = isOptionSelected(option.value);
            const disabled = isOptionDisabled(option.value);

            return (
              <label
                key={option.value}
                className={`
                  group relative flex min-h-[64px] cursor-pointer items-center gap-4 
                  rounded-2xl border-2 px-4 py-3 transition-all duration-200
                  ${selected
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-300 bg-white hover:border-slate-400"
                  }
                  ${disabled ? "cursor-not-allowed opacity-40" : ""}
                `}
              >
                {/* Hidden input for accessibility */}
                <input
                  type={isMulti ? "checkbox" : "radio"}
                  name={id}
                  value={option.value}
                  checked={selected}
                  disabled={disabled}
                  onChange={() => handleOptionClick(option.value)}
                  className="sr-only"
                  aria-label={option.label}
                />

                {/* Emoji */}
                {option.emoji && (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[28px]">
                    {option.emoji}
                  </span>
                )}

                {/* Text content */}
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <span
                    className={`
                      text-[15px] leading-snug transition-colors duration-150
                      ${selected ? "font-semibold text-slate-900" : "font-medium text-slate-800"}
                    `}
                  >
                    {option.label}
                  </span>
                  {option.subtitle && (
                    <span className="mt-0.5 text-[13px] text-slate-500">
                      {option.subtitle}
                    </span>
                  )}
                </div>

                {/* Checkbox indicator on the right */}
                <span
                  className={`
                    flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 
                    transition-all duration-200
                    ${selected
                      ? "border-slate-900 bg-slate-900"
                      : "border-slate-300 bg-white group-hover:border-slate-400"
                    }
                  `}
                >
                  {selected && (
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  )}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {/* Selection summary pills for multi-select/hybrid */}
      {isMulti && selectedArray.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedArray.map((value) => {
            const option = options.find((o) => o.value === value);
            return (
              <span
                key={value}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {option?.emoji && <span className="text-sm">{option.emoji}</span>}
                {option?.label || value}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOptionClick(value);
                  }}
                  className="ml-0.5 rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                  aria-label={`Remove ${option?.label || value}`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default QuizQuestionCard;
