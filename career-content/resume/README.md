# Resume source

- The single source of truth for resume content is
  `portfolio/src/features/portfolio/data/resume.json` (typed shape in
  `portfolio/src/features/portfolio/components/resume/types.ts`). Edit that
  JSON file to update the resume — do not invent or edit facts anywhere else.
- Rebuild by running `npm run resume:pdf` from the `portfolio/` directory.
  This reads `resume.json`, renders it through
  `portfolio/scripts/resume-template.mjs`, and:
  - writes the rendered document to `resume.html` in this folder (a
    **generated preview** — it has a "do not edit" comment at the top and is
    overwritten on every build; open it in a browser to check the PDF's
    design without re-running Playwright), and
  - prints that HTML to `portfolio/public/ABHISHEK DUTTA RESUME.pdf`, which
    is what the site serves and what the `/resume` web page links to.
- Both the website `/resume` page and the PDF read from the same
  `resume.json` data, so editing it and running `npm run resume:pdf` keeps
  everything in sync.
- The PDF build uses Playwright + local Microsoft Edge
  (`chromium.launch({ channel: "msedge" })`) via
  `portfolio/scripts/build-resume-pdf.mjs`.
