import type { Descriptor } from "./vocabulary";
import { INTENT_CLUSTERS } from "./intent-map";

function normalizeDescriptor(descriptor: Descriptor): Descriptor[] {
  if (descriptor === "powdery") return ["powdery", "floral"];
  return [descriptor];
}

function expandDescriptors(descriptors: Descriptor[]): Descriptor[] {
  const expanded = new Set<Descriptor>();
  for (const descriptor of descriptors) {
    for (const normalized of normalizeDescriptor(descriptor)) {
      expanded.add(normalized);
    }
  }
  return Array.from(expanded);
}

export function computeIntentScore(
  userDescriptors: Descriptor[],
  perfumeDescriptors: Descriptor[],
): number {
  const userExpanded = expandDescriptors(userDescriptors);
  const perfumeExpanded = expandDescriptors(perfumeDescriptors);

  let matchedClusters = 0;
  const totalClusters = Object.keys(INTENT_CLUSTERS).length;

  for (const cluster of Object.values(INTENT_CLUSTERS)) {
    const userMatch = cluster.some((d) => userExpanded.includes(d));
    const perfumeMatch = cluster.some((d) => perfumeExpanded.includes(d));

    if (userMatch && perfumeMatch) {
      matchedClusters += 1;
    }
  }

  return matchedClusters / totalClusters;
}
