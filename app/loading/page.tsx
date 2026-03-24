"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const MESSAGES = [
  "Reading your scent signals…",
  "Matching your archetype…",
  "Curating your recommendations…",
  "Almost there…",
];

export default function LoadingPage() {
  const router = useRouter();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    async function run() {
      try {
        const raw = sessionStorage.getItem("quiz_answers");
        const answers = raw ? JSON.parse(raw) : {};

        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(answers),
        });

        if (!res.ok) throw new Error("API error");

        const result = await res.json();
        sessionStorage.setItem("reco_result", JSON.stringify(result));
        router.replace("/archetype");
      } catch (err) {
        console.error("Recommendation failed:", err);
        // Still navigate — archetype page shows graceful empty state
        router.replace("/archetype");
      }
    }

    run();
  }, [router]);

  return (
    <main style={s.page}>
      <div style={s.inner}>
        {/* Animated logo mark */}
        <div style={s.logoMark}>
          <div style={s.ring1} />
          <div style={s.ring2} />
          <div style={s.dot} />
        </div>

        <p style={s.eyebrow}>Scent Statement Finder</p>
        <h1 style={s.headline}>Finding your<br /><em style={s.accent}>signature scent</em></h1>

        <div style={s.messageTrack}>
          {MESSAGES.map((msg, i) => (
            <p key={i} style={{ ...s.message, animationDelay: `${i * 1.4}s` }}>
              {msg}
            </p>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.18); opacity: 0.15; }
        }
        @keyframes pulse-ring2 {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50% { transform: scale(1.35); opacity: 0.08; }
        }
        @keyframes dot-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.85); }
        }
        @keyframes msg-fade {
          0% { opacity: 0; transform: translateY(6px); }
          10%, 85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }
        .loading-msg {
          animation: msg-fade 1.4s ease forwards;
        }
      `}</style>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
    color: "#f8fafc",
    fontFamily: "var(--font-inter), 'SF Pro Text', -apple-system, sans-serif",
  },
  inner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 0,
    padding: "0 24px",
    textAlign: "center",
  },
  logoMark: {
    position: "relative",
    width: 64,
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  ring1: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "1px solid rgba(248,250,252,0.3)",
    animation: "pulse-ring 2.4s ease-in-out infinite",
  },
  ring2: {
    position: "absolute",
    inset: -12,
    borderRadius: "50%",
    border: "1px solid rgba(248,250,252,0.12)",
    animation: "pulse-ring2 2.4s ease-in-out infinite",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: "#f8fafc",
    animation: "dot-breathe 2.4s ease-in-out infinite",
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "rgba(248,250,252,0.4)",
    fontWeight: 600,
    marginBottom: 14,
  },
  headline: {
    fontSize: "clamp(28px, 8vw, 40px)",
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
    color: "#f8fafc",
    marginBottom: 36,
    fontFamily: "var(--font-playfair), Georgia, serif",
  },
  accent: {
    fontStyle: "italic",
    fontWeight: 400,
  },
  messageTrack: {
    height: 24,
    position: "relative",
    overflow: "hidden",
    width: "100%",
  },
  message: {
    position: "absolute",
    width: "100%",
    fontSize: 13,
    color: "rgba(248,250,252,0.5)",
    letterSpacing: "0.01em",
    animation: "msg-fade 1.4s ease forwards",
    opacity: 0,
  },
};

