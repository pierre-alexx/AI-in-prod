import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { prompt, styleProfileId } = body ?? {};

  const variants = Array.from({ length: 3 }).map((_, i) => ({
    id: `v_${i + 1}`,
    previewUrl: `https://picsum.photos/seed/${i + 1}/640/400`,
    layout: { sections: [{ type: "hero", heading: `${prompt || "Untitled"} #${i + 1}` }] },
    figmaSpec: { nodes: [] },
  }));

  return NextResponse.json({ ok: true, variants, styleProfileId });
}
