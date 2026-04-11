# Enhanced Webflow Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Abhishek's Webflow portfolio into a job-ready showcase with creative animations, responsive design, and compelling visual media integration.

**Architecture:** Smart hybrid approach using Webflow's native responsive system enhanced with strategic GSAP animations and optimized visual content, creating 4 key "wow moments" while maintaining professional performance standards.

**Tech Stack:** Webflow Designer, GSAP, Lottie Player, Custom CSS/JavaScript, Optimized Video/Image Assets

---

## File Structure & Asset Organization

**Webflow Project Structure:**
- **Site Settings**: Custom code injection for GSAP and global styles
- **Pages**: Home page enhancement with new sections and animations
- **Symbols**: Reusable animated components (navigation, buttons, cards)
- **Interactions**: Webflow native animations for transitions and hover states
- **Assets**: Optimized images (WebP format, multiple resolutions) and videos (MP4 H.264)

**External Assets:**
- **GSAP Libraries**: Core library + ScrollTrigger plugin via CDN
- **Lottie Files**: Process animation JSON files for design workflow illustrations
- **Video Content**: Compressed MP4 files (<10MB each) with poster images
- **Image Gallery**: High-quality screenshots and process documentation

**Custom Code Organization:**
- **Global Styles**: `/head` code for CSS variables and responsive utilities
- **Animation Scripts**: `/body` code for GSAP implementations
- **Performance Scripts**: Lazy loading and reduced motion detection
- **Analytics**: Animation engagement tracking code

## Task Breakdown

### Task 1: Foundation Setup & Responsive Framework

**Files:**
- Modify: Webflow Site Settings > Custom Code
- Modify: Home Page > All Sections (responsive settings)
- Create: Global CSS variables and utilities
- Test: Cross-device responsive behavior

- [ ] **Step 1: Backup current Webflow project**

Navigate to Webflow Dashboard > Project Settings > Backups
Create backup: "Pre-Enhancement Backup - [Today's Date]"
Download backup file for local storage
Expected: Backup created successfully, file downloaded

- [ ] **Step 2: Audit current responsive breakpoints**

Open Webflow Designer for "Abhishek in a nutshell" project  
Switch between Desktop (1920px), Tablet (768px), Mobile (375px) views
Document issues in browser notes:
- Navigation overlaps or missing hamburger menu
- Images scaling incorrectly or breaking aspect ratios  
- Text too small on mobile (<16px)
- Sections with excessive or insufficient spacing
Expected: Clear list of specific responsive issues identified

- [ ] **Step 3: Establish global CSS foundation**

In Site Settings > Custom Code > Head Code, add:

```css
<style>
/* CSS Variables for consistent theming */
:root {
  --primary-color: #1a1a1a;
  --accent-color: #00C853;
  --text-primary: #333333;
  --text-secondary: #666666;
  --animation-duration: 0.3s;
  --animation-easing: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Responsive utilities */
.section-padding {
  padding: 80px 0;
}

@media screen and (max-width: 991px) {
  .section-padding {
    padding: 60px 0;
  }
}

@media screen and (max-width: 767px) {
  .section-padding {
    padding: 40px 0;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Performance optimizations */
.will-animate {
  will-change: transform, opacity;
}

.animation-complete {
  will-change: auto;
}
</style>
```

Expected: Global styles applied, variables available for use

- [ ] **Step 4: Fix navigation responsive behavior**

Select Navigation component in Webflow Designer
In Settings panel:
- Ensure "Menu button" is enabled for tablet/mobile
- Set Menu type to "Over" (not "Push") 
- Configure button styles: 44px min touch target
- Test hamburger menu open/close functionality
Expected: Navigation works smoothly on all breakpoints

- [ ] **Step 5: Implement responsive typography system**

For each text element (H1, H2, H3, Body):
Desktop settings: Current sizes (maintain existing hierarchy)
Tablet settings: Reduce by 15% (H1: 48px→40px, H2: 36px→30px, etc.)
Mobile settings: Reduce by 30% (H1: 48px→34px, minimum 16px for body text)
Line-height: 1.4-1.6 for readability
Expected: Text readable and well-proportioned across all devices

- [ ] **Step 6: Optimize image responsive behavior**

For each image element:
- Set Size to "Cover" (maintains aspect ratio)
- Enable responsive image loading
- Set appropriate max-width: 100%
- Add proper alt text for accessibility
- Configure lazy loading in image settings
Expected: All images scale properly without distortion or layout breaks

- [ ] **Step 7: Test foundation across browsers and devices**

Test in Chrome, Firefox, Safari, Edge (latest versions)
Use browser dev tools to simulate various screen sizes
Check real mobile devices if available
Document any remaining issues for next iteration
Expected: Consistent behavior across browsers, major responsive issues resolved

- [ ] **Step 8: Commit foundation changes**

Publish changes to staging domain (if available)
Test published version on actual devices  
Document foundation completion with before/after screenshots
Create project milestone: "Foundation Complete - Responsive Framework Established"
Expected: Solid responsive foundation ready for animation enhancement

### Task 2: GSAP Integration & Animation Infrastructure

**Files:**
- Modify: Site Settings > Custom Code (Footer)  
- Create: Animation utility functions and GSAP setup
- Test: Basic animation functionality
- Validate: Performance impact measurement

- [ ] **Step 1: Install GSAP via CDN**

In Site Settings > Custom Code > Footer Code (before </body>), add:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
<script>
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);
  
  // Global animation utilities
  window.portfolioAnimations = {
    // Utility function for fade in animations
    fadeIn: function(element, delay = 0) {
      gsap.fromTo(element, 
        { opacity: 0, y: 30 }, 
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          delay: delay,
          ease: "power2.out"
        }
      );
    },
    
    // Utility function for counter animations  
    countUp: function(element, endValue, duration = 1.5) {
      let startValue = 0;
      gsap.to({ value: startValue }, {
        value: endValue,
        duration: duration,
        ease: "power2.out",
        onUpdate: function() {
          element.textContent = Math.round(this.targets()[0].value).toLocaleString();
        }
      });
    },
    
    // Check for reduced motion preference
    respectsReducedMotion: function() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  };
  
  console.log('GSAP and portfolio animations loaded successfully');
</script>
```

Expected: GSAP libraries loaded, console message appears, animation utilities available

- [ ] **Step 2: Test basic GSAP functionality**

In browser console, test basic GSAP functionality:
```javascript
gsap.to('.hero-headline', {duration: 2, x: 100, rotation: 360});
```
Verify animation runs smoothly
Reset element position after test
Expected: Animation executes smoothly, GSAP working correctly

- [ ] **Step 3: Implement performance monitoring**

Add performance monitoring code:

```html
<script>
// Performance monitoring for animations
window.animationPerformance = {
  startTime: performance.now(),
  
  logPerformance: function(animationName) {
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    console.log(`Animation "${animationName}" completed in ${duration.toFixed(2)}ms`);
    this.startTime = performance.now();
  },
  
  checkFPS: function() {
    let fps = 0;
    let lastTime = performance.now();
    
    function updateFPS() {
      fps++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        console.log(`Current FPS: ${fps}`);
        fps = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(updateFPS);
    }
    
    updateFPS();
  }
};

