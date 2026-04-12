import { NextResponse } from "next/server";

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
