import { getSupabaseServiceClient } from './supabaseService';

/**
 * Initialize a user's subscription record if they don't have one
 * This ensures free users get a proper record with 0 credits
 */
export async function initializeUserSubscription(userId: string) {
  const supabase = getSupabaseServiceClient();
  
  // Check if user already has a subscription record
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (existing) {
    return; // User already has a record
  }
  
  // Create a free user record with 0 credits
  await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      stripe_price_id: null,
      status: null,
      current_period_start: null,
      current_period_end: null,
      quota_limit: 0,
      quota_used: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
}
