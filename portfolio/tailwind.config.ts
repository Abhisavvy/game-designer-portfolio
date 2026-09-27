import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "475px",
        // CSS-only match for "wide enough AND tall enough to show the full
        // desktop nav" — mirrors SiteHeader's own JS media-query check, so
        // the desktop nav/hamburger toggle works identically with no JS.
        nav: { raw: "(min-width: 768px) and (min-height: 480px)" },
      },
      colors: {
        ink: "#0B0A09",
        "ink-2": "#141210",
        paper: "#F5F1EA",
        muted: "#A8A29E",
        accent: "#F97316",
        thread: {
          economy: "#F97316",
          retention: "#2DD4BF",
          liveops: "#A78BFA",
          monetization: "#FB7185",
          systems: "#FACC15",
          ai: "#38BDF8",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
