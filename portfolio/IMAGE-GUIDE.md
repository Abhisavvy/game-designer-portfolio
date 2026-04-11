# 📸 Portfolio Image Guide

## 🎯 Feature Hero Images (Project Cards)

### **Image Path Logic:**
Your portfolio automatically looks for hero images using this pattern:
```
/assets/${project.title.toLowerCase().replace(/\s+/g, '-')}/hero-image.jpg
```

### **📋 Required Images for Each Project:**

| Project Title | Folder Path | Required Hero Image |
|---------------|-------------|-------------------|
| **Food Fiesta** | `/assets/food-fiesta/` | `hero-image.jpg` |
| **AI & Innovation** | `/assets/ai-&-innovation/` | `hero-image.jpg` |
| **Kinoa LiveOps Integration** | `/assets/kinoa-liveops-integration/` | `hero-image.jpg` |
| **Word of the Day (WOTD)** | `/assets/word-of-the-day-(wotd)/` | `hero-image.jpg` |
| **Ticket Mania** | `/assets/ticket-mania/` | `hero-image.jpg` |
| **Tiles** | `/assets/tiles/` | `hero-image.jpg` |

## 📁 Complete Folder Structure

```
portfolio/public/assets/
├── general/
│   ├── profile/
│   │   └── abhishek-headshot.webp ✅
│   ├── workspace/
│   │   └── [add your workspace photos here]
│   └── design-process/
│       └── [add design process screenshots here]
├── food-fiesta/
│   ├── hero-image.jpg ← Main card image (REQUIRED)
│   ├── poster.webp ← Additional gallery images
│   ├── feature-demo.mp4 ← Videos (optional)
│   └── gallery/ ← Additional screenshots
├── ai-&-innovation/
│   └── hero-image.jpg ← REQUIRED
├── kinoa-liveops-integration/
│   └── hero-image.jpg ← REQUIRED
├── word-of-the-day-(wotd)/
│   └── hero-image.jpg ← REQUIRED
├── ticket-mania/
│   └── hero-image.jpg ← REQUIRED
├── tiles/
│   └── hero-image.jpg ← REQUIRED
├── word-roll/ (for additional Word Roll content)
│   └── hero-image.jpg ← REQUIRED
└── bon-voyage/
    └── hero-image.jpg ← REQUIRED
```

## 🎨 Image Specifications

### **Hero Images (Project Cards):**
- **Filename**: `hero-image.jpg` (exact name required)
- **Dimensions**: 800×640px (5:4 aspect ratio)
- **Format**: JPG or WebP
- **Size**: < 300KB optimized
- **Content**: Game screenshot, UI mockup, or feature preview

### **Additional Gallery Images:**
- **Naming**: Use descriptive names like:
  - `poster.webp` - Main promotional image
  - `gameplay-screenshot.jpg` - Gameplay captures
  - `ui-mockup.png` - Interface designs
  - `analytics-chart.webp` - Performance data
  - `feature-demo.mp4` - Video demonstrations

### **Profile Images:**
- **Profile Photo**: `/assets/general/profile/abhishek-headshot.webp` ✅
- **Workspace Photo**: `/assets/general/workspace/game-design-workspace.jpg`

## 🚀 Quick Setup Commands

```bash
# Navigate to your portfolio
cd portfolio/public/assets/

# Create all required project folders
mkdir -p food-fiesta ai-\&-innovation kinoa-liveops-integration
mkdir -p word-of-the-day-\(wotd\) ticket-mania tiles
mkdir -p word-roll bon-voyage

# Add hero images (replace with your actual images)
# Copy your screenshots to the appropriate folders with filename: hero-image.jpg
```

## 📝 Checklist

### ✅ Required Hero Images:
- [ ] Food Fiesta: `/assets/food-fiesta/hero-image.jpg`
- [ ] AI & Innovation: `/assets/ai-&-innovation/hero-image.jpg`
- [ ] Kinoa LiveOps: `/assets/kinoa-liveops-integration/hero-image.jpg`
- [ ] WOTD: `/assets/word-of-the-day-(wotd)/hero-image.jpg`
- [ ] Ticket Mania: `/assets/ticket-mania/hero-image.jpg`
- [ ] Tiles: `/assets/tiles/hero-image.jpg`
- [ ] Word Roll: `/assets/word-roll/hero-image.jpg`
- [ ] Bon Voyage: `/assets/bon-voyage/hero-image.jpg`

### ✅ Optional Additional Images:
- [ ] Workspace photo: `/assets/general/workspace/`
- [ ] Process screenshots: `/assets/general/design-process/`
- [ ] Project galleries: Additional images in each project folder

## 🔄 How It Works

1. **Automatic Detection**: Your `OptimizedImage` component automatically looks for `hero-image.jpg` in each project folder
2. **Fallback System**: If image doesn't exist, shows placeholder with project icon
3. **Optimization**: All images are automatically optimized by Next.js
4. **Responsive**: Images scale properly on all screen sizes

## 💡 Pro Tips

- **Use WebP format** when possible for better compression
- **Optimize images** before adding (use tools like TinyPNG)
- **Consistent aspect ratios** for professional appearance
- **Descriptive filenames** for better organization
- **Add alt text descriptions** when customizing components

---

🎮 **Your portfolio will automatically display these images once you add them to the correct folders!**