import { OrganizationSchema } from '@/components/Seo';
import { pageMetadata, siteOrigin } from '@/lib/seo';
import type { Metadata } from 'next';
import { Cinzel, Poppins } from 'next/font/google';
import './globals.css';

const display = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const bodyFont = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = { metadataBase: new URL(siteOrigin), ...pageMetadata('Heritage, Culture & Community', 'Explore Lucknow’s heritage, stories, craft, music and cultural gatherings with Aadaab Arz.', '/') };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${bodyFont.variable}`}><OrganizationSchema />{children}</body>
    </html>
  );
}
