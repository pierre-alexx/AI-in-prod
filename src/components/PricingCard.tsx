"use client";

import { useState } from 'react';

type Props = {
  name: string;
  price: string;
  description?: string;
  features: string[];
  priceId: string;
};

export function PricingCard({ name, price, description, features, priceId }: Props) {
  const [loading, setLoading] = useState(false);

  const onSubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/create-subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      if (data.url) window.location.href = data.url as string;
    } catch (e) {
      console.error(e);
      alert('Unable to start checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-white">
      <h3 className="text-2xl font-semibold">{name}</h3>
      <p className="mt-2 text-3xl">{price}</p>
      {description && <p className="mt-2 text-sm text-zinc-300">{description}</p>}
      <ul className="mt-4 space-y-2 text-sm text-zinc-200">
        {features.map((f) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>
      <button
        onClick={onSubscribe}
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 py-3"
      >
        {loading ? 'Redirecting…' : 'Subscribe'}
      </button>
    </div>
  );
}


