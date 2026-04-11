# Webflow Task 4 — Case study “Impact Visualization” (Food Fiesta + Word Roll)

Scroll-triggered **progress bar** (71% monetization lift) and **SVG growth chart** (4k→40k DAU) with optional hover tooltips, mobile simplifications, and reduced-motion support.

**Depends on** [WEBFLOW-GSAP-INFRASTRUCTURE.md](./WEBFLOW-GSAP-INFRASTRUCTURE.md) (Task 2) in **Footer** before this snippet. **Order:** Task 2 → Task 3 (hero) → **this file**.

---

## 1. Webflow Designer — classes and structure (Steps 1, 2, 4)

### 1.1 Food Fiesta section

1. Select the **Food Fiesta** case study **Section** (or top-level wrapper).
2. **Settings → Selector:** add combo class **`food-fiesta-section`**.
3. Select the **metric** text block that states the 71% (or adjacent headline). Add **`food-fiesta-metric`**.
4. Insert an **Embed** element (or Rich Text custom code) where the bar should appear and paste the HTML from **§1.3** (progress bar).  
   - Alternatively build with native Webflow divs: outer **`progress-bar-container`**, inner **`progress-bar-background`** → child **`progress-bar-fill`** with **Custom attribute** `data-progress` = `71`, sibling **`progress-percentage`** with text `0%`.

### 1.2 Word Roll section

1. Select the **Word Roll** case study **Section**. Add **`word-roll-section`**.
2. Add an **Embed** with the SVG markup from **§1.4** inside a wrapper with class **`growth-chart-container`**.

### 1.3 Progress bar HTML (Embed)

```html
<div class="progress-bar-container">
  <div class="progress-bar-background">
    <div class="progress-bar-fill" data-progress="71"></div>
  </div>
  <div class="progress-percentage" aria-live="polite">0%</div>
</div>
```

**Accessibility:** After animation completes, the script sets a static label on the fill element. During the tween, avoid putting `aria-live` on a rapidly changing node if it annoys testers — you may remove `aria-live` from `.progress-percentage` and rely on surrounding copy + `aria-label` on complete (script adds `aria-label` on the container).

### 1.4 Word Roll growth chart HTML (Embed)

Use **unique** SVG defs IDs so a second chart on the page never collides.

```html
<div class="growth-chart-container">
  <svg class="growth-chart-svg" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="word-roll-chart-title word-roll-chart-desc">
    <title id="word-roll-chart-title">Word Roll daily active users growth</title>
    <desc id="word-roll-chart-desc">Growth from 4 thousand to 40 thousand plus DAU from 2024 Q3 through 2025 Q2.</desc>
    <defs>
      <pattern id="word-roll-grid-pattern" width="40" height="20" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 20" fill="none" stroke="rgba(51,51,51,0.1)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#word-roll-grid-pattern)" />

    <line x1="50" y1="160" x2="350" y2="160" stroke="#666" stroke-width="2"/>
    <line x1="50" y1="160" x2="50" y2="40" stroke="#666" stroke-width="2"/>

    <path
      class="growth-chart-line"
      d="M 50 160 L 120 140 L 200 100 L 280 70 L 350 40"
      fill="none"
      stroke="#00C853"
      stroke-width="3"
      stroke-linecap="round"
      stroke-dasharray="1000"
      stroke-dashoffset="1000"
    />

    <circle class="chart-data-point" tabindex="0" cx="50" cy="160" r="4" fill="#00C853" opacity="0" aria-label="4k DAU, 2024 Q3 launch phase"/>
    <circle class="chart-data-point" tabindex="0" cx="120" cy="140" r="4" fill="#00C853" opacity="0" aria-label="12k DAU, 2024 Q4 initial growth"/>
    <circle class="chart-data-point" tabindex="0" cx="200" cy="100" r="4" fill="#00C853" opacity="0" aria-label="22k DAU, 2025 Q1 feature expansion"/>
    <circle class="chart-data-point" tabindex="0" cx="280" cy="70" r="4" fill="#00C853" opacity="0" aria-label="32k DAU, 2025 Q1 optimization"/>
    <circle class="chart-data-point" tabindex="0" cx="350" cy="40" r="4" fill="#00C853" opacity="0" aria-label="40k plus DAU, 2025 Q2 hypergrowth"/>

    <text x="50" y="180" text-anchor="middle" class="chart-label">2024 Q3</text>
    <text x="350" y="180" text-anchor="middle" class="chart-label">2025 Q2</text>
    <text x="30" y="165" text-anchor="middle" class="chart-label">4k</text>
    <text x="30" y="45" text-anchor="middle" class="chart-label">40k</text>
  </svg>
</div>
```

**Note:** Script targets **`.word-roll-section .growth-chart-line`** (class, not `id`) so IDs stay optional.

