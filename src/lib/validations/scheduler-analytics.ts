import { z } from "zod";

export const platformSchema = z.string().min(1);

export const scheduleRequestSchema = z.object({
  contentItemId: z.string().min(1),
  connectedAccountId: z.string().min(1),
  platform: platformSchema,
  scheduledAt: z.string().min(1),
});

export const postMetricsSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  publishJobId: z.string().optional(),
  publishedPostId: z.string().optional(),
  platform: platformSchema,
  platformPostId: z.string().optional(),
  views: z.number().optional(),
  likes: z.number().optional(),
  comments: z.number().optional(),
  shares: z.number().optional(),
  saves: z.number().optional(),
  impressions: z.number().optional(),
  reach: z.number().optional(),
  watchTimeSeconds: z.number().optional(),
  avgViewDurationSeconds: z.number().optional(),
  fetchedAt: z.string().optional(),
  createdAt: z.string().optional(),
});

export const creatorAnalyticsSummarySchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  platform: platformSchema,
  rangeStart: z.string().min(1),
  rangeEnd: z.string().min(1),
  totalViews: z.number().optional(),
  totalLikes: z.number().optional(),
  totalComments: z.number().optional(),
  totalShares: z.number().optional(),
  totalPosts: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Platform = z.infer<typeof platformSchema>;
export type ScheduleRequest = z.infer<typeof scheduleRequestSchema>;
export type PostMetrics = z.infer<typeof postMetricsSchema>;
export type CreatorAnalyticsSummary = z.infer<typeof creatorAnalyticsSummarySchema>;
