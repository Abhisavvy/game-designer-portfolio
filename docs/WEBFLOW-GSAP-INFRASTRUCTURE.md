# Webflow Task 2 — GSAP integration and animation infrastructure

Use this document when pasting into **Site Settings → Custom Code**. Task 1 already added global CSS (including `@media (prefers-reduced-motion: reduce)`) in **Head**. Task 2 adds GSAP, utilities, performance hooks, and a **JS-driven** `body.reduced-motion` class for GSAP overrides.

---

## 1. Footer code (paste before `</body>`)

Paste the block below **in order** as one continuous snippet. It includes the animation standards comment, reduced-motion CSS (scoped to `body.reduced-motion` so it stacks with Task 1 media queries), GSAP CDN loads, utilities, performance monitoring, reduced-motion behavior, and documentation.

```html
<!--
ANIMATION STANDARDS:
- Duration: 0.3s micro-interactions, 0.6s reveals, 1.5s counters
- Easing: power2.out for natural motion; back.out for playful motion
- Stagger: 0.1s between sequenced items
- Performance: target 60fps; prefer transform/opacity over layout properties
- Accessibility: respect prefers-reduced-motion (utilities + CSS + GSAP overrides)
- Testing: use animationPerformance.logPerformance(name) after major timelines; FPS log in dev hosts only
-->

<style>
  /* JS-driven reduced motion (body.reduced-motion) — complements Task 1 @media (prefers-reduced-motion) */
  body.reduced-motion * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
</style>

<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
<script>
  gsap.registerPlugin(ScrollTrigger);

  window.portfolioAnimations = {
    fadeIn: function (element, delay) {
      delay = delay || 0;
      if (!element) return;
      gsap.fromTo(
        element,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: delay,
          ease: 'power2.out',
        }
      );
    },

    countUp: function (element, endValue, duration) {
      duration = duration || 1.5;
      if (!element) return;
      var startValue = 0;
      gsap.to(
        { value: startValue },
        {
          value: endValue,
          duration: duration,
          ease: 'power2.out',
          onUpdate: function () {
            var v = this.targets()[0].value;
            element.textContent = Math.round(v).toLocaleString();
          },
        }
      );
    },

    respectsReducedMotion: function () {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
  };

  console.log('GSAP and portfolio animations loaded successfully');
</script>

<script>
  window.animationPerformance = {
    startTime: performance.now(),

    logPerformance: function (animationName) {
      var endTime = performance.now();
      var duration = endTime - this.startTime;
      console.log(
        'Animation "' + animationName + '" completed in ' + duration.toFixed(2) + 'ms'
      );
      this.startTime = performance.now();
    },

    checkFPS: function () {
      var fps = 0;
      var lastTime = performance.now();

      function updateFPS() {
        fps++;
        var currentTime = performance.now();
        if (currentTime >= lastTime + 1000) {
          console.log('Current FPS: ' + fps);
          fps = 0;
          lastTime = currentTime;
        }
        requestAnimationFrame(updateFPS);
      }

      updateFPS();
    },
  };

  (function () {
    var h = window.location.hostname;
    if (h === 'preview.webflow.com' || h === 'localhost' || h === '127.0.0.1') {
      window.animationPerformance.checkFPS();
    }
  })();
</script>

<script>
  document.addEventListener('DOMContentLoaded', function () {
    if (!window.portfolioAnimations || !window.portfolioAnimations.respectsReducedMotion()) {
      return;
    }

    gsap.globalTimeline.clear();
    document.body.classList.add('reduced-motion');

    window.portfolioAnimations.fadeIn = function (element) {
      if (!element) return;
      gsap.set(element, { opacity: 1, y: 0 });
    };

    window.portfolioAnimations.countUp = function (element, endValue) {
      if (!element) return;
      element.textContent = Math.round(endValue).toLocaleString();
    };

    console.log('Reduced motion mode activated');
  });
</script>
```

### Notes

- **Task 1 Head** already shortens CSS animations under `prefers-reduced-motion`. The **`body.reduced-motion`** styles above reinforce that for anything GSAP or other libraries animate.
- **FPS logging** runs only on `preview.webflow.com`, `localhost`, and `127.0.0.1`. For a **staging site** on `*.webflow.io`, add that hostname to the `if` condition if you want FPS there.
- **ES5-style** `var` / `function` in the performance and reduced-motion blocks improves compatibility with strict CSP or older parsers Webflow might wrap; the GSAP block matches your spec.

---

## 2. Console tests (after publish or preview)

