import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Load current site content to extract portfolio data
    const siteContent = await import('@/features/portfolio/data/site-content');
    
    // Get request data (bullets and personalInfo are optional for this endpoint)
    const requestBody = await request.json().catch(() => ({}));
    const { bullets = [], personalInfo = {} } = requestBody;

    // Extract current personal info from site content
    const currentPersonalInfo = {
      name: siteContent.defaultPortfolioContent.person?.name || '',
      role: siteContent.defaultPortfolioContent.person?.role || '',
      email: siteContent.defaultPortfolioContent.person?.email || '',
      phone: siteContent.defaultPortfolioContent.person?.phone || '',
      location: siteContent.defaultPortfolioContent.person?.location || '',
      linkedin: siteContent.defaultPortfolioContent.person?.links?.linkedin || '',
      bio: siteContent.defaultPortfolioContent.about?.body || '',
    };

    // Merge with any provided personalInfo (allowing override)
    const mergedPersonalInfo = { ...currentPersonalInfo, ...personalInfo };

    // Generate Reactive Resume compatible JSON
    const reactiveResumeData = {
      $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
      basics: {
        name: mergedPersonalInfo.name,
        label: mergedPersonalInfo.role,
        email: mergedPersonalInfo.email,
        phone: mergedPersonalInfo.phone,
        url: mergedPersonalInfo.linkedin,
        summary: mergedPersonalInfo.bio,
        location: {
          city: mergedPersonalInfo.location,
        },
        profiles: [
          {
            network: "LinkedIn",
            username: "",
            url: mergedPersonalInfo.linkedin,
          },
        ],
      },
      work: [
        {
          name: "Portfolio Projects", // Generic work entry for portfolio projects
          position: mergedPersonalInfo.role,
          url: "",
          startDate: "2023-01-01", // Generic start date
          endDate: "",
          summary: "Game design and development work showcased in portfolio",
          highlights: Array.isArray(bullets) 
            ? bullets
                .filter((bullet: any) => bullet.approved)
                .map((bullet: any) => bullet.content)
            : [],
        },
      ],
      education: [], // Would be populated from actual education data
      skills: [
        {
          name: "Game Design",
          level: "Expert",
          keywords: ["Unity", "Game Balance", "Monetization", "Player Retention"],
        },
        {
          name: "Technical Skills",
          level: "Advanced", 
          keywords: ["C#", "JavaScript", "TypeScript", "Next.js"],
        },
      ],
      projects: siteContent.defaultPortfolioContent.projects?.map((project: any) => ({
        name: project.title,
        description: project.blurb,
        highlights: [],
        keywords: [project.tag],
        startDate: "",
        endDate: "",
        url: project.externalUrl || "",
        roles: ["Designer", "Developer"],
        entity: "Portfolio Project",
        type: "application",
      })) || [],
      meta: {
        canonical: "https://raw.githubusercontent.com/jsonresume/resume-schema/master/resume.json",
        version: "v1.0.0",
        lastModified: new Date().toISOString(),
      },
    };

    return NextResponse.json({
      success: true,
      resumeData: reactiveResumeData,
      message: 'Resume data generated successfully. Copy this JSON to import into Reactive Resume.',
    });
  } catch (error) {
    console.error('Failed to export resume:', error);
    return NextResponse.json(
      { error: 'Failed to export resume data' },
      { status: 500 }
    );
  }
}