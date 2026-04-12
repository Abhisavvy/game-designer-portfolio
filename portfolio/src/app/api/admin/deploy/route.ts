import { NextRequest, NextResponse } from 'next/server';
import { deployToVercel, getGitStatus } from '@/features/admin/utils/git-deploy';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json().catch(() => ({}));
    
    await deployToVercel({ 
      message: message || 'Manual deployment from admin panel' 
    });
    
    return NextResponse.json({
      success: true,
      message: 'Deployment triggered successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Manual deployment failed:', error);
    return NextResponse.json(
      { 
        error: 'Deployment failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const status = await getGitStatus();
    
    return NextResponse.json({
      success: true,
      gitStatus: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get git status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get git status', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}