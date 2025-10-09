"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { GradientButton } from "@/components/ui/gradient-button";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const { user, isLoading, signOut } = useAuth();
  const pathname = usePathname();
  const hideCta = pathname === "/signup" || pathname === "/dashboard";
  const showProfile = pathname === "/dashboard" && !!user;
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);
  return (
    <header className="sticky top-0 z-50 isolate border-b border-white/10 bg-black">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-2">
          <Image src="/renoir-logo.png" alt="Renoir logo" width={48} height={48} />
          <span className="font-semibold" style={{ fontFamily: 'SentinelBlack', fontStyle: 'italic' }}>Renoir</span>
        </div>
        <nav className="hidden gap-3 text-sm md:flex items-center">
          {!hideCta && (
            !isLoading && user ? (
              <>
                <span className="text-xs text-zinc-300 hidden sm:inline">{user.email}</span>
                <Link href="/dashboard">
                  <GradientButton size="md" className="rounded-full font-bold px-5">
                    Sign in
                  </GradientButton>
                </Link>
                <button onClick={signOut} className="px-2 py-1 border border-white/20 rounded text-xs">Sign out</button>
              </>
            ) : (
              <Link href="/signup">
                <GradientButton size="md" className="rounded-full font-bold px-5">
                  Sign in
                </GradientButton>
              </Link>
            )
          )}

          {showProfile && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpen((v) => !v)}
                className="px-3 py-1 border border-white/20 rounded-full text-xs text-white/90 hover:bg-white/10"
              >
                Profile
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-md shadow-xl p-4 z-50">
                  <div className="text-xs sm:text-sm text-zinc-300">
                    <span className="block">Logged in as <span className="text-white">{user?.email}</span></span>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button onClick={signOut} className="px-3 py-1.5 text-xs sm:text-sm border border-white/20 rounded">
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}


