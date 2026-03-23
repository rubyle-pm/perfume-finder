"use client";

import { Check } from "lucide-react";

export interface QuizOption {
  value: string;
  label: string;
  emoji?: string;
  subtitle?: string;
}

export interface QuizQuestionCardProps {
  /** Unique question identifier */
  id: string;
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
  /** Optional: Callback after selection (e.g., for auto-advance on single select) */
  onSelectionComplete?: () => void;
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

      {/* Multi-select hint */}
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

      {/* Options */}
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
                rounded-full border-2 px-4 py-3 transition-all duration-200
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

      {/* Selection summary pills for multi-select */}
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
