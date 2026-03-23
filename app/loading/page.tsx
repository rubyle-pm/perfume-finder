"use client";  

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const MESSAGES = [
  "Reading your signals...",
  "Mapping your scent identity...",
  "Finding your archetype...",
  "Selecting your matches...",
];

export default function LoadingPage() {
  const router = useRouter();
  const [msgIndex, setMsgIndex] = useState(0);
  const [dots, setDots] = useState(0);

  // Cycle through messages every 1.8s
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Navigate to archetype once result is in sessionStorage
  useEffect(() => {
    const check = setInterval(() => {
      if (sessionStorage.getItem("reco_result")) {
        clearInterval(check);
        router.push("/archetype");
      }
    }, 200);
    return () => clearInterval(check);
  }, [router]);

  const dotStr = ".".repeat(dots);

  return (
    <main style={s.page}>
      {/* Animated orb */}
      <div style={s.orbWrap}>
        <div style={s.orb} />
        <div style={s.orbRing} />
      </div>

      {/* Message */}
      <div style={s.textBlock}>
        <p style={s.message}>
          {MESSAGES[msgIndex]}{dotStr}
        </p>
        <p style={s.subtext}>This takes a few seconds</p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes ring {
          0% { transform: scale(0.85); opacity: 0.4; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
    background: "#0f172a",
    color: "#fff",
    fontFamily: "'SF Pro Text', -apple-system, 'Helvetica Neue', sans-serif",
  },
  orbWrap: {
    position: "relative",
    width: 80,
    height: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  orb: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.12)",
    border: "0.5px solid rgba(255,255,255,0.2)",
    animation: "pulse 2s ease-in-out infinite",
  },
  orbRing: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "0.5px solid rgba(255,255,255,0.3)",
    animation: "ring 2s ease-out infinite",
  },
  textBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  message: {
    fontSize: 16,
    fontWeight: 500,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: "0.01em",
    minWidth: 260,
    textAlign: "center",
    transition: "opacity 0.3s ease",
  },
  subtext: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: "0.04em",
  },
};
