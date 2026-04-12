# Portfolio Admin Panel Design Specification

**Date**: 2026-04-12  
**Project**: Game Designer Portfolio Admin Panel  
**Status**: Design Complete - Ready for Implementation

## Overview

A development-only admin panel for comprehensive portfolio content management, providing a user-friendly interface to edit projects, upload assets, and manage all portfolio content while maintaining the existing file-based architecture.

## Requirements Summary

- **Full admin panel** with comprehensive content management
- **No authentication** - simple access for personal use
- **File-based storage** - continue using `site-content.ts`
- **Content focused scope** - manage projects, case studies, personal info, assets
- **Development-only** - admin panel excluded from production builds
- **Responsive preview** - ensure content looks good across all devices
- **Image metadata** - support for alt text, captions, and descriptions

## Architecture

### Core Concept
**Development-Only Admin Panel**: Admin functionality exists only in development mode (`npm run dev`), completely excluded from production builds deployed to Vercel.

### Environment-Based Access
- **Development**: Admin panel available at `/admin` when running `npm run dev`
- **Production**: Admin routes completely excluded from build, no security risk
- **Workflow**: Edit locally → commit to git → auto-deploy to production

### Technical Stack
- **Framework**: Next.js App Router with TypeScript
- **Admin Routes**: Next.js pages under `/admin/*` (development only)
- **API Layer**: Next.js API routes for file operations
- **File Operations**: TypeScript AST manipulation for `site-content.ts`
- **Image Handling**: Direct file system operations in `/public/assets/`

## Admin Panel Interface

### Dashboard Layout
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Portfolio Admin                    [Save] [Reset] │
├─────────────┬───────────────────────────────────────────┤
│ Navigation  │ Main Content Area                         │
│ ├─Personal  │ ┌─────────────────────────────────────┐   │
│ ├─Projects  │ │ Form Fields / Upload Zones          │   │
│ ├─Assets    │ │                                     │   │
│ └─Resume    │ └─────────────────────────────────────┘   │
│             │ ┌─────────────────────────────────────┐   │
│             │ │ Live Preview Panel                  │   │
│             │ │ [Desktop] [Tablet] [Mobile]         │   │
│             │ └─────────────────────────────────────┘   │
└─────────────┴───────────────────────────────────────────┘
```

### Content Management Sections

#### 1. Personal Information
- **Basic Info**: Name, role, tagline, location
- **Contact Details**: Email, phone, LinkedIn
- **Bio/Summary**: Professional summary text
- **Profile Photo**: Upload with alt text and caption
- **CV Sync Side Panel**: Collapsible panel showing matching CV sections and suggested updates (non-intrusive)

#### 2. Projects Management
- **Project List**: Drag-to-reorder interface
- **Add/Edit Project**: 
  - **Primary Tab**: Basic info (title, tag, blurb)
  - **Case Study Tab**: Full editor (problem, approach, constraints, outcome, contributions)
  - **Assets Tab**: Hero image upload with metadata, external links, media gallery
  - **CV Sync Tab**: Auto-suggest matching CV bullets (tight/standard/narrative formats), consistency checker
- **Progressive Disclosure**: CV sync features in dedicated tab to prevent cognitive overload on primary editing flow
- **Non-Blocking Validation**: Consistency warnings appear as badges/indicators, don't prevent saving
- **Delete Project**: With confirmation dialog and CV bullet cleanup suggestions

#### 3. Assets Upload System
- **Hero Images**: Drag-drop zones for each project
- **Image Metadata Fields**:
  - Alt text (required for accessibility)
  - Caption/tagline (optional display text)
  - Category tags (Hero, Gallery, Process, etc.)
  - Usage context (where image appears)
- **Resume PDF**: Upload and replace functionality
- **Image Library**: View all uploaded assets with search/filter

#### 4. Skills & Metrics
- **Core Skills**: Editable list with drag-to-reorder
- **Key Metrics**: Edit achievement numbers and descriptions
- **Work Section**: Edit eyebrow text and title

## Responsive Preview System

### Multi-Device Preview
- **Device Simulator Tabs**: Desktop (1440px), Tablet (768px), Mobile (375px)
- **Real-Time Updates**: Changes reflect immediately across all device views
- **Interactive Preview**: Click through actual portfolio pages in each size
- **Side-by-Side Layout**: Admin form left, device previews right

### Content Validation
- **Character Limits**: Prevent text overflow with visual warnings
- **Image Aspect Ratio**: Validation for card layout compatibility
- **Responsive Safeguards**: Automatic warnings for layout breaks
- **Typography Testing**: Ensure readability across screen sizes

## File Operations & Data Management

### Content Updates
- **TypeScript AST Manipulation**: Safe modification of `site-content.ts`
- **Type Safety**: Maintain TypeScript types during content updates
- **Atomic Operations**: All-or-nothing updates to prevent corruption
- **Backup on Change**: Git-based versioning for all modifications

### Cross-Link Rule Compliance (Critical Workspace Requirement)
- **CV-Portfolio Sync**: When editing portfolio case study copy, automatically propose matching CV bullet updates (and vice versa)
- **Consistency Validation**: Check feature names, dates, and tech stack alignment across Reactive Resume, `career-content/` folder, and Next.js portfolio
- **Glossary Drift Detection**: Flag inconsistencies in names, dates, numbers between CV, portfolio, and optional career-content files
- **Reactive Resume Integration**: Provide export functionality for CV bullets in Reactive Resume JSON format
- **Bidirectional Updates**: Changes in admin panel trigger CV bullet suggestions, changes in CV trigger suggested portfolio updates via import validation
- **Career Content Integration**: Optional read/write support for YAML/Markdown source snippets in `career-content/` folder for AI-assisted edits

### Image Management
- **Organized Storage**: `/public/assets/[project-slug]/` structure
- **Automatic Optimization**: Next.js image optimization integration
- **Format Support**: JPG, PNG, WebP with automatic conversion
- **Metadata Storage**: Extended `site-content.ts` with image metadata

### API Routes Structure
```
/api/admin/
├── content/
│   ├── personal.ts      # Personal info CRUD
│   ├── projects.ts      # Projects CRUD
│   └── skills.ts        # Skills/metrics CRUD
├── assets/
│   ├── upload.ts        # Image upload handler
│   ├── delete.ts        # Asset deletion
│   └── list.ts          # Asset inventory
├── cv-sync/
│   ├── generate-bullets.ts    # Generate CV bullets from case studies
│   ├── validate-consistency.ts # Check CV-portfolio alignment
│   ├── import-resume.ts       # Import and parse Reactive Resume JSON
│   └── export-resume.ts       # Export Reactive Resume JSON
└── preview/
    └── render.ts        # Preview generation
