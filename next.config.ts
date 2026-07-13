import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const backendUrl = process.env.BACKEND_URL;

if (!backendUrl) {
  throw new Error('Missing required environment variable: BACKEND_URL');
}

const imageHostname = process.env.NEXT_PUBLIC_IMAGE_HOSTNAME || 'localhost';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: imageHostname,
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
