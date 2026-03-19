"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ARCHETYPE_DISPLAY } from "@/lib/recommendation-engine/archetype-display";
import type { NarrativeResult } from "@/lib/recommendation-engine/narrative";
import type { EngineResult } from "@/lib/recommendation-engine/result-select";
import type { RecommendationCandidate } from "@/lib/recommendation-engine/types";

type ResultPayload = EngineResult & {
  narrative?: NarrativeResult;
};

function slotLabel(label: "bestFit" | "idealMatch" | "wildcard"): string {
  if (label === "bestFit") return "YOUR SCENT";
  if (label === "idealMatch") return "YOUR STATEMENT SCENT";
  return "YOUR SCENT, WITH A TWIST";
}

function renderCandidate(
  candidate: RecommendationCandidate,
  label: "bestFit" | "idealMatch" | "wildcard",
  narrative?: NarrativeResult,
) {
  const reason =
    label === "bestFit"
      ? narrative?.best_fit_reason
      : label === "idealMatch"
        ? narrative?.ideal_match_reason
        : narrative?.wildcard_reason;

  return (
    <article key={label} className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {slotLabel(label)}
      </p>
      <h3 className="mt-2 text-3xl font-semibold leading-tight text-slate-900">{candidate.perfume.name}</h3>
      <p className="mt-2 text-sm text-slate-700">
        {candidate.perfume.brand} - {candidate.perfume.price_vnd.toLocaleString("vi-VN")} ₫
      </p>
      {reason ? <p className="mt-3 text-sm italic leading-relaxed text-slate-600">{reason}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {candidate.perfume.descriptors.slice(0, 6).map((descriptor) => (
          <span
            key={`${label}-${descriptor}`}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
          >
            {descriptor}
          </span>
        ))}
      </div>
      <a
        href="#"
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Shop
      </a>
    </article>
  );
}

export default function ResultsPage() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("reco_result");
    if (!raw) return;
    try {
      setResult(JSON.parse(raw) as ResultPayload);
    } catch {
      setResult(null);
    }
  }, []);

  if (!result) {
    return (
      <main className="grid min-h-dvh place-items-center bg-gradient-to-b from-slate-50 to-slate-100 px-5 text-center text-slate-900">
        <div className="max-w-md">
          <h1 className="text-3xl font-semibold">No Results Yet</h1>
          <p className="mt-2 text-sm text-slate-600">Complete the quiz first to see your recommendations.</p>
          <Link href="/quiz" className="mt-4 inline-block text-sm font-semibold text-slate-900 underline">
            Go to Quiz
          </Link>
        </div>
      </main>
    );
  }

  const archetypeDisplay = result.topPickArchetype ? ARCHETYPE_DISPLAY[result.topPickArchetype] : null;

  return (
    <main className="min-h-dvh bg-gradient-to-b from-slate-50 via-slate-100 to-slate-100 text-slate-900">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            YOUR SCENT ARCHETYPE
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-900">
            {archetypeDisplay?.name ?? "Your Scent Archetype"}
          </h1>
          <p className="mt-2 text-base italic text-slate-500">{archetypeDisplay?.tagline ?? ""}</p>
          {result.narrative?.archetype_description ? (
            <p className="mt-4 text-base leading-relaxed text-slate-700">{result.narrative.archetype_description}</p>
          ) : null}
          <hr className="mt-6 border-slate-200" />
        </section>

        <section className="grid gap-4">
          {renderCandidate(result.slots.bestFit, "bestFit", result.narrative)}
          {renderCandidate(result.slots.idealMatch, "idealMatch", result.narrative)}
          {renderCandidate(result.slots.wildcard, "wildcard", result.narrative)}
        </section>

        <footer className="pb-4">
          <Link href="/quiz" className="text-sm font-semibold text-slate-900 underline">
            Retake Quiz
          </Link>
        </footer>
      </div>
    </main>
  );
}
