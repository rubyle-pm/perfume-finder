"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ARCHETYPE_DISPLAY } from "@/lib/recommendation-engine/archetype-display";
import type { NarrativeResult } from "@/lib/recommendation-engine/narrative";
import type { EngineResult } from "@/lib/recommendation-engine/result-select";

type ResultPayload = EngineResult & { narrative?: NarrativeResult };

export default function ArchetypePage() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("reco_result");
    if (!raw) return;
    try { setResult(JSON.parse(raw) as ResultPayload); } catch { setResult(null); }
  }, []);

  if (!result) {
    return (
      <main style={s.page}>
        <div style={s.emptyState}>
          <h1 style={s.emptyTitle}>No results yet</h1>
          <p style={s.emptyBody}>Complete the quiz first to see your archetype.</p>
          <Link href="/quiz" style={s.linkUnderline}>Take the quiz →</Link>
        </div>
      </main>
    );
  }

  const archetype = result.topPickArchetype ? ARCHETYPE_DISPLAY[result.topPickArchetype] : null;
  const signals = result.slots?.bestFit ? [] : [];
  // Pull signals from sessionStorage-stored profile if available, fallback gracefully
  const signalList: string[] = [];

  return (
    <main style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <Link href="/quiz/review" style={s.backLink}>← Back</Link>
        <p style={s.headerTitle}>Your essence, in a bottle</p>
      </div>

      {/* Hero image slot — replace with botanical/editorial image */}
      <div style={s.heroSlot}>
        {archetype?.image ? (
          <img 
            src={archetype.image} 
            alt={archetype.name} 
            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
          />
        ) : (
          <span style={s.heroPlaceholder}>
            Archetype hero image<br />
            <span style={{ fontSize: 11, opacity: 0.6 }}>Botanical / organic editorial — no faces</span>
          </span>
        )}
      </div>

      {/* Content */}
      <div style={s.content}>
        <p style={s.eyebrow}>Your Fragrance DNA</p>

        <h1 style={s.archetypeName}>
          {archetype?.name ?? "Your Fragrance DNA"}
        </h1>

        {archetype?.tagline && (
          <p style={s.tagline}>{archetype.tagline}</p>
        )}

        {result.narrative?.archetype_description && (
          <p style={s.description}>{result.narrative.archetype_description}</p>
        )}

        {/* Signal tags */}
        {result.topPickArchetype && (
          <div style={s.tagRow}>
            {/* Show archetype signals as visual tags */}
            {getArchetypeSignals(result.topPickArchetype).map((sig) => (
              <span key={sig} style={s.tag}>{sig.replace(/_/g, " ")}</span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div style={s.divider} />

        {/* Answer review — compact 2-col grid */}
        <div style={s.reviewSection}>
          <p style={s.reviewLabel}>Based on your profile</p>
        </div>
        <div style={s.reviewGrid}>
          {getAnswerSummary(result).map(({ label, value }) => (
            <div key={label} style={s.reviewItem}>
              <span style={s.reviewItemLabel}>{label}</span>
              <span style={s.reviewItemValue}>{value}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link href="/results" style={s.ctaBtn}>
          Explore your Statement Scents →
        </Link>
      </div>
    </main>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────

import { ARCHETYPE_SIGNAL_MAP } from "@/lib/recommendation-engine/vocabulary";

function getArchetypeSignals(archetypeId: string): string[] {
  return [...((ARCHETYPE_SIGNAL_MAP as Record<string, readonly string[]>)[archetypeId] ?? [])];
}

function getAnswerSummary(result: ResultPayload): { label: string; value: string }[] {
  // Pull from stored answers if available — graceful fallback to perfume data
  try {
    const raw = sessionStorage.getItem("reco_result");
    if (!raw) return [];
    // We don't store raw answers in reco_result, so show derived profile data
    const r = JSON.parse(raw) as ResultPayload;
    const items: { label: string; value: string }[] = [];
    if (r.topPickArchetype) {
      items.push({ label: "You are a ", value: r.topPickArchetype.replace(/_/g, " ") });
    }
    if (r.slots?.bestFit?.perfume) {
      items.push({
        label: "Your daily scent",
        value: r.slots.bestFit.perfume.name,
      });
    }
    return items;
  } catch {
    return [];
  }
}

// ─── Styles ────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    background: "#FAFAF8",
    color: "#1C1917",
    fontFamily: "var(--font-inter), -apple-system, 'Helvetica Neue', sans-serif",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100dvh",
    padding: 24,
    gap: 12,
    textAlign: "center",
  },
  emptyTitle: { fontSize: 24, fontWeight: 600 },
  emptyBody: { fontSize: 14, color: "#57534E" },
  linkUnderline: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1C1917",
    textDecoration: "underline",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "rgba(250,250,248,0.9)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderBottom: "0.5px solid rgba(28,25,23,0.08)",
    padding: "12px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backLink: {
    fontSize: 13,
    color: "#57534E",
    textDecoration: "none",
    fontWeight: 500,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1C1917",
    margin: 0,
  },
  heroSlot: {
    width: "100%",
    height: "45dvh",
    maxHeight: 400,
    background: "#292524",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  heroPlaceholder: {
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
    textAlign: "center",
    lineHeight: 1.6,
    letterSpacing: "0.03em",
  },
  content: {
    maxWidth: 520,
    margin: "0 auto",
    padding: "28px 20px 48px",
    display: "flex",
    flexDirection: "column",
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#A8A29E",
    fontWeight: 600,
    marginBottom: 10,
  },
  archetypeName: {
    fontSize: "clamp(28px, 8vw, 40px)",
    fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
    fontWeight: 400,
    letterSpacing: "-0.02em",
    color: "#1C1917",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: "#44403C",
    fontStyle: "italic",
    lineHeight: 1.5,
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 1.65,
    color: "#44403C",
    marginBottom: 20,
  },
  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 7,
    marginBottom: 28,
  },
  tag: {
    padding: "5px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
    border: "0.5px solid rgba(28,25,23,0.15)",
    color: "#44403C",
    background: "rgba(28,25,23,0.03)",
    letterSpacing: "0.02em",
  },
  divider: {
    height: "0.5px",
    background: "rgba(28,25,23,0.08)",
    margin: "4px 0 20px",
  },
  reviewSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewLabel: {
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#A8A29E",
    fontWeight: 600,
  },
  reviewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px 16px",
    marginBottom: 32,
  },
  reviewItem: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  reviewItemLabel: {
    fontSize: 11,
    color: "#A8A29E",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: 600,
  },
  reviewItemValue: {
    fontSize: 13,
    color: "#1C1917",
    fontWeight: 500,
    textTransform: "capitalize",
  },
  ctaBtn: {
    display: "block",
    textAlign: "center",
    padding: "12px 28px",
    borderRadius: 1000,
    background: "#2C2C2E",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: "-0.23px",
    textDecoration: "none",
    marginBottom: 16,
    minHeight: 44,
    fontFamily: "var(--font-inter), -apple-system, sans-serif",
    transition: "background 0.18s ease",
  },
  retakeLink: {
    display: "block",
    textAlign: "center",
    fontSize: 13,
    color: "#57534E",
    textDecoration: "underline",
  },
};
