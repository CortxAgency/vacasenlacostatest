import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'media.argprop.com', // Placeholder domain
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com', // Fallback
      },
      {
        protocol: 'https',
        hostname: 'pub-*.r2.dev', // R2 dev domains
      },
    ],
  },
};

export default nextConfig;
