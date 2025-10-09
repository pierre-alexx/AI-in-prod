import type { Metadata } from "next";
import "../app/globals.css";

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
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
