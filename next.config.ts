import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const imageHostname = process.env.IMAGE_HOSTNAME || 'localhost';
const imageProtocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      {
        protocol: imageProtocol,
        hostname: imageHostname,
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
