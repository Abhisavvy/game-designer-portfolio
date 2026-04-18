import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { triggerHotReloadAndDeploy } from '@/features/admin/utils/hot-reload';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit for resume)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB` },
        { status: 400 }
      );
    }

    // Validate file type (both extension and MIME type)
    const isValidExtension = file.name.toLowerCase().endsWith('.pdf');
    const isValidMimeType = file.type === 'application/pdf' || file.type === 'application/x-pdf';
    
    if (!isValidExtension || !isValidMimeType) {
      return NextResponse.json(
        { 
          error: 'Invalid file format. Only PDF files are allowed.',
          details: `Received: ${file.type || 'unknown type'}, filename: ${file.name}`
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to the exact location the resume page expects
    const publicPath = path.join(process.cwd(), 'public', 'ABHISHEK DUTTA RESUME.pdf');
    await writeFile(publicPath, buffer);

    console.log(`Resume PDF updated: ${file.name} (${buffer.length} bytes)`);

    // Trigger deployment to update live site
    await triggerHotReloadAndDeploy(publicPath, 'Resume PDF updated');

    return NextResponse.json({
      success: true,
      message: 'Resume PDF updated successfully',
      filename: 'ABHISHEK DUTTA RESUME.pdf',
      size: buffer.length,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to upload resume PDF:', error);
    return NextResponse.json(
      { error: 'Failed to upload resume PDF' },
      { status: 500 }
    );
  }
}