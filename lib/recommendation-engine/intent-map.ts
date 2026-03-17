// Descriptor-intent semantic mapping, can be config 
import type { Descriptor } from "./vocabulary";  

export const INTENT_CLUSTERS = {
  gourmand: ["gourmand", "vanilla", "sweet"],
  sensual: ["musky", "amber", "spicy", "smoky", "oud", "vanilla"],
  fresh: ["fresh", "citrus", "aquatic", 'clean'],
  soft: ["powdery", "floral"],
  woody: ["woody", "sandalwood", "vetiver"],
} as const satisfies Record<string, readonly Descriptor[]>;
