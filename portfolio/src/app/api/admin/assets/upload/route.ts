import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { z } from 'zod';
import { ASTManipulator } from '@/features/admin/utils/ast-manipulator';
import { triggerHotReload } from '@/features/admin/utils/hot-reload';

const uploadSchema = z.object({
  category: z.enum(['hero', 'gallery', 'process', 'profile']),
  projectSlug: z.string().optional(),
  altText: z.string().min(1, 'Alt text is required'),
  caption: z.string().optional(),
  usageContext: z.string().min(1, 'Usage context is required'),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadata = JSON.parse(formData.get('metadata') as string);

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate metadata
    const validatedMetadata = uploadSchema.parse(metadata);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate filename
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const baseName = path.basename(file.name, extension)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const filename = `${baseName}-${timestamp}${extension}`;

    // Determine upload path
    const uploadDir = validatedMetadata.projectSlug
      ? path.join(process.cwd(), 'public', 'assets', validatedMetadata.projectSlug)
      : path.join(process.cwd(), 'public', 'assets', 'general');

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Write file
    const filePath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate public URL
    const publicUrl = validatedMetadata.projectSlug
      ? `/assets/${validatedMetadata.projectSlug}/${filename}`
      : `/assets/general/${filename}`;

    // Update site-content.ts based on image category
    if (validatedMetadata.projectSlug) {
      try {
        const siteContentPath = path.join(process.cwd(), 'src/features/portfolio/data/site-content.ts');
        const astManipulator = new ASTManipulator(siteContentPath);
        
        if (validatedMetadata.category === 'hero') {
          astManipulator.updateProjectImage(validatedMetadata.projectSlug, publicUrl);
          console.log(`Updated hero image for project ${validatedMetadata.projectSlug}: ${publicUrl}`);
        } else if (validatedMetadata.category === 'gallery') {
          astManipulator.addGalleryImage(validatedMetadata.projectSlug, {
            path: publicUrl,
            alt: validatedMetadata.altText,
            label: validatedMetadata.usageContext,
          });
          console.log(`Added gallery image for project ${validatedMetadata.projectSlug}: ${publicUrl}`);
        }
        
        // Trigger hot reload to update the live site
        await triggerHotReload(siteContentPath);
      } catch (error) {
        console.error('Failed to update site-content.ts:', error);
        // Don't fail the upload, just log the error
      }
    }

    // Return asset info
    const assetInfo = {
      filename,
      publicUrl,
      size: file.size,
      type: file.type,
      metadata: validatedMetadata,
      uploadedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, asset: assetInfo });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid metadata', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Failed to upload asset:', error);
    return NextResponse.json(
      { error: 'Failed to upload asset' },
      { status: 500 }
    );
  }
}