### 1.5 Optional video / overlay (Task 4 scope teaser)

For **background or inline demo video** (Food Fiesta gameplay, Word Roll trailer), prefer Webflow **Video** or **Background video** with `muted` `playsinline` `loop` as needed; heavy overlay logic is covered in the broader plan’s **Task 6 — Media**. This Task 4 doc focuses on **data viz** + tooltips.

---

## 2. Site Settings → Custom Code → **Head** (CSS)

Paste **after** Task 1 variables and Task 3 hero CSS so `var(--accent-color)` and `var(--text-secondary)` resolve.

```css
/* Task 4 — Case study impact visualization */

.food-fiesta-section .progress-bar-container,
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
  background: linear-gradient(90deg, #00c853, #4caf50);
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

.growth-chart-container {
  margin: 30px 0;
  padding: 20px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  position: relative;
}

.growth-chart-svg {
  width: 100%;
  height: auto;
  max-width: 500px;
  display: block;
}

.chart-label {
  font-size: 12px;
  fill: var(--text-secondary, #666);
  font-family: inherit;
}

.word-roll-section .chart-data-point {
  cursor: pointer;
  transform-box: fill-box;
  transform-origin: center center;
}

.word-roll-section .chart-data-point:focus {
  outline: 2px solid var(--accent-color, #00c853);
  outline-offset: 2px;
}

.word-roll-section .chart-data-point:focus:not(:focus-visible) {
  outline: none;
}

.chart-tooltip {
  position: fixed;
  left: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  pointer-events: none;
  opacity: 0;
  z-index: 10000;
  max-width: min(280px, calc(100vw - 24px));
  white-space: normal;
  line-height: 1.35;
  transition: opacity 0.15s ease;
}

.chart-tooltip strong {
  display: block;
  margin-bottom: 4px;
}

@media (max-width: 767px) {
  .food-fiesta-section .progress-bar-container,
  .progress-bar-container {
    margin: 15px 0;
  }

  .growth-chart-container {
    margin: 20px 0;
    padding: 15px;
  }

  .growth-chart-svg {
    max-width: 100%;
  }

  .chart-label {
    font-size: 10px;
  }

  .word-roll-section .chart-data-point {
    r: 3;
  }
}
```

**Safari note:** CSS `r:` on `<circle>` is supported in WebKit for many builds; if a circle ignores `r`, set radius in Designer or accept 4px on mobile.

---

## 3. Site Settings → Custom Code → **Footer** (single script block)

Paste **below** Task 2 + Task 3. One IIFE avoids duplicate listeners and keeps **case study** timelines from mutating **global** GSAP speed (hero stays unchanged).

