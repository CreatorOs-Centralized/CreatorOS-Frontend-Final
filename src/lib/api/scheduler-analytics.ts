import { env } from "@/lib/env";
import { apiClient } from "@/lib/utils/axios";
import {
  creatorAnalyticsSummarySchema,
  postMetricsSchema,
  scheduleRequestSchema,
  type CreatorAnalyticsSummary,
  type Platform,
  type PostMetrics,
  type ScheduleRequest,
} from "@/lib/validations/scheduler-analytics";

const normalizeScheduleDateTime = (value: string) => {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${value}:00`;
  }
  return value;
};

export const schedulerAnalyticsApi = {
  async schedulePublish(payload: ScheduleRequest, userId: string): Promise<string> {
    const parsed = scheduleRequestSchema.parse(payload);
    const response = await apiClient.post(
      `${env.VITE_SCHEDULER_BASE_PATH}/schedule`,
      {
        ...parsed,
        scheduledAt: normalizeScheduleDateTime(parsed.scheduledAt),
      },
      {
        headers: {
          "X-User-Id": userId,
        },
      }
    );

    return typeof response.data === "string"
      ? response.data
      : JSON.stringify(response.data);
  },

  async createPostMetrics(payload: PostMetrics): Promise<PostMetrics> {
    const parsed = postMetricsSchema.parse(payload);
    const response = await apiClient.post(`${env.VITE_ANALYTICS_BASE_PATH}/metrics`, parsed);
    return postMetricsSchema.parse(response.data);
  },

  async createSummary(payload: CreatorAnalyticsSummary): Promise<CreatorAnalyticsSummary> {
    const parsed = creatorAnalyticsSummarySchema.parse(payload);
    const response = await apiClient.post(`${env.VITE_ANALYTICS_BASE_PATH}/summary`, parsed);
    return creatorAnalyticsSummarySchema.parse(response.data);
  },

  async getMetricsByUser(userId: string, platform?: Platform): Promise<PostMetrics[]> {
    const response = await apiClient.get(`${env.VITE_ANALYTICS_BASE_PATH}/metrics/user/${userId}`, {
      params: {
        platform,
      },
    });
    return postMetricsSchema.array().parse(response.data);
  },

  async getMetricsByPost(postId: string): Promise<PostMetrics[]> {
    const response = await apiClient.get(`${env.VITE_ANALYTICS_BASE_PATH}/metrics/post/${postId}`);
    return postMetricsSchema.array().parse(response.data);
  },

  async getSummary(params: {
    userId: string;
    platform?: Platform;
    startDate?: string;
    endDate?: string;
  }): Promise<CreatorAnalyticsSummary[]> {
    const response = await apiClient.get(`${env.VITE_ANALYTICS_BASE_PATH}/summary/${params.userId}`, {
      params: {
        platform: params.platform,
        startDate: params.startDate,
        endDate: params.endDate,
      },
    });
    return creatorAnalyticsSummarySchema.array().parse(response.data);
  },
};
