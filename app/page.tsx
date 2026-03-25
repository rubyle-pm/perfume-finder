"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

// ─── Shared sub-components ────────────────────────────────────────────────────

function Notif({ titleSize = 13, descSize = 13 }: { titleSize?: number; descSize?: number }) {
  return (
    <div style={{
      display: "flex", flexDirection: "row", alignItems: "flex-start",
      padding: "12px 9px 12px 13px", gap: 13,
    }}>
      <span style={{ fontSize: 26, lineHeight: 1, display: "block", marginTop: 2, flexShrink: 0 }}>🔮</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: "-apple-system,'SF Pro',sans-serif", fontWeight: 700, fontSize: titleSize, lineHeight: "1.3", letterSpacing: "-0.02em", color: "rgba(0,0,0,0.85)", marginBottom: 2 }}>
          Explore your Fragrance DNA
        </p>
        <p style={{ fontFamily: "-apple-system,'SF Pro',sans-serif", fontWeight: 400, fontSize: descSize, lineHeight: "1.5", letterSpacing: "-0.008em", color: "rgba(0,0,0,0.85)" }}>
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

function Toggle({ width = 64, height = 28, knob = 24 }: { width?: number; height?: number; knob?: number }) {
  return (
    <span style={{ display: "inline-flex", justifyContent: "space-between", alignItems: "center", padding: 2, width, height, background: "#34C759", borderRadius: 100, flexShrink: 0, transform: "rotate(-0.29deg)" }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)", paddingLeft: 4, fontFamily: "-apple-system,sans-serif", lineHeight: 1 }}>I</span>
      <span style={{ width: knob, height: knob, background: "#fff", borderRadius: "50%", flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.04)" }} />
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

const BG = "#FAFAF8";

// ─── MOBILE LAYOUT (430px canvas, scaled) ────────────────────────────────────

function MobileLayout() {
  return (
    <div id="homeCanvas" style={{ position: "relative", width: 430, height: 860, transformOrigin: "top left" }}>

      {/* NOTIFICATION */}
      <div style={{ position: "absolute", left: "2.02%", right: "2.02%", top: 0, zIndex: 200, borderRadius: 16, overflow: "hidden", ...GLASS }}>
        <Notif />
      </div>

      {/* TOP LEFT: Monica window */}
      <div style={{ position: "absolute", left: 0, width: "24.94%", top: 108, height: 147, background: "#fff", boxShadow: "0 5px 15px rgba(0,0,0,0.25)", borderRadius: 15, overflow: "hidden", zIndex: 2 }}>
        <WinChrome />
        <div style={{ position: "relative", width: "100%", height: "calc(100% - 22px)" }}>
          <Image src="/images/monica.jpg" alt="" fill style={{ objectFit: "cover" }} />
        </div>
      </div>

      {/* TOP CENTER: Tom Ford */}
      <div style={{ position: "absolute", zIndex: 5, left: "35.01%", right: "39.8%", top: 59, height: 105, border: "1px solid rgba(118,118,128,0.15)", boxShadow: "0 4px 15px rgba(0,0,0,0.25)", borderRadius: 14, overflow: "hidden" }}>
        <Image src="/images/tomford2.jpg" alt="" fill style={{ objectFit: "cover" }} />
      </div>

      {/* TOP RIGHT: Diptyque */}
      <div style={{ position: "absolute", zIndex: 20, left: "62.72%", right: "11.06%", top: 120, height: 104 }}>
        <Image src="/images/fleur-de-peau-100ml-edt.png" alt="" fill style={{ objectFit: "contain" }} />
      </div>

      {/* MID RIGHT: Figs */}
      <div style={{ position: "absolute", zIndex: 5, left: "76.83%", right: "1.51%", top: 180, height: 116, borderRadius: 14, border: "1px solid rgba(245,245,245,0.67)", boxShadow: "0 4px 15px rgba(0,0,0,0.3)", overflow: "hidden" }}>
        <Image src="/images/fig.jpg" alt="" fill style={{ objectFit: "cover" }} />
      </div>

      {/* HEADLINE */}
      <div style={{ position: "absolute", left: 0, right: 0, top: "32.81%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", zIndex: 10 }}>
        <p style={{ fontFamily: "var(--font-inter),'Inter',sans-serif", fontWeight: 600, fontSize: 50, lineHeight: 1, letterSpacing: "-0.43px", color: "#000", marginBottom: 8 }}>POV:</p>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={serif(47)}>You've</span>
            <Toggle />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Image src="/images/folder_icon.png" alt="" width={38} height={38} style={{ objectFit: "contain" }} />
            <span style={serif(47)}>discovered</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={serif(47)}>your&nbsp;</span>
            <span style={hlItalic(47)}><em>Statement</em></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={hlItalic(47)}><em>Scent</em></span>
            <span style={serif(47)}>&nbsp;today</span>
            <span style={{ fontSize: 36, lineHeight: 1 }}>🪩</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link href="/quiz" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: "70.45%", display: "inline-flex", alignItems: "center", gap: 6, padding: "14px 32px", background: "#0088FF", borderRadius: 1000, textDecoration: "none", whiteSpace: "nowrap", zIndex: 10 }}>
        <span style={{ fontSize: 14, color: "#fff", lineHeight: 1 }}>▶</span>
        <span style={{ fontFamily: "-apple-system,'SF Pro',sans-serif", fontSize: 16, fontWeight: 500, letterSpacing: "-0.23px", color: "#fff" }}>Play Now</span>
      </Link>

      {/* BOTTOM LEFT: Martini */}
      <div style={{ position: "absolute", zIndex: 20, left: "6.3%", right: "69.27%", top: 664, height: 135, border: "1px solid #BFBFBF", boxShadow: "0 4px 15px 1px rgba(0,0,0,0.25)", borderRadius: 14, overflow: "hidden" }}>
        <Image src="/images/martini.jpg" alt="" fill style={{ objectFit: "cover", transform: "scaleX(-1)" }} />
      </div>

      {/* BOTTOM: Tom Ford bottle — above martini */}
      <div style={{ position: "absolute", zIndex: 25, left: "24.94%", right: "59.7%", top: 716, height: 104 }}>
        <Image src="/images/tomford.png" alt="" fill style={{ objectFit: "contain" }} />
      </div>

      {/* BOTTOM RIGHT: moodboard window */}
      <div style={{ position: "absolute", left: "49.62%", right: "8.82%", top: "81.18%", bottom: "4.34%", background: "#fff", boxShadow: "0 4px 15px rgba(0,0,0,0.25)", borderRadius: 15, overflow: "hidden", zIndex: 2 }}>
        <WinChrome colored />
        <div style={{ position: "relative", width: "100%", height: "calc(100% - 22px)" }}>
          <Image src="/images/c08d097df5efc08ef1454ff2cb151d36.jpg" alt="" fill style={{ objectFit: "cover" }} />
        </div>
      </div>

      {/* HANDLE */}
      <p style={{ position: "absolute", right: "0.5%", top: "94.93%", fontFamily: "var(--font-inter),'Inter',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: "-0.3px", color: "#808080", paddingRight: 8, zIndex: 10 }}>@haz.perfume</p>
    </div>
  );
}

// ─── DESKTOP LAYOUT (1512×982 canvas, scaled) ────────────────────────────────
// All % positions from Figma CSS export

function DesktopLayout() {
  return (
    <div id="homeCanvas" style={{ position: "relative", width: 1512, height: 982, transformOrigin: "top center" }}>

      {/* NOTIFICATION — left: 17.66%, right: 16.87%, top: ~74px centered */}
      <div style={{ position: "absolute", left: "17.66%", right: "16.87%", top: 37, zIndex: 200, borderRadius: 16, overflow: "hidden", ...GLASS }}>
        <Notif titleSize={16} descSize={15} />
      </div>

      {/* MONICA WINDOW — left: 8.26%, width ~200px, top 162px, height 268px */}
      <div style={{ position: "absolute", left: "8.26%", right: "78.51%", top: 162, height: 268, background: "#fff", boxShadow: "0 5px 15px rgba(0,0,0,0.25)", borderRadius: 15, overflow: "hidden", zIndex: 2 }}>
        <WinChrome />
        <div style={{ position: "relative", width: "100%", height: "calc(100% - 22px)" }}>
          <Image src="/images/monica.jpg" alt="" fill style={{ objectFit: "cover" }} />
        </div>
      </div>

      {/* TOM FORD bottle top — left: 38.62%, right: 50.2%, top: 75px, height: 140px */}
      <div style={{ position: "absolute", left: "38.62%", right: "50.2%", top: 75, height: 140, border: "1px solid rgba(118,118,128,0.15)", boxShadow: "0 4px 15px rgba(0,0,0,0.25)", borderRadius: 14, overflow: "hidden", zIndex: 5 }}>
        <Image src="/images/tomford2.jpg" alt="" fill style={{ objectFit: "cover" }} />
      </div>

      {/* DIPTYQUE — left: 73.41%, top: 195px, height: 170px, rotate -1deg */}
      <div style={{ position: "absolute", left: "73.41%", right: "15.31%", top: 195, height: 170, transform: "rotate(-1deg)", zIndex: 20 }}>
        <Image src="/images/fleur-de-peau-100ml-edt.png" alt="" fill style={{ objectFit: "contain" }} />
      </div>

      {/* FIGS — left: 80.36%, right: 10.12%, top: 254px, height: 193px */}
      <div style={{ position: "absolute", left: "80.36%", right: "10.12%", top: 254, height: 193, borderRadius: 14, border: "1px solid rgba(245,245,245,0.67)", boxShadow: "0 4px 15px rgba(0,0,0,0.3)", overflow: "hidden", zIndex: 5 }}>
        <Image src="/images/fig.jpg" alt="" fill style={{ objectFit: "cover" }} />
      </div>

      {/* HEADLINE — centered, from Figma: left 22.55%, right 28.9%, top 34.52% */}
      <div style={{ position: "absolute", left: 0, right: 0, top: "32.69%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", zIndex: 10 }}>
        {/* POV: — left 33.33%, right 39.28%, top 32.69% */}
        <p style={{ fontFamily: "var(--font-inter),'Inter',sans-serif", fontWeight: 600, fontSize: 70, lineHeight: 1, letterSpacing: "-0.43px", color: "#000", marginBottom: 12 }}>POV:</p>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          {/* You've [toggle] */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <span style={serif(72)}>You've</span>
            <Toggle width={62} height={40} knob={27} />
          </div>

          {/* [folder] discovered your [disco] */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <Image src="/images/folder_icon.png" alt="" width={67} height={67} style={{ objectFit: "contain" }} />
            <span style={serif(72)}>discovered your</span>
            <span style={{ fontSize: 60, lineHeight: 1 }}>🪩</span>
          </div>

          {/* [Statement Scent] today */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <span style={hlItalic(72)}><em>Statement Scent</em></span>
            <span style={serif(72)}>today</span>
          </div>
        </div>
      </div>

      {/* CTA — left: 41.4%, right: 47.42%, top: 72.51% */}
      <Link href="/quiz" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: "72.51%", display: "inline-flex", alignItems: "center", gap: 6, padding: "16px 40px", background: "#0088FF", borderRadius: 400, textDecoration: "none", whiteSpace: "nowrap", zIndex: 10 }}>
        <span style={{ fontSize: 15, color: "#fff", lineHeight: 1 }}>▶</span>
        <span style={{ fontFamily: "-apple-system,'SF Pro',sans-serif", fontSize: 18, fontWeight: 500, letterSpacing: "-0.23px", color: "#fff" }}>Play Now</span>
      </Link>

      {/* MARTINI — left: 19.18%, right: 71.69%, top: 712px, height: 171px, scaleX(-1) */}
      <div style={{ position: "absolute", left: "19.18%", right: "71.69%", top: 712, height: 171, border: "1px solid #BFBFBF", boxShadow: "0 4px 15px 1px rgba(0,0,0,0.25)", borderRadius: 14, overflow: "hidden", zIndex: 20 }}>
        <Image src="/images/martini.jpg" alt="" fill style={{ objectFit: "cover", transform: "scaleX(-1)" }} />
      </div>

      {/* TOM FORD bottle bottom — left: 15.21%, right: 78.57%, top: 760px, height: 160px — above martini */}
      <div style={{ position: "absolute", left: "15.21%", right: "78.57%", top: 760, height: 160, zIndex: 25 }}>
        <Image src="/images/tomford.png" alt="" fill style={{ objectFit: "contain" }} />
      </div>

      {/* MOODBOARD WINDOW — left: 65.67%, right: 14.44%, top: 71.54%, bottom: 10.08% */}
      <div style={{ position: "absolute", left: "65.67%", right: "14.44%", top: "71.54%", bottom: "10.08%", background: "#fff", boxShadow: "0 4px 15px rgba(0,0,0,0.25)", borderRadius: 15, overflow: "hidden", zIndex: 2, transform: "rotate(0.09deg)" }}>
        <WinChrome colored />
        <div style={{ position: "relative", width: "100%", height: "calc(100% - 22px)" }}>
          <Image src="/images/c08d097df5efc08ef1454ff2cb151d36.jpg" alt="" fill style={{ objectFit: "cover" }} />
        </div>
      </div>

      {/* HANDLE — left: 41.87%, right: 47.09%, top: 92.06% */}
      <p style={{ position: "absolute", left: "41.87%", right: "47.09%", top: "92.06%", fontFamily: "var(--font-inter),'Inter',sans-serif", fontWeight: 600, fontSize: 20, lineHeight: "50px", letterSpacing: "-0.3px", color: "#808080", textAlign: "center", zIndex: 10 }}>@haz.perfume</p>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function HomePage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    function update() {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const mobile = W < 768;
      setIsMobile(mobile);

      const el = document.getElementById("homeCanvas");
      if (!el) return;

      if (mobile) {
        // Scale 430px canvas to fit screen width
        const s = W / 430;
        el.style.transform = `scale(${s})`;
        el.style.transformOrigin = "top left";
        if (el.parentElement) el.parentElement.style.height = `${860 * s}px`;
      } else {
        // Scale 1512px canvas to fit screen
        const s = Math.min(H / 982, W / 1512);
        el.style.transform = `scale(${s})`;
        el.style.transformOrigin = "top center";
        if (el.parentElement) el.parentElement.style.minHeight = `${982 * s}px`;
      }
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [isMobile]);

  return (
    <div style={{ minHeight: "100dvh", display: "flex", justifyContent: "center", background: BG }}>
      <main style={{ position: "relative", width: "100%", background: BG }}>
        {isMobile === null
          ? null /* prevent flash before measurement */
          : isMobile
            ? <MobileLayout />
            : <DesktopLayout />
        }
      </main>
    </div>
  );
}

// ─── Style helpers ────────────────────────────────────────────────────────────

function serif(size: number): React.CSSProperties {
  return {
    fontFamily: "var(--font-playfair),'Playfair Display',Georgia,serif",
    fontWeight: 400,
    fontSize: size,
    lineHeight: `${size + 4}px`,
    letterSpacing: "-0.3px",
    color: "#000",
    whiteSpace: "nowrap",
  };
}

function hlItalic(size: number): React.CSSProperties {
  return {
    fontFamily: "var(--font-playfair),'Playfair Display',Georgia,serif",
    fontStyle: "italic",
    fontWeight: 400,
    fontSize: size,
    lineHeight: `${size + 4}px`,
    letterSpacing: "-0.3px",
    color: "#000",
    background: "#D2E4F8",
    borderRadius: 2,
    padding: "0 4px",
  };
}