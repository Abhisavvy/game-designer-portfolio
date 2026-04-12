/**
 * Fallback documentation for production admin feature omission.
 *
 * In production (`next build`), `ProductionAdminStubPlugin` does **not** point imports
 * at this file. Instead, modules under `src/features/admin/` resolve to:
 *
 *   `!!webpack/admin-feature-prod-stub-loader.cjs!<original-file>`
 *
 * The loader reads the original source and emits a synthetic module that declares the
 * same export names (functions, classes, const bindings, default export) so named imports
 * like `import { useX } from '@/features/admin/foo'` bundle successfully without pulling
 * in real admin code.
 *
 * If you add unusual export forms (`export * from`, re-exports only, etc.), extend the
 * loader or switch to explicit shared exports that the loader understands.
 */

export {};
