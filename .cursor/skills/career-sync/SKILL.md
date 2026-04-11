---
name: career-sync
description: >-
  Sync game-design CV content with the Next.js portfolio: ingest achievements or
  job descriptions, draft CV bullets (tight/standard/narrative), outline case
  studies, run terminology checklist, remind to export PDF from Reactive Resume.
---

# Career sync (CV + portfolio)

Use this skill when the user says things like: **update my CV**, **add Word Roll feature to portfolio**, **tailor CV to this JD**, **sync resume and site**, or **career materials**.

## Context

- **CV:** [Reactive Resume](https://github.com/amruthpillai/reactive-resume) lives in `reactive-resume/`. Canonical artifact is **PDF export** after content freeze.
- **Portfolio:** Next.js app in `portfolio/`. Case studies: problem → design → constraints → outcome.
- **Drafts / notes:** Optional `career-content/` for raw achievements and consistent naming.
- **Workspace rules:** Follow `.cursor/rules/career-materials.mdc` (Word Roll spelling, no invented metrics).

## Workflow

### 1. Ingest

- If they paste a **job description**: extract must-have themes (genre, tools, seniority, multiplayer, live ops, AI, etc.).
- If they paste an **achievement** or feature: capture scope, timeframe, team role, measurable outcome (or “outcome TBD”).
- If they reference **Word Roll** or **AI tools**: confirm exact product names and what is public vs. under NDA.

### 2. Draft outputs

Always produce:

1. **CV bullets — three variants**
   - *Tight:* one line each, max ~90 characters where possible.
   - *Standard:* one line each, full STAR-style implication.
   - *Narrative:* 2–3 short bullets for a “featured” role block.
2. **Portfolio outline** (if relevant): suggested H1/H2, 3–5 section headings, CTA (contact / resume PDF link), image or video placeholders.
3. **Mirror map:** which new CV bullets correspond to which portfolio section.

### 3. Sync checklist (run mentally and list gaps)

- [ ] **Word Roll** and other names match across CV, portfolio, and `career-content/`.
- [ ] Dates and titles consistent.
- [ ] No invented metrics; flag **TBD** where needed.
- [ ] Links: store page, trailer, GitHub, itch, press — only if user provided them.

### 4. Handoff

- Tell them to paste **standard** bullets into Reactive Resume (or import JSON if they use export/import).
- Remind: **Export PDF** from Reactive Resume when the section is done.
- For portfolio: point to files under `portfolio/src/app/` to implement the outline.

### 5. Word (.docx) requests

Reactive Resume supports **DOCX export** from the builder. Suggest using it when they need Word; remind them to proofread layout. If export fails (e.g. printer/storage issues), fall back to PDF or PDF→Word conversion.

## Triggers

- CV update, new shipped feature, new job posting, portfolio case study draft, or “make my resume match this site section.”
