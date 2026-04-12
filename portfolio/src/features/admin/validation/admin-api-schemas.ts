import { z } from "zod";

/** Metadata JSON for POST /api/admin/assets/upload (must stay aligned with ImageUploader form). */
export const adminAssetUploadMetadataSchema = z.object({
  category: z.enum(["hero", "gallery", "process", "profile"]),
  projectSlug: z.string().optional(),
  altText: z.string().min(1, "Alt text is required"),
  caption: z.string().optional(),
  usageContext: z.string().min(1, "Usage context is required"),
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
  href: z.string().min(1, "Href is required"),
  externalUrl: z
    .union([z.literal(""), z.string().url("Valid external URL required")])
    .optional(),
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
        href: z.string().min(1),
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
