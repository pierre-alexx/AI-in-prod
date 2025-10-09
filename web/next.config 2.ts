import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile ESM packages for Next.js
  transpilePackages: ["three"],
};

export default nextConfig;
