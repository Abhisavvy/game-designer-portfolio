# Webflow Task 5 — Skills matrix (interactive grid, progress rings, touch)

Staggered **ScrollTrigger** reveal for `.skill-item` cards, **SVG circular progress** with hover (desktop) or **IntersectionObserver + tap** (mobile), category accent borders, and accessibility fallbacks.

**Depends on** [WEBFLOW-GSAP-INFRASTRUCTURE.md](./WEBFLOW-GSAP-INFRASTRUCTURE.md) (Task 2) in **Footer** before this snippet. **Order:** Task 2 → Task 3 → Task 4 → **this file**.

---

## 1. Webflow Designer — structure and classes (Steps 1, 3)

### 1.1 Section and grid

1. Select the **Skills** section wrapper (the outer `Section` or `Div` that contains the whole block).
2. **Element settings → Selector:** add **`skills-section`** (combo class is fine).
3. Select the **direct parent** of all skill cards (the flex/grid row container Webflow generated). Add **`skills-grid`**.
4. Ensure **Layout → Grid** in Webflow matches intent: **3 columns** desktop, **2** tablet, **1** mobile — or rely on the **Head CSS** in §2 (Webflow’s grid + this CSS both work; if you use custom CSS `display:grid`, set the Webflow parent to **display: block** or plain **div** to avoid double layout — simplest path: **one div** with class `skills-grid` only, children are cards).

### 1.2 Each skill card

For **each** card (block containing title, copy, icon, etc.):

1. Add combo class **`skill-item`**.
2. Add **one** category combo class:
   - **`category-game-dev`**
   - **`category-analytics`**
   - **`category-innovation`**
3. **Accessibility:** give the visible skill title an **ID** (e.g. `skill-unity-title`). On the card wrapper, add **Custom attributes:** `aria-labelledby` = that ID (or use a short **`data-skill-label`** for the script below to set `aria-label`).

### 1.3 Progress ring (Embed per card)

Add an **Embed** inside each card (top-right is handled by CSS), or duplicate this HTML in a **Symbol** and override `data-progress` per instance.

**Desktop / default (60×60, r=25):**

```html
<div class="skill-progress" data-progress="85">
  <svg class="progress-ring" width="60" height="60" viewBox="0 0 60 60" aria-hidden="true" focusable="false">
    <circle
      class="progress-ring-background"
      cx="30"
      cy="30"
      r="25"
      fill="transparent"
      stroke="rgba(0, 200, 83, 0.2)"
      stroke-width="4"
    />
    <circle
      class="progress-ring-fill"
      cx="30"
      cy="30"
      r="25"
      fill="transparent"
      stroke="#00C853"
      stroke-width="4"
      stroke-dasharray="157.08"
      stroke-dashoffset="157.08"
      stroke-linecap="round"
    />
  </svg>
  <span class="progress-percentage" aria-live="polite">0%</span>
</div>
```

**Optional:** change `data-progress` per skill (0–100). Script reads **`r`** from `.progress-ring-fill` to compute circumference so you can swap radii without editing JS.

**Mobile:** CSS in §2 scales the SVG to 50×50; keep **viewBox="0 0 60 60"** so coordinates stay valid.

---

## 2. Site Settings → Custom Code → **Head** (CSS)

Paste **after** Task 1 variables / Task 3 / Task 4 CSS so `var(--accent-color)` resolves.

```css
/* Task 5 — Skills matrix */

.skills-section {
  position: relative;
}

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
  padding-right: 90px; /* room for progress ring */
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease;
  cursor: pointer;
  position: relative;
  outline: none;
}

.skill-item:hover {
  border-color: var(--accent-color, #00c853);
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 200, 83, 0.15);
  z-index: 10;
}

/* Dim siblings only when a card is hovered (pointer), not on mere section focus */
.skills-grid:has(.skill-item:hover) .skill-item:not(:hover) {
  opacity: 0.6;
  transform: scale(0.98);
}

.skill-item.category-game-dev {
  border-left: 4px solid #2196f3;
}

.skill-item.category-analytics {
  border-left: 4px solid #ff9800;
}

.skill-item.category-innovation {
  border-left: 4px solid #9c27b0;
}

.skill-item:focus-visible {
  outline: 2px solid var(--accent-color, #00c853);
  outline-offset: 4px;
}

.skill-progress {
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
  height: 60px;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-color, #00c853);
  pointer-events: none;
}

@media (max-width: 767px) {
  .skill-item {
    padding: 20px;
    padding-right: 80px;
    margin-bottom: 0;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .skill-item:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }

  .skill-progress {
    top: 10px;
    right: 10px;
    width: 50px;
    height: 50px;
  }

  .progress-ring {
    width: 50px;
    height: 50px;
  }
}

```

Browsers that do not support **`:has()`** ignore the sibling-dimming rule; cards still lift on hover without dimming others.

---

## 3. Site Settings → Custom Code → **Footer** (single script block)

