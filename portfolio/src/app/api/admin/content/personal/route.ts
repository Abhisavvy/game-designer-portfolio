import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { ASTManipulator } from "@/features/admin/utils/ast-manipulator";
import type { AdminPersonalInfo } from "@/features/admin/types/admin";
import { defaultPortfolioContent } from "@/features/portfolio/data/site-content";
import path from "path";

const SITE_CONTENT_PATH = path.join(
  process.cwd(),
  "src/features/portfolio/data/site-content.ts",
);

const personalBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  tagline: z.string().min(1, "Tagline is required"),
  location: z.string().min(1, "Location is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(1, "Phone is required"),
  linkedin: z.string().url("Valid LinkedIn URL required"),
  bio: z.string().optional(),
});

const putBodySchema = z.object({
  personal: personalBodySchema,
});

export async function GET() {
  try {
    const c = defaultPortfolioContent;
    const personal: AdminPersonalInfo = {
      name: c.person.name,
      role: c.person.role,
      tagline: c.person.tagline,
      location: c.person.location,
      email: c.person.email,
      phone: c.person.phone,
      linkedin: c.person.links.linkedin,
      bio: c.about.body ?? "",
    };

    return NextResponse.json({ personal });
  } catch (error) {
    console.error("Failed to load personal info:", error);
    return NextResponse.json(
      { error: "Failed to load personal info" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const parsed = putBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { personal } = parsed.data;
    const payload: AdminPersonalInfo = {
      ...personal,
      bio: personal.bio ?? "",
    };

    const astManipulator = new ASTManipulator(SITE_CONTENT_PATH);
    astManipulator.updatePersonalInfo(payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update personal info:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update personal info";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