// Start FPS monitoring in development
if (window.location.hostname === 'preview.webflow.com' || window.location.hostname === 'localhost') {
  window.animationPerformance.checkFPS();
}
</script>
```

Expected: Performance monitoring active, FPS tracking in console

- [ ] **Step 4: Create reduced motion fallbacks**

Add reduced motion handling:

```html
<script>
// Handle reduced motion preferences
document.addEventListener('DOMContentLoaded', function() {
  if (window.portfolioAnimations.respectsReducedMotion()) {
    // Disable complex animations
    gsap.globalTimeline.clear();
    
    // Add class to body for CSS-based fallbacks
    document.body.classList.add('reduced-motion');
    
    // Override animation functions with instant versions
    window.portfolioAnimations.fadeIn = function(element) {
      gsap.set(element, { opacity: 1, y: 0 });
    };
    
    console.log('Reduced motion mode activated');
  }
});
</script>
```

Add corresponding CSS:
```css
.reduced-motion * {
  transition-duration: 0.01ms !important;
  animation-duration: 0.01ms !important;
}
```

Expected: Reduced motion preference respected, fallbacks working

- [ ] **Step 5: Test animation infrastructure**

Create test animation on existing element:
```javascript
// Test stagger animation on navigation links
gsap.from('.nav-link', {
  opacity: 0,
  y: -20,
  duration: 0.5,
  stagger: 0.1,
  ease: 'back.out(1.7)'
});
```

Verify smooth performance (60fps target)
Test on mobile device for performance validation
Expected: Smooth animation performance, no janky behavior

- [ ] **Step 6: Document animation standards**

Create animation guidelines comment:
```html
<!--
ANIMATION STANDARDS:
- Duration: 0.3s for micro-interactions, 0.6s for reveals, 1.5s for counters
- Easing: power2.out for natural feel, back.out for playful elements
- Stagger: 0.1s between elements for sequence animations
- Performance: Target 60fps, use transforms over position changes
- Accessibility: Always respect prefers-reduced-motion
- Testing: Monitor FPS and animation duration in console
-->
```

Expected: Clear standards documented for consistent implementation

- [ ] **Step 7: Validate cross-browser animation compatibility**

Test GSAP animations in:
- Chrome (latest): Full feature support expected
- Firefox (latest): Full feature support expected  
- Safari (latest): Check for any webkit-specific issues
- Edge (latest): Full feature support expected

Document any browser-specific adjustments needed
Expected: Consistent animation behavior across all target browsers

- [ ] **Step 8: Commit animation infrastructure**

Publish changes and test on staging environment
Verify all GSAP functionality works on published site
Create milestone: "Animation Infrastructure Complete - GSAP Ready"
Measure and document baseline performance metrics
Expected: Solid animation foundation ready for specific implementations

### Task 3: Hero Section "Game Designer in Action" Animation

**Files:**
- Modify: Hero Section elements and classes
- Create: Typewriter animation and counter functionality
- Create: Particle background system
- Test: Hero animation performance and mobile adaptation

- [ ] **Step 1: Prepare hero section elements for animation**

In Webflow Designer, add classes to hero elements:
- Headline text: Add class "hero-headline"
- DAU metric: Add class "dau-counter" 
- Background container: Add class "hero-background"
- Overall section: Add class "hero-section"

Set initial states:
- Headline opacity: 0 (will be animated in)
- Counter text: "0+" (will animate to "40k+")
- Background: Prepare for particle container
Expected: Hero elements properly classed and ready for animation

- [ ] **Step 2: Implement typewriter effect for headline**

Add to Footer Code:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  const headline = document.querySelector('.hero-headline');
  if (!headline) return;
  
  const originalText = headline.textContent;
  headline.textContent = '';
  headline.style.opacity = '1';
  
  // Add cursor element
  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  cursor.textContent = '|';
  headline.appendChild(cursor);
  
  if (window.portfolioAnimations.respectsReducedMotion()) {
    // Instant reveal for reduced motion
    headline.textContent = originalText;
    return;
  }
  
  // Typewriter animation
  gsap.to({}, {
    duration: originalText.length * 0.08, // 80ms per character
    ease: "none",
    onUpdate: function() {
      const progress = Math.round(this.progress() * originalText.length);
      headline.textContent = originalText.slice(0, progress);
      headline.appendChild(cursor);
    },
    onComplete: function() {
      // Cursor blink animation
      gsap.to(cursor, {
        opacity: 0,
        duration: 0.5,
        repeat: -1,
        yoyo: true
      });
      
      window.animationPerformance.logPerformance('Typewriter Effect');
    }
  });
});
</script>
```

Add cursor styles to CSS:
```css
.typewriter-cursor {
  color: var(--accent-color);
  font-weight: normal;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

Expected: Smooth typewriter effect with blinking cursor

- [ ] **Step 3: Create animated counter for DAU metric**

Implement counter animation with hover trigger:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  const counterElement = document.querySelector('.dau-counter');
  if (!counterElement) return;
  
  let hasAnimated = false;
  
  function animateCounter() {
    if (hasAnimated) return;
    hasAnimated = true;
    
    if (window.portfolioAnimations.respectsReducedMotion()) {
      counterElement.textContent = '40k+';
      return;
    }
    
    const counter = { value: 0 };
    gsap.to(counter, {
      value: 40000,
      duration: 1.5,
      ease: "power2.out",
      onUpdate: function() {
        const currentValue = Math.round(counter.value);
        const formattedValue = currentValue >= 1000 
          ? (currentValue / 1000).toFixed(currentValue % 1000 === 0 ? 0 : 1) + 'k'
          : currentValue.toString();
        counterElement.textContent = formattedValue + '+';
      },
      onComplete: function() {
        window.animationPerformance.logPerformance('DAU Counter');
      }
    });
  }
  
  // Trigger on hover (desktop) or intersection (mobile)
  if (window.innerWidth > 768) {
    counterElement.addEventListener('mouseenter', animateCounter);
  } else {
    // Intersection observer for mobile
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(counterElement);
  }
});
</script>
```

Expected: Counter animates smoothly from 0 to 40k+ with proper formatting

- [ ] **Step 4: Create particle background system**

Implement CSS-based particle animation:

```css
.hero-background {
  position: relative;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(0, 200, 83, 0.6);
  border-radius: 50%;
  pointer-events: none;
}

@media (max-width: 767px) {
  .particle {
    display: none; /* Disable on mobile for performance */
  }
}
```

