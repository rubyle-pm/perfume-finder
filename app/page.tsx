"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

// ─── Inject CSS keyframes once ────────────────────────────────────────────────

const KEYFRAMES = `
  @keyframes floatA {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-10px) rotate(0.5deg); }
  }
  @keyframes floatB {
    0%, 100% { transform: translateY(0px) rotate(-0.5deg); }
    50%       { transform: translateY(-14px) rotate(0.3deg); }
  }
  @keyframes floatC {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    40%       { transform: translateY(-8px) translateX(4px); }
    80%       { transform: translateY(-4px) translateX(-3px); }
  }
  @keyframes floatD {
    0%, 100% { transform: translateY(0px) rotate(0.09deg); }
    50%       { transform: translateY(-12px) rotate(-0.3deg); }
  }
  @keyframes notifSlide {
    from { transform: translateY(-110%); opacity: 0; }
    to   { transform: translateY(0);     opacity: 1; }
  }
  @keyframes revealLine {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes revealCTA {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
  }
  @keyframes revealHandle {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;

// ─── Sub-components ────────────────────────────────────────────────────────────

function Notif() {
  return (
    <div style={{
      display: "flex", flexDirection: "row", alignItems: "flex-start",
      padding: "12px 9px 12px 13px", gap: 13,
    }}>
      <span style={{ fontSize: 26, lineHeight: 1, display: "block", marginTop: 2, flexShrink: 0 }}>🔮</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: "-apple-system,'SF Pro',sans-serif", fontWeight: 700, fontSize: 13, lineHeight: "1.3", letterSpacing: "-0.02em", color: "rgba(0,0,0,0.85)", marginBottom: 2 }}>
          Explore your Fragrance DNA
        </p>
        <p style={{ fontFamily: "-apple-system,'SF Pro',sans-serif", fontWeight: 400, fontSize: 13, lineHeight: "1.5", letterSpacing: "-0.008em", color: "rgba(0,0,0,0.85)" }}>
          12 questions. 3 scents. No sign-up needed. Just curiosity.
        </p>
      </div>
      <span style={{ fontFamily: "-apple-system,'SF Pro',sans-serif", fontSize: 11, color: "#BFBFBF", flexShrink: 0 }}>now</span>
    </div>
  );
}

function WinChrome({ colored = false }: { colored?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, height: 22, borderBottom: "1px solid rgba(0,0,0,0.08)", paddingLeft: 8, background: "rgba(248,248,248,0.95)", flexShrink: 0 }}>
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: colored ? "#FF5F57" : "rgba(0,0,0,0.15)", border: "0.5px solid rgba(0,0,0,0.08)", flexShrink: 0, display: "block" }} />
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: colored ? "#FEBC2E" : "rgba(0,0,0,0.15)", border: "0.5px solid rgba(0,0,0,0.08)", flexShrink: 0, display: "block" }} />
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: colored ? "#28C840" : "rgba(0,0,0,0.15)", border: "0.5px solid rgba(0,0,0,0.08)", flexShrink: 0, display: "block" }} />
    </div>
  );
}

function Toggle({ style, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      style={{
        display: "inline-flex", justifyContent: "space-between", alignItems: "center",
        padding: 2,
        width: "clamp(40px, 10vw, 62px)",
        height: "clamp(20px, 5vw, 28px)",
        background: "#34C759", borderRadius: 100, flexShrink: 0,
        transform: "rotate(-0.29deg)",
        ...style,
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)", paddingLeft: 4, fontFamily: "-apple-system,sans-serif", lineHeight: 1 }}>I</span>
      <span style={{
        width: "clamp(16px, 3.5vw, 24px)",
        height: "clamp(16px, 3.5vw, 24px)",
        background: "#fff", borderRadius: "50%", flexShrink: 0,
        boxShadow: "0 1px 3px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.04)"
      }} />
    </span>
  );
}

const GLASS: React.CSSProperties = {
  background: "rgba(250,250,250,0.75)",
  backdropFilter: "saturate(180%) blur(24px)",
  WebkitBackdropFilter: "saturate(180%) blur(24px)",
  border: "0.5px solid rgba(255,255,255,0.65)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.10), inset 0 0.5px 0 rgba(255,255,255,0.85)",
};

// ─── Style helpers ─────────────────────────────────────────────────────────────

function serifStyle(): React.CSSProperties {
  return {
    fontFamily: "var(--font-playfair),'Playfair Display',Georgia,serif",
    fontWeight: 400,
    fontSize: "clamp(1.9rem, 8.5vw, 4.5rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.3px",
    color: "#000",
    whiteSpace: "nowrap",
  };
}

function hlItalicStyle(): React.CSSProperties {
  return {
    fontFamily: "var(--font-playfair),'Playfair Display',Georgia,serif",
    fontStyle: "italic",
    fontWeight: 500,
    fontSize: "clamp(1.9rem, 8.5vw, 4.5rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.3px",
    color: "#000",
    background: "#D2E4F8",
    borderRadius: 2,
    padding: "0 4px",
    whiteSpace: "nowrap",
  };
}

// Staggered reveal helper
function reveal(delayS: number): React.CSSProperties {
  return {
    opacity: 0,
    animation: `revealLine 0.7s cubic-bezier(0.22,1,0.36,1) ${delayS}s forwards`,
  };
}
const iconSize = "clamp(1.7rem, 7.5vw, 3.2rem)";

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  // Inject keyframes
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = KEYFRAMES;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Track scroll for notification glass deepening
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ minHeight: "100dvh", background: "#FAFAF8", position: "relative", overflow: "hidden" }}>

      {/* NOISE OVERLAY — data URI SVG grain (reliable across SSR/CSR) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
          backgroundSize: "200px 200px",
          pointerEvents: "none",
          zIndex: 1,
          opacity: 0.7,
          mixBlendMode: "overlay",
        }}
      />

      {/* ── DECORATIVE LAYER ─────────────────────────────────────────────────── */}

      {/* NOTIFICATION — top, 16px margin each side */}
      <div style={{
        position: "fixed",
        top: 16,
        left: 16,
        right: 16,
        zIndex: 300,
        borderRadius: 16,
        overflow: "hidden",
        ...GLASS,
        boxShadow: scrolled
          ? "0 12px 40px rgba(0,0,0,0.18), inset 0 0.5px 0 rgba(255,255,255,0.85)"
          : "0 8px 32px rgba(0,0,0,0.10), inset 0 0.5px 0 rgba(255,255,255,0.85)",
        transition: "box-shadow 0.4s ease",
        animation: "notifSlide 1s cubic-bezier(0.22,1,0.36,1) 2s both",  // config notif 
      }}>
        <Notif />
      </div>

      {/* MONICA WINDOW — floatA */}
      <div style={{
        position: "absolute",
        top: "clamp(100px, 18vh, 200px)",
        left: "clamp(8px, 4vw, 24px)",
        width: "clamp(88px, 25vw, 120px)",
        height: "clamp(110px, 32vw, 150px)",
        background: "#fff",
        boxShadow: "0 5px 15px rgba(0,0,0,0.25)",
        borderRadius: 14,
        overflow: "hidden",
        zIndex: 2,
        animation: "floatA 7s ease-in-out 0s infinite",
      }}>
        <WinChrome />
        <div style={{ position: "relative", width: "100%", height: "calc(100% - 22px)" }}>
          <Image src="/images/monica.jpg" alt="" fill style={{ objectFit: "cover" }} />
        </div>
      </div>

      {/* BAG — wrapper handles position, inner div handles float animation */}
      <div style={{
        position: "absolute",
        top: "clamp(55px, 4vh, 110px)",
        left: "49%",
        transform: "translateX(-58%) scaleY(-1)",
        width: "clamp(100px, 30vw, 175px)",
        height: "clamp(62px, 24vw, 108px)",
        boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
        borderRadius: 14,
        overflow: "hidden",
        zIndex: 5,
      }}>
        <div style={{
          position: "absolute", inset: 0,
          animation: "floatA 9s ease-in-out 1s infinite",
        }}>
          <Image src="/images/bag.jpg" alt="" fill style={{ objectFit: "cover", objectPosition: "center top" }} />
        </div>
      </div>

      {/* DIPTYQUE + FIG — floatC, organic drift */}
      <div style={{
        position: "absolute",
        top: "clamp(100px, 18vh, 140px)",
        right: "clamp(4px, 2vw, 10px)",
        width: "clamp(130px, 35vw, 200px)",
        height: "clamp(130px, 35vw, 200px)",
        zIndex: 10,
        animation: "floatC 8s ease-in-out 0.5s infinite",
      }}>
        <Image src="/images/diptyque_fig.png" alt="" fill style={{ objectFit: "contain" }} />
      </div>

      {/* TOMFORD + MARTINI — floatB, offset delay */}
      <div style={{
        position: "absolute",
        bottom: "clamp(50px, 10vh, 100px)",
        left: "clamp(40px, 2vw, 0px)",
        width: "clamp(150px, 36vw, 240px)",
        height: "clamp(150px, 36vw, 240px)",
        zIndex: 20,
        animation: "floatB 10s ease-in-out 2s infinite",
      }}>
        <Image src="/images/tomford_martini.png" alt="" fill style={{ objectFit: "contain" }} />
      </div>

      {/* MOODBOARD WINDOW — floatD, slowest */}
      <div style={{
        position: "absolute",
        bottom: "clamp(50px, 20vh, 115px)",
        right: "clamp(25px, 2vw, 20px)",
        width: "clamp(140px, 42vw, 220px)",
        height: "clamp(105px, 24vw, 155px)",
        background: "#fff",
        boxShadow: "0 4px 15px rgba(0,0,0,0.25)",
        borderRadius: 15,
        overflow: "hidden",
        zIndex: 2,
        animation: "floatD 11s ease-in-out 1.5s infinite",
      }}>
        <WinChrome colored />
        <div style={{ position: "relative", width: "100%", height: "calc(100% - 22px)" }}>
          <Image src="/images/c08d097df5efc08ef1454ff2cb151d36.jpg" alt="" fill style={{ objectFit: "cover" }} />
        </div>
      </div>

      {/* ── CONTENT LAYER ────────────────────────────────────────────────────── */}
      <main style={{
        position: "relative",
        zIndex: 10,
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        // Top padding reserves space for notification + decorative top elements
        // Bottom padding reserves space for martini/moodboard
        padding: "clamp(200px, 38vh, 340px) 1rem clamp(190px, 34vh, 300px)",
        gap: 0,
      }}>

        {/* POV: */}
        <p style={{
          fontFamily: "var(--font-inter),'Inter',sans-serif",
          fontWeight: 600,
          fontSize: "clamp(2.2rem, 9vw, 4.4rem)",
          lineHeight: 0.9,
          letterSpacing: "-0.03em",
          color: "#000",
          marginBottom: "0.1em",
          //...reveal(0.4),
        }}>
          POV:
        </p>

        {/* Headline lines */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25em" }}>

          {/* You've [toggle] */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.7em", ...reveal(0.65) }}>
            <span style={serifStyle()}>You've</span>
            <Toggle style={{ transform: "rotate(-0.29deg) translateY(4px)" }} />
          </div>

          {/* [👀] discovered your [disco] */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5em", ...reveal(0.95) }}>
            <span style={{ fontSize: iconSize, lineHeight: 1, display: "inline-block" }}>👀</span>
            <span style={serifStyle()}>discovered your</span>
            <span style={{ fontSize: iconSize, lineHeight: 1, display: "inline-block" }}>🪩</span>
          </div>

          {/* Statement Scent today */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3em", ...reveal(1.05) }}>
            <em style={hlItalicStyle()}>Statement Scent</em>
            <span style={serifStyle()}>today</span>
          </div>

        </div>

        {/* CTA */}
        <Link
          href="/quiz"
          className="ds-btn ds-btn-glass ds-btn-lg"
          style={{
            marginTop: "clamp(1.6rem, 5.5vh, 2.8rem)",
            background: "rgba(235, 235, 235, 0.88)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: "#3C3C3E",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.9), 0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <span style={{ fontSize: "clamp(12px, 2vw, 15px)", lineHeight: 1 }}>▶</span>
          <span style={{ fontFamily: "var(--font-inter), -apple-system, 'SF Pro', sans-serif", fontSize: "clamp(14px, 2.5vw, 18px)", fontWeight: 500, letterSpacing: "-0.23px" }}>
            Play Now
          </span>
        </Link>

        {/* Handle */}
        <p style={{
          marginTop: "clamp(0.8rem, 2.5vh, 1.5rem)",
          fontFamily: "var(--font-inter),'Inter',sans-serif",
          fontWeight: 600,
          fontSize: "clamp(12px, 1.8vw, 18px)",
          letterSpacing: "-0.3px",
          color: "#808080",
          opacity: 0,
          animation: "revealHandle 0.8s ease 1.6s forwards",
        }}>
          @haz.perfume
        </p>
      </main>
    </div>
  );
}