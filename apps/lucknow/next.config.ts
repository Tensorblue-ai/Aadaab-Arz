import type { NextConfig } from 'next';

const contentApiOrigin = process.env.CONTENT_API_ORIGIN?.replace(/\/$/, '');
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (process.env.VERCEL ? '/home' : '');

const nextConfig: NextConfig = {
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_FOREIGN_SITE_URL: process.env.NEXT_PUBLIC_FOREIGN_SITE_URL ?? (basePath ? '/' : 'https://events-greater-completely-boost.trycloudflare.com'),
  },
  async rewrites() {
    return contentApiOrigin ? [
      { source: '/api/public/:path*', destination: `${contentApiOrigin}/api/public/:path*`, basePath: false },
      { source: '/admin', destination: `${contentApiOrigin}/admin`, basePath: false },
      { source: '/admin/:path*', destination: `${contentApiOrigin}/admin/:path*`, basePath: false },
    ] : [];
  },
};

export default nextConfig;
