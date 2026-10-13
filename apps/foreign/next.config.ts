import type { NextConfig } from 'next';

const contentApiOrigin = process.env.CONTENT_API_ORIGIN?.replace(/\/$/, '');
const lucknowOrigin = process.env.LUCKNOW_ORIGIN?.replace(/\/$/, '');
const singleDomain = Boolean(process.env.VERCEL || lucknowOrigin);
const mainSite = process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? (singleDomain ? '/home' : 'https://supplier-reporting-scott-violations.trycloudflare.com');

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_MAIN_SITE_URL: mainSite,
    NEXT_PUBLIC_CONTENT_API_BASE: process.env.NEXT_PUBLIC_CONTENT_API_BASE ?? (singleDomain ? '' : mainSite),
  },
  async rewrites() {
    return {
      beforeFiles: [
        ...(lucknowOrigin ? [
          { source: '/home', destination: `${lucknowOrigin}/home` },
          { source: '/home/:path*', destination: `${lucknowOrigin}/home/:path*` },
        ] : []),
        ...(contentApiOrigin ? [
          { source: '/api/public/:path*', destination: `${contentApiOrigin}/api/public/:path*` },
          { source: '/admin', destination: `${contentApiOrigin}/admin` },
          { source: '/admin/:path*', destination: `${contentApiOrigin}/admin/:path*` },
        ] : []),
      ],
    };
  },
};

export default nextConfig;
