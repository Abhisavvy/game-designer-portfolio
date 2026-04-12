import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const tests = [];
  
  try {
    // Test 1: Check if site-content.ts is accessible
    try {
      const siteContent = await import('@/features/portfolio/data/site-content');
      tests.push({
        name: 'Site Content Import',
        status: 'pass',
        message: `Loaded ${siteContent.projects?.length || 0} projects`,
      });
    } catch (error) {
      tests.push({
        name: 'Site Content Import',
        status: 'fail',
        message: `Failed to import site-content.ts: ${error}`,
      });
    }

    // Test 2: Check admin types
    try {
      const { AdminProject } = await import('@/features/admin/types/admin');
      tests.push({
        name: 'Admin Types',
        status: 'pass',
        message: 'Admin types loaded successfully',
      });
    } catch (error) {
      tests.push({
        name: 'Admin Types',
        status: 'fail',
        message: `Failed to load admin types: ${error}`,
      });
    }

    // Test 3: Check AST Manipulator
    try {
      const { ASTManipulator } = await import('@/features/admin/utils/ast-manipulator');
      tests.push({
        name: 'AST Manipulator',
        status: 'pass',
        message: 'AST Manipulator class loaded successfully',
      });
    } catch (error) {
      tests.push({
        name: 'AST Manipulator',
        status: 'fail',
        message: `Failed to load AST Manipulator: ${error}`,
      });
    }

    // Test 4: Check CV Bullet Generator
    try {
      const { CVBulletGenerator } = await import('@/features/admin/utils/cv-bullet-generator');
      tests.push({
        name: 'CV Bullet Generator',
        status: 'pass',
        message: 'CV Bullet Generator loaded successfully',
      });
    } catch (error) {
      tests.push({
        name: 'CV Bullet Generator',
        status: 'fail',
        message: `Failed to load CV Bullet Generator: ${error}`,
      });
    }

    // Test 5: Check file system permissions
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const publicDir = path.join(process.cwd(), 'public');
      await fs.access(publicDir);
      
      tests.push({
        name: 'File System Access',
        status: 'pass',
        message: 'Can access public directory for asset uploads',
      });
    } catch (error) {
      tests.push({
        name: 'File System Access',
        status: 'fail',
        message: `Cannot access file system: ${error}`,
      });
    }

    // Test 6: Check TypeScript compiler
    try {
      const ts = await import('typescript');
      tests.push({
        name: 'TypeScript Compiler',
        status: 'pass',
        message: `TypeScript ${ts.version} available for AST manipulation`,
      });
    } catch (error) {
      tests.push({
        name: 'TypeScript Compiler',
        status: 'fail',
        message: `TypeScript compiler not available: ${error}`,
      });
    }

    const passedTests = tests.filter(t => t.status === 'pass').length;
    const totalTests = tests.length;

    return NextResponse.json({
      success: passedTests === totalTests,
      summary: `${passedTests}/${totalTests} tests passed`,
      tests,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        cwd: process.cwd(),
        env: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test suite failed to run',
        details: String(error),
      },
      { status: 500 }
    );
  }
}