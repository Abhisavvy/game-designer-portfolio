import { NextResponse } from "next/server";

/**
 * Production stub for Route Handlers under `src/app/admin/` (`route.ts`, `route.js`, …).
 * Mirrors `api-route.ts` so HTTP verbs stay defined without bundling real admin handlers.
 */
async function adminOmitted() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export const GET = adminOmitted;
export const POST = adminOmitted;
export const PUT = adminOmitted;
export const PATCH = adminOmitted;
export const DELETE = adminOmitted;
export const HEAD = adminOmitted;
export const OPTIONS = adminOmitted;
