import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServiceClient } from "@/lib/supabaseService";

const schema = z.object({
  email: z.string().email(),
  referrer: z.string().optional(),
  meta: z.record(z.string(), z.any()).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parse = schema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase.from("waitlist").insert({
      email: parse.data.email,
      referrer: parse.data.referrer || null,
      meta: parse.data.meta || {},
    }).select("id, created_at").single();

    if (error) {
      const status = error.code === "23505" ? 409 : 500; // unique violation -> conflict
      return NextResponse.json({ ok: false, error: error.message }, { status });
    }

    return NextResponse.json({ ok: true, id: data.id, createdAt: data.created_at });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Unexpected error" }, { status: 500 });
  }
}
