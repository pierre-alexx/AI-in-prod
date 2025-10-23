"use client";

import { useState } from 'react';

type Props = {
  name: string;
  price: string;
  description?: string;
  features: string[];
  priceId: string;
  isCurrent?: boolean;
};

export function PricingCard({ name, price, description, features, priceId, isCurrent = false }: Props) {
  const [loading, setLoading] = useState(false);

  const onSubscribe = async () => {
    setLoading(true);
    try {
      if (!priceId) {
        throw new Error('Missing priceId. Configure NEXT_PUBLIC_STRIPE_PRICE_BASIC/PRO in your env.');
      }
      const res = await fetch('/api/create-subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, plan: name.toLowerCase() }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data?.error || `Checkout failed (${res.status})`);
      if (data.url) window.location.href = data.url as string;
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : 'Unable to start checkout.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-3xl border p-6 text-white ${
      isCurrent 
        ? 'border-blue-500/50 bg-blue-500/5' 
        : 'border-white/10 bg-white/[0.03]'
    }`}>
      <h3 className="text-2xl font-semibold">{name}</h3>
      <p className="mt-2 text-3xl">{price}</p>
      {description && <p className="mt-2 text-sm text-zinc-300">{description}</p>}
      <ul className="mt-4 space-y-2 text-sm text-zinc-200">
        {features.map((f) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>
      {isCurrent ? (
        <div className="mt-6 w-full rounded-xl bg-blue-500/20 border border-blue-500/30 py-3 text-center text-sm text-blue-200">
          Current Plan
        </div>
      ) : (
        <button
          onClick={onSubscribe}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 py-3"
        >
          {loading ? 'Redirecting…' : 'Subscribe'}
        </button>
      )}
    </div>
  );
}


