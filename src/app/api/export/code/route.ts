import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { variant } = body ?? {};
  return NextResponse.json({ ok: true, url: "https://example.com/mock.zip", variant });
}
