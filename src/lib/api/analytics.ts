import { env } from "@/lib/env";
import { apiClient } from "@/lib/utils/axios";
import {
    dashboardSummaryResponseSchema,
    dashboardTrendItemSchema,
    platformComparisonItemSchema,
    dashboardPostItemSchema,
    type DashboardSummaryResponse,
    type DashboardTrendItem,
    type PlatformComparisonItem,
    type DashboardPostItem,
} from "@/lib/validations/analytics";

interface BaseDashboardRequest {
    userId: string;
    platform?: string;
    postId?: string;
}

interface TrendDashboardRequest extends BaseDashboardRequest {
    days?: number;
}

interface ComparisonDashboardRequest {
    userId: string;
    days?: number;
}

interface PostsDashboardRequest {
    userId: string;
    platform?: string;
}

export const analyticsApi = {
    getDashboardSummary: async (params: BaseDashboardRequest): Promise<DashboardSummaryResponse> => {
        const response = await apiClient.get(`${env.VITE_ANALYTICS_BASE_PATH}/dashboard/summary`, {
            params,
        });
        return dashboardSummaryResponseSchema.parse(response.data);
    },

    getDashboardTrend: async (params: TrendDashboardRequest): Promise<DashboardTrendItem[]> => {
        const response = await apiClient.get(`${env.VITE_ANALYTICS_BASE_PATH}/dashboard/trend`, {
            params,
        });
        return dashboardTrendItemSchema.array().parse(response.data);
    },

    getPlatformComparison: async (params: ComparisonDashboardRequest): Promise<PlatformComparisonItem[]> => {
        const response = await apiClient.get(`${env.VITE_ANALYTICS_BASE_PATH}/dashboard/comparison`, {
            params,
        });
        return platformComparisonItemSchema.array().parse(response.data);
    },

    getDashboardPosts: async (params: PostsDashboardRequest): Promise<DashboardPostItem[]> => {
        const response = await apiClient.get(`${env.VITE_ANALYTICS_BASE_PATH}/dashboard/posts`, {
            params,
        });
        return dashboardPostItemSchema.array().parse(response.data);
    },
};
