import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({ variable: "--font-roboto", subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Aadaab Arz Lucknow Abroad — Discover Lucknow",
  description: "A thoughtful international guide to Lucknow’s heritage, people, craft and living culture.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.variable}>{children}</body>
    </html>
  );
}
