//config copy layer for Archetype 

import type { ArchetypeId } from "./vocabulary";

export interface ArchetypeDisplay {
  name: string;
  tagline: string;
  image?: string;
}

export const ARCHETYPE_DISPLAY: Record<ArchetypeId, ArchetypeDisplay> = {
  bare_glow: {
    name: "The Bare Glow",
    tagline: "Warm, natural, easy-going. Comfort is your aesthetic.",
    image: "/archetype-image/bare-glow.jpg",
  },
  effortless_muse: {
    name: "The Effortless Chic",
    tagline: "Understated. Nonchalant, yet Magnetic. Like you weren't even trying.",
    image: "/archetype-image/effortless-chic.jpg",
  },
  corporate_pragmatist: {
    name: "The Corporate Pragmatist",
    tagline: "Smart, structured, and quietly polished. Function meets taste.",
    image: "/archetype-image/corporate.jpg",
  },
  understated_classic: {
    name: "The Understated Classic",
    tagline: "No noise. Quiet-luxury presence. The kind that doesn’t need announcing.",
    image: "/archetype-image/classic.jpg",
  },
  playful_sweetheart: {
    name: "The Playful Sweetheart",
    tagline: "Soft feminine, sweet, and a little mischievous. Raw — but never plain.",
    image: "/archetype-image/sweetheart.jpg",
  },
  playful_charmer: {
    name: "The Playful Charmer",
    tagline: "Unpolished, sun-warmed, a bit rusty. The old-school vibe that is dangerously fun to flirt with.",
    image: "/archetype-image/charmer.jpg",
  },
  soft_romantic: {
    name: "Soft Romantic",
    tagline: "Gentle, cozy, quietly lingering — like a sweet summer-break memory you revisit.",
    image: "/archetype-image/soft-romantic.jpg",
  },
  old_soul: {
    name: "Old Soul",
    tagline: "Nostalgic, introspective, cultural, and a little removed from the present.",
    image: "/archetype-image/old-soul.jpg",
  },
  off_duty_trendsetter: {
    name: "Off-Duty Trendsetter",
    tagline: "Intentionally cool, casually confident, and always ahead of the curve.",
    image: "/archetype-image/trendsetter.jpg",
  },
  modern_icon: {
    name: "The Modern Icon",
    tagline: "Bold. Self-assured. Charismatic. You walk in and the room notices.",
    image: "/archetype-image/modern-icon.jpg",
  },
  dark_intellectual: {
    name: "The Whimsical Intellectual",
    tagline: "Complex. Unreadable. A little cryptic. An endlessly interesting nerd.",
    image: "/archetype-image/academia.jpg",
  },
  the_sensualist: {
    name: "The Sensualist",
    tagline: "Warm skin, low light, slow tension. Seductive and irresistible.",
    image: "/archetype-image/sensualist.jpg",
  },
  edge_walker: {
    name: "The Challenger",
    tagline: "Unexpected. Break conventions for sport. You’re not for everyone — and that’s the point.",
    image: "/archetype-image/edge-walker.jpg",
  },
};
