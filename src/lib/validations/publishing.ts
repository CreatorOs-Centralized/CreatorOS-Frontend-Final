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
  instagramUserId: z.string().optional(),
  isActive: z.boolean(),
  connectedAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const publishedPostSchema = z.object({
  id: z.string().min(1),
  platform: z.enum(["YOUTUBE", "LINKEDIN", "INSTAGRAM"]),
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

export const instagramMediaTypeSchema = z.enum(["REELS", "STORIES", "CAROUSEL", "VIDEO"]);

export const instagramPublishRequestSchema = z
  .object({
    accountId: z.string().min(1),
    caption: z.string().max(2200).optional(),
    mediaType: instagramMediaTypeSchema.optional(),
    imageUrl: z.string().url().optional(),
    videoUrl: z.string().url().optional(),
    children: z.array(z.string().min(1)).optional(),
    isCarouselItem: z.boolean().optional(),
    thumbOffset: z.string().optional(),
    altText: z.string().max(1000).optional(),
  })
  .refine((value) => !(value.imageUrl && value.videoUrl), {
    message: "imageUrl and videoUrl are mutually exclusive for single-media posts",
    path: ["imageUrl"],
  });

export const instagramPublishResultSchema = z.object({
  containerId: z.string().optional(),
  mediaId: z.string().optional(),
  status: z.string().optional(),
});

export const instagramMediaSchema = z.object({
  id: z.string().min(1),
  caption: z.string().optional(),
  media_type: z.string().optional(),
  media_url: z.string().url().optional(),
  permalink: z.string().url().optional(),
  timestamp: z.string().optional(),
  like_count: z.number().optional(),
  comments_count: z.number().optional(),
});

export const instagramPostsResultSchema = z.object({
  data: z.array(instagramMediaSchema).optional(),
  paging: z
    .object({
      cursors: z
        .object({
          before: z.string().optional(),
          after: z.string().optional(),
        })
        .optional(),
      next: z.string().optional(),
      previous: z.string().optional(),
    })
    .optional(),
});

export const instagramInsightValueSchema = z.object({
  value: z.union([z.number(), z.string(), z.record(z.unknown())]).optional(),
  end_time: z.string().optional(),
});

export const instagramInsightSchema = z.object({
  name: z.string().min(1),
  period: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  values: z.array(instagramInsightValueSchema).optional(),
});

export const instagramInsightsResultSchema = z.object({
  data: z.array(instagramInsightSchema).optional(),
});

export const instagramContainerStatusSchema = z.object({
  id: z.string().optional(),
  status: z.string().optional(),
  statusCode: z.string().optional(),
  errorMessage: z.string().optional(),
});

export const instagramPublishingLimitSchema = z.object({
  config: z.record(z.unknown()).optional(),
  quota_usage: z.number().optional(),
  quotaUsage: z.number().optional(),
});

export const loginUrlSchema = z.string().min(1);

export type ConnectedAccountDto = z.infer<typeof connectedAccountSchema>;
export type PublishingPlatform = z.infer<typeof publishingPlatformSchema>;
export type PublishedPostDto = z.infer<typeof publishedPostSchema>;
export type YouTubePublishRequestDto = z.infer<typeof youtubePublishRequestSchema>;
export type YouTubePublishResponseDto = z.infer<typeof youtubePublishResponseSchema>;
export type LinkedInPublishRequestDto = z.infer<typeof linkedInPublishRequestSchema>;
export type LinkedInPublishResponseDto = z.infer<typeof linkedInPublishResponseSchema>;
export type InstagramMediaType = z.infer<typeof instagramMediaTypeSchema>;
export type InstagramPublishRequestDto = z.infer<typeof instagramPublishRequestSchema>;
export type InstagramPublishResultDto = z.infer<typeof instagramPublishResultSchema>;
export type InstagramMediaDto = z.infer<typeof instagramMediaSchema>;
export type InstagramPostsResultDto = z.infer<typeof instagramPostsResultSchema>;
export type InstagramInsightDto = z.infer<typeof instagramInsightSchema>;
export type InstagramInsightsResultDto = z.infer<typeof instagramInsightsResultSchema>;
export type InstagramContainerStatusDto = z.infer<typeof instagramContainerStatusSchema>;
export type InstagramPublishingLimitDto = z.infer<typeof instagramPublishingLimitSchema>;
