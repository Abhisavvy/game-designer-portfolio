// Builds the public resume PDF from the maintainable HTML source.
//
// Source:  career-content/resume/resume.html
// Output:  portfolio/public/ABHISHEK DUTTA RESUME.pdf
//
// Usage (from the portfolio/ directory):
//   npm run resume:pdf

import { chromium } from "@playwright/test";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// scripts/ -> portfolio/ -> repo root -> career-content/resume/resume.html
const repoRoot = path.resolve(__dirname, "..", "..");
const sourceHtmlPath = path.join(repoRoot, "career-content", "resume", "resume.html");
const outputPdfPath = path.join(__dirname, "..", "public", "ABHISHEK DUTTA RESUME.pdf");

async function main() {
  if (!fs.existsSync(sourceHtmlPath)) {
    console.error(`Resume source not found at: ${sourceHtmlPath}`);
    process.exit(1);
  }

  const fileUrl = pathToFileURL(sourceHtmlPath).href;

  console.log(`Loading resume source: ${sourceHtmlPath}`);
  const browser = await chromium.launch({ channel: "msedge" });

  try {
    const page = await browser.newPage();
    await page.goto(fileUrl, { waitUntil: "networkidle" });

    await page.pdf({
      path: outputPdfPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    console.log(`Wrote PDF: ${outputPdfPath}`);

    try {
      const { default: pdfParseModule } = await import("pdf-parse").catch(() => ({ default: null }));
      if (pdfParseModule) {
        const data = await pdfParseModule(fs.readFileSync(outputPdfPath));
        console.log(`Page count: ${data.numpages}`);
      }
    } catch {
      // Optional page-count logging only; not a build requirement.
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
