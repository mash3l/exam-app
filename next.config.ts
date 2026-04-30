import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16: cacheComponents moved out of experimental
  cacheComponents: true,
  /** لتخطي تسجيل الدخول يدوياً في التطوير فقط: NEXT_PUBLIC_SKIP_AUTH=true و NEXT_PUBLIC_DEV_API_TOKEN في .env.local */
  env: {
    NEXT_PUBLIC_SKIP_AUTH: process.env.NEXT_PUBLIC_SKIP_AUTH ?? "false",
    NEXTAUTH_URL:
      process.env.NEXTAUTH_URL?.trim() ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
  },
};

export default nextConfig;