import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/app/providers";
import { SiteFooter } from "@/features/portfolio/components/SiteFooter";
import { SiteHeader } from "@/features/portfolio/components/SiteHeader";
import { SiteMetaSync } from "@/features/portfolio/components/SiteMetaSync";
import { defaultPortfolioContent } from "@/features/portfolio/data/site-content";
import "./globals.css";
import "../styles/print.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: defaultPortfolioContent.siteMeta.title,
  description: defaultPortfolioContent.siteMeta.description,
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased font-sans`}
      >
        <Providers>
          <SiteMetaSync />
          <SiteHeader />
          <div className="min-h-screen bg-zinc-950 pt-14">{children}</div>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
