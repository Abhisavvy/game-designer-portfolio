import { NextRequest, NextResponse } from 'next/server';
import { ASTManipulator } from '@/features/admin/utils/ast-manipulator';
import { triggerHotReloadAndDeploy } from '@/features/admin/utils/hot-reload';
import path from 'path';
import { z } from 'zod';

const SITE_CONTENT_PATH = path.join(process.cwd(), 'src/features/portfolio/data/site-content.ts');

const galleryItemSchema = z.object({
  thumb: z.string(),
  full: z.string(),
  alt: z.string(),
  label: z.string(),
});

const updateGallerySchema = z.object({
  projectSlug: z.string(),
  items: z.array(galleryItemSchema),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectSlug, items } = updateGallerySchema.parse(body);

    const astManipulator = new ASTManipulator(SITE_CONTENT_PATH);
    astManipulator.replaceGalleryItems(projectSlug, items);
    
    // Trigger hot reload and deploy to Vercel
    await triggerHotReloadAndDeploy(SITE_CONTENT_PATH, `Gallery updated for ${projectSlug}`);

    return NextResponse.json({
      success: true,
      message: `Gallery updated for ${projectSlug}`,
      itemCount: items.length,
    });
  } catch (error) {
    console.error('Failed to update gallery:', error);
    return NextResponse.json(
      { error: 'Failed to update gallery', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}