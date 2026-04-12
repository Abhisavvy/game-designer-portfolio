import { NextRequest, NextResponse } from 'next/server';
import { ASTManipulator } from '@/features/admin/utils/ast-manipulator';
import path from 'path';

const SITE_CONTENT_PATH = path.join(process.cwd(), 'src/features/portfolio/data/site-content.ts');

export async function POST(request: NextRequest) {
  try {
    const { projectSlug, resetType } = await request.json();
    
    if (!projectSlug) {
      return NextResponse.json(
        { error: 'Project slug is required' },
        { status: 400 }
      );
    }

    const astManipulator = new ASTManipulator(SITE_CONTENT_PATH);
    
    if (resetType === 'hero' || resetType === 'all') {
      // Reset hero image to a generic placeholder
      const placeholderPath = `/assets/placeholder-image.svg`;
      astManipulator.updateProjectImage(projectSlug, placeholderPath);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Placeholder reset for ${projectSlug}`,
      resetType 
    });
  } catch (error) {
    console.error('Failed to reset placeholder:', error);
    return NextResponse.json(
      { error: 'Failed to reset placeholder' },
      { status: 500 }
    );
  }
}