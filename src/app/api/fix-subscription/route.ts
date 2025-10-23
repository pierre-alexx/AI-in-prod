import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseServiceClient } from '@/lib/supabaseService';

export async function POST(req: NextRequest) {
  try {
    // Check authenticated user
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );
    
    const { data: userData } = await authClient.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body;
    
    if (!plan || !['basic', 'pro'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan. Must be "basic" or "pro"' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    
    // Set quota limits based on plan
    const quotaLimit = plan === 'pro' ? 200 : 50;
    const priceId = plan === 'pro' 
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO 
      : process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC;

    // Update or create subscription record
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_customer_id: `manual_${userId}_${Date.now()}`,
        stripe_subscription_id: `manual_sub_${userId}_${Date.now()}`,
        stripe_price_id: priceId,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        quota_limit: quotaLimit,
        quota_used: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { 
        onConflict: 'user_id' 
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription:', error);
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully activated ${plan} plan with ${quotaLimit} credits`,
      subscription: data
    });

  } catch (error) {
    console.error('Fix subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
