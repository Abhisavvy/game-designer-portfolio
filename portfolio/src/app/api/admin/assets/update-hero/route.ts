import { NextRequest, NextResponse } from 'next/server';
import { ASTManipulator } from '@/features/admin/utils/ast-manipulator';
import path from 'path';

const SITE_CONTENT_PATH = path.join(process.cwd(), 'src/features/portfolio/data/site-content.ts');

export async function POST(request: NextRequest) {
  try {
    const { projectSlug, imagePath } = await request.json();
    
    if (!projectSlug || !imagePath) {
      return NextResponse.json(
        { error: 'Project slug and image path are required' },
        { status: 400 }
      );
    }

    // Update the hero image in site-content.ts
    const astManipulator = new ASTManipulator(SITE_CONTENT_PATH);
    astManipulator.updateProjectImage(projectSlug, imagePath);

    return NextResponse.json({ 
      success: true, 
      message: `Hero image updated for ${projectSlug}`,
      imagePath 
    });
  } catch (error) {
    console.error('Failed to update hero image:', error);
    return NextResponse.json(
      { error: 'Failed to update hero image' },
      { status: 500 }
    );
  }
}