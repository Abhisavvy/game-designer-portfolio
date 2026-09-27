import { z } from "zod";

/** Lowercase letters, numbers, and hyphens only — same rule as
 * `adminProjectItemSchema.slug` below; kept as one constant so the two
 * can't silently drift apart. */
const SLUG_PATTERN = /^[a-z0-9-]+$/;
const INTERNAL_WORK_HREF_PATTERN = new RegExp(`^/work/${SLUG_PATTERN.source.slice(1, -1)}$`);

/**
 * Admin-authored hrefs (the project card's own link, and case-study
 * attachment/reference links) are restricted to same-origin `/work/<slug>`
 * routes or plain `https://` URLs — anything else (`javascript:`, `data:`,
 * protocol-relative `//host`, plain `http://`, etc.) is rejected. The admin
 * API is localhost-only, so this is defence in depth rather than a hard
 * security boundary: nothing downstream should ever trust an arbitrary
 * stored href enough to render it as a clickable link unchecked.
 */
const adminHrefSchema = z
  .string()
  .min(1, "Href is required")
  .refine(
    (href) => INTERNAL_WORK_HREF_PATTERN.test(href) || /^https:\/\//.test(href),
    "Href must be an internal /work/<slug> path or an https:// URL",
  );

/** Metadata JSON for POST /api/admin/assets/upload (must stay aligned with ImageUploader form). */
export const adminAssetUploadMetadataSchema = z.object({
  category: z.enum(["hero", "gallery", "process", "profile"]),
  // Becomes a folder name under public/assets, so no dots or slashes (path traversal).
  projectSlug: z
    .union([
      z.literal(""),
      z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "Invalid project slug"),
    ])
    .optional(),
  altText: z.string().min(1, "Alt text is required"),
  caption: z.string().optional(),
  usageContext: z.string().min(1, "Usage context is required"),
});

export const adminSkillThreadIdSchema = z.enum([
  "economy",
  "retention",
  "liveops",
  "monetization",
  "systems",
  "ai",
]);

export const adminProjectStatSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const adminProjectItemSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens only",
    ),
  title: z.string().min(1, "Title is required"),
  tag: z.string().min(1, "Tag is required"),
  blurb: z.string().min(1, "Blurb is required"),
  href: adminHrefSchema,
  externalUrl: z
    .union([z.literal(""), z.string().url("Valid external URL required")])
    .optional(),
  skills: z.array(adminSkillThreadIdSchema).optional(),
  stats: z.array(adminProjectStatSchema).optional(),
});

export const adminCaseStudyDraftSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  problem: z.string().min(1),
  approach: z.string().min(1),
  constraints: z.string().min(1),
  outcome: z.string().min(1),
  contributions: z.string().optional(),
  links: z
    .array(
      z.object({
        label: z.string().min(1),
        href: adminHrefSchema,
      }),
    )
    .optional(),
});

export const adminCreateProjectBodySchema = z.object({
  project: adminProjectItemSchema,
  caseStudy: adminCaseStudyDraftSchema.optional(),
});

export const adminCaseStudyScalarSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
  problem: z.string().min(1, "Problem description is required"),
  approach: z.string().min(1, "Approach description is required"),
  constraints: z.string().min(1, "Constraints description is required"),
  outcome: z.string().min(1, "Outcome description is required"),
  contributions: z.string().optional(),
});
