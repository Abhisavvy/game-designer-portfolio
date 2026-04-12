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
  const issues = [];
  
  try {
    // Load current portfolio data
    const siteContent = await import('@/features/portfolio/data/site-content');
    
    // Compare personal information
    const portfolioPersonal = {
      name: siteContent.defaultPortfolioContent.person?.name || '',
      email: siteContent.defaultPortfolioContent.person?.email || '',
      phone: siteContent.defaultPortfolioContent.person?.phone || '',
      location: siteContent.defaultPortfolioContent.person?.location || '',
      linkedin: siteContent.defaultPortfolioContent.person?.links?.linkedin || '',
    };

    // Check name consistency
    if (resumeInfo.personal.name && portfolioPersonal.name) {
      if (resumeInfo.personal.name.trim() !== portfolioPersonal.name.trim()) {
        issues.push({
          type: 'personal_info',
          severity: 'medium' as const,
          projectSlug: 'general',
          field: 'name',
          message: 'Name differs between CV and portfolio',
          cvValue: resumeInfo.personal.name,
          portfolioValue: portfolioPersonal.name,
          suggestion: 'Ensure consistent name formatting across CV and portfolio',
        });
      }
    }

    // Check email consistency
    if (resumeInfo.personal.email && portfolioPersonal.email) {
      if (resumeInfo.personal.email !== portfolioPersonal.email) {
        issues.push({
          type: 'personal_info',
          severity: 'high' as const,
          projectSlug: 'general',
          field: 'email',
          message: 'Email address differs between CV and portfolio',
          cvValue: resumeInfo.personal.email,
          portfolioValue: portfolioPersonal.email,
          suggestion: 'Update email address to match across both platforms',
        });
      }
    }

    // Check LinkedIn consistency
    if (resumeInfo.personal.linkedin && portfolioPersonal.linkedin) {
      if (resumeInfo.personal.linkedin !== portfolioPersonal.linkedin) {
        issues.push({
          type: 'personal_info',
          severity: 'medium' as const,
          projectSlug: 'general',
          field: 'linkedin',
          message: 'LinkedIn URL differs between CV and portfolio',
          cvValue: resumeInfo.personal.linkedin,
          portfolioValue: portfolioPersonal.linkedin,
          suggestion: 'Ensure LinkedIn URL is consistent',
        });
      }
    }

    // Check location consistency
    if (resumeInfo.personal.location && portfolioPersonal.location) {
      if (resumeInfo.personal.location !== portfolioPersonal.location) {
        issues.push({
          type: 'personal_info',
          severity: 'low' as const,
          projectSlug: 'general',
          field: 'location',
          message: 'Location format differs between CV and portfolio',
          cvValue: resumeInfo.personal.location,
          portfolioValue: portfolioPersonal.location,
          suggestion: 'Consider using consistent location format',
        });
      }
    }

    // Check for missing portfolio projects in CV experience
    if (siteContent.defaultPortfolioContent.projects && resumeInfo.experience) {
      const portfolioProjects = siteContent.defaultPortfolioContent.projects.map((p: any) => p.title.toLowerCase());
      const cvHighlights = resumeInfo.experience
        .flatMap((job: any) => job.highlights || [])
        .join(' ')
        .toLowerCase();

      portfolioProjects.forEach((projectTitle: string) => {
        if (!cvHighlights.includes(projectTitle)) {
          issues.push({
            type: 'project_missing',
            severity: 'medium' as const,
            projectSlug: 'general',
            field: 'experience',
            message: `Portfolio project "${projectTitle}" not mentioned in CV highlights`,
            cvValue: 'Not found in CV',
            portfolioValue: projectTitle,
            suggestion: 'Consider adding CV bullets for this portfolio project',
          });
        }
      });
    }

  } catch (error) {
    console.error('Error validating consistency:', error);
    issues.push({
      type: 'validation_error',
      severity: 'high' as const,
      projectSlug: 'general',
      field: 'system',
      message: 'Could not validate consistency due to system error',
      suggestion: 'Check portfolio data structure and try again',
    });
  }

  return issues;
}