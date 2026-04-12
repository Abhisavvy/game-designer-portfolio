import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectSlug = searchParams.get('projectSlug');
    const category = searchParams.get('category');

    const assetsDir = path.join(process.cwd(), 'public', 'assets');
    
    if (!existsSync(assetsDir)) {
      return NextResponse.json({ assets: [] });
    }

    const assets = [];
    
    // Read from project-specific directory if specified
    if (projectSlug) {
      const projectDir = path.join(assetsDir, projectSlug);
      if (existsSync(projectDir)) {
        const files = await readdir(projectDir);
        for (const file of files) {
          const filePath = path.join(projectDir, file);
          const stats = await stat(filePath);
          
          if (stats.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(file)) {
            assets.push({
              filename: file,
              publicUrl: `/assets/${projectSlug}/${file}`,
              size: stats.size,
              uploadedAt: stats.mtime.toISOString(),
              projectSlug,
            });
          }
        }
      }
    } else {
      // Read from all directories
      const dirs = await readdir(assetsDir, { withFileTypes: true });
      
      for (const dir of dirs) {
        if (dir.isDirectory()) {
          const dirPath = path.join(assetsDir, dir.name);
          const files = await readdir(dirPath);
          
          for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = await stat(filePath);
            
            if (stats.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(file)) {
              assets.push({
                filename: file,
                publicUrl: `/assets/${dir.name}/${file}`,
                size: stats.size,
                uploadedAt: stats.mtime.toISOString(),
                projectSlug: dir.name === 'general' ? null : dir.name,
              });
            }
          }
        }
      }
    }

    // Filter by category if specified (this would require metadata storage)
    let filteredAssets = assets;
    if (category) {
      // For now, just return all assets since we don't have metadata storage yet
      // In a real implementation, you'd store metadata in a database or JSON file
      filteredAssets = assets;
    }

    // Sort by upload date (newest first)
    filteredAssets.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return NextResponse.json({ assets: filteredAssets });
  } catch (error) {
    console.error('Failed to list assets:', error);
    return NextResponse.json(
      { error: 'Failed to list assets' },
      { status: 500 }
    );
  }
}