import type { Metadata } from "next";
import { Allura, Cinzel, Poppins } from "next/font/google";
import "./globals.css";

const display = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });
const bodyFont = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const logoFont = Allura({ variable: "--font-allura", subsets: ["latin"], weight: "400" });
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
      <body className={`${display.variable} ${bodyFont.variable} ${logoFont.variable}`}>{children}</body>
    </html>
  );
}
