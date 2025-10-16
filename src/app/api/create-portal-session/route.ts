import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { getSupabaseServiceClient } from '@/lib/supabaseService';

export async function POST(_req: NextRequest) {
  try {
    const auth = getSupabaseServerClient();
    const { data: userData } = await auth.auth.getUser();
    const user = userData.user;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getSupabaseServiceClient();
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
    const stripeCustomerId = sub?.stripe_customer_id;
    if (!stripeCustomerId) return NextResponse.json({ error: 'No customer' }, { status: 400 });

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Server error' }, { status: 500 });
  }
}