```html
<!--
CASE STUDY ANIMATIONS DOCUMENTATION:
- Food Fiesta: progress bar 0% → data-progress (default 71%) over ~2s (shorter on mobile)
- Word Roll: SVG line draw + staggered points; path length from getTotalLength()
- Triggers: ScrollTrigger on .food-fiesta-section / .word-roll-section; toggleActions play/reverse on scroll
- Mobile: shorter durations, pointer-events none on points (no hover tooltip chase)
- Accessibility: prefers-reduced-motion → instant state; circles tabindex + aria-label; keyboard shows tooltip
- Performance: transform-friendly; logPerformance hooks optional
-->

<script>
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function respectsRM() {
    return (
      window.portfolioAnimations &&
      typeof window.portfolioAnimations.respectsReducedMotion === 'function' &&
      window.portfolioAnimations.respectsReducedMotion()
    );
  }

  function logPerf(name) {
    if (window.animationPerformance && typeof window.animationPerformance.logPerformance === 'function') {
      window.animationPerformance.logPerformance(name);
    }
  }

  var isMobile = window.innerWidth <= 767;

  function initFoodFiestaProgress() {
    var section = document.querySelector('.food-fiesta-section');
    if (!section) return;

    var progressBar = section.querySelector('.progress-bar-fill');
    var percentageDisplay = section.querySelector('.progress-percentage');
    if (!progressBar || !percentageDisplay) return;

    var targetProgress = parseInt(progressBar.getAttribute('data-progress'), 10);
    if (isNaN(targetProgress)) targetProgress = 71;

    var dur = isMobile ? 1.35 : 2;

    if (respectsRM()) {
      progressBar.style.width = targetProgress + '%';
      percentageDisplay.textContent = targetProgress + '%';
      section.setAttribute('aria-label', 'Monetization increase ' + targetProgress + ' percent');
      logPerf('Food Fiesta progress (reduced motion)');
      return;
    }

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        end: 'bottom 25%',
        toggleActions: 'play none none reverse',
      },
    });

    var counter = { value: 0 };

    tl.to(progressBar, {
      width: targetProgress + '%',
      duration: dur,
      ease: 'power2.out',
    }).to(
      counter,
      {
        value: targetProgress,
        duration: dur,
        ease: 'power2.out',
        onUpdate: function () {
          percentageDisplay.textContent = Math.round(counter.value) + '%';
        },
        onComplete: function () {
          section.setAttribute('aria-label', 'Monetization increase ' + targetProgress + ' percent');
          logPerf('Food Fiesta progress');
        },
      },
      0
    );
  }

  function initWordRollChart() {
    var section = document.querySelector('.word-roll-section');
    if (!section) return;

    var growthLine = section.querySelector('.growth-chart-line');
    var dataPoints = section.querySelectorAll('.chart-data-point');
    if (!growthLine || !dataPoints.length) return;

    var len = typeof growthLine.getTotalLength === 'function' ? growthLine.getTotalLength() : 1000;
    growthLine.style.strokeDasharray = String(len);
    growthLine.style.strokeDashoffset = String(len);

    var lineDur = isMobile ? 1.65 : 2.5;
    var pointDur = isMobile ? 0.28 : 0.4;
    var stagger = isMobile ? 0.12 : 0.2;

    gsap.set(dataPoints, { scale: 0, transformOrigin: 'center center' });

    if (respectsRM()) {
      gsap.set(growthLine, { strokeDashoffset: 0 });
      gsap.set(dataPoints, { opacity: 1, scale: 1 });
      logPerf('Word Roll chart (reduced motion)');
      return;
    }

    var chartTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        end: 'bottom 30%',
        toggleActions: 'play none none reverse',
      },
    });

    chartTimeline
      .to(growthLine, {
        strokeDashoffset: 0,
        duration: lineDur,
        ease: 'power2.inOut',
      })
      .to(
        dataPoints,
        {
          opacity: 1,
          scale: 1,
          duration: pointDur,
          stagger: stagger,
          ease: 'back.out(1.7)',
        },
        '-=' + (isMobile ? 0.65 : 1)
      )
      .call(function () {
        logPerf('Word Roll chart');
      });
  }

  function initChartTooltips() {
    var section = document.querySelector('.word-roll-section');
    if (!section) return;

    var dataPoints = section.querySelectorAll('.chart-data-point');
    if (!dataPoints.length) return;

    var tooltipData = [
      { value: '4k DAU', period: '2024 Q3 — Launch phase' },
      { value: '12k DAU', period: '2024 Q4 — Initial growth' },
      { value: '22k DAU', period: '2025 Q1 — Feature expansion' },
      { value: '32k DAU', period: '2025 Q1 — Optimization' },
      { value: '40k+ DAU', period: '2025 Q2 — Hypergrowth' },
    ];

    var tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tooltip);

    function placeTooltip(clientX, clientY) {
      var pad = 12;
      var rect = tooltip.getBoundingClientRect();
      var x = clientX + 10;
      var y = clientY - 10;
      if (x + rect.width > window.innerWidth - pad) {
        x = window.innerWidth - rect.width - pad;
      }
      if (y + rect.height > window.innerHeight - pad) {
        y = clientY - rect.height - 10;
      }
      if (y < pad) y = pad;
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
    }

    function showForIndex(index, clientX, clientY) {
      var data = tooltipData[index];
      if (!data) return;
      tooltip.innerHTML = '<strong>' + data.value + '</strong><br>' + data.period;
      tooltip.style.opacity = '1';
      tooltip.setAttribute('aria-hidden', 'false');
      placeTooltip(clientX, clientY);
    }

    function hideTip() {
      tooltip.style.opacity = '0';
      tooltip.setAttribute('aria-hidden', 'true');
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        hideTip();
        dataPoints.forEach(function (p) {
          gsap.to(p, { scale: 1, duration: 0.15, transformOrigin: 'center center' });
        });
      }
    });

    dataPoints.forEach(function (point, index) {
      if (isMobile) {
        point.style.pointerEvents = 'none';
        point.removeAttribute('tabindex');
        return;
      }

      point.addEventListener('mouseenter', function (e) {
        showForIndex(index, e.clientX, e.clientY);
        gsap.to(point, { scale: 1.5, duration: 0.2, transformOrigin: 'center center' });
      });

      point.addEventListener('mousemove', function (e) {
        if (tooltip.style.opacity === '1') {
          placeTooltip(e.clientX, e.clientY);
        }
      });

      point.addEventListener('mouseleave', function () {
        hideTip();
        gsap.to(point, { scale: 1, duration: 0.2, transformOrigin: 'center center' });
      });

      point.addEventListener('focus', function (e) {
        var r = point.getBoundingClientRect();
        showForIndex(index, r.left + r.width / 2, r.top);
      });

      point.addEventListener('blur', function () {
        hideTip();
        gsap.to(point, { scale: 1, duration: 0.2, transformOrigin: 'center center' });
      });
    });
  }

  ready(function () {
    if (!window.gsap || !window.ScrollTrigger) {
      console.warn('Task 4 case studies: GSAP or ScrollTrigger missing — load Task 2 footer first.');
      return;
    }

    initFoodFiestaProgress();
    initWordRollChart();
    initChartTooltips();

    if (typeof ScrollTrigger.refresh === 'function') {
      ScrollTrigger.refresh();
    }
  });
})();
</script>
```

