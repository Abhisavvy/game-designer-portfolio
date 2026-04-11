# Import this starter into Reactive Resume

1. Start Reactive Resume (from `reactive-resume/`): `docker compose up -d` → open `http://localhost:3000` (or your deployed URL).
2. Sign in / create an account (self-hosted).
3. Open **Dashboard** → **Import** (or create a new resume and use Import from the menu).
4. Choose format **Reactive Resume (JSON)**.
5. Upload [`reactive-resume-starter.json`](reactive-resume-starter.json) or paste its contents.
6. Replace placeholders: name, email, links, Word Roll dates, studio name, real bullets, and metrics you are allowed to share.
7. Pick a **template** in the builder if you want a different look than the default in the file (`azurill` is set in JSON; you can change in UI).
8. **Export** PDF (and DOCX if needed) from the builder sidebar.

If import fails on an older instance, try **Reactive Resume v4 (JSON)** or create a blank resume and paste section content manually from this file.

Schema reference: `reactive-resume/skills/resume-builder/references/schema.md` or [rxresu.me/schema.json](https://rxresu.me/schema.json).
