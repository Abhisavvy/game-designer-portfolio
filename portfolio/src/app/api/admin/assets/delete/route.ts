import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { ASTManipulator } from '@/features/admin/utils/ast-manipulator';
import { triggerHotReloadAndDeploy } from '@/features/admin/utils/hot-reload';
import { isSafeFilename, isSafeSlug, resolveInside } from '@/features/admin/utils/safe-paths';

const SITE_CONTENT_PATH = path.join(process.cwd(), 'src/features/portfolio/data/site-content.ts');

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const projectSlug = searchParams.get('projectSlug');

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    if (!isSafeFilename(filename) || (projectSlug && !isSafeSlug(projectSlug))) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    // Construct file path; resolveInside rejects anything outside public/assets
    const assetsDir = path.join(process.cwd(), 'public', 'assets');
    const filePath = resolveInside(assetsDir, projectSlug || 'general', filename);

    if (!filePath) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Delete the file
    await unlink(filePath);

    // Remove references from site-content.ts
    if (projectSlug) {
      const publicPath = `/assets/${projectSlug}/${filename}`;
      const astManipulator = new ASTManipulator(SITE_CONTENT_PATH);
      astManipulator.removeImageReferences(publicPath);
      
      // Trigger hot reload and deploy to Vercel
      await triggerHotReloadAndDeploy(SITE_CONTENT_PATH, `Asset deleted: ${filename}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}