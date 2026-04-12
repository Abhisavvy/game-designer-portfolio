# Learning Document: Abhishek's Development Patterns & Preferences

## User Profile & Context
- **Name**: Abhishek Dutta
- **Role**: Game Designer who also ships AI/tools work
- **Tech Stack**: Next.js (App Router), TypeScript, Tailwind, Unity C#, React-Three-Fiber
- **Deployment**: Vercel for web apps
- **Development Style**: Test-driven, autonomous execution preferred, explainability important

## Project Structure & Preferences

### Career Workspace Layout
```
career-workspace/
├── reactive-resume/          # CV editing (Docker-based)
├── portfolio/               # Next.js portfolio site
├── career-content/          # Optional notes/exports
├── docs/prompts/           # Copy-paste prompts for CV/case studies
└── skills/career-sync/     # Cursor skill for CV workflow
```

### Key Technical Patterns
1. **File-based Content Management**: Uses `site-content.ts` with AST manipulation for updates
2. **Hot Reload System**: Custom utility to trigger Next.js updates + Vercel deployment
3. **Admin Panel Architecture**: Full CRUD with real-time preview and auto-deployment
4. **Modular Feature Structure**: `src/features/[feature-name]/` organization

## Communication & Work Style

### Preferred Approach
- **Autonomous Execution**: "Complete everything, test it thoroughly and then run it for me"
- **Direct Problem Solving**: Prefers implementation over extensive discussion
- **Comprehensive Solutions**: Expects full end-to-end functionality, not partial implementations
- **Real-world Testing**: Always wants to see things working on live sites, not just localhost

### Response Patterns
- Gets frustrated with incomplete solutions: "I asked 3 times and you couldn't do anything"
- Values immediate results: "Nothing is updating on the live site"
- Prefers systematic fixes over band-aids
- Appreciates detailed explanations of what was implemented

## Technical Challenges & Solutions

### Recurring Issues
1. **AST Manipulation Complexity**: Hyphenated project slugs (`"bon-voyage"`) require string literal handling
2. **Hot Reload + Deployment**: Local changes need to propagate to production automatically
3. **Build Cache Corruption**: `npm run build` + `npm run dev` conflicts break webpack
4. **ESLint Compliance**: Unescaped quotes in JSX frequently cause build failures

### Successful Patterns
1. **Comprehensive Testing**: Use test-master subagent for systematic validation
2. **Progressive Implementation**: Build → Test → Deploy → Verify on live site
3. **Error-First Debugging**: Check server logs, console errors, then fix systematically
4. **Documentation**: Create detailed markdown files for complex implementations

## Domain Knowledge

### Game Design Background
- Focuses on metrics, scope, constraints over adjectives
- Uses terms like "D30/D1 ratio", "IAP rev/DAU", "retention lifts"
- Prefers data-driven outcomes in case studies
- Values Word Roll consistency in naming

### Portfolio Content Strategy
- CV bullets should map to portfolio case studies
- Emphasizes problem → approach → constraints → outcome structure
- Prefers PDF exports from Reactive Resume for sharing
- Cross-links between CV and portfolio content

## Development Workflow Preferences

### Deployment Strategy
- **Local Development**: Immediate hot reload for rapid iteration
- **Production Deployment**: Automatic git commit + push to trigger Vercel
- **Content Management**: Admin panel should update both local and live sites
- **Asset Management**: Comprehensive cleanup when deleting (no broken references)

### Quality Standards
- **Build Success**: Must pass `npm run build` with minimal warnings
- **ESLint Compliance**: Fix unescaped quotes and other linting errors
- **TypeScript Strict**: Proper type safety throughout
- **Component Architecture**: Reusable UI components with proper props

## Lessons Learned

### What Works Well
1. **Proactive Subagent Use**: test-master for validation, explore for codebase analysis
2. **Comprehensive Feature Implementation**: Gallery management, auto-deployment, asset cleanup all at once
3. **Real-world Validation**: Always test on actual Vercel deployment, not just localhost
4. **Clear Documentation**: Step-by-step guides and implementation summaries
5. **Path Consistency**: When implementing upload/download features, ensure file paths match exactly

### What to Avoid
1. **Partial Solutions**: Don't implement gallery upload without reorder/delete
2. **Localhost-Only Testing**: Always verify changes reach production
3. **Cache Conflicts**: Never run build while dev server is running
4. **Incomplete Error Handling**: Fix all ESLint errors before claiming completion
5. **Path Mismatches**: Upload endpoints must save files where download functions expect them

### Recent Fixes Applied
- **Resume Upload Issue (2026-04-12)**: PDF uploads were saving to `/assets/general/` but download expected `/ABHISHEK DUTTA RESUME.pdf`. Created dedicated `/api/admin/resume/upload` endpoint that saves directly to the expected location.

## Future Considerations

### Potential Enhancements
1. **Case Study Content Sync**: Currently JSON vs site-content.ts mismatch
2. **Image Optimization**: Consider Next.js Image component for better performance
3. **Deployment Monitoring**: Enhanced status tracking and rollback capabilities
4. **Content Validation**: Zod schemas for all admin panel inputs

### Technical Debt
1. **UI Component Library**: Currently custom components, could benefit from shadcn/ui
2. **Error Boundaries**: Better error handling in admin panel
3. **Loading States**: More sophisticated loading indicators
4. **Accessibility**: WCAG compliance improvements

## Success Metrics
- ✅ Admin panel changes reflect on live Vercel site within minutes
- ✅ Gallery management works end-to-end (upload → reorder → delete → cleanup)
- ✅ Auto-deployment system requires zero manual intervention
- ✅ Build process is reliable and error-free
- ✅ Content management workflow is intuitive and fast

---

*Last Updated: 2026-04-12*
*This document evolves based on each interaction to better serve development needs.*