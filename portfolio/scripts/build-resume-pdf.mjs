// Builds the public resume PDF from the single source of truth:
// src/features/portfolio/data/resume.json.
//
// This script renders that data into HTML (scripts/resume-template.mjs),
// writes the result to career-content/resume/resume.html as a generated
// preview (open it in a browser to check the PDF's design without
// re-running the build), then prints that HTML to the public PDF with
// Playwright + msedge.
//
// Source:  src/features/portfolio/data/resume.json
// Preview: career-content/resume/resume.html (generated — do not edit)
// Output:  portfolio/public/ABHISHEK DUTTA RESUME.pdf
//
// Usage (from the portfolio/ directory):
//   npm run resume:pdf

import { chromium } from "@playwright/test";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { renderResumeHtml } from "./resume-template.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// scripts/ -> portfolio/ -> repo root -> career-content/resume/resume.html
const repoRoot = path.resolve(__dirname, "..", "..");
const resumeDataPath = path.join(__dirname, "..", "src", "features", "portfolio", "data", "resume.json");
const generatedHtmlPath = path.join(repoRoot, "career-content", "resume", "resume.html");
const outputPdfPath = path.join(__dirname, "..", "public", "ABHISHEK DUTTA RESUME.pdf");

const GENERATED_FILE_NOTICE = `<!--
  GENERATED FILE — do not edit directly.

  This preview is generated from src/features/portfolio/data/resume.json by
  portfolio/scripts/build-resume-pdf.mjs (via resume-template.mjs). Edit the
  JSON data file and re-run "npm run resume:pdf" from portfolio/ to update
  both this preview and the PDF.
-->
`;

async function main() {
  if (!fs.existsSync(resumeDataPath)) {
    console.error(`Resume data not found at: ${resumeDataPath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(resumeDataPath, "utf-8"));
  const html = renderResumeHtml(data);

  fs.writeFileSync(generatedHtmlPath, GENERATED_FILE_NOTICE + html, "utf-8");
  console.log(`Wrote generated preview: ${generatedHtmlPath}`);

  const fileUrl = pathToFileURL(generatedHtmlPath).href;

  console.log(`Loading resume source: ${generatedHtmlPath}`);
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
