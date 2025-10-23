"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';
import Link from 'next/link';

type SubscriptionData = {
  quota_limit: number | null;
  quota_used: number | null;
  status: string | null;
  stripe_price_id: string | null;
};

export function CreditCounter() {
  const { user } = useAuth();
  const supabase = getSupabaseBrowserClient();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadSubscription = async () => {
      try {
        const { data } = await supabase
          .from('subscriptions')
          .select('quota_limit,quota_used,status,stripe_price_id')
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
    
    // Refresh every 30 seconds to keep credits up to date
    const interval = setInterval(loadSubscription, 30000);
    return () => clearInterval(interval);
  }, [user, supabase, refreshTrigger]);

  // Listen for credit refresh events
  useEffect(() => {
    const handleRefresh = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('refreshCredits', handleRefresh);
    return () => window.removeEventListener('refreshCredits', handleRefresh);
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-white/10 rounded w-24 mb-2"></div>
          <div className="h-2 bg-white/10 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Determine if user has active subscription
  const hasActiveSubscription = subscription?.status === 'active' || 
                                subscription?.status === 'trialing' || 
                                subscription?.status === 'past_due';

  // Only show credits for active subscribers
  const quotaLimit = hasActiveSubscription ? (subscription?.quota_limit ?? 0) : 0;
  const quotaUsed = hasActiveSubscription ? (subscription?.quota_used ?? 0) : 0;
  const remaining = Math.max(0, quotaLimit - quotaUsed);
  const percent = quotaLimit > 0 ? Math.min(100, (quotaUsed / quotaLimit) * 100) : 0;

  // Determine plan name
  const planName = hasActiveSubscription 
    ? (subscription?.stripe_price_id === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ? 'Pro' : 'Basic')
    : 'No Subscription';

  const isOutOfCredits = remaining === 0;

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      isOutOfCredits 
        ? 'border-red-500/30 bg-red-500/5' 
        : 'border-white/10 bg-white/[0.03]'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-white">
            {planName} Plan
          </h3>
          <p className="text-xs text-zinc-400">
            {hasActiveSubscription ? 'Credits remaining' : ''}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">
            {hasActiveSubscription ? remaining : ''}
          </div>
          {hasActiveSubscription && (
            <div className="text-xs text-zinc-400">
              / {quotaLimit}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar - only for active subscribers */}
      {hasActiveSubscription && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Usage</span>
            <span>{quotaUsed}/{quotaLimit}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                isOutOfCredits ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!hasActiveSubscription || isOutOfCredits ? (
        <div className="space-y-3">
          <Link 
            href="/pricing"
            className="block w-full text-center rounded-xl bg-white text-black font-bold py-3 px-6 text-base transition-all shadow-lg hover:shadow-xl transform hover:scale-105 hover:bg-gray-100"
          >
            {hasActiveSubscription ? 'Upgrade Plan' : 'Get Credits'}
          </Link>
          <p className="text-xs text-zinc-400 text-center">
            {hasActiveSubscription ? 'Upgrade to get more credits' : 'Subscribe to start generating images'}
          </p>
        </div>
      ) : (
        <div className="text-xs text-zinc-400 text-center">
          Ready to generate
        </div>
      )}
    </div>
  );
}