### 2.1 Environment checks

```javascript
typeof gsap;
typeof ScrollTrigger;
window.portfolioAnimations;
window.animationPerformance;
```

Expected: `"function"` or `"object"` as appropriate; `portfolioAnimations` and `animationPerformance` defined.

### 2.2 Basic tween (Step 2)

```javascript
gsap.to('.hero-headline', { duration: 2, x: 100, rotation: 360 });
```

**Reset** (run after the tween completes or `kill` it):

```javascript
gsap.set('.hero-headline', { clearProps: 'all' });
```

If `.hero-headline` does not exist yet, substitute any real selector from the page (e.g. a heading class).

### 2.3 Utilities

```javascript
var el = document.querySelector('h1');
if (el) window.portfolioAnimations.fadeIn(el, 0.1);
```

```javascript
var n = document.querySelector('[data-count-test]');
if (n) window.portfolioAnimations.countUp(n, 1234, 1.2);
```

Add a temporary element in Designer if needed: e.g. a text block with **Custom attribute** `data-count-test` for the counter test.

### 2.4 Stagger test (Step 5)

```javascript
gsap.from('.nav-link', {
  opacity: 0,
  y: -20,
  duration: 0.5,
  stagger: 0.1,
  ease: 'back.out(1.7)',
});
```

Replace `.nav-link` with the **actual** class Webflow outputs for nav links (inspect in DevTools). Reset if needed:

```javascript
gsap.set('.nav-link', { clearProps: 'all' });
```

### 2.5 Reduced motion (Step 4)

1. Enable **prefers reduced motion** in OS or browser devtools (e.g. Chrome: Rendering → Emulate `prefers-reduced-motion`: reduce).
2. Reload the page.
3. Confirm console: `Reduced motion mode activated`.
4. Confirm `document.body.classList.contains('reduced-motion')` is `true`.
5. Call `portfolioAnimations.fadeIn(el)` — element should **snap** to visible with no tween.

### 2.6 Performance (Step 3)

On a dev host (see hostnames above), watch the console for `Current FPS:` once per second. Use **Performance** panel in DevTools while running stagger or hero tweens to confirm long tasks and layout thrash stay minimal.

---

## 3. Cross-browser checklist (Step 7)

| Browser        | What to verify |
|----------------|----------------|
| Chrome (latest)| GSAP + ScrollTrigger; stagger; `matchMedia` reduced motion |
| Firefox (latest) | Same; check `back.out` easing feels acceptable |
| Safari (latest) | ScrollTrigger + transforms; reduced motion + `body` class; no console errors |
| Edge (latest)  | Same as Chrome baseline |

**Safari:** Prefer **transform**/`opacity` tweens. Avoid animating **large** `box-shadow`/`filter` if jank appears. If ScrollTrigger pin/jump issues appear, document the section and consider `ScrollTrigger.normalizeScroll(true)` later (Task 4 scope).

Document any project-specific fixes in this file under a dated **“Browser notes”** subheading.

---

## 4. Milestone and baseline (Step 8)

After **Publish** (or staging):

1. Confirm footer console: `GSAP and portfolio animations loaded successfully`.
2. Run Section 2 tests on the **published** URL.
3. In DevTools **Performance**, record 5–10s of idle + one stagger test; note median FPS and any long tasks (baseline for Tasks 3–6).
4. Milestone label: **Animation infrastructure complete — GSAP ready**.

---

## 5. Handoff to Tasks 3–6

| Task | Use |
|------|-----|
| 3 — Hero | `portfolioAnimations.fadeIn`, `countUp`; call `animationPerformance.logPerformance('hero')` after main timeline — implementation: [WEBFLOW-TASK-3-HERO.md](./WEBFLOW-TASK-3-HERO.md) |
| 4 — Case studies | `ScrollTrigger`; refresh after CMS/layout changes: `ScrollTrigger.refresh()` — implementation: [WEBFLOW-TASK-4-CASE-STUDIES.md](./WEBFLOW-TASK-4-CASE-STUDIES.md) |
| 5 — Skills grid | Stagger + transforms; respect `portfolioAnimations.respectsReducedMotion()` before building timelines — implementation: [WEBFLOW-TASK-5-SKILLS-MATRIX.md](./WEBFLOW-TASK-5-SKILLS-MATRIX.md) |
| 6 — Media | GSAP timelines; lazy media + `will-change` from Task 1 utilities where appropriate |

Always branch on `respectsReducedMotion()` before creating long or decorative timelines.
