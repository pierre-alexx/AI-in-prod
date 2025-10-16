import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { message, variantId } = body ?? {};
  return NextResponse.json({ ok: true, change: { variantId, action: "update_text", value: message } });
}
