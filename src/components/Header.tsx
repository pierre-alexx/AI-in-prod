"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { GradientButton } from "@/components/ui/gradient-button";
import { useState } from "react";

export function Header() {
  const { user, isLoading, signOut } = useAuth();
  const pathname = usePathname();
  const hideCta = pathname === "/signup" || pathname === "/dashboard" || pathname === "/profile";
  const showProfile = !!user; // show a single Profile link when authenticated
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  return (
    <header className="sticky top-0 z-50 isolate border-b border-white/10 bg-black">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/renoir-logo.png" alt="Renoir logo" width={48} height={48} />
            <span className="font-semibold" style={{ fontFamily: 'SentinelBlack', fontStyle: 'italic' }}>Renoir</span>
          </Link>
        </div>
        <nav className="hidden gap-3 text-sm md:flex items-center">
          {!hideCta && !isLoading && !user && (
            <Link href="/login">
              <GradientButton size="md" className="rounded-full font-bold px-5">
                Sign in
              </GradientButton>
            </Link>
          )}

          {showProfile && (
            pathname === "/profile" ? (
              <Link href="/dashboard" className="px-3 py-1 border border-white/20 rounded-full text-xs text-white/90 hover:bg-white/10">
                Dashboard
              </Link>
            ) : (
              <Link href="/profile" className="px-3 py-1 border border-white/20 rounded-full text-xs text-white/90 hover:bg-white/10">
                Profile
              </Link>
            )
          )}

          {showProfile && (pathname === "/dashboard" || pathname === "/profile") && (
            <button
              onClick={async () => {
                setUpgradeLoading(true);
                try {
                  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO as string | undefined;
                  if (!priceId) throw new Error('Missing Pro price id');
                  const res = await fetch('/api/create-subscription-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ priceId }),
                  });
                  const data = await res.json();
                  if (!res.ok || !data.url) throw new Error(data.error || 'Unable to start checkout');
                  window.location.href = data.url as string;
                } catch (e: any) {
                  console.error(e);
                } finally {
                  setUpgradeLoading(false);
                }
              }}
              disabled={upgradeLoading}
              className="px-3 py-1 rounded-full text-xs bg-white text-black hover:bg-white/90"
            >
              {upgradeLoading ? 'Opening…' : 'Upgrade'}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}


