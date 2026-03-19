// Merge signal-derived descriptors into UserProfile in profile-builder.ts and use in scoring/ts with scent-type

import { DESCRIPTORS, SIGNALS } from "./vocabulary";
import type { Descriptor, Signal } from "./vocabulary";

const SENSUAL_CLUSTER: readonly Descriptor[] = [  
  "musky",
  "amber",
  "spicy",
  "smoky",
  "oud",
  "vanilla",
];
const SOFT_CLUSTER: readonly Descriptor[] = ["powdery", "floral"];
const FRESH_CLUSTER: readonly Descriptor[] = ["fresh", "citrus", "aquatic", "clean"];
const WOODY_CLUSTER: readonly Descriptor[] = ["woody", "sandalwood", "vetiver"];
const GOURMAND_CLUSTER: readonly Descriptor[] = ["gourmand", "vanilla", "sweet"];

const SIGNAL_DESCRIPTOR_MAP: Record<Signal, readonly Descriptor[]> = {    // signal → descriptor reverse lookup
  sensual: SENSUAL_CLUSTER,
  glamorous: SENSUAL_CLUSTER,
  mysterious: SENSUAL_CLUSTER,
  enigmatic: SENSUAL_CLUSTER,
  menacing: SENSUAL_CLUSTER,

  romantic: SOFT_CLUSTER,
  soft: SOFT_CLUSTER,
  nostalgic: SOFT_CLUSTER,
  playful: SOFT_CLUSTER,

  effortless: FRESH_CLUSTER,
  minimal: FRESH_CLUSTER,
  cool: FRESH_CLUSTER,
  easy_going: FRESH_CLUSTER,
  modern: FRESH_CLUSTER,

  grounded: WOODY_CLUSTER,
  sophisticated: WOODY_CLUSTER,
  elegant: WOODY_CLUSTER,
  intellectual: WOODY_CLUSTER,
  introspective: WOODY_CLUSTER,

  warm: [...SOFT_CLUSTER, ...GOURMAND_CLUSTER],
  cozy: [...SOFT_CLUSTER, ...GOURMAND_CLUSTER],

  bold: [],
  confident: [],
  edgy: [],
  free_spirited: [],
  vintage: [],
};

const SIGNAL_SET = new Set<Signal>(SIGNALS);
const DESCRIPTOR_SET = new Set<Descriptor>(DESCRIPTORS);

export function signalsToDescriptors(signals: Signal[]): Descriptor[] {   //look up signal, dedup, 
  const frequency = new Map<Descriptor, number>();

  for (const signal of signals) {
    if (!SIGNAL_SET.has(signal)) continue;
    const mapped = SIGNAL_DESCRIPTOR_MAP[signal] ?? [];
    for (const descriptor of mapped) {
      if (!DESCRIPTOR_SET.has(descriptor)) continue;
      frequency.set(descriptor, (frequency.get(descriptor) ?? 0) + 1);
    }
  }

  return Array.from(frequency.entries())    //prioritize descriptors by frequency desc
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return DESCRIPTORS.indexOf(a[0]) - DESCRIPTORS.indexOf(b[0]);
    })
    .slice(0, 6)    //cap to 6
    .map(([descriptor]) => descriptor);
}
