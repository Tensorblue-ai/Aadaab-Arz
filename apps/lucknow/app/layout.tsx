import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Aadaab Arz Lucknow — A Living Inheritance',
  description:
    'An immersive journey through the heritage, stories, craft and living culture of Lucknow and Awadh.',
  openGraph: {
    title: 'Aadaab Arz Lucknow',
    description: 'Where heritage lives, stories gather, and culture continues.',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aadaab Arz Lucknow',
    description: 'Where heritage lives, stories gather, and culture continues.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={roboto.variable}>{children}</body>
    </html>
  );
}
