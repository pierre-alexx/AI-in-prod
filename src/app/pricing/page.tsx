import { PricingCard } from '@/components/PricingCard';

export default function PricingPage() {
  const basicPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC!;
  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!;
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
        />
        <PricingCard
          name="Pro"
          price="€19/mo"
          description="200 generations per month"
          features={["200 generations/month", "Priority support"]}
          priceId={proPriceId}
        />
      </div>
    </main>
  );
}