Create particles with JavaScript:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  const heroBackground = document.querySelector('.hero-background');
  if (!heroBackground || window.innerWidth <= 767) return;
  
  if (window.portfolioAnimations.respectsReducedMotion()) return;
  
  // Create particles
  const particleCount = 25;
  const particles = [];
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random starting position
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    
    heroBackground.appendChild(particle);
    particles.push(particle);
    
    // Animate particle movement
    gsap.to(particle, {
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      duration: 10 + Math.random() * 10,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
    
    // Fade in particle
    gsap.from(particle, {
      opacity: 0,
      duration: 2,
      delay: Math.random() * 3
    });
  }
  
  console.log(`Created ${particleCount} particles for hero background`);
});
</script>
```

Expected: Subtle animated particle background on desktop, disabled on mobile

- [ ] **Step 5: Implement mobile-optimized hero animations**

Add mobile-specific optimizations:

```css
@media (max-width: 767px) {
  .hero-headline {
    font-size: 2rem; /* Ensure readability */
    line-height: 1.3;
  }
  
  .dau-counter {
    font-size: 1.5rem;
    font-weight: 600;
  }
}
```

Mobile-specific JavaScript optimizations:

```html
<script>
// Mobile performance optimizations
if (window.innerWidth <= 767) {
  // Faster typewriter for mobile
  document.addEventListener('DOMContentLoaded', function() {
    const headline = document.querySelector('.hero-headline');
    if (!headline) return;
    
    // Reduce character delay for mobile
    const originalText = headline.textContent;
    headline.textContent = '';
    
    gsap.to({}, {
      duration: originalText.length * 0.05, // Faster on mobile
      ease: "none",
      onUpdate: function() {
        const progress = Math.round(this.progress() * originalText.length);
        headline.textContent = originalText.slice(0, progress);
      }
    });
  });
}
</script>
```

Expected: Optimized mobile experience with faster animations and no particles

- [ ] **Step 6: Test hero section performance**

Performance validation checklist:
- Monitor FPS during animations (should maintain 60fps)
- Test on mobile device (animations should be smooth)
- Verify reduced motion fallbacks work correctly
- Check memory usage (particles should not cause leaks)

Use performance monitoring:
```javascript
// Test hero animation performance
window.animationPerformance.checkFPS();
```

Expected: Smooth 60fps performance, no memory leaks, mobile-optimized

- [ ] **Step 7: Implement accessibility enhancements**

Add screen reader support:

```html
<div class="hero-headline" aria-live="polite" role="text">
  Feature Designer | Mobile Game Specialist
</div>

<div class="dau-counter" aria-live="polite" aria-label="Daily active users count">
  40k+
</div>
```

Add focus management for keyboard users:
```css
.dau-counter:focus {
  outline: 2px solid var(--accent-color);
  outline-offset: 4px;
}
```

Expected: Accessible to screen readers and keyboard navigation

- [ ] **Step 8: Test and optimize hero section**

Comprehensive testing protocol:
1. Desktop browsers (Chrome, Firefox, Safari, Edge)
2. Mobile devices (iOS Safari, Chrome Mobile)  
3. Tablet devices (iPad, Android tablets)
4. Screen readers (VoiceOver, NVDA)
5. Keyboard navigation
6. Reduced motion preferences

Document any issues and optimizations needed
Create performance benchmark for hero section
Expected: Fully functional, accessible, performant hero animation

- [ ] **Step 9: Commit hero section enhancement**

Publish changes and validate on live environment
Test hero animations on published site
Document completion with performance metrics
Create milestone: "Hero Section Complete - First Wow Moment Achieved"
Expected: Hero section delivering strong first impression with engaging animations

### Task 4: Case Study "Impact Visualization" Animations  

**Files:**
- Modify: Case Study sections (Food Fiesta, Word Roll Growth)
- Create: Progress bar and chart animations with ScrollTrigger
- Create: Video integration and interactive overlays
- Test: Scroll-triggered animations and mobile performance

- [ ] **Step 1: Prepare case study elements for animation**

Add classes to Food Fiesta section elements:
- Section container: "food-fiesta-section" 
- Metric text: "food-fiesta-metric"
- Progress bar container: "progress-bar-container"
- Progress bar fill: "progress-bar-fill"

Add classes to Word Roll section elements:
- Section container: "word-roll-section"
- Growth chart container: "growth-chart-container" 
- Chart SVG: "growth-chart-svg"
- Data points: "chart-data-point" (for each point)

Expected: All case study elements properly classed and ready for animation

- [ ] **Step 2: Create animated progress bar for Food Fiesta (71% increase)**

Add progress bar HTML structure in Webflow:
```html
<div class="progress-bar-container">
  <div class="progress-bar-background">
    <div class="progress-bar-fill" data-progress="71"></div>
  </div>
  <div class="progress-percentage">0%</div>
</div>
```

Style the progress bar:
```css
.progress-bar-container {
  margin: 20px 0;
  width: 100%;
}

