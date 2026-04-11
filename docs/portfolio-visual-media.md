# Visual media integration (Next.js portfolio)

This workspace ships media in the **Next.js** app under `portfolio/public/assets/` (URLs like `/assets/food-fiesta/poster.svg`). Case study pages read optional `media` on each `CaseStudy` in `portfolio/src/features/portfolio/data/site-content.ts`.

## Webflow parity

If you maintain a **Webflow** portfolio as well, mirror the same folder names and filenames in Webflow Assets, then embed using the HTML/CSS/JS patterns from your Task 6 spec (background video, gallery grid, lightbox script, video controls). Keep **Word Roll** capitalization consistent across Webflow, Reactive Resume, and this repo.

## Encoding

### Video (H.264 MP4)

```bash
ffmpeg -i input.mov -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k -movflags +faststart output.mp4
```

Target: 1920×1080 or 1280×720, ~2–4 Mbps, 30–90s, file size under ~10 MB when possible.

### Images

Prefer **WebP** (with JPEG fallback for critical hero images if you need older browsers). Export multiple widths (400 / 800 / 1200 / 1920). Use ~85% quality for photos; lossless or near-lossless for sharp UI screenshots. Always set **descriptive `alt` text** (see `CaseStudyGalleryItem` in code).

## Runtime behavior (implemented)

- **Hero**: Optional `hero.videoSrc`. Video plays only on **desktop** (`min-width: 768px`), muted, looping, low opacity; **poster** on smaller viewports and when `prefers-reduced-motion: reduce`.
- **Gallery**: Grid with hover/focus overlay; **lightbox** with Escape, arrows, backdrop close, body scroll lock.
- **Showcase video**: Intersection Observer defers attaching `source` until near viewport; mobile uses `preload="none"`; custom play overlay, progress scrub, fullscreen (including `webkitEnterFullscreen` on iOS where relevant).

## Testing checklist

1. **Performance**: Lighthouse / Network tab on `/work/food-fiesta` with throttling; confirm no eager download of MP4 until scroll (when `videoSrc` is set).
2. **Functionality**: Lightbox prev/next/keyboard; video play/pause/scrub/fullscreen.
3. **Mobile**: No hero autoplay video; showcase controls stay visible on small screens.
4. **Accessibility**: Tab to gallery tiles and play button; screen reader gets `alt` / `aria-label`; respect reduced motion.

## Milestone

**Visual media integration** is in place when real MP4/WebP assets replace placeholders and the checklist above passes on a production build.
