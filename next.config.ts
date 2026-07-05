import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16: cacheComponents moved out of experimental
  cacheComponents: true,

  // 🛡️ تنظيف الكود: مسح كل الـ console.log عند عمل Build للـ Production
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "exam-app.elevate-bootcamp.cloud",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },

  env: {
    NEXTAUTH_URL:
      process.env.NEXTAUTH_URL?.trim() ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
  },

  // إعدادات إضافية لزيادة الأمان في الـ Cookies والـ Headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;