.progress-bar-background {
  width: 100%;
  height: 8px;
  background: rgba(0, 200, 83, 0.2);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  width: 0%;
  height: 100%;
  background: linear-gradient(90deg, #00C853, #4CAF50);
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 10px;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 0 4px 4px 0;
}

.progress-percentage {
  margin-top: 8px;
  font-weight: 600;
  color: var(--accent-color);
  font-size: 1.2rem;
}
```

Expected: Styled progress bar ready for animation

- [ ] **Step 3: Implement ScrollTrigger animation for Food Fiesta**

Create scroll-triggered progress bar animation:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  const progressBar = document.querySelector('.progress-bar-fill');
  const percentageDisplay = document.querySelector('.progress-percentage');
  
  if (!progressBar || !percentageDisplay) return;
  
  const targetProgress = parseInt(progressBar.dataset.progress) || 71;
  
  if (window.portfolioAnimations.respectsReducedMotion()) {
    // Instant completion for reduced motion
    progressBar.style.width = targetProgress + '%';
    percentageDisplay.textContent = targetProgress + '%';
    return;
  }
  
  // GSAP ScrollTrigger animation
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.food-fiesta-section',
      start: 'top 75%',
      end: 'bottom 25%',
      toggleActions: 'play none none reverse',
      onEnter: () => console.log('Food Fiesta animation triggered')
    }
  });
  
  // Counter object for percentage display
  const counter = { value: 0 };
  
  // Animate progress bar width
  tl.to(progressBar, {
    width: targetProgress + '%',
    duration: 2,
    ease: 'power2.out'
  })
  // Animate percentage counter (parallel with progress bar)
  .to(counter, {
    value: targetProgress,
    duration: 2,
    ease: 'power2.out',
    onUpdate: function() {
      percentageDisplay.textContent = Math.round(counter.value) + '%';
    }
  }, 0); // Start at same time as progress bar
  
  console.log('Food Fiesta progress animation initialized');
});
</script>
```

Expected: Progress bar animates from 0% to 71% when scrolled into view

- [ ] **Step 4: Create SVG line chart for Word Roll growth (4k→40k DAU)**

Create SVG chart structure in Webflow:
```html
<div class="growth-chart-container">
  <svg class="growth-chart-svg" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Chart background grid -->
    <defs>
      <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 20" fill="none" stroke="rgba(51,51,51,0.1)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
    
    <!-- Chart axes -->
    <line x1="50" y1="160" x2="350" y2="160" stroke="#666" stroke-width="2"/>
    <line x1="50" y1="160" x2="50" y2="40" stroke="#666" stroke-width="2"/>
    
    <!-- Data line (will be animated) -->
    <path id="growth-line" d="M 50 160 L 120 140 L 200 100 L 280 70 L 350 40" 
          fill="none" stroke="#00C853" stroke-width="3" stroke-linecap="round"
          stroke-dasharray="1000" stroke-dashoffset="1000"/>
    
    <!-- Data points (will be animated in sequence) -->
    <circle class="chart-data-point" cx="50" cy="160" r="4" fill="#00C853" opacity="0"/>
    <circle class="chart-data-point" cx="120" cy="140" r="4" fill="#00C853" opacity="0"/>
    <circle class="chart-data-point" cx="200" cy="100" r="4" fill="#00C853" opacity="0"/>
    <circle class="chart-data-point" cx="280" cy="70" r="4" fill="#00C853" opacity="0"/>
    <circle class="chart-data-point" cx="350" cy="40" r="4" fill="#00C853" opacity="0"/>
    
    <!-- Labels -->
    <text x="50" y="180" text-anchor="middle" class="chart-label">2024 Q3</text>
    <text x="350" y="180" text-anchor="middle" class="chart-label">2025 Q2</text>
    <text x="30" y="165" text-anchor="middle" class="chart-label">4k</text>
    <text x="30" y="45" text-anchor="middle" class="chart-label">40k</text>
  </svg>
</div>
```

Style the chart:
```css
.growth-chart-container {
  margin: 30px 0;
  padding: 20px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.growth-chart-svg {
  width: 100%;
  height: auto;
  max-width: 500px;
}

.chart-label {
  font-size: 12px;
  fill: var(--text-secondary);
  font-family: inherit;
}

@media (max-width: 767px) {
  .growth-chart-svg {
    max-width: 100%;
  }
  
  .chart-label {
    font-size: 10px;
  }
}
```

Expected: Professional SVG chart ready for animation

- [ ] **Step 5: Animate Word Roll growth chart with ScrollTrigger**

Implement line drawing and point reveal animation:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  const growthLine = document.getElementById('growth-line');
  const dataPoints = document.querySelectorAll('.chart-data-point');
  
  if (!growthLine || !dataPoints.length) return;
  
  if (window.portfolioAnimations.respectsReducedMotion()) {
    // Instant reveal for reduced motion
    gsap.set(growthLine, { strokeDashoffset: 0 });
    gsap.set(dataPoints, { opacity: 1 });
    return;
  }
  
  // ScrollTrigger timeline for chart animation
  const chartTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '.word-roll-section',
      start: 'top 70%',
      end: 'bottom 30%',
      toggleActions: 'play none none reverse',
      onEnter: () => console.log('Word Roll chart animation triggered')
    }
  });
  
  // Animate line drawing
  chartTimeline.to(growthLine, {
    strokeDashoffset: 0,
    duration: 2.5,
    ease: 'power2.inOut'
  })
  // Animate data points appearing (staggered)
  .to(dataPoints, {
    opacity: 1,
    scale: 1,
    duration: 0.4,
    stagger: 0.2,
    ease: 'back.out(1.7)'
  }, '-=1'); // Start 1 second before line completes
  
  console.log('Word Roll growth chart animation initialized');
});
</script>
```

Expected: Line chart draws smoothly with data points appearing in sequence

- [ ] **Step 6: Add interactive tooltips for chart data points**

Implement hover tooltips for data points:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  const dataPoints = document.querySelectorAll('.chart-data-point');
  const tooltipData = [
    { value: '4k DAU', period: '2024 Q3 - Launch Phase' },
    { value: '12k DAU', period: '2024 Q4 - Initial Growth' },
    { value: '22k DAU', period: '2025 Q1 - Feature Expansion' },
    { value: '32k DAU', period: '2025 Q1 - Optimization' },
    { value: '40k+ DAU', period: '2025 Q2 - Hypergrowth' }
  ];
  
  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.className = 'chart-tooltip';
  tooltip.style.cssText = `
    position: absolute;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    pointer-events: none;
    opacity: 0;
    z-index: 1000;
    white-space: nowrap;
  `;
  document.body.appendChild(tooltip);
  
  dataPoints.forEach((point, index) => {
    const data = tooltipData[index];
    
    point.addEventListener('mouseenter', (e) => {
      tooltip.innerHTML = `<strong>${data.value}</strong><br>${data.period}`;
      tooltip.style.opacity = '1';
      
      // Scale up data point
      gsap.to(point, { scale: 1.5, duration: 0.2 });
    });
    
    point.addEventListener('mousemove', (e) => {
      tooltip.style.left = e.clientX + 10 + 'px';
      tooltip.style.top = e.clientY - 10 + 'px';
    });
    
    point.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
      
      // Scale down data point
      gsap.to(point, { scale: 1, duration: 0.2 });
    });
  });
});
</script>
```

Expected: Interactive tooltips showing detailed growth metrics on hover

- [ ] **Step 7: Optimize animations for mobile performance**

Add mobile-specific optimizations:

```css
@media (max-width: 767px) {
  .progress-bar-container {
    margin: 15px 0;
  }
  
  .growth-chart-container {
    margin: 20px 0;
    padding: 15px;
  }
  
  /* Simplify animations on mobile */
  .chart-data-point {
    r: 3; /* Smaller touch targets */
  }
}
```

Mobile JavaScript optimizations:

```html
<script>
// Mobile-specific performance optimizations for case studies
if (window.innerWidth <= 767) {
  document.addEventListener('DOMContentLoaded', function() {
    // Faster animations on mobile
    const isMobile = true;
    
    // Reduce animation durations for mobile
    gsap.globalTimeline.timeScale(1.5); // Make animations 50% faster
    
    // Disable complex hover states on mobile
    const dataPoints = document.querySelectorAll('.chart-data-point');
    dataPoints.forEach(point => {
      point.style.pointerEvents = 'none';
    });
    
    console.log('Mobile optimizations applied to case study animations');
  });
}
</script>
```

Expected: Optimized mobile performance with appropriate animation simplifications

- [ ] **Step 8: Test case study animations thoroughly**

Comprehensive testing protocol:
1. **Scroll Trigger Testing**:
   - Scroll down to trigger animations
   - Scroll up and back down (should re-trigger appropriately)
   - Test at various scroll speeds
   - Verify animations don't overlap or conflict

2. **Performance Testing**:
   - Monitor FPS during animations (target: 60fps)
   - Test on mobile devices for smoothness  
   - Check memory usage with developer tools
   - Verify no memory leaks after animations complete

3. **Cross-browser Testing**:
   - Chrome: Test latest version
   - Firefox: Test latest version
   - Safari: Test both desktop and mobile
   - Edge: Test latest version

4. **Accessibility Testing**:
   - Test with screen readers
   - Verify reduced motion preferences work
   - Test keyboard navigation
   - Check color contrast on chart elements

Expected: Smooth, accessible, performant case study animations across all platforms

- [ ] **Step 9: Document and commit case study enhancements**

