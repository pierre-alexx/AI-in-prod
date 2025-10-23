"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';
import { PricingCard } from '@/components/PricingCard';
import Link from 'next/link';

type SubscriptionData = {
  stripe_price_id: string | null;
  status: string | null;
};

export function PricingPageClient() {
  const { user } = useAuth();
  const supabase = getSupabaseBrowserClient();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadSubscription = async () => {
      try {
        const { data } = await supabase
          .from('subscriptions')
          .select('stripe_price_id,status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        setSubscription(data as SubscriptionData | null);
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [user, supabase]);

  const basicPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC!;
  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!;
  
  // Determine current plan
  const hasActiveSubscription = subscription?.status === 'active' || 
                                subscription?.status === 'trialing' || 
                                subscription?.status === 'past_due';
  
  const currentPlan = hasActiveSubscription 
    ? (subscription?.stripe_price_id === proPriceId ? 'pro' : 'basic')
    : 'free';

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
          isCurrent={currentPlan === 'basic'}
        />

        <PricingCard
          name="Pro"
          price="€19/mo"
          description="200 generations per month"
          features={["200 generations/month", "Priority support"]}
          priceId={proPriceId}
          isCurrent={currentPlan === 'pro'}
        />
      </div>
      
      {hasActiveSubscription && (
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold">Cancel your subscription</h2>
          <p className="mt-2 text-sm text-zinc-300">You can cancel your plan from the billing portal.</p>
          <div className="mt-4">
            <Link href="/api/create-portal-session" prefetch={false} className="inline-block rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-4 py-2 text-sm text-red-200">
              Cancel your plan
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
