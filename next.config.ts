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
        hostname: "vgwyxzwhyfrmwjrvztyx.supabase.co",
      },
    ],
  },
};

export default nextConfig;
