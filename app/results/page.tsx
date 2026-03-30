"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { NarrativeResult } from "@/lib/recommendation-engine/narrative";
import type { EngineResult } from "@/lib/recommendation-engine/result-select";
import type { RecommendationCandidate } from "@/lib/recommendation-engine/types";

type ResultPayload = EngineResult & { narrative?: NarrativeResult };

type SlotKey = "bestFit" | "idealMatch" | "wildcard";

const SLOT_META: Record<SlotKey, { eyebrow: string; label: string }> = {
  bestFit: {
    eyebrow: "Built for your everyday",
    label: "Your scent, but better",
  },
  idealMatch: {
    eyebrow: "Your statement fragrance",
    label: "The one that announces you",
  },
  wildcard: {
    eyebrow: "You with a twist",
    label: "The unexpected one",
  },
};

export default function ResultsPage() {
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
          <p style={s.emptyBody}>Complete the quiz first.</p>
          <Link href="/quiz" style={s.linkUnderline}>Take the quiz →</Link>
        </div>
      </main>
    );
  }

  const slots: SlotKey[] = ["bestFit", "idealMatch", "wildcard"];

  return (
    <main style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <Link href="/archetype" style={s.backLink}>← Back to scent profile</Link>
        <p style={s.headerTitle}>Your essence, in a bottle</p>
      </div>

      <div style={s.content}>
        {slots.map((slotKey) => {
          const candidate = result.slots?.[slotKey];
          if (!candidate) return null;
          const reason = slotKey === "bestFit"
            ? result.narrative?.best_fit_reason
            : slotKey === "idealMatch"
              ? result.narrative?.ideal_match_reason
              : result.narrative?.wildcard_reason;

          return (
            <PerfumeSection
              key={slotKey}
              slotKey={slotKey}
              candidate={candidate}
              reason={reason}
            />
          );
        })}

        {/* Summary card strip at bottom */}
        <div style={s.summarySection}>
          <p style={s.summaryLabel}>Choose your next fragrance</p>
          <div style={s.summaryRow}>
            {slots.map((slotKey) => {
              const candidate = result.slots?.[slotKey];
              if (!candidate) return null;
              return (
                <div key={slotKey} style={s.summaryCard}>
                  <div style={s.summaryImageSlot}>
                    {/* Replace with <Image> */}
                    <span style={s.summaryImageText}>img</span>
                  </div>
                  <p style={s.summaryCardName}>{candidate.perfume.name}</p>
                  <p style={s.summaryCardBrand}>{candidate.perfume.brand}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div style={s.footer}>
          <Link href="/quiz" style={s.retakeBtn}>Retake quiz</Link>
        </div>
      </div>
    </main>
  );
}

// ─── Perfume section ───────────────────────────────────────────────────────

function PerfumeSection({
  slotKey,
  candidate,
  reason,
}: {
  slotKey: SlotKey;
  candidate: RecommendationCandidate;
  reason?: string;
}) {
  const { eyebrow, label } = SLOT_META[slotKey];
  const { perfume } = candidate;

  // Format price
  const price = perfume.price_vnd
    ? `${perfume.price_vnd.toLocaleString("vi-VN")} ₫`
    : null;

  return (
    <section style={s.perfumeSection}>
      {/* Eyebrow */}
      <p style={s.perfumeEyebrow}>{eyebrow}</p>

      {/* Bottle image — full width, square */}
      <div style={s.bottleImageSlot}>
        {/*
          Replace with:
          <Image
            src={`/images/perfumes/${perfume.id}.jpg`}
            alt={perfume.name}
            fill
            style={{ objectFit: "contain", padding: "16px" }}
          />
        */}
        <span style={s.bottleImageText}>
          {perfume.name}<br />
          <span style={{ fontSize: 10, opacity: 0.5 }}>bottle image</span>
        </span>
      </div>

      {/* Name + brand */}
      <div style={s.perfumeNameBlock}>
        <h2 style={s.perfumeName}>{perfume.name}</h2>
        <div style={s.perfumeMeta}>
          <span style={s.perfumeBrand}>{perfume.brand}</span>
          {price && <span style={s.perfumePrice}>{price}</span>}
        </div>
      </div>

      {/* AI reason */}
      {reason && <p style={s.perfumeReason}>{reason}</p>}

      {/* Descriptor tags */}
      <div style={s.descriptorRow}>
        {perfume.descriptors.slice(0, 5).map((d) => (
          <span key={d} style={s.descriptorTag}>{d}</span>
        ))}
      </div>

      {/* CTA buttons */}
      <div style={s.btnRow}>
        <Link
          href={`/perfume/${perfume.id}`}
          style={s.btnSecondary}
        >
          View details
        </Link>
        <a
          href="#"
          style={s.btnPrimary}
          target="_blank"
          rel="noopener noreferrer"
        >
          Shop ↗
        </a>
      </div>

      <div style={s.sectionDivider} />
    </section>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    background: "#FAFAF8",
    color: "#1C1917",
    fontFamily: "var(--font-inter, -apple-system, 'Helvetica Neue', sans-serif)",
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
    fontSize: 14, fontWeight: 600, color: "#1C1917", textDecoration: "underline",
  },

  // Header bar
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

  content: {
    maxWidth: 520,
    margin: "0 auto",
    padding: "0 0 48px",
  },

  // Each perfume section
  perfumeSection: {
    padding: "28px 20px 0",
  },
  perfumeEyebrow: {
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#A8A29E",
    fontWeight: 600,
    marginBottom: 14,
  },

  // Full-width bottle image — square
  bottleImageSlot: {
    width: "100%",
    aspectRatio: "1 / 1",
    background: "#EDE9E4",
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    position: "relative",
    overflow: "hidden",
  },
  bottleImageText: {
    fontSize: 12,
    color: "#A8A29E",
    textAlign: "center",
    lineHeight: 1.6,
    letterSpacing: "0.03em",
  },

  perfumeNameBlock: {
    marginBottom: 12,
  },
  perfumeName: {
    fontSize: "clamp(22px, 6vw, 30px)",
    fontFamily: "var(--font-playfair, Georgia, serif)",
    fontWeight: 400,
    lineHeight: 1.1,
    color: "#1C1917",
    marginBottom: 6,
  },
  perfumeMeta: {
    display: "flex",
    alignItems: "baseline",
    gap: 10,
  },
  perfumeBrand: {
    fontSize: 13,
    color: "#57534E",
    fontWeight: 500,
  },
  perfumePrice: {
    fontSize: 13,
    color: "#1C1917",
    fontWeight: 600,
  },

  perfumeReason: {
    fontSize: 14,
    lineHeight: 1.65,
    color: "#44403C",
    fontStyle: "italic",
    marginBottom: 14,
  },

  descriptorRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 18,
  },
  descriptorTag: {
    padding: "4px 11px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 500,
    border: "0.5px solid rgba(28,25,23,0.12)",
    color: "#44403C",
    background: "rgba(255,255,255,0.7)",
    letterSpacing: "0.02em",
  },

  btnRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginBottom: 28,
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 20px",
    borderRadius: 1000,
    background: "#2C2C2E",
    color: "#fff",
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: "-0.23px",
    textDecoration: "none",
    minHeight: 44,
    fontFamily: "var(--font-inter), -apple-system, sans-serif",
    transition: "background 0.18s ease",
  },
  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 20px",
    borderRadius: 1000,
    background: "rgba(235, 235, 235, 0.88)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    color: "#3C3C3E",
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: "-0.23px",
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.6)",
    boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.9), 0 1px 4px rgba(0,0,0,0.06)",
    minHeight: 44,
    fontFamily: "var(--font-inter), -apple-system, sans-serif",
    transition: "background 0.18s ease, color 0.18s ease",
  },

  sectionDivider: {
    height: "0.5px",
    background: "rgba(28,25,23,0.08)",
    margin: "0 0 4px",
  },

  // Summary strip at bottom
  summarySection: {
    padding: "32px 20px 0",
  },
  summaryLabel: {
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#A8A29E",
    fontWeight: 600,
    marginBottom: 12,
  },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 8,
  },
  summaryCard: {
    borderRadius: 12,
    overflow: "hidden",
    border: "0.5px solid rgba(28,25,23,0.08)",
    background: "rgba(255,255,255,0.7)",
  },
  summaryImageSlot: {
    width: "100%",
    aspectRatio: "1 / 1",
    background: "#EDE9E4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryImageText: {
    fontSize: 10,
    color: "#A8A29E",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  summaryCardName: {
    fontSize: 11,
    fontWeight: 600,
    color: "#1C1917",
    padding: "7px 8px 2px",
    margin: 0,
    lineHeight: 1.3,
  },
  summaryCardBrand: {
    fontSize: 10,
    color: "#57534E",
    padding: "0 8px 8px",
    margin: 0,
  },

  footer: {
    padding: "28px 20px 0",
  },
  retakeBtn: {
    display: "block",
    textAlign: "center",
    fontSize: 13,
    color: "#57534E",
    textDecoration: "underline",
    fontWeight: 500,
  },
};
