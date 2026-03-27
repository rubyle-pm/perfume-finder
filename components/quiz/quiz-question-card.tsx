"use client";

function CheckIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 6L9 17L4 12"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

  // MBTI descriptions
  const MBTI_DESCRIPTIONS: Record<string, string> = {
    INTJ: "The Architect",
    INTP: "The Logician",
    ENTJ: "The Commander",
    ENTP: "The Debater",
    INFJ: "The Advocate",
    INFP: "The Mediator",
    ENFJ: "The Protagonist",
    ENFP: "The Campaigner",
    ISTJ: "The Logistician",
    ISFJ: "The Defender",
    ESTJ: "The Executive",
    ESFJ: "The Consul",
    ISTP: "The Virtuoso",
    ISFP: "The Adventurer",
    ESTP: "The Entrepreneur",
    ESFP: "The Entertainer",
  };

  return (
    <div className="flex flex-col">
      {/* Question Text */}
      <h2
        className="mb-6 text-[28px] leading-tight tracking-[-0.01em] text-slate-900 md:text-[32px]"
        style={{
          fontFamily: "var(--font-playfair), 'Playfair Display', serif",
          fontWeight: 500
        }}
      >
        {questionText}
      </h2>

      {/* Question Image - 21:9 aspect ratio placeholder BELOW question text */}
      {questionImageUrl && (
        <div className="mb-6 aspect-[21/9] w-full overflow-hidden rounded-2xl bg-[#E7E5E4]">
          <img
            src={questionImageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Multi-select/Hybrid hint */}
      {isMulti && (
        <p className="mb-4 text-sm text-[#A8A29E]">
          Select up to {maxSelections}
          {selectedArray.length > 0 && (
            <span className="ml-1.5 font-medium text-[#44403C]">
              ({selectedArray.length}/{maxSelections})
            </span>
          )}
        </p>
      )}

      {/* MBTI Tag-Pair Layout */}
      {isMbti ? (
        <div
          className="flex flex-col gap-2.5"
          role="radiogroup"
          aria-labelledby={`question-${id}`}
        >
          {options.map((option) => {
            const selected = isOptionSelected(option.value);
            const description = MBTI_DESCRIPTIONS[option.value] || option.subtitle || "";

            return (
              <label
                key={option.value}
                className={`
                  group relative flex cursor-pointer items-center gap-2 
                  transition-all duration-200
                `}
              >
                {/* Hidden input for accessibility */}
                <input
                  type="radio"
                  name={id}
                  value={option.value}
                  checked={selected}
                  onChange={() => handleOptionClick(option.value)}
                  className="sr-only"
                  aria-label={`${option.value} - ${description}`}
                />

                {/* Black pill - MBTI type */}
                <span
                  className={`
                    flex h-11 items-center justify-center rounded-full px-5 text-[15px] font-semibold 
                    transition-all duration-200
                    ${selected
                      ? "bg-[#1C1917] text-white"
                      : "bg-[#1C1917] text-white"
                    }
                  `}
                >
                  {option.value}
                </span>

                {/* White outlined pill - description */}
                <span
                  className={`
                    flex h-11 flex-1 items-center rounded-full border-2 px-5 text-[15px] 
                    transition-all duration-200
                    ${selected
                      ? "border-[#1C1917] bg-[#F5F5F4] font-medium text-[#1C1917]"
                      : "border-[#E7E5E4] bg-white text-[#44403C] group-hover:border-[#A8A29E]"
                    }
                  `}
                >
                  {description}
                </span>

                {/* Checkbox indicator */}
                <span
                  className={`
                    flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 
                    transition-all duration-200
                    ${selected
                      ? "border-[#1C1917] bg-[#1C1917]"
                      : "border-[#E7E5E4] bg-white group-hover:border-[#A8A29E]"
                    }
                  `}
                >
                  {selected && (
                    <CheckIcon className="h-4 w-4 text-white" />
                  )}
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
                    ? "border-[#1C1917] bg-[#F5F5F4]"
                    : "border-[#E7E5E4] bg-white hover:border-[#A8A29E]"
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
                  <div className="aspect-square w-full overflow-hidden bg-[#F5F5F4]">
                    <img
                      src={option.imageUrl}
                      alt={option.label}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center bg-[#F5F5F4]">
                    {option.emoji ? (
                      <span className="text-[48px]">{option.emoji}</span>
                    ) : (
                      <span className="text-4xl text-[#E7E5E4]">?</span>
                    )}
                  </div>
                )}

                {/* Text content */}
                <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <span
                      className={`
                        block truncate text-[13px] leading-tight transition-colors duration-150
                        ${selected ? "font-semibold text-[#1C1917]" : "font-medium text-[#292524]"}
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
                        ? "border-[#1C1917] bg-[#1C1917]"
                        : "border-[#E7E5E4] bg-white group-hover:border-[#A8A29E]"
                      }
                    `}
                  >
                    {selected && (
                      <CheckIcon className="h-3 w-3 text-white" />
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
                    ? "border-[#1C1917] bg-[#F5F5F4]"
                    : "border-[#E7E5E4] bg-white hover:border-[#A8A29E]"
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
                      ${selected ? "font-semibold text-[#1C1917]" : "font-medium text-[#292524]"}
                    `}
                  >
                    {option.label}
                  </span>
                  {option.subtitle && (
                    <span className="mt-0.5 text-[13px] text-[#A8A29E]">
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
                      ? "border-[#1C1917] bg-[#1C1917]"
                      : "border-[#E7E5E4] bg-white group-hover:border-[#A8A29E]"
                    }
                  `}
                >
                  {selected && (
                    <CheckIcon className="h-4 w-4 text-white" />
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
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E5E4] bg-[#F5F5F4] px-3 py-1 text-xs font-medium text-[#44403C]"
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
                  className="ml-0.5 rounded-full p-0.5 text-[#A8A29E] transition-colors hover:bg-[#E7E5E4] hover:text-[#57534E]"
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
