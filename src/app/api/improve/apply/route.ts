import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { pack } = body ?? {};
  return NextResponse.json({ ok: true, patchName: "update-style.patch", diffSummary: "+12 -4", pack });
}
