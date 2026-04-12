import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import path from 'path';
import { ASTManipulator } from '@/features/admin/utils/ast-manipulator';
import { triggerHotReloadAndDeploy } from '@/features/admin/utils/hot-reload';
import type { CaseStudy } from '@/features/portfolio/data/site-content';
import { adminCaseStudyScalarSchema } from '@/features/admin/validation/admin-api-schemas';

const SITE_CONTENT_PATH = path.join(
  process.cwd(),
  'src/features/portfolio/data/site-content.ts',
);

function toAdminCaseStudy(study: CaseStudy): Record<string, unknown> {
  return {
    title: study.title,
    subtitle: study.subtitle,
    problem: study.problem,
    approach: study.approach,
    constraints: study.constraints,
    outcome: study.outcome,
    contributions: study.contributions ?? '',
    links: study.links ?? [],
    media: study.media ?? { hero: { posterSrc: '/assets/placeholder-image.svg' } },
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectSlug = searchParams.get('projectSlug');

    if (!projectSlug) {
      return NextResponse.json(
        { error: 'Project slug is required' },
        { status: 400 },
      );
    }

    const siteContent = await import('@/features/portfolio/data/site-content');
    const study = siteContent.defaultPortfolioContent.caseStudies[projectSlug];

    if (!study) {
      return NextResponse.json({
        caseStudy: {
          title: '',
          subtitle: '',
          problem: '',
          approach: '',
          constraints: '',
          outcome: '',
          contributions: '',
          links: [] as { label: string; href: string }[],
          media: { hero: { posterSrc: '' } },
        },
      });
    }

    return NextResponse.json({ caseStudy: toAdminCaseStudy(study) });
  } catch (error) {
    console.error('Failed to load case study:', error);
    return NextResponse.json(
      { error: 'Failed to load case study' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { projectSlug, caseStudy } = await request.json();

    if (!projectSlug || typeof projectSlug !== 'string') {
      return NextResponse.json(
        { error: 'Project slug is required' },
        { status: 400 },
      );
    }

    const validated = adminCaseStudyScalarSchema.parse(caseStudy);

    const astManipulator = new ASTManipulator(SITE_CONTENT_PATH);
    astManipulator.updateCaseStudyScalars(projectSlug, validated);

    await triggerHotReloadAndDeploy(
      SITE_CONTENT_PATH,
      `Case study copy updated: ${projectSlug}`,
    );

    return NextResponse.json({
      success: true,
      applied: validated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid case study data', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Failed to save case study:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to save case study';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
