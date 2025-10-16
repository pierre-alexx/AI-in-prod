import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const files = form.getAll("files");
  const userId = form.get("userId") as string | null;

  return NextResponse.json({ ok: true, profileId: "mock_profile_123", embeddedRefs: files.length, userId });
}
