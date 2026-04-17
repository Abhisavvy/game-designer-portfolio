import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/app/providers";
import { SiteFooter } from "@/features/portfolio/components/SiteFooter";
import { SiteHeader } from "@/features/portfolio/components/SiteHeader";
import { SiteMetaSync } from "@/features/portfolio/components/SiteMetaSync";
import { SkipNavigation } from "@/components/SkipNavigation";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { defaultPortfolioContent } from "@/features/portfolio/data/site-content";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Ensure font-display: swap for better loading performance
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: defaultPortfolioContent.siteMeta.title,
  description: defaultPortfolioContent.siteMeta.description,
  keywords: [
    'game designer', 
    'systems designer', 
    'LiveOps', 
    'mobile games', 
    'retention mechanics', 
    'economy design',
    'Word Roll',
    'game development',
    'feature design',
    'data-driven design'
  ],
  authors: [{ name: 'Abhishek Dutta' }],
  creator: 'Abhishek Dutta',
  publisher: 'Abhishek Dutta',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://game-designer-portfolio-kappa.vercel.app/',
    siteName: defaultPortfolioContent.siteMeta.siteName,
    title: defaultPortfolioContent.siteMeta.title,
    description: defaultPortfolioContent.siteMeta.description,
    images: [
      {
        url: '/assets/general/workspace/game-design-workspace.webp',
        width: 1200,
        height: 630,
        alt: 'Abhishek Dutta - Game Designer Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultPortfolioContent.siteMeta.title,
    description: defaultPortfolioContent.siteMeta.description,
    creator: '@abhishekdutta', // Add your Twitter handle
    images: ['/assets/general/workspace/game-design-workspace.webp'],
  },
  verification: {
    // Add verification meta tags if needed
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Font preconnect for faster Google Fonts loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Theme initialization script to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('portfolio-theme') || 'dark';
                  const resolvedTheme = theme === 'system' 
                    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                    : theme;
                  document.documentElement.setAttribute('data-theme', resolvedTheme);
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased font-sans`}
      >
        <ThemeProvider defaultTheme="dark">
          <Providers>
            <SkipNavigation />
            <SiteMetaSync />
            <SiteHeader />
            <main id="main-content" className="min-h-screen bg-background pt-14">
              {children}
            </main>
            <SiteFooter />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
