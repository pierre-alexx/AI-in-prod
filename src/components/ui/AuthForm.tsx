"use client";

import { useState } from "react";
import { z } from "zod";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { GradientButton } from "@/components/ui/gradient-button";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

type Mode = "login" | "signup";

export function AuthForm({ defaultMode = "signup" as Mode }: { defaultMode?: Mode }) {
  const supabase = getSupabaseBrowserClient();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Invalid";
      setError(first);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        window.location.href = "/confirm-email";
        return;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err?.message ?? "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto w-full">
      <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
        <button
          className={`px-4 py-2 rounded-lg text-sm transition ${mode === "login" ? "bg-white text-black" : "text-white/80 hover:text-white"}`}
          onClick={() => setMode("login")}
          type="button"
        >
          Log in
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm transition ${mode === "signup" ? "bg-white text-black" : "text-white/80 hover:text-white"}`}
          onClick={() => setMode("signup")}
          type="button"
        >
          Sign up
        </button>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm text-white/80">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 placeholder:text-white/40"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-white/80">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 placeholder:text-white/40"
            placeholder="••••••••"
            required
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <GradientButton
          type="submit"
          disabled={loading}
          isLoading={loading}
          className="w-full justify-center mt-2"
        >
          {mode === "signup" ? "Create account" : "Log in"}
        </GradientButton>
      </form>
    </div>
  );
}


