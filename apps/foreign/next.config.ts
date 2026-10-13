import type { NextConfig } from 'next';

const contentApiOrigin = process.env.CONTENT_API_ORIGIN?.replace(/\/$/, '');

const nextConfig: NextConfig = {
  async rewrites() {
    return contentApiOrigin ? [
      { source: '/api/public/:path*', destination: `${contentApiOrigin}/api/public/:path*` },
      { source: '/admin', destination: `${contentApiOrigin}/admin` },
      { source: '/admin/:path*', destination: `${contentApiOrigin}/admin/:path*` },
    ] : [];
  },
};

export default nextConfig;
