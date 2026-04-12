import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { bullets, personalInfo } = await request.json();
    
    if (!bullets || !personalInfo) {
      return NextResponse.json(
        { error: 'CV bullets and personal info are required' },
        { status: 400 }
      );
    }

    // Load current site content to extract portfolio data
    const siteContent = await import('@/features/portfolio/data/site-content');

    // Generate Reactive Resume compatible JSON
    const reactiveResumeData = {
      $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
      basics: {
        name: personalInfo.name || siteContent.personalInfo?.name || '',
        label: personalInfo.role || siteContent.personalInfo?.role || '',
        email: personalInfo.email || siteContent.personalInfo?.contact?.email || '',
        phone: personalInfo.phone || siteContent.personalInfo?.contact?.phone || '',
        url: siteContent.personalInfo?.contact?.linkedin || '',
        summary: personalInfo.bio || siteContent.about?.body || '',
        location: {
          city: personalInfo.location || siteContent.personalInfo?.location || '',
        },
        profiles: [
          {
            network: "LinkedIn",
            username: "",
            url: personalInfo.linkedin || siteContent.personalInfo?.contact?.linkedin || '',
          },
        ],
      },
      work: [
        {
          name: "Game Studio", // This would come from your actual work experience
          position: personalInfo.role || "Game Designer",
          url: "",
          startDate: "2023-01-01", // These would come from actual data
          endDate: "",
          summary: "Game design and development work",
          highlights: bullets
            .filter((bullet: any) => bullet.approved)
            .map((bullet: any) => bullet.content),
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
      projects: siteContent.projects?.map((project: any) => ({
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