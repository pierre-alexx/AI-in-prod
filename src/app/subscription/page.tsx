"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';

type SubRow = { status: string | null };

export default function SubscriptionHubPage() {
  const { user, isLoading } = useAuth();
  const supabase = getSupabaseBrowserClient();
  const [active, setActive] = useState<boolean | null>(null);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const status = (data as SubRow | null)?.status ?? null;
      const isActive = status === 'active' || status === 'trialing' || status === 'past_due';
      setActive(isActive);
      if (!isActive) {
        window.location.replace('/pricing');
      }
    })();
  }, [user, isLoading, supabase]);

  const openPortal = async () => {
    setError(null);
    setOpening(true);
    try {
      const res = await fetch('/api/create-portal-session', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Unable to open billing portal');
      window.location.href = data.url as string;
    } catch (e: any) {
      setError(e?.message ?? 'Unable to open billing portal');
    } finally {
      setOpening(false);
    }
  };

  // Show loading while checking subscription status
  if (isLoading || active === null) return <div className="p-6 text-white">Loading…</div>;

  // If no active subscription, don't render anything as we'll redirect
  if (active === false) return <div className="p-6 text-white">Redirecting…</div>;

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10 text-white">
      <h1 className="mb-6 text-4xl sm:text-5xl" style={{ fontFamily: 'SentinelBlack' }}>Manage subscription</h1>
      <p className="text-sm text-zinc-300">Upgrade, change payment method, or cancel your plan in the billing portal.</p>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <button
          onClick={openPortal}
          disabled={opening}
          className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-sm"
        >
          {opening ? 'Opening…' : 'Open billing portal'}
        </button>
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      </div>
    </main>
  );
}


