"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import HeroScene from "@/components/scene/HeroScene";
import SlideInOnScroll from "@/components/SlideInOnScroll";
import Workflow from "@/components/Workflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [mounted, setMounted] = useState(false);

  const rotate = useTransform(scrollYProgress, [0, 1], [0, 10]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.7]);
  // Parallax offsets for aurora layers
  const l1y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const l2y = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const l3y = useTransform(scrollYProgress, [0, 1], [0, -20]);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "exists">("idle");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto typewriter sentences (not linked to scroll). Keep static prefix "Jony " always visible
  const staticPrefix = "Jony ";
  const phrases = [
    "turns your idea into beautiful, production-ready UI. Type what you want, drop a style reference, and ship.",
    "designs tasteful landing pages from a single prompt and a style reference.",
    "improves your existing React + Tailwind code with WCAG-safe tokens.",
    "exports clean components, design tokens, and a Figma-ready spec.",
    "iterates in chat until it matches your taste."
  ];
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [typedDynamic, setTypedDynamic] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const holdRef = useRef<number | null>(null);

  useEffect(() => {
    const current = phrases[sentenceIndex % phrases.length];
    const typeDelay = isDeleting ? 14 : 20; // faster typing/deleting

    if (!isDeleting && typedDynamic === current) {
      // Hold before deleting (increased by +2s for readability)
      holdRef.current = window.setTimeout(() => setIsDeleting(true), 5000);
      return () => {
        if (holdRef.current) window.clearTimeout(holdRef.current);
      };
    }

    if (isDeleting && typedDynamic.length === 0) {
      // Move to next sentence
      setIsDeleting(false);
      setSentenceIndex((i) => (i + 1) % phrases.length);
      return;
    }

    const id = window.setTimeout(() => {
      if (isDeleting) {
        setTypedDynamic((t) => t.slice(0, -1));
      } else {
        setTypedDynamic(current.slice(0, typedDynamic.length + 1));
      }
    }, typeDelay);

    return () => window.clearTimeout(id);
  }, [typedDynamic, isDeleting, sentenceIndex]);

  async function joinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 409) {
        setStatus("exists");
        return;
      }
      if (!res.ok) throw new Error("failed");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div ref={ref} className="min-h-screen bg-black text-zinc-50">
      <header className="sticky top-0 z-50 isolate border-b border-white/10 bg-black" style={{ backgroundColor: "#000" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2">
            <Image src="/jony-logo.png" alt="Jony logo" width={24} height={24} />
            <span className="font-semibold">Jony</span>
          </div>
          <nav className="hidden gap-6 text-sm md:flex">
            <a href="#features" className="text-zinc-300 hover:text-white">Why Jony</a>
            <a href="#demo" className="text-zinc-300 hover:text-white">Demo</a>
            <a href="#waitlist" className="text-zinc-300 hover:text-white">Waitlist</a>
          </nav>
          <a href="/onboarding" className="rounded-md bg-white px-3 py-1.5 text-xs sm:text-sm font-bold text-zinc-900">Try it now</a>
        </div>
      </header>

      <section className="relative overflow-hidden" style={{ backgroundColor: "#000" }}>
        {/* Noise overlay for texture */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay z-5"
          style={{
            backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
            backgroundSize: "140px 140px"
          }}
        />
        
        {/* 3D Canvas background (above gradient, below content) */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {/* Fallback black until mounted to avoid flash */}
          {!mounted && <div className="w-full h-full bg-black" />}
          {mounted && (
            <div className="block w-full h-full min-h-[420px] sm:min-h-0">
              <HeroScene />
            </div>
          )}
        </div>
        
        {/* Subtle animated aurora background with parallax (furthest back) */}
        <div className="pointer-events-none absolute inset-0 z-0">
          {/* Base dark gradient overlay (lighter to show spotlight) */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-transparent" />
          {/* Aurora layers */}
          <motion.div
            className="absolute -inset-40 rounded-[100%] bg-[radial-gradient(60%_60%_at_20%_30%,#6ee7ff44,transparent_60%)] blur-3xl"
            style={{ y: l1y }}
            animate={{ x: [-30, 10, -10, 30, -30], opacity: [0.2, 0.3, 0.25, 0.3, 0.2] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -inset-40 rounded-[100%] bg-[radial-gradient(50%_50%_at_80%_20%,#a78bfa44,transparent_60%)] blur-3xl"
            style={{ y: l2y }}
            animate={{ x: [20, -20, 30, -10, 20], opacity: [0.15, 0.25, 0.2, 0.25, 0.15] }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -inset-40 rounded-[100%] bg-[radial-gradient(40%_40%_at_50%_70%,#22d3ee33,transparent_60%)] blur-3xl"
            style={{ y: l3y }}
            animate={{ x: [-10, 30, -20, 10, -10], opacity: [0.1, 0.2, 0.15, 0.2, 0.1] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Soft highlight */}
          <motion.div style={{ rotate }} className="absolute -inset-52">
            <div className="size-full bg-[radial-gradient(60%_60%_at_50%_40%,rgba(255,255,255,0.08),transparent_60%)]" />
          </motion.div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-24 sm:pt-28 pb-16 sm:pb-20">
          {/* Full-width title block */}
          <motion.div style={{ opacity }} className="relative z-20 mx-auto max-w-3xl text-center -top-3">
            <p className="text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] text-white/80">The first AI agent with <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">taste</span></p>
            <h1 className="mt-3 sm:mt-4 text-balance text-4xl sm:text-6xl font-semibold leading-tight sm:leading-[1.05] md:text-7xl" style={{ fontFamily: 'SentinelBlack, ui-sans-serif, system-ui' }}>
              Design quality UI. From a prompt.
            </h1>
          </motion.div>

          {/* Auto-typed rotating sentences between title and CTA */}
          <div className="mt-6 relative -top-1">
            <div className="relative z-20">
              <div className="mx-auto max-w-4xl text-center h-16 sm:h-20 flex items-center justify-center px-1">
                <p className="text-lg sm:text-2xl text-zinc-300" style={{ fontFamily: 'SentinelMedium, ui-sans-serif, system-ui' }}>
                  <span style={{ fontFamily: 'SentinelBlack, ui-sans-serif, system-ui' }}>{staticPrefix}</span>{typedDynamic}
                  <span className="inline-block w-px translate-y-px bg-zinc-400 align-middle animate-[caret-blink_0.7s_steps(1,end)_infinite]" style={{ height: "1em" }} />
                </p>
              </div>
            </div>
          </div>

          {/* Premium glassmorphism CTA */}
          <motion.div
            id="waitlist"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative z-20 mt-6"
          >
            {/* Subtle radial scrim to preserve text contrast over bright shapes */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.35),transparent_60%)]" />
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-3xl sm:text-4xl font-semibold mb-3 sm:mb-4" style={{ fontFamily: 'SentinelSemiBold, ui-sans-serif, system-ui' }}>Get early access</h2>
              <p className="mt-2 sm:mt-3 text-base sm:text-lg text-zinc-200 drop-shadow-[0_0_8px_rgba(0,0,0,0.35)]" style={{ fontFamily: 'SentinelMedium, ui-sans-serif, system-ui' }}>Be among the first to try Jony.</p>
              
              {/* Waitlist form container (no blur/box) */}
              <div className="mt-5 sm:mt-6">
                <form onSubmit={joinWaitlist} className="space-y-3 sm:space-y-4">
                  {/* InputWithButton layout from shadcn */}
                  <div className="flex w-full items-center gap-2 flex-col sm:flex-row">
                    <Input
                      type="email"
                      required
                      placeholder="Your Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-14 sm:h-14 text-lg sm:text-lg bg-black/60 border-white/20 text-white placeholder:text-base sm:placeholder:text-lg placeholder:text-white/50 placeholder:[font-family:SentinelBook,ui-sans-serif,system-ui] focus-visible:ring-white/20 focus-visible:border-white/40 rounded-xl w-full"
                    />
                    <Button
                      type="submit"
                      disabled={status === "loading"}
                      size="lg"
                      className="h-12 sm:h-14 px-5 sm:px-6 text-base sm:text-lg font-semibold bg-white text-black hover:bg-zinc-100 shadow-sm transition rounded-xl border border-white/20 w-full sm:w-auto"
                    >
                      {status === "loading" ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                          Joining…
                        </>
                      ) : (
                        <>Join the waitlist</>
                      )}
                    </Button>
                  </div>
                </form>
                
                {/* Status messages */}
                <div className="mt-4 text-center">
                  {status === "success" && (
                    <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                      ✓ You're in. We'll be in touch soon.
                    </Badge>
                  )}
                  {status === "exists" && (
                    <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                      ⚡ You're already on the list. Thanks!
                    </Badge>
                  )}
                  {status === "error" && (
                    <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30">
                      ⚠ Something went wrong. Try again.
                    </Badge>
                  )}
                </div>
                
              </div>
            </div>
          </motion.div>

          {/* How Jony Works Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="relative z-20 mt-24 sm:mt-32"
          >
            <div className="mx-auto max-w-5xl text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-3 sm:mb-4" 
                style={{ fontFamily: 'SentinelSemiBold, ui-sans-serif, system-ui' }}
              >
                How Jony works
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg sm:text-xl text-zinc-400 mb-10 sm:mb-16" 
                style={{ fontFamily: 'SentinelBook, ui-sans-serif, system-ui' }}
              >
                Three simple steps to design-quality UI
              </motion.p>

              <Workflow />

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-12 sm:mt-16"
              >
                <p className="text-base sm:text-lg text-zinc-400 mb-5 sm:mb-6" style={{ fontFamily: 'SentinelBook, ui-sans-serif, system-ui' }}>
                  Ready to create something beautiful?
                </p>
                <Button
                  asChild
                  size="lg"
                  className="h-11 sm:h-12 px-6 sm:px-8 text-base sm:text-lg font-semibold bg-gradient-to-r from-white via-white to-gray-100 text-black hover:from-gray-50 hover:via-gray-50 hover:to-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl border border-white/20"
                >
                  <a href="/onboarding">
                    Start with Jony
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Spacing after How it Works */}
          <div className="mt-16 sm:mt-24" />
        </div>

      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-12 text-[11px] sm:text-xs text-zinc-500">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <span>© {new Date().getFullYear()} Jony</span>
            <div className="flex gap-3 sm:gap-4">
              <a className="hover:text-zinc-300" href="#features">Features</a>
              <a className="hover:text-zinc-300" href="#demo">Demo</a>
              <a className="hover:text-zinc-300" href="#waitlist">Waitlist</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