Paste **below** Task 2 + Task 3 + Task 4. One IIFE avoids duplicate `DOMContentLoaded` handlers and keeps **progress** tweens easy to `kill` on rapid hover.

```html
<!--
SKILLS MATRIX ANIMATION DOCUMENTATION:
- Staggered reveal: total stagger window ~0.8s, ease back.out(1.7), grid from live column count
- Progress rings: ~1.2s, ease power2.out; circumference from SVG circle r
- Desktop: hover drives ring + counter; mouseleave resets (unless reduced motion: snap)
- Mobile: IntersectionObserver once per card (threshold 0.7) + optional short tap replay
- Accessibility: focus-visible in CSS; keyboard Space/Enter plays ring; prefers-reduced-motion → instant states
- Performance: transform/opacity on reveal; killTweensOf on re-hover; logPerformance on reveal complete
- Categories: border-left colors — game-dev #2196F3, analytics #FF9800, innovation #9C27B0
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

  function devLog(msg) {
    var h = window.location.hostname;
    if (h === 'preview.webflow.com' || h === 'localhost' || h === '127.0.0.1') {
      console.log(msg);
    }
  }

  function staggerColumns() {
    if (window.matchMedia('(min-width: 992px)').matches) return 3;
    if (window.matchMedia('(min-width: 768px)').matches) return 2;
    return 1;
  }

  function initSkillsGridReveal() {
    var section = document.querySelector('.skills-section');
    var skillItems = document.querySelectorAll('.skills-grid .skill-item');
    if (!section || !skillItems.length || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      return;
    }

    if (respectsRM()) {
      gsap.set(skillItems, { opacity: 1, y: 0, scale: 1 });
      logPerf('Skills Grid Reveal (reduced motion)');
      return;
    }

    gsap.set(skillItems, { opacity: 0, y: 40, scale: 0.9 });

    var cols = staggerColumns();
    var rows = Math.ceil(skillItems.length / cols);

    ScrollTrigger.create({
      trigger: section,
      start: 'top 75%',
      end: 'bottom 25%',
      once: true,
      onEnter: function () {
        gsap.to(skillItems, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: {
            amount: 0.8,
            grid: [cols, rows],
            from: 'start',
          },
          ease: 'back.out(1.7)',
          onComplete: function () {
            devLog('Skills grid animation completed');
            logPerf('Skills Grid Reveal');
          },
        });
      },
    });
  }

  function getCircumference(fillCircle) {
    var r = parseFloat(fillCircle.getAttribute('r'), 10);
    if (isNaN(r) || r <= 0) r = 25;
    return 2 * Math.PI * r;
  }

  function initSkillProgressAndInteraction() {
    var skillItems = document.querySelectorAll('.skill-item');
    if (!skillItems.length || typeof gsap === 'undefined') return;

    var useHoverProgress = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    skillItems.forEach(function (item) {
      var label = item.getAttribute('data-skill-label');
      if (label && !item.getAttribute('aria-label')) {
        item.setAttribute('aria-label', label);
      }

      item.setAttribute('tabindex', '0');

      var progressWrap = item.querySelector('.skill-progress');
      var progressRing = item.querySelector('.progress-ring-fill');
      var percentageDisplay = item.querySelector('.progress-percentage');
      if (!progressWrap || !progressRing || !percentageDisplay) return;

      var targetProgress = parseInt(progressWrap.getAttribute('data-progress'), 10);
      if (isNaN(targetProgress)) targetProgress = 0;
      targetProgress = Math.max(0, Math.min(100, targetProgress));

      var circumference = getCircumference(progressRing);
      progressRing.style.strokeDasharray = String(circumference);
      var finalOffset = circumference - (targetProgress / 100) * circumference;

      function applyInstantComplete() {
        gsap.killTweensOf(progressRing);
        if (item._skillProgressCounter) {
          gsap.killTweensOf(item._skillProgressCounter);
          item._skillProgressCounter = null;
        }
        progressRing.style.strokeDashoffset = String(finalOffset);
        percentageDisplay.textContent = targetProgress + '%';
      }

      function resetVisual() {
        gsap.killTweensOf(progressRing);
        if (item._skillProgressCounter) {
          gsap.killTweensOf(item._skillProgressCounter);
          item._skillProgressCounter = null;
        }
        gsap.set(progressRing, { strokeDashoffset: circumference });
        percentageDisplay.textContent = '0%';
      }

      function playProgressAnimation() {
        if (respectsRM()) {
          applyInstantComplete();
          return;
        }

        gsap.killTweensOf(progressRing);
        if (item._skillProgressCounter) {
          gsap.killTweensOf(item._skillProgressCounter);
        }
        gsap.set(progressRing, { strokeDashoffset: circumference });

        gsap.to(progressRing, {
          strokeDashoffset: finalOffset,
          duration: 1.2,
          ease: 'power2.out',
        });

        var counter = { value: 0 };
        item._skillProgressCounter = counter;
        gsap.to(counter, {
          value: targetProgress,
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: function () {
            percentageDisplay.textContent = Math.round(counter.value) + '%';
          },
          onComplete: function () {
            item._skillProgressCounter = null;
          },
        });
      }

      if (useHoverProgress) {
        item.addEventListener('mouseenter', playProgressAnimation);
        item.addEventListener('mouseleave', function () {
          if (!respectsRM()) resetVisual();
        });
      } else {
        var io = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                playProgressAnimation();
                io.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.7 }
        );
        io.observe(item);
      }

      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          playProgressAnimation();
        }
      });

      /* Short tap replay on coarse pointers */
      var touchStart = 0;
      item.addEventListener(
        'touchstart',
        function () {
          touchStart = Date.now();
          if (!respectsRM()) gsap.to(item, { scale: 0.98, duration: 0.1 });
        },
        { passive: true }
      );
      item.addEventListener(
        'touchend',
        function () {
          if (!respectsRM()) gsap.to(item, { scale: 1, duration: 0.1 });
          if (Date.now() - touchStart < 300) {
            playProgressAnimation();
          }
        },
        { passive: true }
      );
    });

    devLog('Skill progress ring interactions initialized');
  }

  function initCategoryDevLogs() {
    var skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        var cat = item.classList.contains('category-game-dev')
          ? 'game-dev'
          : item.classList.contains('category-analytics')
            ? 'analytics'
            : item.classList.contains('category-innovation')
              ? 'innovation'
              : '';
        if (cat) devLog('Skills matrix: hover category ' + cat);
      });
    });
    devLog('Skills category interactions initialized');
  }

  ready(function () {
    initSkillsGridReveal();
    initSkillProgressAndInteraction();
    initCategoryDevLogs();
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  });
})();
</script>
```

