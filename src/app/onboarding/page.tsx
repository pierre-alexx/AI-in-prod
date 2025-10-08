"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function OnboardingPage() {
  const supabase = getSupabaseBrowserClient();
  const upsertProfile = useUpsertProfile();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authState, setAuthState] = useState<"idle" | "loading" | "authed">("idle");
  const [mode, setMode] = useState<"scratch" | "improve" | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setAuthState("loading");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const { error: signUpErr } = await supabase.auth.signUp({ email, password });
      if (signUpErr) {
        setAuthState("idle");
        return;
      }
    }
    await upsertProfile(email);
    setAuthState("authed");
  }

  async function trainProfile() {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    if (url) form.append("url", url);
    const res = await fetch("/api/profile/train", { method: "POST", body: form });
    const data = await res.json();
    setResult(data);
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950 text-neutral-100">
      {/* Animated floating lights */}
      <motion.div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute left-1/4 top-1/3 h-48 w-48 rounded-full bg-white/5 blur-3xl"
          animate={{ x: [0, 100, -100, 0], y: [0, -50, 50, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl"
          animate={{ x: [0, -80, 80, 0], y: [0, 60, -60, 0], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
        {authState !== "authed" ? (
          <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="w-full max-w-xl text-center">
            <h1 className="mb-10 text-5xl font-light uppercase tracking-wide text-neutral-100 md:text-6xl" style={{ fontFamily: 'SentinelBlack, ui-sans-serif, system-ui' }}>
              Design projects with taste. <span style={{ fontStyle: 'italic' }}>Now</span>.
            </h1>

            <div className="relative mx-auto w-full overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 p-0 shadow-2xl">
              <div className="p-10">
                <form className="space-y-8" onSubmit={signIn}>
                  <div className="space-y-2 text-left">
                    <label htmlFor="email" className="text-neutral-200">Email</label>
                    <div className="group relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={22} />
                      <input id="email" name="email" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 w-full rounded-2xl border border-neutral-700 bg-neutral-950 pl-12 pr-3 text-[18px] text-neutral-100 placeholder:text-neutral-500 focus:shadow-lg focus:ring-2 focus:ring-neutral-400" />
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label htmlFor="password" className="text-neutral-200">Password</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={22} />
                      <input id="password" name="password" type={showPassword ? "text" : "password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 w-full rounded-2xl border border-neutral-700 bg-neutral-950 pl-12 pr-12 text-[18px] text-neutral-100 placeholder:text-neutral-500 focus:shadow-lg focus:ring-2 focus:ring-neutral-400" />
                      <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-neutral-500 opacity-80 transition hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-neutral-400" aria-label={showPassword ? "Hide password" : "Show password"}>
                        {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                      </button>
                    </div>
                  </div>

                  <button disabled={authState === "loading"} type="submit" className="group w-full rounded-2xl border border-neutral-700 bg-neutral-100 py-4 text-lg font-semibold text-neutral-900 hover:bg-neutral-200">
                    {authState === "loading" ? "Signing in…" : (
                      <span className="inline-flex items-center justify-center">Sign in<ArrowRight className="ml-2 transition-transform group-hover:translate-x-0.5" size={20} /></span>
                    )}
                  </button>
                </form>
              </div>
            </div>

            <p className="mx-auto mt-6 max-w-md text-center text-xs leading-5 text-neutral-500">
              Protected by reCAPTCHA and subject to our <a href="#" className="underline underline-offset-2">Terms of Service</a> & <a href="#" className="underline underline-offset-2">Privacy Policy</a>.
            </p>
          </motion.div>
        ) : (
          <div className="mt-8 space-y-8">
            <section>
              <div className="text-sm text-zinc-600">Would you like to create from scratch or improve an existing project?</div>
              <div className="mt-3 flex gap-3">
                <button onClick={() => setMode("scratch")} className={`rounded-md border px-4 py-2 ${mode === "scratch" ? "border-zinc-900" : ""}`}>From Scratch</button>
                <button onClick={() => setMode("improve")} className={`rounded-md border px-4 py-2 ${mode === "improve" ? "border-zinc-900" : ""}`}>Improve Existing</button>
              </div>
            </section>

            <section>
              <div className="text-sm text-zinc-600">Collect inspiration and inputs</div>
              <div className="mt-3 grid gap-3">
                <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                <input className="rounded-md border px-3 py-2" placeholder="URL to scrape (optional)" value={url} onChange={(e) => setUrl(e.target.value)} />
                <button onClick={trainProfile} className="rounded-md bg-zinc-900 px-4 py-2 text-white">Analyze</button>
              </div>
              {result && (
                <div className="mt-4 rounded-md border bg-white p-4 text-sm">
                  <div className="font-medium">Mock result</div>
                  <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(result, null, 2)}</pre>
                </div>
              )}
            </section>

            {mode === "scratch" && (
              <div className="rounded-md border bg-white p-4 text-sm text-zinc-600">Next: prompt to generate variants (MVP mock).</div>
            )}
            {mode === "improve" && (
              <div className="rounded-md border bg-white p-4 text-sm text-zinc-600">Next: analyze uploaded repo and propose patches (MVP mock).</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Upsert profile after auth
function useUpsertProfile() {
  const supabase = getSupabaseBrowserClient();
  return async (email?: string) => {
    const { data: user } = await supabase.auth.getUser();
    const uid = user.user?.id;
    if (!uid) return;
    await supabase.from("profiles").upsert({ id: uid, email: email || user.user?.email || null }, { onConflict: "id" });
  };
}
