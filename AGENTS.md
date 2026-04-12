# Career workspace

This folder groups your CV tooling and public portfolio. Open **`career-workspace`** as the single root in Cursor (File → Open Folder).

## Layout

| Path | Purpose |
|------|---------|
| `reactive-resume/` | Clone of [Reactive Resume](https://github.com/amruthpillai/reactive-resume). Edit in the app; export **PDF** (best layout fidelity) or **DOCX** when Word is required. See [docs/REACTIVE-RESUME.md](docs/REACTIVE-RESUME.md). |
| `portfolio/` | Next.js (App Router) site for your public portfolio. Run `npm install` then `npm run dev`. **Edit copy in the browser:** [Edit portfolio](http://localhost:3000/edit) (saved in `localStorage` key `portfolio-site-editor-v2`). **CV:** [CV builder](http://localhost:3000/cv-builder) exports Reactive Resume JSON. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). |
| `career-content/` | Optional notes, YAML/Markdown source snippets, or exports (JSON) for AI-assisted edits. |
| `docs/prompts/` | Copy-paste prompts for CV bullets, case studies, and JD tailoring. |
| `skills/career-sync/` | Cursor skill (duplicate at `.cursor/skills/career-sync/` for discovery). Optionally also copy to `~/.cursor/skills-cursor/career-sync/` for global use. |

## Quick commands

```bash
# Reactive Resume (Docker — from reactive-resume/)
cd reactive-resume && docker compose up -d
# App: http://localhost:3000

# Portfolio
cd portfolio && npm install && npm run dev
# App: http://localhost:3000 — if both run, change one port: npm run dev -- -p 3001
```

## Design references

- Portfolio UX inspiration: [NoCodefolio](https://github.com/maheshpaulj/NoCodefolio) (patterns only; this repo uses a custom Next.js app).

## AI in Cursor

- Rules: `.cursor/rules/career-materials.mdc` (game design voice, Word Roll consistency, PDF-first CV).
- Say: “update my CV”, “add Word Roll feature to portfolio”, “tailor CV to this JD” to trigger the career-sync skill workflow.
