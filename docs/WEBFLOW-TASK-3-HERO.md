# Webflow Task 3 — Hero “Game Designer in Action”

Implements typewriter headline, DAU counter, desktop-only particles, mobile timing, and accessibility. **Depends on** [WEBFLOW-GSAP-INFRASTRUCTURE.md](./WEBFLOW-GSAP-INFRASTRUCTURE.md) (Task 2) being in **Footer** above this snippet.

---

## 1. Webflow Designer — structure and classes (Step 1)

### 1.1 Section and wrappers

1. Select the **Hero** section (top of home).
2. In **Settings → Selector**, add combo class **`hero-section`** (keep existing section class; Webflow outputs multiple classes).
3. Identify the **background** layer (gradient, image, or full-bleed `div`). Add **`hero-background`**.
   - Set **Position** to relative if it is not already (snippet also enforces via CSS).
   - Ensure this layer sits **behind** headline and metrics in the **Navigator** order (particles inject as last children; `z-index` can be added if needed).

### 1.2 Headline

1. Prefer a **Heading** block set to **H1** for SEO (see §7 for accessibility split).
2. Add combo class **`hero-headline`** on the element that holds the visible headline string (e.g. “Feature Designer | Mobile Game Specialist”).
3. **Initial opacity:** Style panel → **Opacity: 0%**. Script sets opacity to `1` when animation starts.

### 1.3 DAU metric

1. Select the **DAU** number text element.
2. Add **`dau-counter`**.
3. Set visible copy to **`0+`** (script replaces during animation; reduced motion jumps to **`40k+`**).

### 1.4 Optional z-index (if particles cover text)

In **Head** (or existing global CSS), after particle rules:

```css
.hero-background .particle {
  z-index: 0;
}
.hero-section .hero-headline,
.hero-section .dau-counter {
  position: relative;
  z-index: 1;
}
```

Adjust selectors to match your actual hierarchy.

---

## 2. Site Settings → **Custom Code → Head** (CSS only)

Paste **after** Task 1 global variables so `var(--accent-color)` resolves.

```css
/* Task 3 — Hero */
.hero-background {
  position: relative;
  overflow: hidden;
}

.typewriter-cursor {
  color: var(--accent-color);
  font-weight: normal;
  margin-left: 1px;
}

@media (max-width: 767px) {
  .hero-headline {
    font-size: 2rem;
    line-height: 1.3;
  }

  .dau-counter {
    font-size: 1.5rem;
    font-weight: 600;
  }

  .particle {
    display: none !important;
  }
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(0, 200, 83, 0.6);
  border-radius: 50%;
  pointer-events: none;
  will-change: transform, opacity;
}

.dau-counter:focus {
  outline: 2px solid var(--accent-color);
  outline-offset: 4px;
}

.dau-counter:focus:not(:focus-visible) {
  outline: none;
}
```

Notes:

- **`:focus:not(:focus-visible)`** avoids a persistent ring for mouse users while keeping keyboard focus visible.
- Mobile hides `.particle` in CSS even if scripts run early.

---

## 3. Site Settings → **Custom Code → Footer** (single block)

Paste **below** the Task 2 GSAP + `portfolioAnimations` + `animationPerformance` scripts. This is one **`<script>`** to avoid duplicate `DOMContentLoaded` handlers and conflicting mobile typewriters.

```html
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

  function typewriterHeadline() {
    var headline = document.querySelector('.hero-headline');
    if (!headline) return;

    var originalText = (headline.textContent || '').trim();
    if (!originalText) return;

    headline.textContent = '';
    headline.style.opacity = '1';

    var cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.textContent = '|';

    function attachCursor() {
      headline.appendChild(cursor);
    }

    if (respectsRM()) {
      headline.textContent = originalText;
      logPerf('Typewriter Effect (reduced motion)');
      return;
    }

    var msPerChar = window.innerWidth <= 767 ? 50 : 80;
    var duration = Math.max(0.35, (originalText.length * msPerChar) / 1000);

    attachCursor();

    gsap.to(
      {},
      {
        duration: duration,
        ease: 'none',
        onUpdate: function () {
          var p = Math.round(this.progress() * originalText.length);
          headline.textContent = originalText.slice(0, p);
          attachCursor();
        },
        onComplete: function () {
          headline.textContent = originalText;
          attachCursor();
          gsap.to(cursor, {
            opacity: 0,
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
          logPerf('Typewriter Effect');
        },
      }
    );
  }

  function formatDau(n) {
    if (n >= 1000) {
      var k = n / 1000;
      var rounded = Math.abs(k - Math.round(k)) < 0.05 ? Math.round(k) : Math.round(k * 10) / 10;
      var s = rounded % 1 === 0 ? String(Math.round(rounded)) : String(rounded);
      return s + 'k';
    }
    return String(Math.round(n));
  }

  function dauCounter() {
    var el = document.querySelector('.dau-counter');
    if (!el) return;

    var done = false;

    function run() {
      if (done) return;
      done = true;

      if (respectsRM()) {
        el.textContent = '40k+';
        logPerf('DAU Counter (reduced motion)');
        return;
      }

      var o = { value: 0 };
      gsap.to(o, {
        value: 40000,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: function () {
          el.textContent = formatDau(o.value) + '+';
        },
        onComplete: function () {
          el.textContent = '40k+';
          el.setAttribute('aria-label', 'Daily active users, 40 thousand plus');
          logPerf('DAU Counter');
        },
      });
    }

    if (window.innerWidth > 768) {
      el.addEventListener('mouseenter', run);
    } else {
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              run();
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      obs.observe(el);
    }
  }

  function particles() {
    if (window.innerWidth <= 767) return;
    if (respectsRM()) return;

    var root = document.querySelector('.hero-background');
    if (!root) return;

    var n = 25;
    var i;
    for (i = 0; i < n; i++) {
      var p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      root.appendChild(p);

      gsap.to(p, {
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        duration: 10 + Math.random() * 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.from(p, {
        opacity: 0,
        duration: 2,
        delay: Math.random() * 3,
      });
    }

    if (typeof console !== 'undefined' && console.log) {
      console.log('Task 3 hero: created ' + n + ' particles');
    }
  }

  ready(function () {
    if (!window.gsap) {
      console.warn('Task 3 hero: GSAP missing — load Task 2 footer first.');
      return;
    }
    typewriterHeadline();
    dauCounter();
    particles();
  });
})();
</script>
```

