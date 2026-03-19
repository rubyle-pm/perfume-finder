import { ARCHETYPE_DISPLAY } from "./archetype-display";
import type { EngineResult } from "./result-select";
import type { Perfume, UserProfile } from "./types";

export interface NarrativeResult {
  archetype_description: string;
  best_fit_reason: string;
  ideal_match_reason: string;
  wildcard_reason: string;
  is_template_fallback: boolean;
}

const TEMPLATE_NARRATIVE = {
  archetype_description: (archetypeName: string, signals: string[]) =>
    `A ${signals.slice(0, 2).join(" and ")} presence - ${archetypeName} is the quiet confidence that doesn't need to explain itself. Your scent should feel like an extension of that.`,

  best_fit_reason: (perfume: Perfume) => {
    const notes = [...perfume.top_notes].slice(0, 2).join(" and ");
    const descriptor = perfume.descriptors[0] ?? "refined";
    const useCase = perfume.use_cases[0]?.replace("_", " ") ?? "everyday wear";
    return `${perfume.name} opens with ${notes} - ${descriptor} and made for ${useCase}. It fits without effort.`;
  },

  ideal_match_reason: (perfume: Perfume) => {
    const heart = [...perfume.heart_notes].slice(0, 2).join(" and ");
    const descriptor = perfume.descriptors[1] ?? perfume.descriptors[0] ?? "distinct";
    return `Built around ${heart}, ${perfume.name} is ${descriptor} in a way that stays with a room. The scent you'd wear when it matters.`;
  },

  wildcard_reason: (perfume: Perfume) => {
    const heart = [...perfume.heart_notes].slice(0, 1).join("");
    const base = [...perfume.base_notes].slice(0, 1).join("");
    return `${perfume.name} moves through ${heart} into ${base} - further from your usual, but that's the point. Sometimes the unexpected one is the one that stays.`;
  },
};

function buildTemplateNarrative(result: EngineResult, profile: UserProfile): NarrativeResult {
  const archetypeName = result.topPickArchetype
    ? ARCHETYPE_DISPLAY[result.topPickArchetype].name
    : "Your scent profile";

  return {
    archetype_description: TEMPLATE_NARRATIVE.archetype_description(archetypeName, profile.signals),
    best_fit_reason: TEMPLATE_NARRATIVE.best_fit_reason(result.slots.bestFit.perfume),
    ideal_match_reason: TEMPLATE_NARRATIVE.ideal_match_reason(result.slots.idealMatch.perfume),
    wildcard_reason: TEMPLATE_NARRATIVE.wildcard_reason(result.slots.wildcard.perfume),
    is_template_fallback: true,
  };
}

function buildNarrativePrompt(result: EngineResult, profile: UserProfile): string {
  const archetypeName = result.topPickArchetype
    ? ARCHETYPE_DISPLAY[result.topPickArchetype].name
    : "Unknown Archetype";
  const bestFit = result.slots.bestFit.perfume;
  const idealMatch = result.slots.idealMatch.perfume;
  const wildcard = result.slots.wildcard.perfume;

  return `You are a perfume editor writing for a boutique's discovery tool.
Tone: intelligent, warm, a little poetic - never generic.
Never use the words "journey", "unique", or "curated". Write in English.

Strict length limits - do not exceed these under any circumstance:
- archetype_description: 3 sentences max, 60 words max
- best_fit_reason: 2 sentences max, 40 words max
- ideal_match_reason: 2 sentences max, 40 words max
- wildcard_reason: 2 sentences max, 40 words max

User archetype: ${archetypeName}
User signals: ${profile.signals.join(", ")}
Their scent descriptors: ${profile.derived_descriptors.join(", ")}

The 3 recommended perfumes are:

BEST FIT - ${bestFit.name} by ${bestFit.brand}
Descriptors: ${bestFit.descriptors.join(", ")}
Top notes: ${bestFit.top_notes.join(", ")}
Use cases: ${bestFit.use_cases.join(", ")}

IDEAL MATCH - ${idealMatch.name} by ${idealMatch.brand}
Descriptors: ${idealMatch.descriptors.join(", ")}
Top notes: ${idealMatch.top_notes.join(", ")}
Style tags: ${idealMatch.style_tags.join(", ")}

WILDCARD - ${wildcard.name} by ${wildcard.brand}
Descriptors: ${wildcard.descriptors.join(", ")}
Heart notes: ${wildcard.heart_notes.join(", ")}
Base notes: ${wildcard.base_notes.join(", ")}

Respond ONLY in this exact JSON format, no markdown, no preamble:
{
  "archetype_description": "3 sentences max, 60 words max. About this person's scent personality based on their signal combination. Personal and specific - not generic archetype copy.",
  "best_fit_reason": "2 sentences max, 40 words max. Why this perfume fits their everyday self.",
  "ideal_match_reason": "2 sentences max, 40 words max. Why this is their statement scent.",
  "wildcard_reason": "2 sentences max, 40 words max. Frame the surprise - why this unexpected choice might be the one that stays."
}`;
}

interface AnthropicTextBlock {
  type: string;
  text?: string;
}

interface AnthropicResponse {
  content?: AnthropicTextBlock[];
}

interface NarrativePayload {
  archetype_description?: unknown;
  best_fit_reason?: unknown;
  ideal_match_reason?: unknown;
  wildcard_reason?: unknown;
}

function parseNarrativePayload(raw: string): NarrativePayload | null {
  try {
    return JSON.parse(raw) as NarrativePayload;
  } catch {
    return null;
  }
}

function normalizeNarrativePayload(payload: NarrativePayload): Omit<NarrativeResult, "is_template_fallback"> | null {
  if (
    typeof payload.archetype_description !== "string" ||
    typeof payload.best_fit_reason !== "string" ||
    typeof payload.ideal_match_reason !== "string" ||
    typeof payload.wildcard_reason !== "string"
  ) {
    return null;
  }

  return {
    archetype_description: payload.archetype_description.trim(),
    best_fit_reason: payload.best_fit_reason.trim(),
    ideal_match_reason: payload.ideal_match_reason.trim(),
    wildcard_reason: payload.wildcard_reason.trim(),
  };
}

export async function generateNarrative(
  result: EngineResult,
  profile: UserProfile,
): Promise<NarrativeResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: buildNarrativePrompt(result, profile) }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return buildTemplateNarrative(result, profile);
    }

    const data = (await response.json()) as AnthropicResponse;
    const text = data.content?.find((block) => block.type === "text")?.text?.trim();
    if (!text) {
      return buildTemplateNarrative(result, profile);
    }

    const parsed = parseNarrativePayload(text);
    if (!parsed) {
      return buildTemplateNarrative(result, profile);
    }

    const normalized = normalizeNarrativePayload(parsed);
    if (!normalized) {
      return buildTemplateNarrative(result, profile);
    }

    return {
      ...normalized,
      is_template_fallback: false,
    };
  } catch {
    return buildTemplateNarrative(result, profile);
  } finally {
    clearTimeout(timeout);
  }
}
