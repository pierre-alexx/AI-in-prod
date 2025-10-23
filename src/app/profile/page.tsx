"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';
import { SubscriptionFix } from '@/components/SubscriptionFix';

type SubRow = {
  stripe_price_id: string | null;
  quota_limit: number | null;
  quota_used: number | null;
  status: string | null;
};

export default function ProfilePage() {
  const { user, isLoading, signOut } = useAuth();
  const supabase = getSupabaseBrowserClient();
  const [row, setRow] = useState<SubRow | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('stripe_price_id,quota_limit,quota_used,status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setRow((data as SubRow) || null);
    };
    load();
  }, [user, supabase]);

  // Check if user has active subscription
  const hasActive = row?.status === 'active' || row?.status === 'trialing' || row?.status === 'past_due';
  const plan = hasActive
    ? (row?.stripe_price_id === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ? 'Pro plan' : 'Basic plan')
    : 'No Subscription';

  // Only show credits for active subscribers
  const limit = hasActive ? (row?.quota_limit ?? 0) : 0;
  const used = hasActive ? (row?.quota_used ?? 0) : 0;
  const remaining = Math.max(0, limit - used);
  const percent = limit ? Math.min(100, (used / limit) * 100) : 0;

  const openPortal = async () => {
    setError(null);
    setLoadingPortal(true);
    try {
      const res = await fetch('/api/create-portal-session', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Unable to open billing portal');
      window.location.href = data.url as string;
    } catch (e: any) {
      setError(e?.message ?? 'Unable to open billing portal');
    } finally {
      setLoadingPortal(false);
    }
  };

  if (isLoading) return <div className="p-6 text-white">Loading…</div>;
  if (!user) return <div className="p-6 text-white">Please log in.</div>;

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10 text-white">
      <h1 className="mb-8 text-4xl sm:text-5xl" style={{ fontFamily: 'SentinelBlack' }}>Profile</h1>
      {/* Removed inline "Logged in as" line under the title */}

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-300">Current plan</p>
            <p className="text-2xl font-semibold">{plan}</p>
            <p className="mt-1 text-xs text-zinc-400">Status: {row?.status ?? '—'}</p>
          </div>
          <a
            href="/subscription"
            className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-sm"
          >
            Manage subscription
          </a>
        </div>

        {hasActive ? (
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-300">Credits remaining</span>
              <span className="font-medium">{remaining}/{limit}</span>
            </div>
            <div className="mt-2 h-2 w-full rounded bg-white/10">
              <div 
                className={`h-2 rounded transition-all ${
                  remaining === 0 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}
                style={{ width: `${percent}%` }} 
              />
            </div>
          </div>
        ) : (
          <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
            <p className="text-sm text-blue-300 mb-4 text-center">
              Subscribe to start generating images
            </p>
            <a 
              href="/pricing" 
              className="block w-full text-center rounded-xl bg-white text-black font-bold py-3 px-6 text-base transition-all shadow-lg hover:shadow-xl transform hover:scale-105 hover:bg-gray-100"
            >
              Get Credits →
            </a>
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-300">{error}</p>
        )}
      </section>

      <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xl font-semibold">Tips</h2>
        <ul className="mt-3 list-disc pl-5 text-sm text-zinc-300 space-y-1">
          <li>Upgrade to Pro for higher monthly limits.</li>
          <li>You can pause or cancel anytime from the billing portal.</li>
          <li>Invoices and payment methods live in the portal.</li>
        </ul>
      </section>

      {/* Manual subscription fix for debugging */}
      {!hasActive && (
        <section className="mt-8">
          <SubscriptionFix />
        </section>
      )}

      <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-300">
            <span>Logged in as </span>
            <span className="text-white font-medium">{user?.email ?? '—'}</span>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 text-sm border border-white/20 rounded-xl hover:bg-white/10"
          >
            Sign out
          </button>
        </div>
      </section>
    </main>
  );
}


