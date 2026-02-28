import { z } from "zod";

export const platformSchema = z.string().min(1);

// 1. Dashboard Summary
export const dashboardSummaryResponseSchema = z.object({
    views: z.number().default(0),
    likes: z.number().default(0),
    comments: z.number().default(0),
    shares: z.number().default(0),
});

export type DashboardSummaryResponse = z.infer<typeof dashboardSummaryResponseSchema>;

// 2. Views / Engagement Trend
export const dashboardTrendItemSchema = z.object({
    date: z.string(),
    views: z.number().default(0),
    likes: z.number().default(0),
    comments: z.number().default(0),
    shares: z.number().default(0),
});

export type DashboardTrendItem = z.infer<typeof dashboardTrendItemSchema>;

// 3. Platform Comparison
export const platformComparisonItemSchema = z.object({
    platform: platformSchema,
    views: z.number().default(0),
    likes: z.number().default(0),
    comments: z.number().default(0),
    shares: z.number().default(0),
});

export type PlatformComparisonItem = z.infer<typeof platformComparisonItemSchema>;

// 4. Available Posts
export const dashboardPostItemSchema = z.object({
    postId: z.string().uuid(),
    platformPostId: z.string(),
    title: z.string(),
    platform: platformSchema,
});

export type DashboardPostItem = z.infer<typeof dashboardPostItemSchema>;