```

## Scalability & Future Features

### Modular Architecture
- **Plugin System**: Extensible for new content types
- **Template System**: Save project templates for reuse
- **Export/Import**: Backup entire portfolio as JSON
- **Content Types**: Framework ready for testimonials, blog posts, etc.

### Cross-Device Development
**Setup on New Computer**:
1. Clone repository: `git clone [repo-url]`
2. Install dependencies: `npm install`
3. Run development: `npm run dev`
4. Access admin: `localhost:3000/admin`
5. Make changes and commit via git workflow

**Requirements**:
- Node.js 18+ and npm
- Git for version control
- Any modern browser
- Optional: Code editor for advanced customization

### Future Expansion Ready
- **Additional Pages**: Easy to add new portfolio sections
- **Integration Hooks**: Ready for analytics, CMS, external services
- **Multi-Language**: Structure supports internationalization
- **Advanced Features**: SEO tools, performance monitoring, A/B testing

## Implementation Phases

### Phase 1: Core Admin Infrastructure
- Development-only routing setup
- Basic admin layout and navigation
- API routes for content operations
- TypeScript file manipulation utilities

### Phase 2: Content Management
- Personal info editing interface
- Projects CRUD functionality
- Basic image upload system
- Real-time preview integration
- **CV bullet generation system** (critical workspace requirement)

### Phase 3: Enhanced Features
- Multi-device responsive preview
- Advanced image management with metadata
- Drag-and-drop reordering
- Content validation and safeguards
- **Consistency validation system** and **Reactive Resume JSON export**

### Phase 4: Polish & Scalability
- Export/import functionality
- Template system for projects
- Performance optimization
- Documentation and setup guides

## Security Considerations

### Development-Only Access
- **Environment Detection**: Admin routes only available in development
- **Build Exclusion**: Zero admin code in production bundles
- **Git Workflow**: All changes tracked and version controlled
- **No Network Exposure**: Admin panel never accessible on live site

### Data Safety
- **Atomic Updates**: Prevent partial file corruption
- **Git Backup**: Every change is version controlled
- **Validation**: Type checking and content validation before saves
- **Rollback**: Easy revert via git history

## CV-Portfolio Synchronization (Workspace Rule Compliance)

### Cross-Link Rule Implementation
Following the critical workspace requirement from `.cursor/rules/career-materials.mdc`:

#### Automatic CV Bullet Generation
- **When editing case studies**: Admin panel automatically generates matching CV bullets in three formats:
  - **Tight**: One line, ~90 characters (e.g., "Designed Food Fiesta cross-mode event — 71% monetization increase")
  - **Standard**: Full STAR-style implication (e.g., "Designed Food Fiesta event mechanics featuring balanced gacha systems, generating 71% monetization increase")
  - **Narrative**: 2-3 bullets for featured role block with detailed context
- **CV Bullet Contract**: All generated bullets follow **action + scope + result** format from career-materials rule
- **Mapping Constraint**: Each major case study generates 1-2 CV bullets maximum (primary + optional secondary)
- **Privacy Compliance**: Never invent metrics, employers, titles, or features - only use user-entered facts. Use qualitative outcomes or explicit "TBD" when numbers are missing
- **Human Approval Required**: All generated bullets require explicit user approval before use
- **Export to Reactive Resume**: Generate JSON format for direct import into Reactive Resume

#### Consistency Validation System
- **Feature Names**: Ensure "Word Roll" (capital W, capital R) consistency across all content
- **Dates Alignment**: Validate project timelines match between CV and portfolio
- **Metrics Consistency**: Flag when numbers differ between CV bullets and case study outcomes
- **Tech Stack Sync**: Ensure tools and technologies listed consistently

#### Bidirectional Sync Workflow
1. **Portfolio → CV**: When editing case studies, show generated CV bullets for copy/paste into Reactive Resume
   - **Suggest-Only**: Generated bullets are presented for manual copy/paste, never auto-applied
   - **User Control**: All CV updates require explicit user action in Reactive Resume
2. **CV → Portfolio**: Import Reactive Resume JSON to validate portfolio alignment
   - **Validation Mode**: Compare imported CV data against portfolio content to flag inconsistencies
   - **Suggest-Only**: Highlight drift and recommend portfolio updates, never auto-modify `site-content.ts`
   - **Manual Apply**: User reviews suggestions and manually applies desired changes
3. **Drift Detection**: Highlight inconsistencies with specific recommendations
   - **Non-Blocking**: Validation warnings don't prevent saving, only inform user
   - **Contextual**: Show exactly which fields differ and suggest specific fixes
4. **Bulk Sync**: Mass alignment functionality with safety controls
   - **Preview Mode**: Show all proposed changes before applying any
   - **Selective Apply**: User can choose which consistency fixes to apply
   - **Git Backup**: All bulk changes create automatic git commits for rollback

#### Integration with Reactive Resume
- **JSON Export**: Generate Reactive Resume-compatible JSON with updated bullets
- **Schema Compatibility**: Target current Reactive Resume repository version (mirror `reactive-resume/` submodule in workspace)
- **Section Mapping**: Generated bullets populate `experience[].highlights[]` arrays in employment sections
- **Import Validation**: Read existing Reactive Resume exports to check alignment
- **Version Detection**: Validate imported JSON schema version and warn of compatibility issues
- **PDF Reminder**: Prompt to export PDF from Reactive Resume after content changes
- **DOCX Support**: Note when Word format needed and remind to proofread layout

## Success Criteria

### Functional Requirements
- ✅ Upload and manage all portfolio assets
- ✅ Edit all content types (personal, projects, case studies)
- ✅ Real-time preview across device sizes
- ✅ Add/remove projects with full content management
- ✅ Zero security risk (development-only access)
- ✅ **CV-Portfolio sync compliance**: Auto-generate matching CV bullets when editing case studies
- ✅ **Consistency validation**: Flag feature names, dates, metrics drift between CV and portfolio
- ✅ **Reactive Resume integration**: Export JSON format for direct CV import

### User Experience
- ✅ Intuitive interface requiring no technical knowledge
- ✅ Immediate visual feedback for all changes
- ✅ Responsive design validation built-in
- ✅ Cross-device development workflow
- ✅ Scalable for future feature additions

### Technical Quality
- ✅ Type-safe content operations
- ✅ Atomic file updates with git versioning
- ✅ Performance optimized (development tools only)
- ✅ Modular architecture for extensibility
- ✅ Zero production bundle impact

---

**Next Steps**: Implementation plan creation and development phase execution.