//config copy layer for Archetype 

import type { ArchetypeId } from "./vocabulary";

export interface ArchetypeDisplay {
  name: string;
  tagline: string;
}

export const ARCHETYPE_DISPLAY: Record<ArchetypeId, ArchetypeDisplay> = {
  bare_glow: {
    name: "Bare Glow",
    tagline: "Warm, natural, easy-going. Comfort as an aesthetic.",
  },
  effortless_muse: {
    name: "The Effortless Muse",
    tagline: "Understated. Nonchalant, yet Magnetic. Like you weren't even trying.",
  },
  corporate_pragmatist: {
    name: "The Corporate Pragmatist",
    tagline: "Smart, structured, and quietly polished. Function meets taste.",
  },
  understated_classic: {
    name: "Understated Classic",
    tagline: "No noise. Just presence. The kind that doesn’t need announcing.",
  },
  playful_sweetheart: {
    name: "Playful Sweetheart",
    tagline: "Soft, flirty, and a little mischievous. Sweet — but never simple.",
  },
  playful_charmer: {
    name: "The Playful Charmer",
    tagline: "Unpolished, sun-warmed. The old-school masculinity that is dangerously easy to like.",
  },
  soft_romantic: {
    name: "Soft Romantic",
    tagline: "Gentle, warm, and quietly lingering — like a sweet memory you revisit.",
  },
  old_soul: {
    name: "Old Soul",
    tagline: "Nostalgic, introspective, and a little removed from the present.",
  },
  off_duty_trendsetter: {
    name: "Off-Duty Trendsetter",
    tagline: "Easy energy, pleasantly cool, a little messy with intention.",
  },
  free_spirit: {
    name: "The Free Spirit",
    tagline: "Warm chaos, full of energy. Boredom is not an option.",
  },
  modern_icon: {
    name: "The Modern Icon",
    tagline: "Bold. Self-assured. You walk in and the room notices.",
  },
  dark_intellectual: {
    name: "The Dark Intellectual",
    tagline: "Complex. A little cryptic. Endlessly interesting.",
  },
  the_sensualist: {
    name: "The Sensualist",
    tagline: "Rich, seductive, and irresistible.",
  },
  edge_walker: {
    name: "The Edge Walker",
    tagline: "Unexpected. Unsettling in the best way.",
  },
};
