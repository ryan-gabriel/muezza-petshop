import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "your-supabase-storage-url.com", // kalau kamu pakai Supabase
      },
    ],
  },
};

export default nextConfig;
