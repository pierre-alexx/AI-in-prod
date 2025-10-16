"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';

type Row = {
  stripe_price_id: string | null;
  quota_limit: number | null;
  quota_used: number | null;
  status: string | null;
};

export function SubscriptionStatus() {
  const { user } = useAuth();
  const supabase = getSupabaseBrowserClient();
  const [row, setRow] = useState<Row | null>(null);

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
      setRow((data as Row) || null);
    };
    load();
  }, [user, supabase]);

  if (!user) return null;
  const limit = row?.quota_limit ?? 0;
  const used = row?.quota_used ?? 0;

  const plan = row?.stripe_price_id === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO
    ? 'Pro plan'
    : row?.stripe_price_id
      ? 'Basic plan'
      : 'Free';

  return (
    <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-300">Your subscription</p>
          <p className="text-lg font-semibold">{plan}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-300">Remaining generations</p>
          <p className="text-lg font-semibold">{Math.max(0, limit - used)}/{limit}</p>
        </div>
      </div>
      <div className="mt-3 h-2 w-full rounded bg-white/10">
        <div className="h-2 rounded bg-white/70" style={{ width: `${limit ? Math.min(100, (used / limit) * 100) : 0}%` }} />
      </div>
    </div>
  );
}


