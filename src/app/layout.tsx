import type { Metadata } from "next";
import "../app/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { LightCursorEnforcer } from "@/components/LightCursorEnforcer";

export const metadata: Metadata = {
  title: "Renoir - Transform images. Instantly.",
  description: "AI that understands your vision. Upload, describe, create. Make your photos better instantly.",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Preload cursor images to prevent flickering */}
        <link rel="preload" href="/arrow.svg" as="image" />
        <link rel="preload" href="/pointer.svg" as="image" />
        {/* Inline critical cursor styles for immediate application */}
        <style dangerouslySetInnerHTML={{
          __html: `
            * { cursor: url('/arrow.svg') 8 8, auto !important; }
            a, button, [role=button], [role=link], input:not([type=hidden]), textarea, select, [data-cursor=pointer], .cursor-pointer, .pointer, [tabindex]:not([tabindex="-1"]) { cursor: url('/pointer.svg') 8 8, pointer !important; }
            a *, a img, a span, a div, a svg { cursor: url('/pointer.svg') 8 8, pointer !important; }
            input[type="text"], input[type="search"], input[type="password"], input[type="email"], input[type="url"], input[type="tel"], textarea { cursor: url('/arrow.svg') 8 8, text !important; }
          `
        }} />
      </head>
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <LightCursorEnforcer />
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
