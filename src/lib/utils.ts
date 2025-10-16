import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type SubscriptionRow = {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  quota_limit: number | null;
  quota_used: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export function isActiveStatus(status: string | null | undefined) {
  if (!status) return false
  const s = status.toLowerCase()
  return s === 'active' || s === 'trialing' || s === 'past_due'
}

