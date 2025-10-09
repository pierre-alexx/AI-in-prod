"use client";

import { AuthForm } from "@/components/ui/AuthForm";

export default function SignupPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 h-full">
        {/* Left hero */}
        <section className="relative overflow-hidden p-8 sm:p-12 flex flex-col justify-end md:justify-between gap-10 md:gap-0">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-black" />
            <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%)]" />
          </div>

          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 text-xs tracking-wide uppercase text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
              Welcome
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-semibold leading-tight font-['SentinelBlack','SentinelBook',serif]">
              Create your account
            </h1>
            <p className="mt-4 text-white/70 text-base sm:text-lg">
              Join Renoir and turn ideas into stunning visuals. Built for speed, privacy, and flow.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xl mt-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
              <p className="text-sm text-white/80">Secure by design</p>
              <p className="text-xs text-white/60 mt-1">Powered by Supabase Auth</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
              <p className="text-sm text-white/80">Built for creators</p>
              <p className="text-xs text-white/60 mt-1">Clean, fast, and delightful</p>
            </div>
          </div>
        </section>

        {/* Right auth card */}
        <section className="relative flex items-center justify-center p-6 sm:p-10 bg-black/40 backdrop-blur-sm border-t md:border-t-0 md:border-l border-white/10">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-white/10 bg-black/50 p-6 sm:p-8 shadow-[0_0_40px_-15px_rgba(255,255,255,0.3)]">
              <h2 className="text-2xl font-semibold font-['SentinelBlack','SentinelBook',serif]">Sign up</h2>
              <p className="mt-1 text-sm text-white/70">Create your account to access your workspace.</p>
              <div className="mt-6">
                <AuthForm defaultMode="signup" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}


