import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // --- THIS IS THE CRUCIAL CHANGE ---
    // This tells the Next.js <Image> component to serve the original,
    // un-optimized image file directly, bypassing the optimizer service
    // that seems to be failing.
    unoptimized: true,
    
    // Your remotePatterns config is correct, but we'll leave it in.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;