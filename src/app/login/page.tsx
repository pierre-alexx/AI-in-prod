"use client";

import { AuthForm } from "@/components/ui/AuthForm";

export default function LoginPage() {
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
              Welcome back
            </span>
            <h1 className="mt-4 text-6xl sm:text-7xl font-semibold leading-tight font-['SentinelBlack','SentinelBook',serif]">
              Sign in
            </h1>
            <p className="mt-4 text-white/70 text-base sm:text-lg">
              Access your Renoir workspace and continue creating amazing visuals.
            </p>
          </div>
        </section>

        {/* Right auth card */}
        <section className="relative flex items-center justify-center p-6 sm:p-10 bg-black/40 backdrop-blur-sm border-t md:border-t-0 md:border-l border-white/10">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-white/10 bg-black/50 p-6 sm:p-8 shadow-[0_0_40px_-15px_rgba(255,255,255,0.3)]">
              <h2 className="text-2xl font-semibold font-['SentinelBlack','SentinelBook',serif]">Sign in</h2>
              <p className="mt-1 text-sm text-white/70">Welcome back to your workspace.</p>
              <div className="mt-6">
                <AuthForm defaultMode="login" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
