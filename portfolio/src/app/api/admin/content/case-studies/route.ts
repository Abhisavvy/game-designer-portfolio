import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const caseStudySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  problem: z.string().min(1, 'Problem description is required'),
  approach: z.string().min(1, 'Approach description is required'),
  constraints: z.string().min(1, 'Constraints description is required'),
  outcome: z.string().min(1, 'Outcome description is required'),
  contributions: z.string().optional(),
  links: z.array(z.object({
    label: z.string(),
    href: z.string().url(),
  })).optional(),
  media: z.object({
    hero: z.object({
      posterSrc: z.string(),
    }),
    processGallery: z.object({
      groupId: z.string(),
      heading: z.string(),
      items: z.array(z.object({
        thumb: z.string(),
        full: z.string(),
        alt: z.string(),
        label: z.string(),
      })),
    }).optional(),
  }).optional(),
});

const CASE_STUDIES_DIR = path.join(process.cwd(), 'data', 'case-studies');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectSlug = searchParams.get('projectSlug');

    if (!projectSlug) {
      return NextResponse.json(
        { error: 'Project slug is required' },
        { status: 400 }
      );
    }

    const caseStudyPath = path.join(CASE_STUDIES_DIR, `${projectSlug}.json`);

    if (!existsSync(caseStudyPath)) {
      // Return empty case study structure
      return NextResponse.json({
        caseStudy: {
          title: '',
          subtitle: '',
          problem: '',
          approach: '',
          constraints: '',
          outcome: '',
          contributions: '',
          links: [],
          media: {
            hero: { posterSrc: '' },
          },
        }
      });
    }

    const data = await readFile(caseStudyPath, 'utf-8');
    const caseStudy = JSON.parse(data);

    return NextResponse.json({ caseStudy });
  } catch (error) {
    console.error('Failed to load case study:', error);
    return NextResponse.json(
      { error: 'Failed to load case study' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { projectSlug, caseStudy } = await request.json();

    if (!projectSlug) {
      return NextResponse.json(
        { error: 'Project slug is required' },
        { status: 400 }
      );
    }

    // Validate case study data
    const validatedCaseStudy = caseStudySchema.parse(caseStudy);

    // Ensure directory exists
    if (!existsSync(CASE_STUDIES_DIR)) {
      await mkdir(CASE_STUDIES_DIR, { recursive: true });
    }

    // Save case study
    const caseStudyPath = path.join(CASE_STUDIES_DIR, `${projectSlug}.json`);
    await writeFile(caseStudyPath, JSON.stringify(validatedCaseStudy, null, 2));

    return NextResponse.json({ success: true, caseStudy: validatedCaseStudy });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid case study data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to save case study:', error);
    return NextResponse.json(
      { error: 'Failed to save case study' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectSlug = searchParams.get('projectSlug');

    if (!projectSlug) {
      return NextResponse.json(
        { error: 'Project slug is required' },
        { status: 400 }
      );
    }

    const caseStudyPath = path.join(CASE_STUDIES_DIR, `${projectSlug}.json`);

    if (existsSync(caseStudyPath)) {
      const { unlink } = await import('fs/promises');
      await unlink(caseStudyPath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete case study:', error);
    return NextResponse.json(
      { error: 'Failed to delete case study' },
      { status: 500 }
    );
  }
}