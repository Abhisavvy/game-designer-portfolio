import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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

    // Construct file path
    const assetsDir = path.join(process.cwd(), 'public', 'assets');
    const targetDir = projectSlug ? path.join(assetsDir, projectSlug) : path.join(assetsDir, 'general');
    const filePath = path.join(targetDir, filename);

    // Security check: ensure the file is within the assets directory
    const normalizedPath = path.normalize(filePath);
    const normalizedAssetsDir = path.normalize(assetsDir);
    
    if (!normalizedPath.startsWith(normalizedAssetsDir)) {
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}