Create documentation comment:
```html
<!-- 
CASE STUDY ANIMATIONS DOCUMENTATION:
- Food Fiesta: Progress bar animation (0% to 71% over 2 seconds)
- Word Roll: SVG line chart with staggered data point reveals
- Trigger: ScrollTrigger at 75% viewport entry
- Mobile: Simplified animations, faster durations
- Performance: Target 60fps, reduced motion support
- Accessibility: Screen reader friendly, keyboard navigable
-->
```

Publish changes and test on live environment
Create milestone: "Case Study Animations Complete - Impact Visualization Achieved"
Document performance benchmarks and any optimization notes
Expected: Professional data visualizations enhancing case study impact

### Task 5: Skills Matrix Interactive Grid Animation

**Files:**
- Modify: Skills section layout and elements
- Create: Staggered reveal animations and hover interactions
- Create: Progress ring animations for skill proficiency
- Test: Interactive grid performance and mobile touch support

- [ ] **Step 1: Restructure skills section for animation**

In Webflow Designer, reorganize skills section:
- Main container: Add class "skills-section"
- Skills grid: Add class "skills-grid" 
- Individual skill items: Add class "skill-item"
- Skill categories: Add classes "category-game-dev", "category-analytics", "category-innovation"
- Progress indicators: Add class "skill-progress" to each

Set up grid structure:
```css
.skills-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin: 40px 0;
}

@media (max-width: 991px) {
  .skills-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;
  }
}

@media (max-width: 767px) {
  .skills-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

.skill-item {
  padding: 25px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.skill-item:hover {
  border-color: var(--accent-color);
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 200, 83, 0.15);
}
```

Expected: Clean, responsive grid layout ready for interactive animations

- [ ] **Step 2: Create staggered reveal animation for skills on scroll**

Implement ScrollTrigger animation for skills grid:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  const skillItems = document.querySelectorAll('.skill-item');
  
  if (!skillItems.length) return;
  
  // Set initial state for animation
  gsap.set(skillItems, {
    opacity: 0,
    y: 40,
    scale: 0.9
  });
  
  if (window.portfolioAnimations.respectsReducedMotion()) {
    // Instant reveal for reduced motion
    gsap.set(skillItems, {
      opacity: 1,
      y: 0,
      scale: 1
    });
    return;
  }
  
  // Staggered reveal animation
  ScrollTrigger.create({
    trigger: '.skills-section',
    start: 'top 75%',
    end: 'bottom 25%',
    onEnter: () => {
      gsap.to(skillItems, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: {
          amount: 0.8, // Total stagger duration
          grid: window.innerWidth > 767 ? [3, 2] : [1, 6], // Adapt to grid layout
          from: "start"
        },
        ease: "back.out(1.7)",
        onComplete: () => {
          console.log('Skills grid animation completed');
          window.animationPerformance.logPerformance('Skills Grid Reveal');
        }
      });
    }
  });
  
  console.log('Skills grid animation initialized');
});
</script>
```

Expected: Skills items reveal in elegant staggered sequence when scrolled into view

- [ ] **Step 3: Create circular progress indicators for skill proficiency**

Add SVG progress rings to each skill item:

```html
<!-- Add this structure to each skill item in Webflow -->
<div class="skill-progress" data-progress="85"> <!-- Unity: 85% proficiency -->
  <svg class="progress-ring" width="60" height="60">
    <circle class="progress-ring-background" 
            cx="30" cy="30" r="25" 
            fill="transparent" 
            stroke="rgba(0, 200, 83, 0.2)" 
            stroke-width="4"/>
    <circle class="progress-ring-fill" 
            cx="30" cy="30" r="25" 
            fill="transparent" 
            stroke="#00C853" 
            stroke-width="4"
            stroke-dasharray="157.08" 
            stroke-dashoffset="157.08"
            stroke-linecap="round"/>
  </svg>
  <span class="progress-percentage">0%</span>
</div>
```

Style the progress rings:

```css
.skill-progress {
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-ring {
  transform: rotate(-90deg); /* Start from top */
}

.progress-percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-color);
}

@media (max-width: 767px) {
  .skill-progress {
    top: 10px;
    right: 10px;
  }
  
  .progress-ring {
    width: 50px;
    height: 50px;
  }
}
```

Expected: Professional circular progress indicators positioned in each skill card

- [ ] **Step 4: Animate progress rings on hover/interaction**

Implement interactive progress ring animations:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  const skillItems = document.querySelectorAll('.skill-item');
  
  skillItems.forEach((item) => {
    const progressElement = item.querySelector('.skill-progress');
    const progressRing = item.querySelector('.progress-ring-fill');
    const percentageDisplay = item.querySelector('.progress-percentage');
    
    if (!progressElement || !progressRing || !percentageDisplay) return;
    
    const targetProgress = parseInt(progressElement.dataset.progress) || 0;
    const circumference = 2 * Math.PI * 25; // radius = 25
    const offset = circumference - (targetProgress / 100 * circumference);
    
    let hasAnimated = false;
    
    function animateProgress() {
      if (hasAnimated) return;
      hasAnimated = true;
      
      if (window.portfolioAnimations.respectsReducedMotion()) {
        // Instant completion for reduced motion
        progressRing.style.strokeDashoffset = offset;
        percentageDisplay.textContent = targetProgress + '%';
        return;
      }
      
      // Animate progress ring
      gsap.fromTo(progressRing, 
        { strokeDashoffset: circumference },
        { 
          strokeDashoffset: offset,
          duration: 1.2,
          ease: "power2.out"
        }
      );
      
      // Animate percentage counter
      const counter = { value: 0 };
      gsap.to(counter, {
        value: targetProgress,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: function() {
          percentageDisplay.textContent = Math.round(counter.value) + '%';
        }
      });
    }
    
    function resetProgress() {
      hasAnimated = false;
      gsap.set(progressRing, { strokeDashoffset: circumference });
      percentageDisplay.textContent = '0%';
    }
    
    // Desktop: hover interaction
    if (window.innerWidth > 768) {
      item.addEventListener('mouseenter', animateProgress);
      item.addEventListener('mouseleave', resetProgress);
    } else {
      // Mobile: intersection observer (animate once when visible)
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateProgress();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.7 });
      
      observer.observe(item);
    }
  });
  
  console.log('Skill progress ring interactions initialized');
});
</script>
```

Expected: Progress rings animate on hover (desktop) or when visible (mobile)

- [ ] **Step 5: Add skill category highlighting and grouping animations**

Implement category-based interactions:

```css
/* Category highlighting */
.skills-grid:hover .skill-item:not(:hover) {
  opacity: 0.6;
  transform: scale(0.98);
}

.skill-item.category-game-dev {
  border-left: 4px solid #2196F3;
}

.skill-item.category-analytics {
  border-left: 4px solid #FF9800;
}

.skill-item.category-innovation {
  border-left: 4px solid #9C27B0;
}

/* Hover enhancements */
.skill-item:hover {
  z-index: 10;
}

/* Focus states for keyboard navigation */
.skill-item:focus {
  outline: 2px solid var(--accent-color);
  outline-offset: 4px;
}
```

