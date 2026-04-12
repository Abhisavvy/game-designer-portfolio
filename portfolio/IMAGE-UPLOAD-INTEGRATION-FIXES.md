# Image Upload & Live Preview Fixes

## ✅ Fixed Issues

### 1. **Images Not Reflecting on Live Site**
**Problem:** Images uploaded through admin panel weren't updating the live portfolio site.

**Root Cause:** The upload API saved files to `/public/assets/` but didn't update `site-content.ts` to reference the new images.

**Solution:**
- **Enhanced Upload API** (`/api/admin/assets/upload/route.ts`):
  - Added AST manipulation to update `site-content.ts` when hero images are uploaded
  - Automatically updates `posterSrc` in case studies for the correct project
  - Triggers hot reload to update the live site immediately
  - Logs successful updates for debugging

**Files Modified:**
- `portfolio/src/app/api/admin/assets/upload/route.ts` - Added AST integration and hot reload

**Code Added:**
```typescript
// If this is a hero image, update site-content.ts
if (validatedMetadata.category === 'hero' && validatedMetadata.projectSlug) {
  try {
    const siteContentPath = path.join(process.cwd(), 'src/features/portfolio/data/site-content.ts');
    const astManipulator = new ASTManipulator(siteContentPath);
    astManipulator.updateProjectImage(validatedMetadata.projectSlug, publicUrl);
    
    // Trigger hot reload to update the live site
    await triggerHotReload(siteContentPath);
  } catch (error) {
    console.error('Failed to update site-content.ts:', error);
  }
}
```

### 2. **Live Preview Not Working**
**Problem:** Preview panel in project editor wasn't loading or showing incorrect content.

**Root Causes:**
1. **Hardcoded Port**: Preview URLs were hardcoded to `localhost:3000` but server runs on `3001`
2. **No Refresh Mechanism**: No way to refresh preview after content changes

**Solutions:**
- **Dynamic URLs**: Changed preview URLs to use `window.location.origin` for automatic port detection
- **Refresh Button**: Added manual refresh button to reload preview iframe
- **Auto-reload**: Hero image uploads trigger page reload to show updated content

**Files Modified:**
- `portfolio/src/features/admin/components/ProjectEditor.tsx` - Dynamic preview URLs and auto-reload
- `portfolio/src/features/admin/components/PreviewPanel.tsx` - Added refresh functionality

**Code Changes:**
```typescript
// Dynamic preview URL (works on any port)
<PreviewPanel 
  previewUrl={project?.href ? `${window.location.origin}${project.href}` : window.location.origin}
/>

// Refresh mechanism in PreviewPanel
const handleRefresh = () => {
  setIsLoading(true);
  setRefreshKey(prev => prev + 1);
};
```

### 3. **Enhanced User Experience**
**Additional Improvements:**
- **Better Feedback**: Upload success messages explain that changes reflect automatically
- **Visual Refresh Button**: Clear refresh icon in preview panel header
- **Auto-reload After Upload**: Page automatically reloads 2 seconds after hero image upload
- **Error Handling**: Upload API continues working even if AST update fails

## 🧪 **How to Test the Fixes**

### **Test Image Upload Integration:**
1. Go to any project editor: `http://localhost:3001/admin/projects/[slug]`
2. Navigate to "Assets" tab
3. Upload a new hero image
4. **Expected Results:**
   - Success message appears
   - Page reloads automatically after 2 seconds
   - New image appears in "Current Hero Image" section
   - Live site at `http://localhost:3001` shows the new image immediately

### **Test Live Preview:**
1. In project editor, check the "Preview Panel" on the right side
2. **Expected Results:**
   - Preview loads correctly (no 404 errors)
   - Shows actual project page content
   - Refresh button works to reload preview
   - Device switching (Desktop/Tablet/Mobile) works
   - "Open in new tab" link works correctly

### **Test End-to-End Workflow:**
1. Upload a hero image in admin panel
2. Refresh the preview panel
3. Check the live site in a new tab
4. **Expected Results:**
   - All three locations show the new image consistently

## 🎯 **Technical Details**

### **Image Upload Flow:**
1. **File Upload** → `/public/assets/[project-slug]/[filename]`
2. **AST Update** → Updates `posterSrc` in `site-content.ts`
3. **Hot Reload** → Triggers Next.js file change detection
4. **Live Update** → Portfolio site shows new image immediately

### **Preview Panel Features:**
- **Responsive Testing**: Desktop (1440px), Tablet (768px), Mobile (375px)
- **Dynamic URLs**: Automatically adapts to current server port
- **Manual Refresh**: Force reload preview content
- **External Link**: Open full page in new tab for complete testing

Both image upload integration and live preview are now fully functional! 🎉