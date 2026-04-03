// mapping bottle image to detail page
export const NOTE_IMAGES = [
  "amber", "aquatic", "citrus", "clean", "floral", "fresh",
  "gourmand", "green", "iris", "jasmine", "leather", "musk",
  "oud", "powdery", "resin", "rose", "sandalwood", "smoke",
  "sweet", "tobacco", "vanilla", "vertiver", "woody",
  "matcha", "patchouli", "fig", "tuberose"
];

const NORMALIZATION_MAP: Record<string, string> = {
  "vetiver": "vertiver", // Mapping to match file name typo
  "ambroxan": "amber",
  "gardenia": "floral",
  "frangipani": "floral",
  "sea salt": "aquatic",
  "driftwood": "woody",
  "sage": "green",
  "praline": "sweet",
  "moss": "green",
  "cedarwood": "woody",
};

/**
 * Basic normalization: lowercase, remove non-alphabetic chars (or keep spaces)
 * and try to find a matching note image.
 */
function normalizeNote(rawNote: string): string | null {
  const lower = rawNote.toLowerCase();

  for (const imgNote of NOTE_IMAGES) {
    if (lower.includes(imgNote)) {
      return imgNote;
    }
  }

  // Check aliases/typos
  for (const [alias, imgNote] of Object.entries(NORMALIZATION_MAP)) {
    if (lower.includes(alias)) {
      return imgNote;
    }
  }

  return null;
}

/**
 * Prioritizes heart notes, then top notes, then base notes.
 * Fallback to default botanical (floral.jpg) if no matches found.
 */
export function getNoteImageMapping(
  topNotes: string[] = [],
  heartNotes: string[] = [],
  baseNotes: string[] = []
): string {
  // 1. Try Heart Notes First
  for (const note of heartNotes) {
    const match = normalizeNote(note);
    if (match) return `/perfume-notes/${match}.jpg`;
  }

  // 2. Try Top Notes 
  for (const note of topNotes) {
    const match = normalizeNote(note);
    if (match) return `/perfume-notes/${match}.jpg`;
  }

  // 3. Try Base Notes
  for (const note of baseNotes) {
    const match = normalizeNote(note);
    if (match) return `/perfume-notes/${match}.jpg`;
  }

  // 4. Default wrapper
  return "/perfume-notes/floral.jpg";
}
