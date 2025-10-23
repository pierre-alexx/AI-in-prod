"use client";

import { useState } from 'react';

export function SubscriptionFix() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const fixSubscription = async (plan: 'basic' | 'pro') => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/fix-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Success! ${data.message}`);
        // Refresh the page to update the UI
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-6">
      <h3 className="text-lg font-semibold text-yellow-200 mb-4">
        🔧 Manual Subscription Fix
      </h3>
      <p className="text-sm text-yellow-300 mb-4">
        If your subscription didn't activate automatically, use this to manually fix it.
      </p>
      
      <div className="space-y-3">
        <button
          onClick={() => fixSubscription('basic')}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 text-sm transition-all disabled:opacity-50"
        >
          {loading ? 'Fixing...' : 'Activate Basic Plan (50 credits)'}
        </button>
        
        <button
          onClick={() => fixSubscription('pro')}
          disabled={loading}
          className="w-full rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 text-sm transition-all disabled:opacity-50"
        >
          {loading ? 'Fixing...' : 'Activate Pro Plan (200 credits)'}
        </button>
      </div>
      
      {result && (
        <div className="mt-4 p-3 rounded-lg bg-white/10 text-sm">
          {result}
        </div>
      )}
    </div>
  );
}
