import { PricingCard } from '@/components/PricingCard';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';
import { Suspense } from 'react';

export default function PricingPage() {
  const basicPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC!;
  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!;
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-12 text-white">
      <h1 className="mb-8 text-4xl sm:text-5xl" style={{ fontFamily: 'SentinelBlack' }}>Pricing</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PricingCard
          name="Basic"
          price="€9/mo"
          description="50 generations per month"
          features={["50 generations/month", "Standard support"]}
          priceId={basicPriceId}
        />
        <PricingCard
          name="Pro"
          price="€19/mo"
          description="200 generations per month"
          features={["200 generations/month", "Priority support"]}
          priceId={proPriceId}
        />
      </div>
      <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xl font-semibold">Already subscribed?</h2>
        <p className="mt-2 text-sm text-zinc-300">You can manage or cancel your plan from the billing portal.</p>
        <div className="mt-4 flex gap-3">
          <Link href="/api/create-portal-session" prefetch={false} className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-sm">
            Manage your subscription
          </Link>
          <Link href="/api/create-portal-session" prefetch={false} className="rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-4 py-2 text-sm text-red-200">
            Cancel your plan
          </Link>
        </div>
      </div>
    </main>
  );
}