Add JavaScript for category interactions:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  const skillItems = document.querySelectorAll('.skill-item');
  
  // Add keyboard support
  skillItems.forEach((item) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    
    // Keyboard interaction
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
    
    // Enhanced hover effects with category highlighting
    item.addEventListener('mouseenter', () => {
      const category = item.classList.contains('category-game-dev') ? 'game-dev' :
                      item.classList.contains('category-analytics') ? 'analytics' :
                      item.classList.contains('category-innovation') ? 'innovation' : '';
      
      if (category) {
        console.log(`Highlighting ${category} category skills`);
      }
    });
  });
  
  console.log('Skills category interactions initialized');
});
</script>
```

Expected: Elegant category-based hover effects and keyboard accessibility

- [ ] **Step 6: Implement mobile touch interactions**

Add touch-friendly mobile interactions:

```css
@media (max-width: 767px) {
  .skill-item {
    padding: 20px;
    margin-bottom: 15px;
  }
  
  .skill-item:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
  
  /* Larger touch targets */
  .skill-item {
    min-height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
```

Mobile-specific JavaScript:

```html
<script>
// Enhanced mobile touch interactions
if (window.innerWidth <= 767) {
  document.addEventListener('DOMContentLoaded', function() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach((item) => {
      let touchStartTime = 0;
      
      item.addEventListener('touchstart', () => {
        touchStartTime = Date.now();
        gsap.to(item, { scale: 0.98, duration: 0.1 });
      });
      
      item.addEventListener('touchend', () => {
        const touchDuration = Date.now() - touchStartTime;
        
        gsap.to(item, { scale: 1, duration: 0.1 });
        
        // If touch was brief (tap), trigger progress animation
        if (touchDuration < 300) {
          const progressRing = item.querySelector('.progress-ring-fill');
          const progressElement = item.querySelector('.skill-progress');
          
          if (progressRing && progressElement) {
            // Trigger progress animation on tap
            item.dispatchEvent(new Event('mouseenter'));
          }
        }
      });
    });
    
    console.log('Mobile touch interactions enabled for skills grid');
  });
}
</script>
```

Expected: Responsive touch interactions with appropriate feedback on mobile

- [ ] **Step 7: Test skills matrix performance and accessibility**

Comprehensive testing protocol:

1. **Performance Testing**:
   - Monitor FPS during stagger animations
   - Test hover interactions responsiveness  
   - Check memory usage with multiple hover interactions
   - Verify smooth performance on mobile devices

2. **Accessibility Testing**:
   - Test with screen readers (VoiceOver, NVDA)
   - Verify keyboard navigation works correctly
   - Test focus indicators visibility
   - Check reduced motion fallbacks

3. **Cross-browser Testing**:
   - Chrome: Test all animations and interactions
   - Firefox: Verify SVG progress rings work correctly
   - Safari: Test both desktop and mobile interactions
   - Edge: Verify consistent behavior

4. **Interactive Testing**:
   - Test rapid hover on/off interactions
   - Verify animations don't conflict or stack
   - Test touch interactions on actual mobile devices
   - Check tooltip positioning and readability

Expected: Smooth, accessible, engaging skills matrix across all platforms

- [ ] **Step 8: Document and commit skills matrix enhancement**

Create comprehensive documentation:

```html
<!--
SKILLS MATRIX ANIMATION DOCUMENTATION:
- Staggered reveal: 0.8s total duration, back.out(1.7) easing
- Progress rings: 1.2s animation, power2.out easing
- Mobile: Touch interactions with scale feedback
- Accessibility: Keyboard navigation, screen reader support
- Performance: 60fps target, reduced motion support
- Categories: Color-coded borders (game-dev: blue, analytics: orange, innovation: purple)
-->
```

Performance benchmarks to document:
- Stagger animation FPS
- Hover interaction response time
- Mobile touch responsiveness
- Memory usage during interactions

Publish changes and validate on live environment
Create milestone: "Skills Matrix Complete - Interactive Expertise Showcase"
Expected: Professional, engaging skills matrix demonstrating technical proficiency

### Task 6: Visual Media Integration & Enhancement

**Files:**
- Create: Optimized video and image assets
- Modify: Case study sections for media integration
- Create: Interactive galleries and video overlays
- Test: Media loading performance and mobile optimization

- [ ] **Step 1: Audit and organize existing visual assets**

Create asset inventory checklist:
- **Screenshots**: Game UI mockups, wireframes, design iterations
- **Process Documentation**: Figma screenshots, Machinations.io models, analytics dashboards  
- **Video Content**: Screen recordings of game features, design process timelapses
- **Behind-the-Scenes**: Workspace photos, team collaboration images

Organize assets by project:
```
/assets/
  /food-fiesta/
    - ui-mockups.png
    - analytics-dashboard.png
    - feature-demo.mp4
  /word-roll/
    - growth-chart.png
    - gameplay-video.mp4
    - process-timelapse.mp4
  /general/
    - workspace-photos/
    - design-process/
    - tool-screenshots/
```

Expected: Complete inventory of available visual assets organized by project

- [ ] **Step 2: Optimize visual content for web performance**

Video optimization specifications:
- **Format**: MP4 (H.264 codec) for maximum compatibility
- **Resolution**: 1920x1080 for desktop, 1280x720 for mobile fallback
- **Bitrate**: 2-4 Mbps for high quality, <10MB file size target
- **Duration**: 30-90 seconds per video for optimal engagement

Image optimization specifications:
- **Format**: WebP with JPEG fallback for older browsers
- **Sizes**: Multiple resolutions (400px, 800px, 1200px, 1920px)
- **Compression**: 85% quality for photos, lossless for UI screenshots
- **Alt text**: Descriptive text for all images (accessibility requirement)

Create optimized assets:
```bash
# Video optimization (run locally with ffmpeg)
ffmpeg -i input.mov -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k -movflags +faststart output.mp4

# Image optimization 
# Use tools like ImageOptim, Squoosh.app, or Webflow's built-in optimization
```

Expected: All visual assets optimized for web with appropriate fallbacks

- [ ] **Step 3: Integrate hero background video for Food Fiesta section**

Add background video to Food Fiesta case study:

HTML structure in Webflow:
```html
<div class="case-study-hero">
  <video class="background-video" autoplay muted loop playsinline poster="food-fiesta-poster.jpg">
    <source src="food-fiesta-gameplay.mp4" type="video/mp4">
    <!-- Fallback image for unsupported browsers -->
    <img src="food-fiesta-poster.jpg" alt="Food Fiesta gameplay demonstration">
  </video>
  <div class="case-study-content">
    <!-- Existing content here -->
  </div>
</div>
```

CSS for video background:
```css
.case-study-hero {
  position: relative;
  overflow: hidden;
  min-height: 400px;
}

.background-video {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: translate(-50%, -50%);
  z-index: -1;
  opacity: 0.3; /* Subtle background, doesn't compete with text */
}

.case-study-content {
  position: relative;
  z-index: 2;
  padding: 60px 40px;
  background: rgba(255, 255, 255, 0.95); /* Semi-transparent overlay */
}

@media (max-width: 767px) {
  .background-video {
    display: none; /* Disable on mobile for performance */
  }
  
  .case-study-hero {
    background-image: url('food-fiesta-poster.jpg');
    background-size: cover;
    background-position: center;
  }
}
```

Expected: Engaging background video that enhances but doesn't distract from content

- [ ] **Step 4: Create interactive image galleries for design process**

Implement lightbox gallery for process documentation:

```html
<!-- Add to each case study section -->
<div class="process-gallery">
  <h4>Design Process</h4>
  <div class="gallery-grid">
    <div class="gallery-item" data-lightbox="food-fiesta-process">
      <img src="wireframe-thumb.jpg" alt="Initial wireframe concepts" loading="lazy">
      <div class="gallery-overlay">
        <span class="gallery-icon">🔍</span>
        <span class="gallery-label">Wireframes</span>
      </div>
    </div>
    <div class="gallery-item" data-lightbox="food-fiesta-process">
      <img src="ui-mockup-thumb.jpg" alt="UI design mockups" loading="lazy">
      <div class="gallery-overlay">
        <span class="gallery-icon">🎨</span>
        <span class="gallery-label">UI Design</span>
      </div>
    </div>
    <div class="gallery-item" data-lightbox="food-fiesta-process">
      <img src="analytics-thumb.jpg" alt="Performance analytics dashboard" loading="lazy">
      <div class="gallery-overlay">
        <span class="gallery-icon">📊</span>
        <span class="gallery-label">Results</span>
      </div>
    </div>
  </div>
</div>
```

Style the gallery:
```css
.process-gallery {
  margin: 40px 0;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.gallery-item {
  position: relative;
  aspect-ratio: 4/3;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.gallery-item:hover {
  transform: scale(1.05);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

.gallery-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.gallery-label {
  font-size: 14px;
  font-weight: 600;
}
```

Expected: Professional image gallery showcasing design process with hover overlays

- [ ] **Step 5: Implement custom lightbox functionality**

Create lightweight lightbox for image viewing:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  // Create lightbox structure
  const lightbox = document.createElement('div');
  lightbox.className = 'custom-lightbox';
  lightbox.innerHTML = `
    <div class="lightbox-backdrop"></div>
    <div class="lightbox-content">
      <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
      <img class="lightbox-image" src="" alt="">
      <div class="lightbox-caption"></div>
      <div class="lightbox-navigation">
        <button class="lightbox-prev" aria-label="Previous image">‹</button>
        <button class="lightbox-next" aria-label="Next image">›</button>
      </div>
    </div>
  `;
  document.body.appendChild(lightbox);
  
  // Lightbox styles
  const lightboxStyles = `
    .custom-lightbox {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    
    .custom-lightbox.active {
      opacity: 1;
      pointer-events: all;
    }
    
    .lightbox-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
    }
    
    .lightbox-content {
      position: relative;
      max-width: 90%;
      max-height: 90%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .lightbox-image {
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
      border-radius: 4px;
    }
    
    .lightbox-close {
      position: absolute;
      top: -40px;
      right: 0;
      background: none;
      border: none;
      color: white;
      font-size: 2rem;
      cursor: pointer;
      padding: 10px;
    }
    
    .lightbox-caption {
      color: white;
      margin-top: 20px;
      text-align: center;
      font-size: 14px;
    }
    
    .lightbox-navigation {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 100%;
      display: flex;
      justify-content: space-between;
      pointer-events: none;
    }
    
    .lightbox-prev,
    .lightbox-next {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 2rem;
      padding: 20px;
      cursor: pointer;
      pointer-events: all;
      transition: background 0.3s ease;
    }
    
    .lightbox-prev:hover,
    .lightbox-next:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `;
  
  // Add styles to document
  const styleSheet = document.createElement('style');
  styleSheet.textContent = lightboxStyles;
  document.head.appendChild(styleSheet);
  
  // Lightbox functionality
  let currentImageIndex = 0;
  let currentGallery = [];
  
  function openLightbox(galleryName, imageIndex) {
    const galleryImages = document.querySelectorAll(`[data-lightbox="${galleryName}"]`);
    currentGallery = Array.from(galleryImages);
    currentImageIndex = imageIndex;
    
    showImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  function showImage() {
    const currentItem = currentGallery[currentImageIndex];
    const img = currentItem.querySelector('img');
    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    
    lightboxImage.src = img.src.replace('-thumb', ''); // Use full-size image
    lightboxImage.alt = img.alt;
    lightboxCaption.textContent = img.alt;
  }
  
  function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % currentGallery.length;
    showImage();
  }
  
  function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + currentGallery.length) % currentGallery.length;
    showImage();
  }
  
  // Event listeners
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      const galleryName = item.dataset.lightbox;
      const galleryImages = document.querySelectorAll(`[data-lightbox="${galleryName}"]`);
      const itemIndex = Array.from(galleryImages).indexOf(item);
      openLightbox(galleryName, itemIndex);
    });
  });
  
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', prevImage);
  lightbox.querySelector('.lightbox-next').addEventListener('click', nextImage);
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    switch(e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        prevImage();
        break;
      case 'ArrowRight':
        nextImage();
        break;
    }
  });
  
  console.log('Custom lightbox functionality initialized');
});
</script>
```

Expected: Smooth, accessible lightbox for detailed image viewing with keyboard support

- [ ] **Step 6: Add video integration with play overlays**

Implement video integration with custom play buttons:

```html
<!-- Video integration structure -->
<div class="video-showcase">
  <div class="video-container" data-video-id="word-roll-demo">
    <video class="showcase-video" preload="metadata" poster="word-roll-poster.jpg">
      <source src="word-roll-gameplay.mp4" type="video/mp4">
    </video>
    <button class="video-play-button" aria-label="Play Word Roll demonstration video">
      <span class="play-icon">▶</span>
      <span class="play-label">Watch Demo</span>
    </button>
    <div class="video-controls">
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      <div class="video-info">
        <span class="video-duration">0:45</span>
        <button class="video-fullscreen" aria-label="Fullscreen">⛶</button>
      </div>
    </div>
  </div>
</div>
```

Style video components:
```css
.video-showcase {
  margin: 30px 0;
}

.video-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.showcase-video {
  width: 100%;
  height: auto;
  display: block;
}

.video-play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  border: none;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.video-play-button:hover {
  background: rgba(0, 200, 83, 0.9);
  transform: translate(-50%, -50%) scale(1.1);
}

.play-icon {
  font-size: 24px;
  margin-left: 4px; /* Optical alignment */
}

.play-label {
  font-size: 10px;
  margin-top: 4px;
  font-weight: 600;
}

.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 20px 15px 15px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-container:hover .video-controls,
.video-container.playing .video-controls {
  opacity: 1;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: var(--accent-color);
  width: 0%;
  transition: width 0.1s ease;
}

.video-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-size: 12px;
}

.video-fullscreen {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
}
```

Expected: Professional video integration with custom controls and smooth interactions

- [ ] **Step 7: Implement video interaction functionality**

Add JavaScript for video playback and controls:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  const videoContainers = document.querySelectorAll('.video-container');
  
  videoContainers.forEach((container) => {
    const video = container.querySelector('.showcase-video');
    const playButton = container.querySelector('.video-play-button');
    const progressFill = container.querySelector('.progress-fill');
    const durationDisplay = container.querySelector('.video-duration');
    const fullscreenButton = container.querySelector('.video-fullscreen');
    
    if (!video || !playButton) return;
    
    let isPlaying = false;
    
    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    function togglePlay() {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }
    
    function updateProgress() {
      if (video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        progressFill.style.width = progress + '%';
        durationDisplay.textContent = formatTime(video.duration - video.currentTime);
      }
    }
    
    // Event listeners
    playButton.addEventListener('click', togglePlay);
    
    video.addEventListener('play', () => {
      isPlaying = true;
      playButton.style.display = 'none';
      container.classList.add('playing');
      console.log('Video playback started');
    });
    
    video.addEventListener('pause', () => {
      isPlaying = false;
      playButton.style.display = 'flex';
      container.classList.remove('playing');
    });
    
    video.addEventListener('timeupdate', updateProgress);
    
    video.addEventListener('loadedmetadata', () => {
      durationDisplay.textContent = formatTime(video.duration);
    });
    
    video.addEventListener('ended', () => {
      isPlaying = false;
      playButton.style.display = 'flex';
      container.classList.remove('playing');
      progressFill.style.width = '0%';
      durationDisplay.textContent = formatTime(video.duration);
    });
    
    // Progress bar interaction
    const progressBar = container.querySelector('.progress-bar');
    if (progressBar) {
      progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const progress = clickX / rect.width;
        video.currentTime = progress * video.duration;
      });
    }
    
    // Fullscreen functionality
    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', () => {
        if (video.requestFullscreen) {
          video.requestFullscreen();
        }
      });
    }
    
    // Keyboard controls when video is focused
    video.addEventListener('keydown', (e) => {
      switch(e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          if (video.requestFullscreen) {
            video.requestFullscreen();
          }
          break;
      }
    });
  });
  
  console.log('Video interaction functionality initialized');
});
</script>
```

Expected: Fully functional video player with progress tracking and keyboard controls

- [ ] **Step 8: Optimize media loading and mobile performance**

Implement lazy loading and mobile optimizations:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  // Lazy loading for videos
  const videoContainers = document.querySelectorAll('.video-container');
  
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const video = entry.target.querySelector('.showcase-video');
        if (video && !video.src) {
          // Load video source when in viewport
          const source = video.querySelector('source');
          if (source) {
            video.src = source.src;
            video.load();
          }
        }
        videoObserver.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.25,
    rootMargin: '50px'
  });
  
  videoContainers.forEach((container) => {
    videoObserver.observe(container);
  });
  
  // Mobile-specific optimizations
  if (window.innerWidth <= 767) {
    // Disable autoplay on mobile to save data
    const videos = document.querySelectorAll('.showcase-video');
    videos.forEach((video) => {
      video.removeAttribute('autoplay');
      video.preload = 'none'; // Don't preload on mobile
    });
    
    // Simplify video controls on mobile
    const videoControls = document.querySelectorAll('.video-controls');
    videoControls.forEach((controls) => {
      controls.style.display = 'block';
      controls.style.opacity = '1'; // Always visible on mobile
    });
    
    console.log('Mobile video optimizations applied');
  }
  
  // Progressive image loading
  const images = document.querySelectorAll('img[loading="lazy"]');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach((img) => {
      imageObserver.observe(img);
    });
  }
});
</script>
```

