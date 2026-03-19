"use client";

import { FormEvent, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  DISPLAY_LABELS,
  QUESTION_DISPLAY,
  QUIZ_CONFIG,
} from "@/lib/recommendation-engine/quiz-config";

type AnswerMap = Record<string, string | string[]>;

function prettyLabel(value: string): string {
  const label = DISPLAY_LABELS[value as keyof typeof DISPLAY_LABELS];
  if (label) return label;
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const IMAGE_CARD_QUESTIONS = new Set(["scent_type", "style_icon", "closet_aesthetic"]);
const MOOD_CARD_QUESTIONS = new Set(["mood", "weekend_vibe"]);
const CHIP_GRID_QUESTIONS = new Set(["mbti", "rising_sign"]);

export default function QuizPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const questionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = QUIZ_CONFIG.length;
  const answered = useMemo(
    () =>
      QUIZ_CONFIG.filter((q) => {
        const v = answers[q.id];
        if (Array.isArray(v)) return v.length > 0;
        return typeof v === "string" && v.length > 0;
      }).length,
    [answers],
  );
  const progress = Math.round((answered / total) * 100);
  const allAnswered = answered >= total;

  function scrollToNext(index: number) {
    setTimeout(() => {
      const next = questionRefs.current[index + 1];
      if (next) next.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 280);
  }

  function updateSingle(id: string, value: string, index: number) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    scrollToNext(index);
  }

  function updateMulti(id: string, value: string, checked: boolean) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[id]) ? (prev[id] as string[]) : [];
      const next = checked
        ? Array.from(new Set([...current, value])).slice(0, 3)
        : current.filter((i) => i !== value);
      return { ...prev, [id]: next };
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!allAnswered) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      if (!res.ok) {
        const p = (await res.json()) as { error?: string };
        throw new Error(p.error ?? "Failed to generate recommendation");
      }
      const payload = await res.json();
      sessionStorage.setItem("reco_result", JSON.stringify(payload));
      router.push("/archetype");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={s.page}>
      {/* Fixed thin progress line at top */}
      <div style={s.progressBarFixed}>
        <div style={{ ...s.progressFill, width: `${progress}%` }} />
      </div>

      {/* Sticky header */}
      <div style={s.stickyHeader}>
        <div style={s.headerInner}>
          <span style={s.brandLabel}>Scent Statement Finder</span>
          <span style={s.progressCount}>{answered} / {total}</span>
        </div>
      </div>

      <form onSubmit={onSubmit} style={s.form}>
        <div style={s.questionsStack}>
          {QUIZ_CONFIG.map((question, index) => {
            const val = answers[question.id];
            const isAnswered = Array.isArray(val)
              ? val.length > 0
              : typeof val === "string" && val.length > 0;

            return (
              <div
                key={question.id}
                ref={(el) => { questionRefs.current[index] = el; }}
                style={s.questionCard}
              >
                <div style={s.questionMeta}>
                  <span style={s.questionIndex}>{String(index + 1).padStart(2, "0")}</span>
                  {isAnswered && <span style={s.answeredPill}>✓</span>}
                </div>
                <h2 style={s.questionTitle}>{QUESTION_DISPLAY[question.id]}</h2>

                {question.id === "dislike_note" && (
                  <p style={s.questionHint}>
                    Select up to 3 — these will never appear in your recommendations.
                  </p>
                )}

                {question.kind === "multi" ? (
                  <MultiSelect
                    question={question}
                    current={(answers[question.id] as string[]) ?? []}
                    onUpdate={(v, checked) => updateMulti(question.id, v, checked)}
                  />
                ) : CHIP_GRID_QUESTIONS.has(question.id) ? (
                  <ChipGrid
                    question={question}
                    current={answers[question.id] as string}
                    cols={question.id === "mbti" ? 4 : 3}
                    onUpdate={(v) => updateSingle(question.id, v, index)}
                  />
                ) : IMAGE_CARD_QUESTIONS.has(question.id) ? (
                  <ImageCardGrid
                    question={question}
                    current={answers[question.id] as string}
                    onUpdate={(v) => updateSingle(question.id, v, index)}
                  />
                ) : MOOD_CARD_QUESTIONS.has(question.id) ? (
                  <MoodCardList
                    question={question}
                    current={answers[question.id] as string}
                    onUpdate={(v) => updateSingle(question.id, v, index)}
                  />
                ) : (
                  <RadioList
                    question={question}
                    current={answers[question.id] as string}
                    onUpdate={(v) => updateSingle(question.id, v, index)}
                  />
                )}
              </div>
            );
          })}
        </div>

        {error && <p style={s.errorText}>{error}</p>}

        <div style={s.stickyBottom}>
          <button
            type="submit"
            disabled={submitting || !allAnswered}
            style={{
              ...s.ctaBtn,
              opacity: allAnswered ? (submitting ? 0.7 : 1) : 0.38,
              cursor: allAnswered && !submitting ? "pointer" : "not-allowed",
            }}
          >
            {submitting
              ? "Finding your matches..."
              : allAnswered
              ? "See my scent profile →"
              : `${total - answered} question${total - answered !== 1 ? "s" : ""} left`}
          </button>
        </div>
      </form>
    </main>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function RadioList({
  question, current, onUpdate,
}: {
  question: (typeof QUIZ_CONFIG)[number];
  current: string | undefined;
  onUpdate: (v: string) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {question.options.map((opt) => {
        const val = String(opt);
        const sel = current === val;
        return (
          <button key={val} type="button" onClick={() => onUpdate(val)}
            style={{
              ...s.radioRow,
              borderColor: sel ? "#0f172a" : "rgba(15,23,42,0.12)",
              background: sel ? "rgba(15,23,42,0.04)" : "transparent",
            }}>
            <span style={{
              ...s.radioDot,
              borderColor: sel ? "#0f172a" : "rgba(15,23,42,0.25)",
              background: sel ? "#0f172a" : "transparent",
            }}>
              {sel && <span style={s.radioDotCenter} />}
            </span>
            <span style={s.radioLabel}>{prettyLabel(val)}</span>
          </button>
        );
      })}
    </div>
  );
}