### 3.1 Design notes (vs original spec)

| Topic | Choice |
|--------|--------|
| **Stagger `grid`** | Column count from `matchMedia` at runtime so order matches a responsive CSS grid. |
| **`ScrollTrigger`** | `once: true` avoids replay cost when scrolling up/down. |
| **Progress on mobile** | Original snippet dispatched `mouseenter`, but hover handlers were not registered on small viewports — this script uses **`matchMedia('(hover: hover) and (pointer: fine)')`** so touch devices use **IntersectionObserver** and **tap** calls the same `playProgressAnimation`. |
| **`role="button"`** | Omitted to avoid implying a missing default action; use **`aria-labelledby`** / **`data-skill-label`** + **`tabindex="0"`**. |
| **Sibling dimming** | **`:has(.skill-item:hover)`** so the grid does not dim when only focus moves (keyboard). |
| **Padding** | **`padding-right`** on `.skill-item` so text does not sit under the absolute progress widget. |

After large Designer edits, call **`ScrollTrigger.refresh()`** once (Webflow **page load** is enough if you publish; for AJAX-style transitions, hook refresh manually).

---

## 4. Testing protocol (Step 7)

### 4.1 Performance

1. Open **DevTools → Performance**, record while scrolling the skills section into view — watch **FPS** and **long tasks** during stagger.
2. On `preview.webflow.com` / localhost, Task 2 may log **Current FPS:** — confirm it stays near 60 under hover spam.
3. Rapidly move the pointer across cards — confirm no runaway memory (Performance → Memory snapshot before/after).

### 4.2 Accessibility

1. Enable **prefers-reduced-motion** — cards and rings should **snap** to final state (no decorative tween).
2. **Tab** through `.skill-item` — **focus-visible** ring visible.
3. **Enter / Space** on a focused card — percentage and ring update.
4. Screen reader: ensure each card has **meaningful name** (`aria-labelledby` or `aria-label`).

### 4.3 Cross-browser

| Browser | Checks |
|---------|--------|
| Chrome | Stagger, hover ring, `:has` dimming |
| Firefox | SVG `strokeDashoffset` tween |
| Safari | `:has` support (14.1+); else dimming falls back per §2 |
| Edge | Same as Chrome |

### 4.4 Touch devices

1. Scroll cards into view — ring should animate **once** per card (IO).
2. **Quick tap** — should replay `playProgressAnimation` without relying on synthetic `mouseenter`.

---

## 5. Milestone (Step 8)

1. **Publish** (or staging) and verify console (dev hosts only): initialization logs are quiet on production if you remove `devLog` or keep as-is (production logs only category line if you add `console.log` elsewhere — current script uses `devLog` for noise control).
2. Record baseline: stagger duration to first paint stable, and one **logPerformance** reading for **Skills Grid Reveal**.
3. Milestone label: **Skills Matrix Complete — Interactive Expertise Showcase**.

---

## 6. Handoff

| Next | Notes |
|------|--------|
| **Task 6 — Media** | Reuse `transform`/`opacity` patterns; avoid stacking heavy filters on the same section as large video. |
| **CV / portfolio copy** | If skills change, keep **percentages** truthful or remove `data-progress` and treat rings as decorative only (then prefer not to expose a numeric `aria-live` spam). |
