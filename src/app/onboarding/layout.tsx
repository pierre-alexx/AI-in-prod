// This is a server component layout that sets route segment config
// for everything under /onboarding. We avoid exporting these from the
// client page to prevent Next.js from trying to interpret them there.

export const dynamic = "force-dynamic";
export const revalidate = false;
export const fetchCache = "force-no-store";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}


