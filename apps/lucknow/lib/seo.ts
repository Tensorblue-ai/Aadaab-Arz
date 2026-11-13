import type { Metadata } from 'next';

export const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://aadaabarzlucknowabroad.com').replace(/\/$/, '');
const basePath = '/home';
export const siteName = 'Aadaab Arz Lucknow';
export function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return new URL(`${basePath}${path === '/' ? '' : path}`, siteOrigin).toString();
}
export function pageMetadata(title: string, description: string, path: string, image = '/images/hero-architecture.webp', canonical = absoluteUrl(path)): Metadata {
  const fullTitle = `${title} | ${siteName}`;
  return {
    title: fullTitle, description, alternates: { canonical },
    openGraph: { type: 'website', locale: 'en_US', siteName, title: fullTitle, description, url: canonical, images: [{ url: absoluteUrl(image), alt: title }] },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [absoluteUrl(image)] },
  };
}
