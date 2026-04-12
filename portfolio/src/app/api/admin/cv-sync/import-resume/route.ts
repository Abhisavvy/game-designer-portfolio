import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Reactive Resume JSON schema (simplified)
const reactiveResumeSchema = z.object({
  basics: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    location: z.object({
      address: z.string().optional(),
      city: z.string().optional(),
      region: z.string().optional(),
      postalCode: z.string().optional(),
      countryCode: z.string().optional(),
    }).optional(),
    profiles: z.array(z.object({
      network: z.string(),
      username: z.string().optional(),
      url: z.string().url(),
    })).optional(),
  }),
  work: z.array(z.object({
    name: z.string(),
    position: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    summary: z.string().optional(),
    highlights: z.array(z.string()).optional(),
  })).optional(),
  education: z.array(z.object({
    institution: z.string(),
    area: z.string().optional(),
    studyType: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })).optional(),
  skills: z.array(z.object({
    name: z.string(),
    level: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  })).optional(),
});

type ReactiveResumeData = z.infer<typeof reactiveResumeSchema>;

export async function POST(request: NextRequest) {
  try {
    const { resumeData } = await request.json();
    
    if (!resumeData) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }

    // Validate the resume data structure
    const validatedData = reactiveResumeSchema.parse(resumeData);

    // Extract relevant information for portfolio sync
    const extractedInfo = {
      personal: {
        name: validatedData.basics.name,
        email: validatedData.basics.email,
        phone: validatedData.basics.phone,
        location: validatedData.basics.location?.city || '',
        linkedin: validatedData.basics.profiles?.find(p => p.network.toLowerCase() === 'linkedin')?.url || '',
      },
      experience: validatedData.work?.map(job => ({
        company: job.name,
        position: job.position,
        startDate: job.startDate,
        endDate: job.endDate,
        summary: job.summary,
        highlights: job.highlights || [],
      })) || [],
      skills: validatedData.skills?.map(skill => ({
        name: skill.name,
        level: skill.level,
        keywords: skill.keywords || [],
      })) || [],
    };

    // TODO: Compare with current portfolio data and identify inconsistencies
    const consistencyIssues = await validateConsistency(extractedInfo);

    return NextResponse.json({
      success: true,
      extractedInfo,
      consistencyIssues,
      message: 'Resume imported successfully. Review consistency issues below.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid resume format', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Failed to import resume:', error);
    return NextResponse.json(
      { error: 'Failed to import resume' },
      { status: 500 }
    );
  }
}

async function validateConsistency(resumeInfo: any) {
  // This would compare resume data with portfolio data
  // For now, return mock consistency issues
  return [
    {
      type: 'personal_info',
      severity: 'medium' as const,
      projectSlug: 'general',
      field: 'name',
      message: 'Name format differs between CV and portfolio',
      cvValue: resumeInfo.personal.name,
      portfolioValue: 'Current Portfolio Name',
      suggestion: 'Update portfolio to match CV format',
    },
  ];
}