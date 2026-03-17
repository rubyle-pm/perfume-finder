"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { EngineResult } from "@/lib/recommendation-engine/result-select";
import type { RecommendationCandidate } from "@/lib/recommendation-engine/types";

function slotTitle(label: "bestFit" | "idealMatch" | "wildcard"): string {
  if (label === "bestFit") return "Best Fit";
  if (label === "idealMatch") return "Ideal Match";
  return "Wildcard";
}

function renderCandidate(
  candidate: RecommendationCandidate,
  label: "bestFit" | "idealMatch" | "wildcard",
) {
  return (
    <article
      key={label}
      style={{
        background: "rgba(255,255,255,0.92)",
        borderRadius: 18,
        padding: 16,
        boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 12,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#475569",
          fontWeight: 700,
        }}
      >
        {slotTitle(label)}
      </p>
      <h2 style={{ margin: "8px 0 4px", fontSize: 22, lineHeight: 1.2 }}>
        {candidate.perfume.name}
      </h2>
      <p style={{ margin: "0 0 8px", color: "#334155", fontSize: 15 }}>
        {candidate.perfume.brand}
      </p>
      <p style={{ margin: "0 0 12px", color: "#0f172a", fontSize: 14, fontWeight: 600 }}>
        Score: {candidate.score.toFixed(3)}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {candidate.perfume.descriptors.slice(0, 6).map((descriptor) => (
          <span
            key={`${label}-${descriptor}`}
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: 12,
              color: "#334155",
            }}
          >
            {descriptor}
          </span>
        ))}
      </div>
    </article>
  );
}

export default function ResultsPage() {
  const [result, setResult] = useState<EngineResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("reco_result");
    if (!raw) return;
    try {
      setResult(JSON.parse(raw) as EngineResult);
    } catch {
      setResult(null);
    }
  }, []);

  if (!result) {
    return (
      <main
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: 20,
          background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)",
          color: "#0f172a",
          fontFamily: "Inter, SF Pro Text, -apple-system, sans-serif",
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 8px", fontSize: 28 }}>No Results Yet</h1>
          <p style={{ margin: "0 0 16px", color: "#334155" }}>
            Complete the quiz first to see your recommendations.
          </p>
          <Link href="/quiz" style={{ color: "#0f172a", fontWeight: 700 }}>
            Go to Quiz
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "24px 16px 28px",
          fontFamily: "Inter, SF Pro Text, -apple-system, sans-serif",
        }}
      >
        <header style={{ marginBottom: 16 }}>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#475569",
              fontWeight: 700,
            }}
          >
            Your Scent Statement
          </p>
          <h1 style={{ margin: "6px 0 8px", fontSize: 30, lineHeight: 1.15 }}>
            Recommendation Results
          </h1>
          <p style={{ margin: 0, color: "#334155", fontSize: 14 }}>
            Archetype: {result.topPickArchetype ?? "N/A"}
          </p>
          <p style={{ margin: "4px 0 0", color: "#334155", fontSize: 14 }}>
            {result.explanation}
          </p>
        </header>

        <section style={{ display: "grid", gap: 12 }}>
          {renderCandidate(result.slots.bestFit, "bestFit")}
          {renderCandidate(result.slots.idealMatch, "idealMatch")}
          {renderCandidate(result.slots.wildcard, "wildcard")}
        </section>

        <div style={{ marginTop: 18 }}>
          <Link href="/quiz" style={{ color: "#0f172a", fontWeight: 700 }}>
            Retake Quiz
          </Link>
        </div>
      </div>
    </main>
  );
}