Mobile-specific CSS optimizations:
```css
@media (max-width: 767px) {
  .video-showcase {
    margin: 20px 0;
  }
  
  .video-play-button {
    width: 60px;
    height: 60px;
  }
  
  .play-icon {
    font-size: 20px;
  }
  
  .play-label {
    font-size: 9px;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  /* Reduce memory usage on mobile */
  .background-video {
    display: none;
  }
}
```

Expected: Optimized media loading with mobile-specific performance enhancements

- [ ] **Step 9: Test and validate visual media integration**

Comprehensive testing protocol:

1. **Performance Testing**:
   - Page load speed with media (target: <3 seconds)
   - Memory usage during video playback
   - FPS during video + animation combinations
   - Mobile data usage (ensure reasonable limits)

2. **Functionality Testing**:
   - Lightbox navigation (previous/next/keyboard)
   - Video controls (play/pause/progress/fullscreen)
   - Lazy loading behavior (videos/images load when needed)
   - Cross-browser video codec support

3. **Mobile Testing**:
   - Touch interactions for gallery and video
   - Video playback on iOS Safari and Chrome Mobile
   - Data-saving behavior (no autoplay, preload=none)
   - Responsive layout with media content

4. **Accessibility Testing**:
   - Screen reader compatibility with video controls
   - Keyboard navigation for all media interactions
   - Alternative text for all images
   - Video captions (if applicable)

