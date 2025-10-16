import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const target = form.get("target");

  return NextResponse.json({
    ok: true,
    tokens: { colors: { primary: "#0ea5e9" }, spacing: [4, 8, 16] },
    wcag: { contrastIssues: 2 },
    critique: ["Increase contrast on buttons", "Unify heading sizes"],
    enhancementPacks: ["Minimal", "Playful", "High-Contrast"],
    target,
  });
}
