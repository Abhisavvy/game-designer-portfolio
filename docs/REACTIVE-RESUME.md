# Reactive Resume — local run, PDF export, Word workaround

Upstream: [github.com/amruthpillai/reactive-resume](https://github.com/amruthpillai/reactive-resume) · Docs: [docs.rxresu.me](https://docs.rxresu.me)

## Quick start (Docker)

From `reactive-resume/`:

```bash
docker compose up -d
```

Open [http://localhost:3000](http://localhost:3000). If this collides with the portfolio dev server, stop one stack or change ports per Docker/Compose docs.

For development-oriented setup, see `compose.dev.yml` and [Development Setup](https://docs.rxresu.me/contributing/development).

## Stack (expect)

- PostgreSQL, printer service (Chromium) for PDF/screenshots, optional S3-compatible storage (e.g. SeaweedFS) for uploads.

Configure environment variables as described in [Self-Hosting (Docker)](https://docs.rxresu.me/self-hosting/docker). Copy `.env.example` if the repo provides one and fill secrets for production.

## PDF export (canonical CV)

1. Create or edit your resume in the UI.
2. Use the app’s **export** flow to generate **PDF**.  
   Guide: [Exporting your resume](https://docs.rxresu.me/guides/exporting-your-resume).

Treat the PDF as the **canonical** artifact for applications unless you maintain a separate Word pipeline.

## JSON export / backup

Reactive Resume supports **JSON** export/import. Use this to back up data or to store a copy under `career-content/` (keep private if it contains personal data).

## Word (.docx)

The builder includes **DOCX export** (see the export sidebar / dock in the resume editor). Use it when a recruiter or portal wants an editable Word file. Layout may differ slightly from PDF; **proofread** after export.

**If DOCX is unavailable or fails in your environment:**

1. **PDF** — Still the default for visual fidelity; most recipients accept it.
2. **PDF → Word** — One-off open in Word/LibreOffice and fix layout.
3. **Parallel template** — Short `.docx` with contact block + pasted bullets for rigid forms.

## Troubleshooting

- PDF blank or errors: ensure the **printer** service is running and logs are clean (see upstream issues and docs).
- Database connection errors: verify Postgres is up and `DATABASE_URL` (or equivalent) matches compose services.
