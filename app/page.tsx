"use client"; /// orchestrator 

import Link from "next/link";

export default function HomePage() {
  return (
    <main style={s.page}>
      {/* Hero image — swap div for <Image> when asset is ready */}
      <div style={s.heroSlot}>
        {/* 
          Replace with:
          <Image src="/images/hero.jpg" alt="" fill style={{ objectFit: "cover" }} priority />
        */}
        <span style={s.heroPlaceholderText}>
          Hero image<br />
          <span style={{ fontSize: 11, opacity: 0.6 }}>
            Editorial campaign shot — portrait or square crop
          </span>
        </span>
      </div>

      {/* Content */}
      <div style={s.content}>
        <p style={s.eyebrow}>Scent Statement Finder</p>

        <h1 style={s.headline}>
          Find your<br />
          <em style={s.headlineAccent}>signature scent</em>
        </h1>

        <p style={s.body}>
          12 questions. A scent profile as specific as you are.
        </p>

        <div style={s.ctaGroup}>
          <Link href="/quiz" style={s.ctaBtn}>
            Start quiz →
          </Link>
          <p style={s.ctaHint}>Takes about 3 minutes</p>
        </div>
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    background: "#f8fafc",
    color: "#0f172a",
    fontFamily: "'SF Pro Text', -apple-system, 'Helvetica Neue', sans-serif",
  },

  // Hero image slot — takes ~55% of viewport height
  heroSlot: {
    flex: "0 0 55dvh",
    background: "#e8ecf0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    // Remove border when real image is in place
    borderBottom: "0.5px solid rgba(15,23,42,0.06)",
  },
  heroPlaceholderText: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 1.6,
    letterSpacing: "0.03em",
  },

  // Text content below hero
  content: {
    flex: 1,
    padding: "28px 24px 40px",
    maxWidth: 480,
    width: "100%",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },

  eyebrow: {
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#94a3b8",
    fontWeight: 600,
    marginBottom: 12,
  },

  headline: {
    fontSize: "clamp(32px, 9vw, 48px)",
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
    color: "#0f172a",
    marginBottom: 14,
  },
  headlineAccent: {
    fontStyle: "italic",
    fontWeight: 400,
    // When you add Canela or Domaine Display, apply it here:
    // fontFamily: "'Canela', 'Georgia', serif",
  },

  body: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 1.6,
    marginBottom: 32,
  },

  ctaGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 12,
    marginTop: "auto",
  },

  ctaBtn: {
    display: "block",
    textAlign: "center",
    padding: "16px 24px",
    borderRadius: 999,
    background: "#0f172a",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    textDecoration: "none",
    transition: "opacity 0.2s",
    minHeight: 52,
    lineHeight: 1.2,
  },

  ctaHint: {
    textAlign: "center",
    fontSize: 12,
    color: "#94a3b8",
    margin: 0,
  },
};
