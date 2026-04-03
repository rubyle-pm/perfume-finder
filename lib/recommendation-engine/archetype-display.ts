//config copy layer for Archetype 

import type { ArchetypeId } from "./vocabulary";

export interface ArchetypeDisplay {
  name: string;
  tagline: string;
}

export const ARCHETYPE_DISPLAY: Record<ArchetypeId, ArchetypeDisplay> = {
  effortless_muse: {
    name: "The Effortless Muse",
    tagline: "Understated. Nonchalant, yet Magnetic. Like you weren't even trying.",
  },
  clean_minimalist: {
    name: "The Minimalist",
    tagline: "Precise. Clean. Productive. Your presence is the statement.",
  },
  romantic_dreamer: {
    name: "The Romantic Dreamer",
    tagline: "Warm, intimate, and quietly unforgettable.",
  },
  modern_icon: {
    name: "The Modern Icon",
    tagline: "Bold. Self-assured. You walk in and the room notices.",
  },
  quiet_luxury: {
    name: "Quiet Luxury",
    tagline: "Refined without announcing itself. Old soul, sharp eye.",
  },
  dark_intellectual: {
    name: "The Dark Intellectual",
    tagline: "Complex. A little cryptic. Endlessly interesting.",
  },
  the_sensualist: {
    name: "The Sensualist",
    tagline: "Rich, confident, undeniably present.",
  },
  edge_walker: {
    name: "The Edge Walker",
    tagline: "Unexpected. Unsettling in the best way.",
  },
  free_spirit: {
    name: "The Free Spirit",
    tagline: "Warm chaos, full of energy. Boredom is not an option.",
  },
  sporty_glam: {
    name: "The Sporty Glam",
    tagline: "Easy energy, effortless cool, quietly striking.",
  },
  coquette: {
    name: "The Coquette",
    tagline: "Soft but never simple. Sweet with an edge.",
  },
};
