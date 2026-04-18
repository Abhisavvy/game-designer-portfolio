import path from "path";

export type AssetCategory = "hero" | "gallery" | "process" | "profile";

/**
 * Normalizes the stem of an upload filename for non-hero assets (timestamped files).
 */
export function sanitizeUploadBaseName(originalFileName: string): string {
  return path
    .basename(originalFileName, path.extname(originalFileName))
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Resolves the on-disk filename. Hero + project slug always uses `hero-image{ext}` so
 * listing cards and case study hero stay aligned without manual renames.
 */
export function resolveUploadedFilename(options: {
  category: AssetCategory;
  projectSlug?: string;
  originalFileName: string;
  /** Injectable clock for deterministic tests */
  now?: number;
}): { filename: string } {
  const timestamp = options.now ?? Date.now();
  const extension = path.extname(options.originalFileName).toLowerCase() || ".png";
  const allowedExt = [".jpg", ".jpeg", ".png", ".webp"];
  const safeExt = allowedExt.includes(extension) ? extension : ".png";
  const baseName = sanitizeUploadBaseName(options.originalFileName);
  const filename =
    options.category === "hero" && options.projectSlug
      ? `hero-image${safeExt}`
      : `${baseName}-${timestamp}${safeExt}`;
  return { filename };
}

export function buildAssetPublicUrl(
  projectSlug: string | undefined,
  filename: string,
): string {
  return projectSlug
    ? `/assets/${projectSlug}/${filename}`
    : `/assets/general/${filename}`;
}
