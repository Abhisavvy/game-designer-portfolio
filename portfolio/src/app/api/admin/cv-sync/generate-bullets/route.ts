import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { cvBulletGenerator } from "@/features/admin/utils/cv-bullet-generator";
import { defaultPortfolioContent } from "@/features/portfolio/data/site-content";

const generateBulletsSchema = z.object({
  projectSlugs: z.array(z.string()),
  format: z.enum(["tight", "standard", "narrative"]),
  focusArea: z.enum(["impact", "technical", "leadership", "process"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parseResult = generateBulletsSchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const { projectSlugs, format, focusArea } = parseResult.data;
    const { projects, caseStudies } = defaultPortfolioContent;

    const requestedProjects = projects.filter((p) =>
      projectSlugs.includes(p.slug),
    );

    if (requestedProjects.length === 0) {
      return NextResponse.json(
        { error: "No matching projects found" },
        { status: 404 },
      );
    }

    const allBullets = requestedProjects.flatMap((project) =>
      cvBulletGenerator.generateBullets(project, caseStudies[project.slug], {
        format,
        focusArea,
      }),
    );

    return NextResponse.json({
      bullets: allBullets,
      projectCount: requestedProjects.length,
      format,
      focusArea,
    });
  } catch (error) {
    console.error("Failed to generate CV bullets:", error);
    return NextResponse.json(
      { error: "Failed to generate CV bullets" },
      { status: 500 },
    );
  }
}
