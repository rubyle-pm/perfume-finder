"use client";

import { Check } from "lucide-react";

export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizQuestionCardProps {
  /** Unique question identifier */
  id: string;
  /** Question number for display (1-indexed) */
  questionNumber: number;
  /** The question text to display */
  questionText: string;
  /** Selection mode: 'single' for radio, 'multi' for checkbox */
  kind: "single" | "multi";
  /** Array of options to display */
  options: QuizOption[];
  /** Currently selected value(s) - string for single, string[] for multi */
  selectedValues: string | string[];
  /** Callback when selection changes */
  onSelect: (value: string | string[]) => void;
  /** Optional: Maximum selections allowed for multi-select */
  maxSelections?: number;
  /** Optional: Callback after selection (e.g., for auto-scroll on single select) */
  onSelectionComplete?: () => void;
}

export function QuizQuestionCard({
  id,
  questionNumber,
  questionText,
  kind,
  options,
  selectedValues,
  onSelect,
  maxSelections = 3,
  onSelectionComplete,
}: QuizQuestionCardProps) {
  const isMulti = kind === "multi";
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
        // Deselect
        newValues = selectedArray.filter((v) => v !== value);
      } else {
        // Select (respect max limit)
        if (selectedArray.length >= maxSelections) {
          return; // Don't add more if limit reached
        }
        newValues = [...selectedArray, value];
      }
      onSelect(newValues);
    } else {
      // Single select
      onSelect(value);
      // Trigger completion callback for auto-scroll behavior
      if (onSelectionComplete) {
        setTimeout(() => {
          onSelectionComplete();
        }, 200);
      }
    }
  }

  function isOptionSelected(value: string): boolean {
    return selectedArray.includes(value);
  }

  function isOptionDisabled(value: string): boolean {
    if (!isMulti) return false;
    // Disable unselected options when max is reached
    return selectedArray.length >= maxSelections && !selectedArray.includes(value);
  }

  return (
    <article className="rounded-2xl bg-white/90 p-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:p-6">
      {/* Question Label */}
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.05em] text-slate-500">
        Question {questionNumber}
      </p>

      {/* Question Text */}
      <h2 className="mb-3 text-xl font-semibold leading-tight text-slate-900 md:mb-4">
        {questionText}
      </h2>

      {/* Multi-select hint */}
      {isMulti && (
        <p className="mb-3 text-sm text-slate-500">
          Select up to {maxSelections} options
          {selectedArray.length > 0 && (
            <span className="ml-1 text-slate-700">
              ({selectedArray.length}/{maxSelections} selected)
            </span>
          )}
        </p>
      )}

      {/* Options */}
      <div className="grid gap-2" role={isMulti ? "group" : "radiogroup"} aria-labelledby={`question-${id}`}>
        {options.map((option) => {
          const selected = isOptionSelected(option.value);
          const disabled = isOptionDisabled(option.value);

          return (
            <label
              key={option.value}
              className={`
                group relative flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl 
                px-3 py-2.5 transition-all duration-150
                ${selected
                  ? "border-[1.5px] border-slate-900 bg-slate-200/80"
                  : "border border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
                }
                ${disabled ? "cursor-not-allowed opacity-50" : ""}
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

              {/* Custom indicator */}
              <span
                className={`
                  flex h-5 w-5 shrink-0 items-center justify-center transition-all duration-150
                  ${isMulti ? "rounded-md" : "rounded-full"}
                  ${selected
                    ? "border-2 border-slate-900 bg-slate-900"
                    : "border-2 border-slate-400 bg-white group-hover:border-slate-500"
                  }
                `}
              >
                {selected && (
                  isMulti ? (
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  )
                )}
              </span>

              {/* Option label */}
              <span
                className={`
                  flex-1 text-[15px] leading-snug transition-colors duration-150
                  ${selected ? "font-medium text-slate-900" : "text-slate-700"}
                `}
              >
                {option.label}
              </span>

              {/* Selected indicator badge (optional visual enhancement) */}
              {selected && (
                <span className="shrink-0 text-xs font-medium text-slate-600">
                  {isMulti ? "" : "Selected"}
                </span>
              )}
            </label>
          );
        })}
      </div>

      {/* Selection summary for multi-select */}
      {isMulti && selectedArray.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {selectedArray.map((value) => {
            const option = options.find((o) => o.value === value);
            return (
              <span
                key={value}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
              >
                {option?.label || value}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOptionClick(value);
                  }}
                  className="ml-0.5 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  aria-label={`Remove ${option?.label || value}`}
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            );
          })}
        </div>
      )}
    </article>
  );
}

export default QuizQuestionCard;
