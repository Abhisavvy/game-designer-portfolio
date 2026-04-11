# Portfolio deployment and environment checklist

The site lives in `portfolio/` (Next.js App Router).

## Prerequisites

- Node.js 20+ recommended.
- `cd portfolio && npm install && npm run build` should succeed locally before deploying.

## Recommended: Vercel

1. Push `career-workspace` (or a repo containing `portfolio/` as the app root) to GitHub/GitLab/Bitbucket.
2. In [Vercel](https://vercel.com): **Add New Project** → import the repo.
3. Set **Root Directory** to `portfolio` if the repository root is `career-workspace`.
4. Framework preset: **Next.js**. Build: `npm run build`, Output: default.
5. Deploy. Custom domain: Project → Settings → Domains.

**Environment variables:** Add only what your app uses (analytics, CMS, etc.). The starter template has **no required** env vars.

| Variable | When needed |
|----------|-------------|
| `NEXT_PUBLIC_*` | Client-exposed config (e.g. public API URL, analytics ID) |
| Server-only secrets | API routes, server actions, webhooks — never prefix with `NEXT_PUBLIC_` |

## Alternative: Cloudflare Pages

1. Connect the repo in Cloudflare Pages.
2. Root directory: `portfolio`.
3. Build command: `npm run build` (or `npx @cloudflare/next-on-pages` if you adopt their Next adapter — follow current Cloudflare Next.js docs).
4. Output directory per adapter docs (often `.vercel/output/static` or framework-specific).

Verify compatibility of your Next.js version with the chosen adapter.

## Alternative: Node server / Docker

Run `npm run build && npm run start` behind a reverse proxy, or containerize with a multi-stage Dockerfile (Node image, copy `portfolio/`, install, build, expose 3000).

## Post-deploy

- Smoke test: home, links, metadata (title/description in `layout.tsx`).
- Add `favicon.ico` and Open Graph image under `portfolio/public/` when ready.
- Point your CV (Reactive Resume PDF) link to a stable URL (Vercel deployment or cloud storage).

## Reactive Resume hosting (separate)

The CV builder is **not** the same deploy as the marketing portfolio. Options:

- Run **locally with Docker** only when editing/exporting PDFs.
- **Self-host** RR on a VPS or PaaS (Postgres + storage + printer). See [Self-Hosting](https://docs.rxresu.me/self-hosting/docker).

Do not confuse Vercel env vars for `portfolio/` with Reactive Resume’s `.env` (database, storage, auth).
