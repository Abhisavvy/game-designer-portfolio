import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    if (!dev) {
      // Exclude admin routes from production builds
      config.resolve.alias = {
        ...config.resolve.alias,
        "@/app/admin": false,
        "@/features/admin": false,
      };
    }
    return config;
  },
};

export default nextConfig;
