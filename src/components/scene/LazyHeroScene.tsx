"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load the heavy Three.js scene
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-black flex items-center justify-center">
      <div className="text-white/60 text-sm">Loading scene...</div>
    </div>
  ),
});

export default function LazyHeroScene() {
  return (
    <Suspense fallback={
      <div className="h-full w-full bg-black flex items-center justify-center">
        <div className="text-white/60 text-sm">Loading scene...</div>
      </div>
    }>
      <HeroScene />
    </Suspense>
  );
}
