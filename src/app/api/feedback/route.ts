import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { variantId, vote, comment } = body ?? {};
  return NextResponse.json({ ok: true, variantId, vote, comment });
}
