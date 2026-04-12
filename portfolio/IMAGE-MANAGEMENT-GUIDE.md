# 📸 Image Management Guide - Admin Panel Integration

## 🎯 **How Image Upload & Management Works**

### **Upload Locations:**
Images are organized by project in the `/public/assets/` directory:

```
public/assets/
├── general/              # General portfolio images (profile, etc.)
├── bon-voyage/          # Project-specific images
├── food-fiesta/         # Project-specific images  
├── tiles/               # Project-specific images
├── word-roll-events/    # Project-specific images
├── ai-innovation/       # Project-specific images
└── kinoa-integration/   # Project-specific images
```

### **Existing Placeholder Integration:**

**Current placeholders in site-content.ts:**
- `/assets/bon-voyage/poster.svg`
- `/assets/food-fiesta/poster.svg`
- `/assets/tiles/poster.svg`
- `/assets/ai-innovation/poster.svg`
- `/assets/kinoa-integration/poster.svg`

**Admin panel workflow:**
1. **Upload via Admin Panel** → Images saved to `/public/assets/[project-slug]/`
2. **Update site-content.ts** → AST manipulator updates `posterSrc` paths
3. **Live Preview** → Changes reflect immediately in portfolio

### **Image Categories & Usage:**

| Category | Usage | Location | Example |
|----------|-------|----------|---------|
| **hero** | Project hero/poster images | `/assets/[project]/poster.jpg` | Main project card image |
| **gallery** | Project gallery images | `/assets/[project]/gallery-1.jpg` | Case study galleries |
| **process** | Process/workflow images | `/assets/[project]/process-1.jpg` | Design process steps |
| **profile** | Profile/avatar images | `/assets/general/profile.jpg` | Personal profile photo |

### **Metadata Requirements:**

Every uploaded image requires:
- **Alt Text** (accessibility) - Required
- **Caption** (optional display text)
- **Category** (hero/gallery/process/profile)
- **Usage Context** (where image appears)

## 🚀 **Admin Panel Image Workflow**

### **1. Upload Images:**
- Go to `/admin/assets` or use project editor "Assets" tab
- Drag & drop or select images
- Fill required metadata
- Images auto-organized by project slug

### **2. Automatic Integration:**
- **Hero Images**: Automatically update `posterSrc` in site-content.ts
- **Gallery Images**: Added to `processGallery.items[]` array
- **Profile Images**: Update personal profile references

### **3. Real-time Preview:**
- Changes reflect immediately in preview panel
- Multi-device responsive validation
- Direct links to live portfolio pages

## 🔧 **Technical Implementation**

### **Upload Process:**
1. **Admin Panel** → `/api/admin/assets/upload`
2. **File Validation** → Type, size, format checks
3. **Metadata Storage** → Alt text, category, usage context
4. **File Organization** → `/public/assets/[project-slug]/filename.ext`
5. **AST Update** → Update site-content.ts references
6. **Live Refresh** → Portfolio updates automatically

### **Replacing Existing Placeholders:**

**Before (placeholder):**
```typescript
posterSrc: "/assets/bon-voyage/poster.svg"
```

**After (admin upload):**
```typescript  
posterSrc: "/assets/bon-voyage/hero-image-1234567890.jpg"
```

**Process:**
1. Upload image via admin panel for "bon-voyage" project
2. Select "hero" category
3. AST manipulator updates site-content.ts automatically
4. Old placeholder replaced with new image path

### **Image Optimization:**
- **Automatic**: Next.js Image component optimization
- **Formats**: JPEG, PNG, WebP supported
- **Sizes**: Responsive sizing for different devices
- **Loading**: Lazy loading and blur placeholders

## 📋 **Step-by-Step Usage**

### **Replace a Project Hero Image:**

1. **Navigate** to `/admin/projects/[project-slug]`
2. **Go to "Assets" tab**
3. **Upload new hero image:**
   - Category: "hero"
   - Alt text: "Bon Voyage event interface showing gem collection"
   - Usage context: "Hero image for Bon Voyage project card"
4. **Save** - Image automatically replaces placeholder in site-content.ts
5. **Preview** - Check live preview panel to verify changes

### **Add Gallery Images:**

1. **Upload multiple images** with category "gallery"
2. **Images automatically added** to processGallery array
3. **Thumbnails generated** for gallery navigation
4. **Full-size versions** available for lightbox view

### **Update Profile Photo:**

1. **Go to** `/admin/assets`
2. **Upload image** with category "profile"
3. **Image saved** to `/assets/general/profile.jpg`
4. **Personal info** automatically references new profile image

## 🎨 **Design Integration**

### **Responsive Images:**
- **Desktop**: Full resolution hero images
- **Tablet**: Medium resolution with proper aspect ratios  
- **Mobile**: Optimized smaller versions

### **Accessibility:**
- **Alt text required** for all images
- **Descriptive captions** for context
- **Proper contrast** validation
- **Screen reader friendly** metadata

### **Performance:**
- **WebP format** preferred for smaller file sizes
- **Lazy loading** for gallery images
- **Blur placeholders** during loading
- **CDN optimization** ready

## 🔄 **Migration from Placeholders**

### **Current State:**
- 5 projects with SVG placeholder posters
- Consistent `/assets/[project]/poster.svg` structure
- Ready for seamless replacement

### **Migration Process:**
1. **Upload real images** via admin panel
2. **Placeholders automatically replaced** by AST manipulator
3. **No manual code changes** required
4. **Backward compatibility** maintained

### **Rollback:**
- **Git version control** tracks all changes
- **Easy revert** to previous image versions
- **Atomic updates** prevent partial failures

---

## 🎉 **Benefits of This System**

✅ **No Code Required** - Pure admin panel workflow
✅ **Automatic Integration** - Images instantly appear in portfolio  
✅ **Responsive Ready** - Works across all device sizes
✅ **SEO Optimized** - Proper alt text and metadata
✅ **Performance Focused** - Optimized formats and loading
✅ **Accessibility Compliant** - Screen reader friendly
✅ **Version Controlled** - All changes tracked in git

**Your existing placeholders are ready to be replaced with real images through the admin panel!**