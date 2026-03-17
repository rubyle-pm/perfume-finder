import { NextResponse } from "next/server";
import rawPerfumes from "@/perfume-data/example_perfumes.json";
import { buildUserProfile } from "@/lib/recommendation-engine/profile-builder";
import { runRecommendationPipeline } from "@/lib/recommendation-engine/pipeline";
import { normalizePerfume } from "@/lib/recommendation-engine/types";

export async function POST(request: Request) {
  try {
    const answers = await request.json();
    const profile = buildUserProfile(answers);
    const perfumes = rawPerfumes.map((item) => normalizePerfume(item));
    const result = runRecommendationPipeline(perfumes, profile);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown recommendation error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
