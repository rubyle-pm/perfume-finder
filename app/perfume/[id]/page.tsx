// view detail page

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { getNoteImageMapping } from "@/lib/noteImageMap";
import { Perfume, RecommendationCandidate } from "@/lib/recommendation-engine/types";
import { UseCase } from "@/lib/recommendation-engine/vocabulary";
import { NarrativeResult } from "@/lib/recommendation-engine/narrative";
import { EngineResult } from "@/lib/recommendation-engine/result-select";

type ResultPayload = EngineResult & { narrative?: NarrativeResult };

const c = {
  bg: "#FAFAF8",
  ink: "#1C1C1A",
  muted: "#9A9690",
  border: "#DDD9D0",
  pillBg: "#E8E5DE"
};

function generateVibe(perfume: Perfume, matchedUseCase: UseCase | null, signals: string[] = [], descriptors: string[] = [], slotKey: string = "bestFit") {
  const occasion = matchedUseCase ? matchedUseCase.replace(/_/g, " ") : "any occasion";
  const vibe = signals.length > 0 ? signals.slice(0, 2).join(" and ") : "refined";
  const pref = descriptors.length > 0 ? descriptors[0] : perfume.family_primary.replace(/_/g, " ");

  const tops = perfume.top_notes.slice(0, 2).join(" and ") || "fresh notes";
  const hearts = perfume.heart_notes.slice(0, 2).join(" and ") || "complex accords";
  const bases = perfume.base_notes.slice(0, 2).join(" and ") || "deep resonance";

  if (slotKey === "bestFit") {
    return `Designed for your everyday rotation, this fragrance perfectly echoes your ${vibe} natural energy. It opens with vibrant ${tops}, leading into a lush ${pref} heart of ${hearts}. A true extension of your personal style anchored by a confident base of ${bases}.`;
  } else if (slotKey === "idealMatch") {
    return `A statement piece created to announce you. It projects a commanding ${vibe} aura, opening with striking ${tops}. The signature ${pref} heart of ${hearts} settles into an undeniable base of ${bases}, leaving a memorable impression.`;
  } else {
    return `An unexpected twist that uniquely works. It pushes your boundaries with vibrant ${tops}, yet retains a subtle ${vibe} charm through a distinct ${pref} heart of ${hearts}. A creative exploration anchored beautifully by ${bases}.`;
  }
}