function MoodCardList({
  question, current, onUpdate,
}: {
  question: (typeof QUIZ_CONFIG)[number];
  current: string | undefined;
  onUpdate: (v: string) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 7 }}>
      {question.options.map((opt) => {
        const val = String(opt);
        const sel = current === val;
        return (
          <button key={val} type="button" onClick={() => onUpdate(val)}
            style={{
              ...s.moodCard,
              borderColor: sel ? "#0f172a" : "rgba(15,23,42,0.1)",
              background: sel ? "rgba(15,23,42,0.04)" : "rgba(255,255,255,0.6)",
              fontWeight: sel ? 500 : 400,
            }}>
            {sel && <span style={s.moodCheck}>✓</span>}
            <span style={{ textAlign: "left", flex: 1 }}>{prettyLabel(val)}</span>
          </button>
        );
      })}
    </div>
  );
}

function ImageCardGrid({
  question, current, onUpdate,
}: {
  question: (typeof QUIZ_CONFIG)[number];
  current: string | undefined;
  onUpdate: (v: string) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {question.options.map((opt) => {
        const val = String(opt);
        const label = prettyLabel(val);
        const [main, sub] = label.includes(" — ") ? label.split(" — ") : [label, null];
        const sel = current === val;
        return (
          <button key={val} type="button" onClick={() => onUpdate(val)}
            style={{
              ...s.imageCard,
              borderColor: sel ? "#0f172a" : "rgba(15,23,42,0.1)",
              borderWidth: sel ? 1.5 : 0.5,
            }}>
            {/* Image slot — swap <div> for <Image> when assets are ready */}
            <div style={s.imageSlot}>
              {sel && <div style={s.imageSelBadge}>✓</div>}
              <span style={s.imageSlotText}>image</span>
            </div>
            <div style={s.imageCardBody}>
              <p style={s.imageCardMain}>{main}</p>
              {sub && <p style={s.imageCardSub}>{sub}</p>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ChipGrid({
  question, current, cols, onUpdate,
}: {
  question: (typeof QUIZ_CONFIG)[number];
  current: string | undefined;
  cols: number;
  onUpdate: (v: string) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 6 }}>
      {question.options.map((opt) => {
        const val = String(opt);
        const sel = current === val;
        return (
          <button key={val} type="button" onClick={() => onUpdate(val)}
            style={{
              ...s.chip,
              background: sel ? "#0f172a" : "transparent",
              color: sel ? "#fff" : "#0f172a",
              borderColor: sel ? "#0f172a" : "rgba(15,23,42,0.2)",
            }}>
            {prettyLabel(val)}
          </button>
        );
      })}
    </div>
  );
}

function MultiSelect({
  question, current, onUpdate,
}: {
  question: (typeof QUIZ_CONFIG)[number];
  current: string[];
  onUpdate: (v: string, checked: boolean) => void;
}) {
  const MAX = 3;
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {question.options.map((opt) => {
        const val = String(opt);
        const sel = current.includes(val);
        const limitHit = current.length >= MAX && !sel;
        return (
          <button key={val} type="button" disabled={limitHit}
            onClick={() => onUpdate(val, !sel)}
            style={{
              ...s.radioRow,
              borderColor: sel ? "#0f172a" : "rgba(15,23,42,0.12)",
              background: sel ? "rgba(15,23,42,0.04)" : "transparent",
              opacity: limitHit ? 0.3 : 1,
            }}>
            <span style={{
              ...s.checkBox,
              borderColor: sel ? "#0f172a" : "rgba(15,23,42,0.25)",
              background: sel ? "#0f172a" : "transparent",
            }}>
              {sel && <span style={s.checkMark}>✓</span>}
            </span>
            <span style={s.radioLabel}>{prettyLabel(val)}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)",
    color: "#0f172a",
    fontFamily: "'SF Pro Text', -apple-system, 'Helvetica Neue', sans-serif",
    paddingBottom: 100,
  },
  progressBarFixed: {
    position: "fixed",
    top: 0, left: 0, right: 0,
    height: 3,
    background: "rgba(15,23,42,0.08)",
    zIndex: 100,
  },
  progressFill: {
    height: "100%",
    background: "#0f172a",
    borderRadius: "0 2px 2px 0",
    transition: "width 350ms ease",
  },
  stickyHeader: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "rgba(248,250,252,0.88)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderBottom: "0.5px solid rgba(15,23,42,0.08)",
    paddingTop: 3,
  },
  headerInner: {
    maxWidth: 600,
    margin: "0 auto",
    padding: "10px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandLabel: {
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#64748b",
    fontWeight: 600,
  },
  progressCount: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: 500,
  },
  form: {
    maxWidth: 600,
    margin: "0 auto",
    padding: "24px 16px 0",
  },
  questionsStack: {
    display: "grid",
    gap: 12,
  },
  questionCard: {
    background: "rgba(255,255,255,0.88)",
    borderRadius: 18,
    padding: "18px 16px 20px",
    boxShadow: "0 2px 16px rgba(15,23,42,0.05)",
    border: "0.5px solid rgba(15,23,42,0.06)",
  },
  questionMeta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  questionIndex: {
    fontSize: 11,
    letterSpacing: "0.06em",
    color: "#94a3b8",
    fontWeight: 600,
  },
  answeredPill: {
    fontSize: 10,
    background: "#0f172a",
    color: "#fff",
    padding: "1px 7px",
    borderRadius: 999,
    fontWeight: 600,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 1.3,
    color: "#0f172a",
    marginBottom: 14,
    letterSpacing: "-0.01em",
  },
  questionHint: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 12,
    lineHeight: 1.5,
    marginTop: -8,
  },
  radioRow: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "11px 13px",
    borderRadius: 12,
    border: "0.5px solid",
    cursor: "pointer",
    transition: "border-color 0.15s, background 0.15s",
    textAlign: "left",
    width: "100%",
    background: "transparent",
    color: "#0f172a",
    fontFamily: "inherit",
    minHeight: 44,
  },
  radioDot: {
    width: 17,
    height: 17,
    borderRadius: "50%",
    border: "1.5px solid",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
  },
  radioDotCenter: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#fff",
  },
  checkBox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    border: "1.5px solid",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
  },
  checkMark: {
    fontSize: 10,
    color: "#fff",
    fontWeight: 700,
    lineHeight: 1,
  },
  radioLabel: {
    fontSize: 14,
    lineHeight: 1.45,
    color: "#0f172a",
    flex: 1,
  },
  moodCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "13px 14px",
    borderRadius: 12,
    border: "0.5px solid",
    cursor: "pointer",
    transition: "all 0.15s",
    fontSize: 14,
    lineHeight: 1.45,
    color: "#0f172a",
    fontFamily: "inherit",
    width: "100%",
    minHeight: 44,
    background: "transparent",
  },
  moodCheck: {
    fontSize: 12,
    color: "#0f172a",
    fontWeight: 700,
    flexShrink: 0,
    marginTop: 1,
  },
  imageCard: {
    borderRadius: 13,
    border: "solid",
    overflow: "hidden",
    cursor: "pointer",
    transition: "border-color 0.15s",
    background: "rgba(255,255,255,0.9)",
    padding: 0,
    textAlign: "left",
    position: "relative",
    fontFamily: "inherit",
    color: "#0f172a",
  },
  imageSlot: {
    width: "100%",
    aspectRatio: "1 / 1",
    background: "#eef2f7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  imageSelBadge: {
    position: "absolute",
    top: 7, right: 7,
    width: 22, height: 22,
    borderRadius: "50%",
    background: "#0f172a",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  imageSlotText: {
    fontSize: 10,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#94a3b8",
  },
  imageCardBody: {
    padding: "8px 10px 10px",
  },
  imageCardMain: {
    fontSize: 12,
    fontWeight: 600,
    color: "#0f172a",
    lineHeight: 1.3,
    margin: 0,
  },
  imageCardSub: {
    fontSize: 11,
    color: "#64748b",
    margin: "2px 0 0",
    lineHeight: 1.3,
  },
  chip: {
    padding: "9px 6px",
    borderRadius: 9,
    border: "0.5px solid",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    transition: "all 0.15s",
    fontFamily: "inherit",
    minHeight: 38,
    letterSpacing: "0.01em",
  },
  stickyBottom: {
    position: "fixed",
    left: 0, right: 0, bottom: 0,
    padding: "12px 16px 20px",
    background: "linear-gradient(180deg, rgba(248,250,252,0) 0%, rgba(238,242,247,1) 30%)",
    zIndex: 40,
  },
  ctaBtn: {
    display: "block",
    maxWidth: 600,
    margin: "0 auto",
    width: "100%",
    padding: "15px 24px",
    borderRadius: 999,
    border: "none",
    background: "#0f172a",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    transition: "opacity 0.2s",
    fontFamily: "inherit",
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 13,
    margin: "12px 0",
    textAlign: "center",
  },
};
