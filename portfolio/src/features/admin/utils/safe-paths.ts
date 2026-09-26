import path from "path";

/** Project slugs are folder names under public/assets — keep them to a strict charset. */
export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export function isSafeSlug(value: unknown): value is string {
  return typeof value === "string" && SLUG_PATTERN.test(value);
}

/** A bare filename: no directories, no leading dot, no traversal. */
export function isSafeFilename(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === path.basename(value) &&
    !value.startsWith(".") &&
    !/[\\/]/.test(value)
  );
}

/**
 * Joins segments onto baseDir and returns the result only if it stays inside baseDir.
 * Compares against baseDir + separator so sibling folders like `assets-x` don't match.
 */
export function resolveInside(baseDir: string, ...segments: string[]): string | null {
  const base = path.resolve(baseDir);
  const target = path.resolve(base, ...segments);
  return target === base || target.startsWith(base + path.sep) ? target : null;
}
