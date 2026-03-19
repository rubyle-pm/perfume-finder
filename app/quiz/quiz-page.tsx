"use client";

import { FormEvent, useMemo, useState, useRef } from "react";  //thêm useRef để tạo scroll-to-next quiz 
import { useRouter } from "next/navigation";
import {
  DISPLAY_LABELS,
  QUESTION_DISPLAY,
  QUIZ_CONFIG,
} from "@/lib/recommendation-engine/quiz-config";

type AnswerMap = Record<string, string | string[]>;

function prettyLabel(value: string): string {
  const displayLabel = DISPLAY_LABELS[value as keyof typeof DISPLAY_LABELS];
  if (displayLabel) return displayLabel;

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function QuizPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const questionRefs = useRef<Array<HTMLElement | null>>([]);  //tạo list refs cho từng quiz
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = QUIZ_CONFIG.length;
  const answered = useMemo(
    () =>
      QUIZ_CONFIG.filter((question) => {
        const value = answers[question.id];
        if (Array.isArray(value)) return value.length > 0;
        return typeof value === "string" && value.length > 0;
      }).length,
    [answers],
  );
  const progress = Math.round((answered / total) * 100);   //tính progress% 

  function updateSingle(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function updateMulti(id: string, value: string, checked: boolean) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[id]) ? prev[id] : [];
      const MAX_MULTI = 3;

      const next = checked
        ? Array.from(new Set([...current, value])).slice(0, MAX_MULTI)
        : current.filter((item) => item !== value);
      return { ...prev, [id]: next };
    });
  }

  function scrollToNext(index: number) {      //function scroll-to-next 
    const next = questionRefs.current[index + 1];
    if (next) {
      next.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to generate recommendation");
      }

      const payload = await response.json();
      sessionStorage.setItem("reco_result", JSON.stringify(payload));
      router.push("/results");
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Unexpected submission error";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)",
        color: "#0f172a",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "20px 16px 112px",
          fontFamily: "Inter, SF Pro Text, -apple-system, sans-serif",
        }}
      >
        <header style={{ marginBottom: 20 }}>
          <p
            style={{
              margin: 0,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontSize: 12,
              color: "#475569",
              fontWeight: 600,
            }}
          >
            Scent Statement Finder
          </p>
          <h1
            style={{
              margin: "8px 0 6px",
              fontSize: 30,
              lineHeight: 1.15,
              fontWeight: 700,
            }}
          >
            Find Your Signature Scent
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "#334155" }}>
            {answered}/{total} answered
          </p>
        </header>    
        <div 
  style={{    //render progress bar 
    position: "sticky",
    top: 0,
    height: 4,
    background: "#e2e8f0",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 16,
  }}
>
  <div
    style={{
      height: "100%",
      width: `${progress}%`,
      background: "linear-gradient(90deg,#0f172a,#334155)",      
      transition: "width 300ms ease",
    }}
  />
</div>
        <div
  style={{
    position: "fixed",
    top: 0,
    height: 4,
    background: "#e2e8f0",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 16,
  }}
>
  <div
    style={{
      height: "100%",
      width: `${progress}%`,
      background: "#0f172a",
      transition: "width 300ms ease",
    }}
  />
</div>

        <section style={{ display: "grid", gap: 12 }}>
          {QUIZ_CONFIG.map((question, index) => (
            <article
              key={question.id}
              ref={(el) => {
                questionRefs.current[index] = el;
              }}

              style={{
                background: "rgba(255,255,255,0.9)",
                borderRadius: 16,
                padding: 14,
                boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                Question {index + 1}
              </p>
              <h2 style={{ margin: "6px 0 12px", fontSize: 20, lineHeight: 1.2 }}>
                {QUESTION_DISPLAY[question.id]}
              </h2>
              <div style={{ display: "grid", gap: 8 }}>
                {question.options.map((option) => {
                  const value = String(option);
                  const selected = Array.isArray(answers[question.id])
                    ? (answers[question.id] as string[]).includes(value)
                    : answers[question.id] === value;

                  const commonStyle = {
                    borderRadius: 12,
                    border: selected ? "1.5px solid #0f172a" : "1px solid #cbd5e1",
                    background: selected ? "#e2e8f0" : "#ffffff",
                    minHeight: 44,
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 15,
                    cursor: "pointer",
                  } as const;

                  const current = answers[question.id] as string[] | undefined;

                  const limitReached =
                  question.id === "dislike_note" &&
                  Array.isArray(current) && 
                  current.length >= 3 &&
                  !selected;

                  if (question.kind === "multi") {
                    return (
                      <label key={value} style={commonStyle}>
                        <input
                          type="checkbox"
                          disabled={limitReached}
                          checked={selected}
                          onChange={(event) =>
                            updateMulti(question.id, value, event.currentTarget.checked)
                          }
                        />
                        <span>{prettyLabel(value)}</span>
                      </label>
                    );
                  }

                  return (
                    <label key={value} style={commonStyle}>
                      <input
                      type="radio"
                      name={question.id}
                      value={value}
                      checked={selected}
                      onChange={() => {
                        updateSingle(question.id, value);
                        setTimeout(() => { 
                          scrollToNext(index);
                        }, 2000); // ~2s     
                      }}
                        />
                      <span>{prettyLabel(value)}</span>
                    </label>
                  );
                })}
              </div>
            </article>
          ))}
        </section>

        {error ? (
          <p style={{ marginTop: 12, color: "#b91c1c", fontSize: 14 }}>
            {error}
          </p>
        ) : null}

        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            padding: 12,
            background: "linear-gradient(180deg, rgba(248,250,252,0) 0%, rgba(248,250,252,1) 28%)",
          }}
        >
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <button
              type="submit"
              disabled={submitting || answered < total}
              style={{
                width: "100%",
                minHeight: 48,
                borderRadius: 999,
                border: "none",
                background: "#0f172a",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Finding Matches..." : "See My Results"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
