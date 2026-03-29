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
  /** Selection mode: 'single' for radio, 'multi' for checkbox, 'hybrid' for image grid, 'pill' for compact emoji-pill grid */
  kind: "single" | "multi" | "hybrid" | "mbti" | "pill";
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
  const isPill = kind === "pill";
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
          // If maxSelections===1, replace instead of block (radio-like)
          if (maxSelections === 1) {
            newValues = [value];
          } else {
            return;
          }
        } else {
          newValues = [...selectedArray, value];
        }
      }
      onSelect(newValues);
      // Auto-advance when max-1 multi reaches its single selection
      if (maxSelections === 1 && newValues.length === 1 && onSelectionComplete) {
        setTimeout(() => onSelectionComplete(), 280);
      }
    } else {
      // single / pill / mbti — radio behaviour
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

      {/* Multi-select/Hybrid selection hint — only show when maxSelections > 1 */}
      {isMulti && maxSelections > 1 && (
        <p className="mb-4 text-sm text-[#A8A29E]">
          Select up to {maxSelections}
          {selectedArray.length > 0 && (
            <span className="ml-1.5 font-medium text-[#44403C]">
              ({selectedArray.length}/{maxSelections})
            </span>
          )}
        </p>
      )}

      {/* ─── PILL LAYOUT — single-select, wrapping flex, emoji + label ─── */}
      {isPill ? (
        <div
          className="flex flex-wrap gap-2.5"
          role="radiogroup"
          aria-labelledby={`question-${id}`}
        >
          {options.map((option) => {
            const selected = isOptionSelected(option.value);
            return (
              <label key={option.value} className="cursor-pointer">
                <input
                  type="radio"
                  name={id}
                  value={option.value}
                  checked={selected}
                  onChange={() => handleOptionClick(option.value)}
                  className="sr-only"
                  aria-label={option.label}
                />
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    borderRadius: "32px",
                    border: selected ? "0.5px solid #1a1a1a" : "0.5px solid #D8D5CE",
                    padding: "10px 18px",
                    background: selected ? "#1a1a1a" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    userSelect: "none",
                  }}
                >
                  {option.emoji && (
                    <span style={{ fontSize: "22px", lineHeight: 1 }}>{option.emoji}</span>
                  )}
                  <span
                    style={{
                      fontSize: "22px",
                      fontWeight: selected ? 400 : 300,
                      color: selected ? "#FAFAF8" : "#3D3B36",
                      letterSpacing: "-0.01em",
                      lineHeight: 1,
                      fontFamily: "var(--font-inter), 'Inter', sans-serif",
                    }}
                  >
                    {option.label}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

      ) : isMbti ? (
        /* ─── LEGACY MBTI LAYOUT — kept for backwards compat ─── */
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
                <input
                  type="radio"
                  name={id}
                  value={option.value}
                  checked={selected}
                  onChange={() => handleOptionClick(option.value)}
                  className="sr-only"
                  aria-label={`${option.value} - ${description}`}
                />
                <span
                  className={`
                    inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-sm font-semibold
                    transition-all duration-200
                    ${selected
                      ? "border-[#1C1917] bg-[#1C1917] text-white"
                      : "border-[#E7E5E4] bg-white text-[#44403C] group-hover:border-[#A8A29E]"
                    }
                  `}
                >
                  {option.emoji && <span className="text-base">{option.emoji}</span>}
                  {option.label}
                </span>
                <span
                  className={`
                    rounded-lg border px-2 py-1 text-xs
                    transition-all duration-200
                    ${selected
                      ? "border-[#1C1917] bg-[#F5F5F4] font-medium text-[#1C1917]"
                      : "border-[#E7E5E4] bg-white text-[#44403C] group-hover:border-[#A8A29E]"
                    }
                  `}
                >
                  {description}
                </span>
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
                  {selected && <CheckIcon className="h-4 w-4 text-white" />}
                </span>
              </label>
            );
          })}
        </div>

      ) : isHybrid ? (
        /* ─── HYBRID IMAGE GRID LAYOUT ─── */
        <div
          className="grid grid-cols-2 gap-x-4 gap-y-0"
          role="group"
          aria-labelledby={`question-${id}`}
        >
          {options.map((option) => {
            const selected = isOptionSelected(option.value);
            const disabled = isOptionDisabled(option.value);

            return (
              <label
                key={option.value}
                style={{
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.4 : 1,
                  paddingBottom: "24px",
                  display: "block",
                }}
              >
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

                {/* Image tile */}
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "4/3",
                    overflow: "hidden",
                    marginBottom: "12px",
                    position: "relative",
                    transition: "opacity 0.18s",
                  }}
                >
                  {/* Glass selection overlay */}
                  {selected && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(255,255,255,0.18)",
                        backdropFilter: "blur(0px)",
                        boxShadow: "inset 0 0 0 1.5px rgba(26,26,26,0.35)",
                        zIndex: 1,
                        transition: "all 0.18s",
                      }}
                    />
                  )}
                  {option.imageUrl ? (
                    <img
                      src={option.imageUrl}
                      alt={option.label}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        filter: selected ? "brightness(0.9)" : "none",
                        transition: "filter 0.18s",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: selected
                          ? "rgba(26,26,26,0.06)"
                          : "#F0EDE6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "32px",
                        transition: "background 0.18s",
                      }}
                    >
                      {option.emoji || "?"}
                    </div>
                  )}
                </div>

                {/* Hairline rule */}
                <hr style={{ border: "none", borderTop: "0.5px solid #D8D5CE", marginBottom: "10px" }} />

                {/* Label */}
                <span
                  style={{
                    display: "block",
                    fontSize: "20px",
                    fontWeight: selected ? 500 : 300,
                    color: selected ? "#1a1a1a" : "#3D3B36",
                    letterSpacing: "-0.015em",
                    lineHeight: 1.15,
                    fontFamily: "var(--font-inter), 'Inter', sans-serif",
                    transition: "color 0.15s, font-weight 0.15s",
                  }}
                >
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>

      ) : (
        /* ─── STANDARD LIST LAYOUT — single / multi ─── */
        <div
          role={isMulti ? "group" : "radiogroup"}
          aria-labelledby={`question-${id}`}
        >
          {options.map((option, index) => {
            const selected = isOptionSelected(option.value);
            const disabled = isOptionDisabled(option.value);

            return (
              <label
                key={option.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "0.5px solid #D8D5CE",
                  borderBottom: index === options.length - 1 ? "0.5px solid #D8D5CE" : "none",
                  padding: "12px 16px",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.4 : 1,
                  position: "relative",
                  // iOS glass selected: subtle tinted background, sharp edges
                  background: selected
                    ? "rgba(26, 26, 26, 0.045)"
                    : "transparent",
                  transition: "background 0.18s",
                }}
              >
                {/* Remove the heavy left accent bar — replaced by background glass tint */}

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

                {/* Left: emoji + label */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {option.emoji && (
                    <span style={{ fontSize: "22px", width: "28px", textAlign: "center", flexShrink: 0 }}>  {/*config emoji size*/}
                      {option.emoji}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: "22px",
                      fontWeight: selected ? 500 : 300,
                      color: selected ? "#1a1a1a" : "#3D3B36",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.15,
                      fontFamily: "var(--font-inter), 'Inter', sans-serif",
                      transition: "color 0.15s",
                    }}
                  >
                    {option.label}
                  </span>
                </div>

                {/* Right: checkbox for multi only — iOS glass style */}
                {isMulti && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      border: selected
                        ? "1.5px solid rgba(26,26,26,0.5)"
                        : "1px solid rgba(188,186,179,0.7)",
                      background: selected
                        ? "rgba(26,26,26,0.12)"
                        : "rgba(255,255,255,0.5)",
                      flexShrink: 0,
                      backdropFilter: selected ? "blur(4px)" : "none",
                      transition: "all 0.18s",
                    }}
                  >
                    {selected && <span style={{ color: "#1a1a1a", display: "flex" }}><CheckIcon className="h-3 w-3" /></span>}
                  </span>
                )}
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