### Fixes vs. the raw task spec

| Issue | Resolution |
|--------|--------------|
| `document.querySelector('.progress-bar-fill')` only first match | Scoped under **`.food-fiesta-section`**. |
| Fixed `stroke-dasharray="1000"` | **`getTotalLength()`** on the path for accurate draw. |
| `gsap.globalTimeline.timeScale(1.5)` | **Avoided** — speeds up hero and everything else. Use **shorter durations** when `isMobile`. |
| SVG `scale` from `back.out` | **`gsap.set`** points `scale: 0` first; **transform-box** in CSS. |
| Tooltips `position: absolute` + body | **`position: fixed`** + clamp to viewport. |
| Mobile hover | **`pointer-events: none`** on points; no tab stop on mobile. |
| `aria-live` on percentage | Optional in embed; **aria-label** on section after complete. |

---

## 4. Testing protocol (Step 8)

### 4.1 ScrollTrigger

- [ ] Scroll until Food Fiesta bar animates; scroll past and back — **reverse** should reset bar (toggleActions).
- [ ] Same for Word Roll line + points.
- [ ] Fast fling scroll: no duplicate timelines (single ScrollTrigger per section).
- [ ] After changing Webflow layout/CMS heights: run `ScrollTrigger.refresh()` in console if sections jump.

### 4.2 Performance

- [ ] DevTools **Performance**: record through both animations; watch **FPS** and **long tasks**.
- [ ] Mobile hardware (or throttled CPU): motion stays acceptable; mobile uses shorter durations.

### 4.3 Cross-browser

| Browser | Focus |
|--------|--------|
| Chrome / Edge | Path length + bar width tweens |
| Firefox | SVG stroke dashoffset |
| Safari (macOS + iOS) | ScrollTrigger; circle `r` in CSS |
| Reduced motion | Instant bar + chart, no jank |

### 4.4 Accessibility

- [ ] **prefers-reduced-motion: reduce** → bar at target width; line fully drawn; points visible.
- [ ] Keyboard: **Tab** to each `chart-data-point` (desktop); tooltip on **focus**; **Escape** dismisses tooltip and resets point scale.
- [ ] Screen reader: **title/desc** on SVG + **aria-label** on circles.
- [ ] Contrast: tooltip `#fff` on near-black; chart green on light grid — adjust if your Task 1 theme differs.

---

## 5. Console quick checks

```javascript
ScrollTrigger.getAll().filter(function (st) {
  return st.vars && st.vars.trigger && st.vars.trigger.classList &&
    (st.vars.trigger.classList.contains('food-fiesta-section') ||
     st.vars.trigger.classList.contains('word-roll-section'));
}).length;
```

Expect **2** when both sections exist on the page.

```javascript
typeof gsap; typeof ScrollTrigger;
```

---

## 6. Milestone and benchmarks (Step 9)

1. **Publish** preview or production.
2. Confirm footer order: **Task 2 → Task 3 → Task 4**.
3. Save **Performance** panel notes (median FPS, long tasks) for Food Fiesta + Word Roll scroll passes.
4. **Milestone:** **Case study animations complete — impact visualization achieved.**

---

## 7. Designer checklist (copy to tracker)

- [ ] **`food-fiesta-section`**, **`food-fiesta-metric`**, progress bar classes + **`data-progress="71"`**
- [ ] **`word-roll-section`**, **`growth-chart-container`**, **`growth-chart-svg`**, **`growth-chart-line`**, each point **`chart-data-point`**
- [ ] Head CSS pasted (Task 4 block)
- [ ] Footer script pasted after Task 3
- [ ] Reduced motion verified
- [ ] Mobile: faster animation, no point tooltips
- [ ] `ScrollTrigger.refresh()` after layout edits if needed

---

## 8. Handoff to Task 5+

- Reuse **`ScrollTrigger`** patterns for the **Skills matrix**; call **`ScrollTrigger.refresh()`** after DOM changes.
- Keep **`window.portfolioAnimations.respectsReducedMotion()`** as the single gate for decorative motion.

Related plan: [superpowers/plans/2026-04-11-enhanced-webflow-portfolio.md](./superpowers/plans/2026-04-11-enhanced-webflow-portfolio.md).
