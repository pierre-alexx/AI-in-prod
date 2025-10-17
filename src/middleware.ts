import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PROTECTED_PATHS = [
  /^\/dashboard(\/.*)?$/,
  // Protect API by default, but we'll explicitly allow the Stripe webhook below
  /^\/api\//,
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Redirect authenticated users away from landing to dashboard
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();

  if (pathname === '/' && data.user) {
    const dash = req.nextUrl.clone();
    dash.pathname = '/dashboard';
    return NextResponse.redirect(dash);
  }

  // Allow public access to Stripe webhooks (Stripe cannot be authenticated)
  if (pathname.startsWith('/api/webhooks/stripe')) {
    return res;
  }

  // Allow checkout and portal endpoints to handle auth themselves and return JSON
  if (pathname === '/api/create-subscription-checkout' || pathname === '/api/create-portal-session') {
    return res;
  }

  const requiresAuth = PROTECTED_PATHS.some((re) => re.test(pathname));
  if (!requiresAuth) return res;

  if (!data.user) {
    const signupUrl = req.nextUrl.clone();
    signupUrl.pathname = '/signup';
    signupUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(signupUrl);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)'],
};


