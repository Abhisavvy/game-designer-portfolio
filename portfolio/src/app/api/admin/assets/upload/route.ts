import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { z } from 'zod';
import { ASTManipulator } from '@/features/admin/utils/ast-manipulator';
import { triggerHotReloadAndDeploy } from '@/features/admin/utils/hot-reload';
import { adminAssetUploadMetadataSchema } from '@/features/admin/validation/admin-api-schemas';
import {
  buildAssetPublicUrl,
  resolveUploadedFilename,
} from '@/app/api/admin/assets/upload/upload-helpers';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadataRaw = formData.get('metadata');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate and parse metadata
    let metadata;
    try {
      if (typeof metadataRaw !== 'string') {
        return NextResponse.json(
          { error: 'Invalid metadata format - must be JSON string' },
          { status: 400 }
        );
      }
      metadata = JSON.parse(metadataRaw);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid metadata JSON format' },
        { status: 400 }
      );
    }

    // Validate metadata structure
    let validatedMetadata;
    try {
      validatedMetadata = adminAssetUploadMetadataSchema.parse(metadata);
    } catch (zodError) {
      return NextResponse.json(
        { 
          error: 'Invalid metadata fields',
          details: zodError instanceof Error ? zodError.message : 'Validation failed'
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.',
          details: `Received: ${file.type || 'unknown'} (${file.name})`
        },
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

    const { filename } = resolveUploadedFilename({
      category: validatedMetadata.category,
      projectSlug: validatedMetadata.projectSlug,
      originalFileName: file.name,
    });

    // Determine upload path
    const uploadDir = validatedMetadata.projectSlug
      ? path.join(process.cwd(), 'public', 'assets', validatedMetadata.projectSlug)
      : path.join(process.cwd(), 'public', 'assets', 'general');

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate public URL
    const publicUrl = buildAssetPublicUrl(
      validatedMetadata.projectSlug,
      filename,
    );

    // Prepare file data
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, filename);
    const tempFilePath = path.join(uploadDir, `temp_${Date.now()}_${filename}`);

    try {
      // Step 1: Write to temporary file first
      await writeFile(tempFilePath, buffer);

      // Step 2: Update site-content.ts based on image category (must succeed for atomic operation)
      if (validatedMetadata.projectSlug) {
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
        
        // Step 3: Deploy content changes
        await triggerHotReloadAndDeploy(siteContentPath, `${validatedMetadata.category} image uploaded for ${validatedMetadata.projectSlug}`);
      }

      // Step 4: Only now move temp file to final location (atomic operation complete)
      await writeFile(filePath, buffer);
      
      // Clean up temp file
      try {
        await unlink(tempFilePath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError);
        // Don't fail the operation for cleanup issues
      }

    } catch (error) {
      // Rollback: Delete temp file if content update failed
      try {
        await unlink(tempFilePath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file after error:', cleanupError);
      }
      
      // Return proper error response
      console.error('Upload failed during content update:', error);
      return NextResponse.json(
        { 
          error: 'Failed to update content. Upload aborted.',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
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