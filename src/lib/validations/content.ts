import { z } from "zod";

export const contentTypeSchema = z.enum([
  "VIDEO",
  "BLOG_POST",
  "PODCAST",
  "IMAGE",
  "SHORT_FORM",
  "NEWSLETTER",
  "OTHER",
]);

export const workflowStateSchema = z.enum([
  "DRAFT",
  "REVIEW",
  "SCHEDULED",
  "PUBLISHED",
]);

export const contentResponseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  contentType: contentTypeSchema,
  workflowState: workflowStateSchema,
  scheduledAt: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const createContentRequestSchema = z.object({
  title: z.string().min(1),
  contentType: contentTypeSchema.optional(),
});

export const updateContentRequestSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
});

export type ContentType = z.infer<typeof contentTypeSchema>;
export type WorkflowState = z.infer<typeof workflowStateSchema>;
export type ContentResponseDto = z.infer<typeof contentResponseSchema>;
export type CreateContentRequestDto = z.infer<typeof createContentRequestSchema>;
export type UpdateContentRequestDto = z.infer<typeof updateContentRequestSchema>;