### Fixes vs. the draft spec

| Issue | Resolution |
|--------|------------|
| Two typewriter scripts on mobile | One handler; `msPerChar` 50 vs 80 by viewport width. |
| `gsap.to(counter)` object tween | Uses a plain object `{ value: 0 }` (reliable in GSAP 3). |
| Final DAU formatting | `onComplete` forces **`40k+`** and updates **`aria-label`**. |
| CSS + GSAP cursor blink | CSS `@keyframes blink` removed; GSAP yoyo only (no fight). |
| Invalid **`role="text"`** | See §7 — use **`aria-hidden`** + screen-reader text or static label. |
| **`aria-live`** on counter during tween | Avoids re-announcing every frame; label set at end. |

---

## 4. Performance and QA (Steps 6, 8)

### 4.1 Console

On `preview.webflow.com`, `localhost`, or `127.0.0.1`, Task 2 already starts FPS sampling. Optionally run:

```javascript
window.animationPerformance && window.animationPerformance.checkFPS();
```

Watch **Performance** → **Frames** while typewriter + counter + particles run; aim for steady frame budget, no long tasks from layout.

### 4.2 Reduced motion

1. Emulate **`prefers-reduced-motion: reduce`**.
2. Reload: headline should appear **full** immediately; counter **40k+**; **no** particles.

### 4.3 Mobile

- Width ≤767: no particles (CSS + script guard); counter uses **IntersectionObserver**; typewriter is faster.

### 4.4 Memory / particles

Particles are fixed DOM nodes with repeating tweens — no per-frame allocation. If you change pages via PJAX in future, kill tweens in a route hook (out of scope for static Webflow).

### 4.5 Cross-target matrix

| Surface | Checks |
|--------|--------|
| Chrome / Firefox / Edge | Typewriter, hover counter, particles |
| Safari (macOS + iOS) | Same; watch for subpixel jitter on particles |
| Tablet | Counter: hover may not exist — use IO path by breakpoint (`<=768` uses IO) |
| Keyboard | Counter focus ring (`tabindex="0"` if element is not naturally focusable) |
| VoiceOver / NVDA | Full headline available without character spam (§7) |

---

## 5. Publish and milestone (Step 9)

1. **Publish** staging / production.
2. Verify footer load order: Task 2 → Task 3.
3. Record a short **Performance** profile (hero only) and note FPS + long tasks for your benchmark doc.
4. Milestone: **Hero section complete — first wow moment achieved.**

---

## 6. Testing checklist (copy into your tracker)

- [ ] Classes: `hero-section`, `hero-background`, `hero-headline`, `dau-counter`
- [ ] Headline opacity 0 in Designer; animates / appears after load
- [ ] Counter starts `0+`; desktop hover → animates to `40k+`; mobile in-view → animates
- [ ] Particles visible desktop only; absent ≤767
- [ ] Reduced motion: full headline, `40k+`, no particles
- [ ] No console errors; GSAP present
- [ ] `animationPerformance.logPerformance` lines for typewriter and counter (wording may include “reduced motion”)

---

## 7. Accessibility (Step 7) — recommended markup

**Do not** put `aria-live="polite"` on the headline **during** a per-character typewriter: assistive tech will flood announcements.

### Pattern A (recommended)

- **Animated** line: wrapper with `aria-hidden="true"` containing `.hero-headline`.
- **One** visually hidden line with the full string for screen readers (Webflow **Screen reader only** or your utility class).

Example structure in Designer (Navigator):

```text
hero-heading-group (Div)
  ├── hero-headline-visual (Div, aria-hidden="true")
  │     └── Heading H1.hero-headline  → visible animated text
  └── sr-only text → full headline copy, never cleared by JS
```

Point the script at **`.hero-headline`** inside the `aria-hidden` wrapper only.

### Counter

- Use a **native** focusable control if possible; otherwise add **`tabindex="0"`** on the metric element for keyboard discoverability.
- **Avoid** `aria-live` on the counting element during the tween.
- Set **`aria-label="Daily active users, 40 thousand plus"`** in Webflow (optional); script refreshes it on complete.

### `role="text"`

Not a valid ARIA role in [WAI-ARIA](https://www.w3.org/TR/wai-aria-1.2/). Prefer **Pattern A** or a single semantic **`h1`** without live region.

---

## 8. Handoff to Task 4+

- Keep **`hero-section`** as a stable hook for ScrollTrigger offsets later.
- Reuse **`animationPerformance.logPerformance('…')`** for the next major timelines.
- Next: [WEBFLOW-TASK-4-CASE-STUDIES.md](./WEBFLOW-TASK-4-CASE-STUDIES.md) (Food Fiesta bar + Word Roll chart).

Related plan: [superpowers/plans/2026-04-11-enhanced-webflow-portfolio.md](./superpowers/plans/2026-04-11-enhanced-webflow-portfolio.md) (Task 3 narrative).
