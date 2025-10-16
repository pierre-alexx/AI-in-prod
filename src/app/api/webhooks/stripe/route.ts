import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSupabaseServiceClient } from '@/lib/supabaseService';
import { isActiveStatus, SubscriptionRow } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event; 
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string | undefined;
        const priceId = session?.line_items?.data?.[0]?.price?.id || session?.metadata?.price_id || null;

        // We rely on customer.subscription.created/updated to set the rest
        await supabase.from('subscriptions').upsert(
          {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId ?? null,
            stripe_price_id: priceId,
            status: 'active',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'stripe_customer_id' }
        );
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as any;
        const customerId = sub.customer as string;
        const priceId = sub.items?.data?.[0]?.price?.id ?? null;
        const status = sub.status as string | null;
        const currentPeriodStart = sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null;
        const currentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;

        let quotaLimit = 50;
        if (priceId) {
          if (priceId === process.env.STRIPE_PRICE_BASIC) quotaLimit = 50;
          else if (priceId === process.env.STRIPE_PRICE_PRO) quotaLimit = 200;
        }

        await supabase.from('subscriptions').upsert(
          {
            stripe_customer_id: customerId,
            stripe_subscription_id: sub.id as string,
            stripe_price_id: priceId,
            status,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            quota_limit: quotaLimit,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'stripe_customer_id' }
        );
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const customerId = sub.customer as string;
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled', updated_at: new Date().toISOString() })
          .eq('stripe_customer_id', customerId);
        break;
      }
      case 'invoice.payment_succeeded': {
        const inv = event.data.object as any;
        const customerId = inv.customer as string;
        // Reset quota_used at the start of a new billing period
        await supabase
          .from('subscriptions')
          .update({ quota_used: 0, updated_at: new Date().toISOString() })
          .eq('stripe_customer_id', customerId);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error('Webhook handling error', e);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}


