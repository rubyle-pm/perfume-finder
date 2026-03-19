import { NextResponse } from "next/server";
import rawPerfumes from "@/perfume-data/example_perfumes.json";
import { generateNarrative, type NarrativeResult } from "@/lib/recommendation-engine/narrative";
import { buildUserProfile } from "@/lib/recommendation-engine/profile-builder";
import { runRecommendationPipeline } from "@/lib/recommendation-engine/pipeline";
import { normalizePerfume } from "@/lib/recommendation-engine/types";

export async function POST(request: Request) {
  try {
    const answers = await request.json();
    const profile = buildUserProfile(answers);
    const perfumes = rawPerfumes.map((item) => normalizePerfume(item));
    const result = runRecommendationPipeline(perfumes, profile);

    const safeNarrative: NarrativeResult = {
      archetype_description: "Your scent profile is taking shape.",
      best_fit_reason: "A close match to your scent preferences.",
      ideal_match_reason: "A statement scent aligned with your style.",
      wildcard_reason: "An exploratory pick - worth trying.",
      is_template_fallback: true,
    };

    try {
      const narrative = await generateNarrative(result, profile);
      return NextResponse.json({ ...result, narrative }, { status: 200 });
    } catch {
      return NextResponse.json({ ...result, narrative: safeNarrative }, { status: 200 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown recommendation error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
