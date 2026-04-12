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

    // Validate file type
    if (!file.name.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
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