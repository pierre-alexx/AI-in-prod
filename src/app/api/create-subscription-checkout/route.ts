import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { getSupabaseServiceClient } from '@/lib/supabaseService';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const auth = getSupabaseServerClient();
    const { data: userData } = await auth.auth.getUser();
    const user = userData.user;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const priceId = body?.priceId as string | undefined;
    if (!priceId) return NextResponse.json({ error: 'priceId required' }, { status: 400 });

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing STRIPE_SECRET_KEY');
      return NextResponse.json({ error: 'Server misconfigured (stripe key)' }, { status: 500 });
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json({ error: 'Server misconfigured (service key)' }, { status: 500 });
    }
    if (!process.env.NEXT_PUBLIC_URL) {
      console.error('Missing NEXT_PUBLIC_URL');
      return NextResponse.json({ error: 'Server misconfigured (public url)' }, { status: 500 });
    }

    const stripe = getStripe();
    const supabase = getSupabaseServiceClient();

    // Find or create Stripe customer
    let stripeCustomerId: string | null = null;
    const { data: subRow } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (subRow?.stripe_customer_id) {
      stripeCustomerId = subRow.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      });
      stripeCustomerId = customer.id;
      await supabase
        .from('subscriptions')
        .upsert({ user_id: user.id, stripe_customer_id: stripeCustomerId }, { onConflict: 'user_id' });
    }

    const base = process.env.NEXT_PUBLIC_URL!.replace(/\/$/, '');
    const successUrl = `${base}/dashboard`;
    const cancelUrl = `${base}/pricing`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId!,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Server error' }, { status: 500 });
  }
}


