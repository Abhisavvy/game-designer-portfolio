/**
 * Progressive-enhancement safety net for entrance motion.
 *
 * Framer Motion bakes its `initial` prop into the server-rendered HTML
 * (e.g. `opacity:0`) so there's no flash-of-unanimated-content once React
 * hydrates. If JavaScript never runs, though, that inline style is never
 * overridden and the content stays invisible forever.
 *
 * Every element that uses an opacity/transform "reveal" animation in this
 * page also carries the `bp-reveal` class. With JS enabled the browser
 * ignores this <noscript> block entirely; with JS disabled, this stylesheet
 * forces those elements fully visible (an `!important` rule beats a plain,
 * non-important inline style), so nothing depends on JavaScript to be seen.
 *
 * The second (non-noscript) rule below handles a related but distinct
 * case: a visitor with the OS-level "prefers-reduced-motion" setting.
 * Components in this page deliberately do NOT branch their `initial`/
 * `animate` props on a reduced-motion hook (that hook — Framer's
 * `useReducedMotion()` — resolves to `null` during SSR and to the live
 * boolean on the client's very first render, so branching on it re-creates
 * a server/client hydration mismatch). Instead every component renders the
 * SAME `initial` on server and client, and:
 *   - the app-wide `<MotionConfig reducedMotion="user">` (see
 *     src/app/providers.tsx) neutralises the TRANSFORM side of these
 *     animations (x/y) for reduced-motion visitors, per Framer's own
 *     positional-value handling;
 *   - this stylesheet neutralises the OPACITY side, which Framer
 *     intentionally leaves animatable even under reduced motion — without
 *     it, reduced-motion visitors would still see a (non-transform, purely
 *     opacity) fade-in rather than instantly-visible content.
 * Both rules force the same end state (fully visible, no transform), so
 * whichever applies, nothing is ever left stuck at opacity:0.
 */
export function NoScriptReveal() {
  return (
    <>
      <noscript>
        <style>{`.bp-reveal{opacity:1 !important;transform:none !important;}`}</style>
      </noscript>
      <style>{`@media (prefers-reduced-motion: reduce) { .bp-reveal { opacity: 1 !important; transform: none !important; } }`}</style>
    </>
  );
}