export default function PerfumeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [vibeDesc, setVibeDesc] = useState<string>("");
  const [matchedUseCase, setMatchedUseCase] = useState<UseCase | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Attempt to hydrate from sessionStorage
    const raw = sessionStorage.getItem("reco_result");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ResultPayload;
        const slots = parsed.slots;
        if (!slots) return;

        let foundCandidate: RecommendationCandidate | undefined;
        let slotMatchType = "bestFit";

        // Check slots for this perfume
        if (slots.bestFit?.perfume.id === id) { foundCandidate = slots.bestFit; slotMatchType = "bestFit"; }
        else if (slots.idealMatch?.perfume.id === id) { foundCandidate = slots.idealMatch; slotMatchType = "idealMatch"; }
        else if (slots.wildcard?.perfume.id === id) { foundCandidate = slots.wildcard; slotMatchType = "wildcard"; }

        if (foundCandidate) {
          setPerfume(foundCandidate.perfume);
          setMatchedUseCase(foundCandidate.matchSignals?.use_case || null);
          setVibeDesc(generateVibe(
            foundCandidate.perfume,
            foundCandidate.matchSignals?.use_case || null,
            foundCandidate.matchSignals?.signals,
            foundCandidate.matchSignals?.descriptors,
            slotMatchType
          ));
        }
      } catch (err) {
        console.error("Failed to parse reco_result", err);
      }
    }
  }, [id]);

  if (!perfume) return null; // or loading state

  const bottleUrl = `/perfume-image/perfume-bottles/${perfume.id}.jpg`;
  const noteImgUrl = getNoteImageMapping(perfume.top_notes, perfume.heart_notes, perfume.base_notes);

  return (
    <div style={s.mainPage}>
      {/* Header */}
      <div style={s.header}>
        <button onClick={() => router.back()} style={s.backLink}>← Back</button>
        <p style={s.headerTitle}>Your essence, in a bottle</p>
      </div>

      <div style={s.page}>

      {/* Bottle Hero */}
      <div style={s.bottleHero}>
        <div style={s.bottleOrb}></div>

        {imgError ? (
          <svg style={s.bottleSvg} width="80" height="200" viewBox="0 0 80 200" fill="none">
            <rect x="29" y="0" width="22" height="14" rx="2" fill="#C8BFB0" opacity="0.85" />
            <rect x="24" y="12" width="32" height="7" rx="1" fill="#B8AFA0" />
            <path d="M17 44 Q8 74 8 120 Q8 170 16 184 Q27 198 40 198 Q53 198 64 184 Q72 170 72 120 Q72 74 63 44 Q56 28 40 28 Q24 28 17 44Z" fill="#D9D0C2" opacity="0.88" />
            <path d="M24 19 Q18 32 17 44 Q24 28 40 28 Q56 28 63 44 Q62 32 56 19Z" fill="#C4BAA8" />
            <rect x="29" y="12" width="22" height="7" rx="1" fill="#EAE2D6" />
            <rect x="12" y="138" width="56" height="28" rx="1" fill="white" opacity="0.5" />
            <line x1="17" y1="145" x2="63" y2="145" stroke="#8B7B68" strokeWidth="0.5" opacity="0.38" />
            <line x1="17" y1="150" x2="63" y2="150" stroke="#8B7B68" strokeWidth="0.4" opacity="0.25" />
            <line x1="17" y1="155" x2="48" y2="155" stroke="#8B7B68" strokeWidth="0.4" opacity="0.18" />
          </svg>
        ) : (
          <img
            src={bottleUrl}
            alt={perfume.name}
            style={s.bottleImage}
            onError={() => setImgError(true)}
          />
        )}
      </div>

      <div style={s.content}>
        {/* Hero text */}
        <div style={s.hero}>
          <div style={s.brandLabel}>{perfume.brand}</div>
          <h1 style={s.perfumeName}>{perfume.name}</h1>
          <div style={s.metaRow}>
            {perfume.concentration && (
              <div style={s.metaItem}><div style={s.key}>Concentration</div><div style={s.val}>{perfume.concentration}</div></div>
            )}
            {perfume.volume_ml && (
              <div style={s.metaItem}><div style={s.key}>Volume</div><div style={s.val}>{perfume.volume_ml} ml</div></div>
            )}
            <div style={s.metaItem}><div style={s.key}>Family</div><div style={s.val}>{perfume.family_primary.replace(/_/g, " ")}</div></div>
            <div style={s.metaItem}><div style={s.key}>Gender</div><div style={s.val}>{perfume.gender_tags?.[0] || 'Unisex'}</div></div>
            <div style={s.metaItem}><div style={s.key}>Price</div><div style={s.val}>{perfume.price_vnd?.toLocaleString('vi-VN')} ₫</div></div>
          </div>
        </div>

        <div style={s.divider}></div>

        {/* AI Description (Using narrative reasoning) */}
        <div>
          <div style={s.secLabel}>About this fragrance</div>
          <p style={s.descItalic}>{vibeDesc}</p>
          <div style={s.aiTag}>Generated for your profile</div>
        </div>
      </div>

      {/* Notes imagery panel */}
      <div style={s.notesSection}>
        <div style={s.notesPanel}>
          <img style={s.notesImg} src={noteImgUrl} alt="Notes" />
          <div style={s.notesScrim}></div>
          <div style={s.notesLeft}><div style={s.notesTitle}>Notes</div></div>
          <div style={s.notesRight}>
            <div style={s.notesBody}>
              {['top', 'heart', 'base'].map((tier) => {
                const notesList = perfume[`${tier}_notes` as keyof Perfume] as string[] || [];
                if (notesList.length === 0) return null;
                const isHeart = tier === 'heart';
                return (
                  <div key={tier} style={{ ...s.tierLine, ...(isHeart ? s.tierLineHeart : {}) }}>
                    <span style={{ ...s.tierKey, ...(isHeart ? s.tierKeyHeart : {}) }}>{tier.toUpperCase()}: </span>
                    {notesList.join(", ")}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div style={s.ucSection}>
        <div style={s.secLabel}>Best for</div>
        <div style={s.ucRow}>
          {perfume.use_cases.map((uc, i) => {
            const isMatched = uc === matchedUseCase;
            const label = uc.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
            return (
              <span key={i} style={{ ...s.ucChip, ...(isMatched ? s.ucChipMatched : {}) }}>
                {label}
              </span>
            );
          })}
        </div>
      </div>

      <div style={s.divider2}></div>

      {/* CTA */}
      <div style={s.ctaSection}>
        <button className="ds-btn ds-btn-glass" style={{ flex: 1 }} onClick={() => router.push('/')}>Back to Home</button>
        <button className="ds-btn ds-btn-primary" style={{ flex: 1 }} onClick={() => window.open('https://www.instagram.com/haz.perfumes/', '_blank')}>Shop ↗</button>
      </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  mainPage: {
    minHeight: "100dvh",
    background: c.bg,
    color: c.ink,
    fontFamily: "var(--font-inter, -apple-system, sans-serif)",
  },
  page: {
    maxWidth: 680,
    margin: "0 auto",
    padding: "0 0 5rem",
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
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    fontFamily: "var(--font-inter, -apple-system, sans-serif)",
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1C1917",
    margin: 0,
  },
  bottleHero: {
    width: "100%",
    aspectRatio: "16/9",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderBottom: `1px solid ${c.border}`,
    overflow: "hidden"
  },
  bottleOrb: {
    display: "none" // Hiding orb on white bg to keep clean frame style
  },
  bottleSvg: {
    position: "relative",
    zIndex: 2,
    transform: "scale(0.7)",
  },
  bottleImage: {
    position: "relative",
    zIndex: 2,
    height: "100%",
    width: "100%",
    objectFit: "contain",
    transform: "scale(0.7)",
  },
  placeholderLabel: {
    position: "absolute",
    bottom: "1.25rem",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: 10,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: c.muted,
    whiteSpace: "nowrap",
    zIndex: 3,
  },
  content: {
    padding: "0 1.5rem",
  },
  secLabel: {
    fontSize: 10,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: c.muted,
    marginBottom: "0.6rem",
  },
  hero: {
    padding: "2rem 0 2rem",
  },
  brandLabel: {
    fontSize: 10,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: c.muted,
    marginBottom: "0.75rem",
  },
  perfumeName: {
    fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
    fontSize: "clamp(42px, 8vw, 52px)",
    fontWeight: 400,
    lineHeight: 1.1,
    color: c.ink,
    marginBottom: "1.75rem",
  },
  metaRow: {
    display: "flex",
    gap: "2.5rem",
    flexWrap: "wrap", // Wrapping is safer for mobile overflow
  },
  metaItem: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
  },
  key: {
    fontSize: 10,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: c.muted,
    whiteSpace: "nowrap",
  },
  val: {
    fontSize: 14,
    fontWeight: 400,
    color: c.ink,
    whiteSpace: "nowrap",
    textTransform: "capitalize",
  },
  divider: {
    height: 1,
    background: c.border,
    margin: "2rem 0",
  },
  descItalic: {
    fontFamily: "var(--font-inter, -apple-system, sans-serif)",
    fontSize: 17,
    fontStyle: "italic",
    fontWeight: 300,
    lineHeight: 1.7,
    color: c.ink,
    margin: "0.6rem 0 0.5rem",
  },
  aiTag: {
    fontSize: 11,
    color: c.muted,
  },
  notesSection: {
    margin: "2.5rem 0 0",
  },
  notesPanel: {
    position: "relative",
    width: "100%",
    aspectRatio: "16/9",
    display: "flex",
    alignItems: "center",
  },
  notesImg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
  },
  notesScrim: {
    position: "absolute",
    inset: 0,
    background: "rgba(30,26,20,0.28)",
  },
  notesLeft: {
    position: "relative",
    zIndex: 2,
    flex: "0 0 auto",
    padding: "2.5rem 3rem",
    display: "flex",
    alignItems: "center",
  },
  notesTitle: {
    fontFamily: "var(--font-inter, -apple-system, sans-serif)",
    fontSize: "clamp(36px,6vw,56px)",
    fontWeight: 300,
    color: "rgba(255,255,255,0.90)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    lineHeight: 1,
  },
  notesRight: {
    position: "relative",
    zIndex: 2,
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "2.5rem 2.5rem 2.5rem 1rem",
  },
  notesBody: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  tierLine: {
    fontFamily: "var(--font-inter, -apple-system, sans-serif)",
    fontSize: 12,
    fontWeight: 300,
    color: "rgba(255,255,255,0.82)",
    lineHeight: 1.5,
  },
  tierKey: {
    fontWeight: 500,
    color: "rgba(255,255,255,0.55)",
    marginRight: "0.4rem",
    letterSpacing: "0.06em",
  },
  tierLineHeart: {
    color: "rgba(255,255,255,0.97)",
  },
  tierKeyHeart: {
    color: "rgba(255,255,255,0.65)",
  },
  ucSection: {
    padding: "2.5rem 1.5rem 0",
  },
  ucRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: "0.75rem",
  },
  ucChip: {
    padding: "8px 18px",
    borderRadius: 9999,
    fontSize: 12,
    background: c.pillBg,
    color: c.muted,
    border: "none",
    fontFamily: "var(--font-inter, -apple-system, sans-serif)",
  },
  ucChipMatched: {
    background: c.ink,
    color: c.bg,
    fontWeight: 500,
  },
  divider2: {
    height: 1,
    background: c.border,
    margin: "2.5rem 1.5rem 0",
  },
  ctaSection: {
    padding: "2rem 1.5rem 0",
    display: "flex",
    gap: "0.75rem",
  }
};
