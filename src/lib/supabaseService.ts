import { createClient } from "@supabase/supabase-js";
import { SubscriptionRow } from "./utils";

export function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function getUserSubscription(userId: string): Promise<SubscriptionRow | null> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return data as SubscriptionRow | null;
}

export async function upsertSubscriptionByCustomerId(fields: Partial<SubscriptionRow> & { stripe_customer_id: string }) {
  const supabase = getSupabaseServiceClient();
  const { data } = await supabase
    .from('subscriptions')
    .upsert(fields, { onConflict: 'stripe_customer_id' })
    .select('*')
    .maybeSingle();
  return data as SubscriptionRow | null;
}

export async function setQuotaUsed(userId: string, used: number) {
  const supabase = getSupabaseServiceClient();
  await supabase
    .from('subscriptions')
    .update({ quota_used: used, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
}

export async function incrementQuotaUsed(userId: string, by: number = 1) {
  const supabase = getSupabaseServiceClient();
  // Try optional RPC; if not available or errors, fallback to update
  try {
    const { error } = await supabase.rpc('increment_quota_used', { p_user_id: userId, p_by: by });
    if (!error) return;
  } catch {}
  const current = await getUserSubscription(userId);
  const next = (current?.quota_used ?? 0) + by;
  await supabase
    .from('subscriptions')
    .update({ quota_used: next, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
}

