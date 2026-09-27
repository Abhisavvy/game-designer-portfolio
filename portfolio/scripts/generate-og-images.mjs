// Generates the link-preview images (Open Graph / Twitter cards) for every
// case study: public/og/work-<slug>.jpg, 1200x630, one per entry in
// `caseStudySlugs`.
//
// Source of truth: src/features/portfolio/data/site-content.ts — the exact
// same data the live /work/[slug] pages render from (case study title,
// subtitle, hero poster, and the matching project's card blurb + headline
// stat). That file is TypeScript with no JSON twin (unlike resume.json, see
// build-resume-pdf.mjs), so this script bundles it — and its sibling
// case-study-media.ts — with esbuild (already a transitive project
// dependency, no new package added), writes the bundled output to a
// throwaway file in the OS temp dir, and dynamically imports it. Both files
// are pure data/types with no framework imports, so the bundle is tiny and
// side-effect free.
//
// Rendering: a small HTML template (dark ink background, Instrument Serif
// title, JetBrains Mono tag line/stat/brand line, the case study's own hero
// art framed on the right) is loaded in a real browser via Playwright
// (`chromium.launch({ channel: "msedge" })`, i.e. the system-installed Edge
// — no Playwright browser download) and screenshotted straight to JPEG.
//
// Usage (from portfolio/):
//   npm run og:images
//   PW_CHANNEL=chrome npm run og:images   (use a different installed channel)

import { chromium } from "@playwright/test";
import esbuild from "esbuild";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const publicDir = path.join(projectRoot, "public");
const outDir = path.join(publicDir, "og");
const siteContentPath = path.join(
  projectRoot,
  "src",
  "features",
  "portfolio",
  "data",
  "site-content.ts",
);

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const JPEG_QUALITY = 85;
const MAX_BYTES = 300 * 1024;
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Instrument+Serif&family=JetBrains+Mono:wght@500;700&display=swap";
const MIME_BY_EXT = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

/**
 * Reads a `public/`-relative asset (e.g. a case study's `media.hero.posterSrc`)
 * and returns it as a `data:` URI. The page this renders is loaded via
 * `page.setContent()`, which gives it an opaque (non-`file://`) origin —
 * Chromium refuses to load `file://` resources from that origin (the image
 * request is silently blocked, rendering as a broken-image icon), so the
 * hero art is inlined instead of referenced by path.
 */