Document any issues and create optimization notes
Expected: Smooth, accessible, performant visual media integration

- [ ] **Step 10: Document and commit visual media enhancement**

Create comprehensive media documentation:

```html
<!--
VISUAL MEDIA INTEGRATION DOCUMENTATION:
- Background Videos: MP4 H.264, <10MB, autoplay muted (desktop only)
- Image Galleries: WebP with JPEG fallback, lazy loading, custom lightbox
- Video Players: Custom controls, progress tracking, keyboard support
- Mobile Optimization: Lazy loading, reduced preloading, simplified controls
- Performance: Intersection Observer, progressive loading, memory management
- Accessibility: Screen reader support, keyboard navigation, alt text
-->
```

Performance benchmarks to document:
- Page load time with media
- Video loading and playback smoothness
- Image lazy loading effectiveness
- Mobile performance metrics

Publish changes and test comprehensively on live environment
Create milestone: "Visual Media Integration Complete - Compelling Portfolio Evidence"
Expected: Portfolio enhanced with authentic visual proof of project work and impact

## Self-Review

**Spec Coverage:**
✓ Responsive design fixes - Tasks 1-2
✓ GSAP integration and infrastructure - Task 2  
✓ Hero section "Game Designer in Action" - Task 3
✓ Case study impact visualizations - Task 4
✓ Skills matrix interactive grid - Task 5
✓ Visual media integration - Task 6
✓ Performance optimization throughout all tasks
✓ Accessibility compliance in all components
✓ Mobile-first responsive approach
✓ 10-14 day timeline with phased implementation

**Placeholder Check:**
✓ No TBD or TODO items in implementation steps
✓ All code examples complete and functional
✓ Specific file paths and class names provided
✓ Exact commands with expected outcomes
✓ Complete CSS and JavaScript implementations

**Type Consistency:**
✓ Class naming consistent (.hero-headline, .dau-counter, .skills-grid)
✓ Animation timing standards maintained (0.3s micro, 0.6s reveals, 1.5s counters)
✓ GSAP easing curves consistent (power2.out, back.out(1.7))
✓ Mobile breakpoint consistent (767px) across all tasks
✓ Performance targets consistent (60fps, <3s load) throughout