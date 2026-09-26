# Resume source

- Edit `resume.html` (single self-contained file, inline CSS) to update the resume content.
- Rebuild the PDF by running `npm run resume:pdf` from the `portfolio/` directory.
- Output is written to `portfolio/public/ABHISHEK DUTTA RESUME.pdf`, which is what the site serves.
- The build uses Playwright + local Microsoft Edge (`chromium.launch({ channel: "msedge" })`) via `portfolio/scripts/build-resume-pdf.mjs`.
