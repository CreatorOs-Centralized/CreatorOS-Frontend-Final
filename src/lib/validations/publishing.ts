import { z } from "zod";

export const publishingPlatformSchema = z.enum(["YOUTUBE", "LINKEDIN", "INSTAGRAM", "TIKTOK"]);

export const connectedAccountSchema = z.object({
  id: z.string().min(1),
  platform: publishingPlatformSchema,
  accountType: z.string().optional(),
  accountName: z.string().min(1),
  platformAccountId: z.string().optional(),
  youtubeChannelId: z.string().optional(),
  linkedinAuthorUrn: z.string().optional(),
  isActive: z.boolean(),
  connectedAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const publishedPostSchema = z.object({
  id: z.string().min(1),
  platform: z.enum(["YOUTUBE", "LINKEDIN"]),
  platformPostId: z.string().min(1),
  permalinkUrl: z.string().url().or(z.string().min(1)),
  logLevel: z.enum(["INFO", "WARN", "ERROR"]).nullish(),
  message: z.string().nullish(),
  createdAt: z.string().optional(),
});

export const youtubePublishRequestSchema = z.object({
  accountId: z.string().min(1),
  title: z.string().min(1).max(100),
  description: z.string().max(5000).optional(),
  gcsPath: z.string().optional(),
  mediaId: z.string().optional(),
  privacyStatus: z.enum(["public", "unlisted", "private"]).optional(),
  tags: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  email: z.string().email().optional(),
});

export const youtubePublishResponseSchema = z.object({
  success: z.boolean(),
  publishJobId: z.string().optional(),
  videoId: z.string().optional(),
  permalink: z.string().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
});

export const linkedInPublishRequestSchema = z.object({
  text: z.string().min(1).max(3000),
});

export const linkedInPublishResponseSchema = z.object({
  postId: z.string().min(1),
  text: z.string(),
  shareUrl: z.string().optional(),
  createdAt: z.string().optional(),
});

export const loginUrlSchema = z.string().min(1);

export type ConnectedAccountDto = z.infer<typeof connectedAccountSchema>;
export type PublishingPlatform = z.infer<typeof publishingPlatformSchema>;
export type PublishedPostDto = z.infer<typeof publishedPostSchema>;
export type YouTubePublishRequestDto = z.infer<typeof youtubePublishRequestSchema>;
export type YouTubePublishResponseDto = z.infer<typeof youtubePublishResponseSchema>;
export type LinkedInPublishRequestDto = z.infer<typeof linkedInPublishRequestSchema>;
export type LinkedInPublishResponseDto = z.infer<typeof linkedInPublishResponseSchema>;
