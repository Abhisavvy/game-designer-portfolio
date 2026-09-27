import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/app/providers";
import { SiteFooter } from "@/features/portfolio/components/SiteFooter";
import { SiteHeader } from "@/features/portfolio/components/SiteHeader";
import { SkipNavigation } from "@/components/SkipNavigation";
import { defaultPortfolioContent } from "@/features/portfolio/data/site-content";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  // `swap` (not `optional`): `optional` was chosen to avoid a swap-induced
  // reflow, but it means the web font can simply never appear at all on a
  // slow first load — the page commits to the fallback for the whole view
  // and never reconsiders. That traded away real design quality (this face
  // IS the brand) for a CLS number. `swap` always lets the real font take
  // over once it arrives; the layout-shift half of that trade is instead
  // handled structurally (see HeroAnimated's min-height and the `<html>`
  // font-metrics fallback below) so the swap has little/nothing left to
  // shift. `adjustFontFallback` stays on its default (true): next/font still
  // generates a size-adjusted fallback face, which is what makes that
  // structural fix hold across both the fallback and the swapped-in font.
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  // See instrumentSerif above.
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://game-designer-portfolio-virid.vercel.app"),
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
    url: 'https://game-designer-portfolio-virid.vercel.app/',
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
    // No `creator` handle: the previous '@abhishekdutta' was a placeholder,
    // not a verified Twitter/X handle for this person.
    images: ['/assets/general/workspace/game-design-workspace.webp'],
  },
  verification: {
    // Add verification meta tags if needed
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets fixed elements (header, mobile menu) pad themselves out from under
  // a notch/dynamic island/home-indicator via env(safe-area-inset-*).
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      // Opts in to Next's upcoming default (it currently auto-disables
      // `scroll-behavior: smooth` during route transitions unless this is
      // set) so the smooth scroll globals.css turns on for
      // `prefers-reduced-motion: no-preference` keeps behaving the same way
      // once Next changes that default.
      data-scroll-behavior="smooth"
      // The bootstrap script below mutates this element's classList before
      // React hydrates (that's the whole point — see the script's comment),
      // so the server-rendered class list and the live DOM will legitimately
      // differ by the time hydration reconciles it. Without this, React
      // would log a hydration mismatch warning for exactly the change we
      // intend.
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans antialiased">
        {/* Marks JS as available, BEFORE the browser paints anything else in
            <body>. globals.css scopes every "hidden until revealed"
            reveal-on-scroll style to `.js`, so: a no-JS visitor (this script
            never having run) always sees fully visible content, and a JS
            visitor sees the hidden pose from a below-fold element's very
            FIRST paint instead of a later effect yanking already-visible
            content hidden.
              A PLAIN native <script> tag, deliberately NOT `next/script`'s
            `<Script strategy="beforeInteractive">`: despite that strategy's
            name/docs, it does not emit a directly-executing inline script —
            it emits `(self.__next_s=...).push([...])`, a queue that Next's
            OWN client runtime JS reads and executes later. Measured on a
            throttled mobile profile (4x CPU, ~9Mbps/150ms RTT — see
            scratchpad/qa/results/hero-hide-diag.json): that runtime can take
            4+ SECONDS to load/parse/run, during which `.js` was never on
            <html> at all — every `.js`-gated element (this hero's cards
            included) rendered fully VISIBLE at first paint (the raw SSR
            pose), then SNAPPED hidden mid-experience the instant `.js`
            finally landed, before playing its entrance — the exact
            flash-then-hide bug this whole mechanism exists to prevent. A
            plain <script> tag has none of that indirection: the browser's
            OWN HTML parser executes it the instant it's reached, blocking
            further parsing until it does, regardless of how slow the JS
            bundle is to arrive.

            The timeout is the hero cards' failsafe: they're hidden
            (`!important`) until LoomCard mounts and drops
            `.loom-card-entrance`. If the bundle never hydrates, that never
            happens, so after 10s `.js-stalled` shows them at rest instead of
            leaving the hand invisible. */}
        <script
          id="js-flag"
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');setTimeout(function(){if(document.querySelector('.loom-card-entrance'))document.documentElement.classList.add('js-stalled')},10000)",
          }}
        />
        <Providers>
          <SkipNavigation />
          <SiteHeader />
          <main
            id="main-content"
            className="min-h-screen pt-[calc(88px+env(safe-area-inset-top))]"
          >
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
