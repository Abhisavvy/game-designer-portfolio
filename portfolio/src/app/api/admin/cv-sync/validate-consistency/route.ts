import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { cvBulletGenerator } from "@/features/admin/utils/cv-bullet-generator";
import { defaultPortfolioContent } from "@/features/portfolio/data/site-content";

const validateConsistencySchema = z.object({
  projectSlugs: z.array(z.string()).optional(),
  /** Reactive Resume JSON or partial export — parsed loosely for text extraction. */
  cvData: z.unknown().optional(),
});

export async function POST(request: NextRequest) {
  try {
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parseResult = validateConsistencySchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const { projectSlugs, cvData } = parseResult.data;
    let projects = defaultPortfolioContent.projects;
    const { caseStudies } = defaultPortfolioContent;

    if (projectSlugs && projectSlugs.length > 0) {
      projects = projects.filter((p) => projectSlugs.includes(p.slug));
    }

    const issues = cvBulletGenerator.validateConsistency(
      projects,
      caseStudies,
      cvData,
    );

    const groupedIssues = {
      high: issues.filter((i) => i.severity === "high"),
      medium: issues.filter((i) => i.severity === "medium"),
      low: issues.filter((i) => i.severity === "low"),
    };

    return NextResponse.json({
      issues: groupedIssues,
      totalIssues: issues.length,
      projectsChecked: projects.length,
      summary: {
        highSeverity: groupedIssues.high.length,
        mediumSeverity: groupedIssues.medium.length,
        lowSeverity: groupedIssues.low.length,
      },
    });
  } catch (error) {
    console.error("Failed to validate consistency:", error);
    return NextResponse.json(
      { error: "Failed to validate consistency" },
      { status: 500 },
    );
  }
}