function toDataUri(publicRelativePath) {
  const abs = path.join(publicDir, publicRelativePath.replace(/^\/+/, ""));
  const mime = MIME_BY_EXT[path.extname(abs).toLowerCase()] ?? "application/octet-stream";
  const base64 = fs.readFileSync(abs).toString("base64");
  return `data:${mime};base64,${base64}`;
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Loads `defaultPortfolioContent` / `caseStudySlugs` from site-content.ts
 * without a TS runtime dependency: bundles it with esbuild (inlining its
 * case-study-media.ts sibling), writes the plain-JS result to the OS temp
 * dir, and dynamically imports it as ESM. The temp file is removed again
 * once the import has resolved.
 */
async function loadSiteContent() {
  const result = await esbuild.build({
    entryPoints: [siteContentPath],
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    target: "node18",
  });
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "og-images-"));
  const tmpFile = path.join(tmpDir, "site-content.mjs");
  fs.writeFileSync(tmpFile, result.outputFiles[0].text, "utf-8");
  try {
    return await import(pathToFileURL(tmpFile).href);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

/** The project card (from `projects` or `personalProjects`) matching this
 *  case study slug — source of the blurb (used by generateMetadata, not by
 *  this script) and the headline stat rendered on the card. */
function findProject(site, slug) {
  return [...site.projects, ...site.personalProjects].find((p) => p.slug === slug);
}

/** public/icon.svg, resized to sit inside the small brand tile — the file's
 *  own width/height attrs are favicon-sized, so they're stripped in favour
 *  of the `.brand-mark svg` CSS rule. */
function readBrandIcon() {
  const raw = fs.readFileSync(path.join(publicDir, "icon.svg"), "utf-8");
  return raw.replace(/<svg([^>]*)>/, (_m, attrs) =>
    `<svg${attrs.replace(/\s(width|height)="[^"]*"/g, "")}>`,
  );
}

function renderCardHtml({ study, project, brandText, iconSvg }) {
  const stat = project?.stats?.[0];
  const heroPosterSrc = study.media?.hero?.posterSrc;
  const heroSrc = heroPosterSrc ? toDataUri(heroPosterSrc) : "";
  // Every title in this dataset fits in two lines at 72px within the 508px
  // text column except the two longest ("Kinoa LiveOps Integration", "Word
  // of the Day (WOTD)") — those drop to 64px, the spec's stated legibility
  // floor for a title shrunk to a ~500px-wide preview.
  const titleSize = study.title.length > 16 ? 64 : 72;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="${FONTS_HREF}" rel="stylesheet" />
<style>
  :root {
    --ink: #0B0A09;
    --ink-2: #141210;
    --paper: #F5F1EA;
    --muted: #A8A29E;
    --accent: #F97316;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${CARD_WIDTH}px;
    height: ${CARD_HEIGHT}px;
    overflow: hidden;
    background: var(--ink);
  }
  body {
    position: relative;
    font-family: "JetBrains Mono", ui-monospace, monospace;
    /* A faint 60px grid (blueprint texture) under the vertical ink gradient
       — decorative only, kept subtle so it never competes with the text. */
    background-image:
      linear-gradient(to right, rgba(245, 241, 234, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(245, 241, 234, 0.05) 1px, transparent 1px),
      linear-gradient(180deg, var(--ink) 0%, var(--ink-2) 100%);
    background-size: 60px 60px, 60px 60px, 100% 100%;
  }
  .vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(120% 70% at 50% 0%, transparent 40%, rgba(0, 0, 0, 0.55) 100%);
  }
  /* Inset well clear of all four edges: LinkedIn/X show this small, and some
     apps crop a 1.9:1 image toward 2:1, so nothing load-bearing sits within
     ~48-56px of an edge. */
  .safe {
    position: absolute;
    inset: 48px 56px;
    display: flex;
    gap: 40px;
  }
  .col-text {
    width: 508px;
    flex: none;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: none;
  }
  .brand-mark {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
  }
  .brand-mark svg { width: 18px; height: 18px; }
  .brand-text {
    font-size: 20px;
    font-weight: 500;
    letter-spacing: 0.01em;
    color: var(--paper);
    opacity: 0.92;
  }
  /* Centers the tagline+title pair in whatever vertical space is left
     between the brand row and the stat block (or the bottom, when a case
     study's matching project has no stats). */
  .middle {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 16px;
  }
  .tagline {
    font-size: 20px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
    line-height: 1.4;
  }
  .title {
    font-family: "Instrument Serif", Georgia, serif;
    font-size: ${titleSize}px;
    line-height: 1.08;
    color: var(--paper);
    font-weight: 400;
  }
  .stat {
    flex: none;
    border-top: 1px dashed rgba(245, 241, 234, 0.25);
    padding-top: 18px;
  }
  .stat-value {
    font-size: 52px;
    font-weight: 700;
    color: var(--accent);
    line-height: 1;
  }
  /* The label is what makes the number mean something, so it has to stay
     readable in a ~500px-wide preview (24px here -> ~10px there). */
  .stat-label {
    margin-top: 10px;
    font-size: 24px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
  }
  /* The frame takes the artwork's own aspect ratio, vertically centred, so a
     wide banner shows in full instead of being cover-cropped mid-word; art
     taller than the column is capped at the column height and cover-cropped. */
  .col-image {
    width: 540px;
    flex: none;
    position: relative;
    display: flex;
    align-items: center;
  }
  .frame {
    position: relative;
    width: 100%;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid rgba(249, 115, 22, 0.45);
    background: #000;
  }
  .frame img {
    width: 100%;
    height: auto;
    max-height: 532px;
    object-fit: cover;
    object-position: center;
    display: block;
  }
  .frame .shade {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(11, 10, 9, 0) 55%, rgba(11, 10, 9, 0.55) 100%),
      linear-gradient(90deg, rgba(11, 10, 9, 0.35) 0%, rgba(11, 10, 9, 0) 20%);
  }
  /* Corner registration marks, echoing the live case-study page's
     PinnedFrame/CornerMarks treatment — "framed nicely" without adding a
     text caption (this template is already at its ~4-text-element budget). */
  .corner {
    position: absolute;
    width: 18px;
    height: 18px;
    border-color: var(--accent);
  }
  .corner.tl { top: 10px; left: 10px; border-top: 2px solid; border-left: 2px solid; }
  .corner.tr { top: 10px; right: 10px; border-top: 2px solid; border-right: 2px solid; }
  .corner.bl { bottom: 10px; left: 10px; border-bottom: 2px solid; border-left: 2px solid; }
  .corner.br { bottom: 10px; right: 10px; border-bottom: 2px solid; border-right: 2px solid; }
</style>
</head>
<body>
  <div class="vignette"></div>
  <div class="safe">
    <div class="col-text">
      <div class="brand">
        <span class="brand-mark">${iconSvg}</span>
        <span class="brand-text">${esc(brandText)}</span>
      </div>
      <div class="middle">
        <div class="tagline">${esc(study.subtitle)}</div>
        <div class="title">${esc(study.title)}</div>
      </div>
      ${
        stat
          ? `<div class="stat">
        <div class="stat-value">${esc(stat.value)}</div>
        <div class="stat-label">${esc(stat.label)}</div>
      </div>`
          : ""
      }
    </div>
    <div class="col-image">
      <div class="frame">
        ${heroSrc ? `<img src="${esc(heroSrc)}" alt="" />` : ""}
        <div class="shade"></div>
        <span class="corner tl"></span>
        <span class="corner tr"></span>
        <span class="corner bl"></span>
        <span class="corner br"></span>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function renderOne(browser, { slug, study, project, brandText, iconSvg }) {
  const html = renderCardHtml({ study, project, brandText, iconSvg });
  const page = await browser.newPage({
    viewport: { width: CARD_WIDTH, height: CARD_HEIGHT },
    deviceScaleFactor: 1,
  });
  try {
    await page.setContent(html, { waitUntil: "networkidle", timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(
      () => Array.from(document.images).every((img) => img.complete),
    );

    const outPath = path.join(outDir, `work-${slug}.jpg`);
    let quality = JPEG_QUALITY;
    let buffer = await page.screenshot({ type: "jpeg", quality });
    // Safety net for the ≤300KB budget — not expected to trigger for these
    // photographic hero images at q85, but degrades gracefully if one does.
    while (buffer.length > MAX_BYTES && quality > 50) {
      quality -= 10;
      buffer = await page.screenshot({ type: "jpeg", quality });
    }
    fs.writeFileSync(outPath, buffer);
    return { slug, bytes: buffer.length, quality, outPath };
  } finally {
    await page.close();
  }
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const mod = await loadSiteContent();
  const site = mod.defaultPortfolioContent;
  const slugs = mod.caseStudySlugs;
  const brandText = `${site.person.name} · ${site.person.role.split(" · ")[0]}`;
  const iconSvg = readBrandIcon();

  const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || "msedge" });
  const results = [];
  try {
    for (const slug of slugs) {
      const study = site.caseStudies[slug];
      if (!study) {
        console.warn(`Skipping "${slug}": no case study entry in site-content.ts.`);
        continue;
      }
      const project = findProject(site, slug);
      const result = await renderOne(browser, { slug, study, project, brandText, iconSvg });
      console.log(
        `Wrote ${path.relative(projectRoot, result.outPath)} ` +
          `(${(result.bytes / 1024).toFixed(1)} KB, quality ${result.quality})`,
      );
      results.push(result);
    }
  } finally {
    await browser.close();
  }

  const missing = slugs.filter((slug) => !results.some((r) => r.slug === slug));
  const oversized = results.filter((r) => r.bytes > MAX_BYTES);
  if (missing.length || oversized.length) {
    if (missing.length) console.error(`No image generated for: ${missing.join(", ")}`);
    if (oversized.length)
      console.error(`Still over the 300KB budget: ${oversized.map((r) => r.slug).join(", ")}`);
    process.exitCode = 1;
  } else {
    console.log(`Generated ${results.length} OG image(s) in ${path.relative(projectRoot, outDir)}/`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
