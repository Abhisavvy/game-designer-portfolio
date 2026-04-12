import { NextRequest, NextResponse } from 'next/server';
import { ASTManipulator } from '@/features/admin/utils/ast-manipulator';
import { triggerHotReloadAndDeploy } from '@/features/admin/utils/hot-reload';
import path from 'path';
import { z } from 'zod';
import {
  adminCreateProjectBodySchema,
  adminProjectItemSchema,
} from '@/features/admin/validation/admin-api-schemas';

const SITE_CONTENT_PATH = path.join(process.cwd(), 'src/features/portfolio/data/site-content.ts');

export async function GET() {
  try {
    // Import current site content
    const siteContent = await import('@/features/portfolio/data/site-content');
    
    // Extract projects data
    const projects = siteContent.defaultPortfolioContent.projects.map((project: any) => ({
      slug: project.slug,
      title: project.title,
      tag: project.tag,
      blurb: project.blurb,
      href: project.href,
      externalUrl: project.externalUrl || '',
    }));

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Failed to load projects:', error);
    return NextResponse.json(
      { error: 'Failed to load projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const body =
      raw && typeof raw === 'object' && 'project' in raw
        ? raw
        : { project: raw };
    const { project, caseStudy: caseStudyDraft } =
      adminCreateProjectBodySchema.parse(body);

    const validatedProject = {
      ...project,
      externalUrl: project.externalUrl || '',
    };

    const siteContent = await import('@/features/portfolio/data/site-content');
    const existingProject = siteContent.defaultPortfolioContent.projects.find(
      (p: { slug: string }) => p.slug === validatedProject.slug,
    );

    if (existingProject) {
      return NextResponse.json(
        { error: 'Project with this slug already exists' },
        { status: 400 },
      );
    }

    const astManipulator = new ASTManipulator(SITE_CONTENT_PATH);
    if (caseStudyDraft) {
      astManipulator.addProjectWithCaseStudy(validatedProject, {
        ...caseStudyDraft,
        title: caseStudyDraft.title || validatedProject.title,
        links: caseStudyDraft.links ?? [],
      });
    } else {
      astManipulator.addProject(validatedProject);
    }

    await triggerHotReloadAndDeploy(
      SITE_CONTENT_PATH,
      `Project created: ${validatedProject.slug}`,
    );

    return NextResponse.json({ success: true, project: validatedProject });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid project data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { slug, project } = await request.json();
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Project slug required' },
        { status: 400 }
      );
    }

    // Validate project data
    const validatedProject = adminProjectItemSchema.parse(project);
    
    // Update project using AST manipulation
    const astManipulator = new ASTManipulator(SITE_CONTENT_PATH);
    astManipulator.updateProject(slug, validatedProject);
    
    // Trigger hot reload and deploy to Vercel
    await triggerHotReloadAndDeploy(SITE_CONTENT_PATH, "Project updated");

    return NextResponse.json({ success: true, project: validatedProject });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid project data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Failed to update project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Project slug required' },
        { status: 400 }
      );
    }

    // Delete project using AST manipulation
    const astManipulator = new ASTManipulator(SITE_CONTENT_PATH);
    astManipulator.deleteProject(slug);
    
    // Trigger hot reload and deploy to Vercel
    await triggerHotReloadAndDeploy(SITE_CONTENT_PATH, "Project updated");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}