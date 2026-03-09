import { apiClient } from "@/lib/utils/axios";
import {
  connectedAccountSchema,
  instagramContainerStatusSchema,
  instagramInsightsResultSchema,
  instagramPostsResultSchema,
  instagramPublishRequestSchema,
  instagramPublishResultSchema,
  instagramPublishingLimitSchema,
  linkedInPublishRequestSchema,
  linkedInPublishResponseSchema,
  loginUrlSchema,
  publishedPostSchema,
  publishingPlatformSchema,
  youtubePublishRequestSchema,
  youtubePublishResponseSchema,
  type ConnectedAccountDto,
  type InstagramContainerStatusDto,
  type InstagramInsightsResultDto,
  type InstagramPostsResultDto,
  type InstagramPublishRequestDto,
  type InstagramPublishResultDto,
  type InstagramPublishingLimitDto,
  type LinkedInPublishRequestDto,
  type LinkedInPublishResponseDto,
  type PublishedPostDto,
  type PublishingPlatform,
  type YouTubePublishRequestDto,
  type YouTubePublishResponseDto,
} from "@/lib/validations/publishing";

type ApiResponse<T> = {
  data?: T;
  result?: T;
  success?: boolean;
  message?: string;
  error?: string;
};

type InstagramInsightParams = {
  metrics: string[];
  period?: string;
  since?: string;
  until?: string;
};

const unwrapArray = <T>(raw: unknown, itemSchema: { parse: (value: unknown) => T }): T[] => {
  const payload = raw as ApiResponse<unknown>;
  const data = Array.isArray(payload?.data) ? payload.data : Array.isArray(raw) ? raw : [];
  return data.map((item) => itemSchema.parse(item));
};

const unwrapObject = <T>(raw: unknown, parser: { parse: (value: unknown) => T }): T => {
  const payload = raw as ApiResponse<unknown>;
  const data = payload?.data ?? payload?.result ?? raw;
  return parser.parse(data);
};

const parseCommaSeparatedMetrics = (metrics: string[]) =>
  metrics
    .map((metric) => metric.trim())
    .filter(Boolean)
    .join(",");

const getLoginUrl = async (provider: "youtube" | "linkedin" | "instagram"): Promise<string> => {
  try {
    const oauthResp = await apiClient.get(`/oauth/${provider}/login`);
    if (typeof oauthResp.data === "string") return loginUrlSchema.parse(oauthResp.data);
    return loginUrlSchema.parse((oauthResp.data as { url?: string })?.url);
  } catch {
    const legacyResp = await apiClient.get(`/publishing/${provider}/login`);
    if (typeof legacyResp.data === "string") return loginUrlSchema.parse(legacyResp.data);
    return loginUrlSchema.parse((legacyResp.data as { url?: string })?.url);
  }
};

export const publishingApi = {
  getConnectedAccounts: async (): Promise<ConnectedAccountDto[]> => {
    const response = await apiClient.get("/connected-accounts");
    return unwrapArray(response.data, connectedAccountSchema);
  },

  getConnectedAccountsByPlatform: async (platform: PublishingPlatform): Promise<ConnectedAccountDto[]> => {
    const validPlatform = publishingPlatformSchema.parse(platform);
    const response = await apiClient.get(`/connected-accounts/platform/${validPlatform}`);
    return unwrapArray(response.data, connectedAccountSchema);
  },

  getYouTubeChannels: async (): Promise<ConnectedAccountDto[]> => {
    const response = await apiClient.get("/connected-accounts/youtube/channels");
    return unwrapArray(response.data, connectedAccountSchema);
  },

  getLinkedInAccounts: async (): Promise<ConnectedAccountDto[]> => {
    const response = await apiClient.get("/connected-accounts/linkedin/accounts");
    return unwrapArray(response.data, connectedAccountSchema);
  },

  getYouTubeLoginUrl: async (): Promise<string> => getLoginUrl("youtube"),
  getLinkedInLoginUrl: async (): Promise<string> => getLoginUrl("linkedin"),
  getInstagramLoginUrl: async (): Promise<string> => getLoginUrl("instagram"),
  // getInstagramLoginUrl: async (): Promise<string> => {
  //   const response = await apiClient.get("/instagram/login");
  //   if (typeof response.data === "string") return loginUrlSchema.parse(response.data);

  //   const payload = response.data as { url?: string; result?: string; data?: string };
  //   return loginUrlSchema.parse(payload.url ?? payload.result ?? payload.data);
  // },

  refreshInstagramToken: async (accountId?: string): Promise<{ success: boolean; message?: string }> => {
    const response = await apiClient.get("/instagram/refresh", {
      params: accountId ? { accountId } : undefined,
    });

    const payload = response.data as ApiResponse<unknown>;
    return {
      success: payload?.success ?? true,
      message: payload?.message,
    };
  },

  publishYouTubeVideo: async (request: YouTubePublishRequestDto): Promise<YouTubePublishResponseDto> => {
    const payload = youtubePublishRequestSchema.parse(request);
    const response = await apiClient.post("/publishing/youtube/publish", payload);
    return unwrapObject(response.data, youtubePublishResponseSchema);
  },

  publishLinkedInPost: async (
    accountId: string,
    request: LinkedInPublishRequestDto,
  ): Promise<LinkedInPublishResponseDto> => {
    const payload = linkedInPublishRequestSchema.parse(request);
    const response = await apiClient.post(`/publishing/linkedin/posts/${accountId}`, payload);
    return unwrapObject(response.data, linkedInPublishResponseSchema);
  },

  publishInstagram: async (request: InstagramPublishRequestDto): Promise<InstagramPublishResultDto> => {
    const payload = instagramPublishRequestSchema.parse(request);
    const response = await apiClient.post("/instagram/publish", payload);
    return unwrapObject(response.data, instagramPublishResultSchema);
  },

  getInstagramPosts: async (accountId: string, limit = 25, after?: string): Promise<InstagramPostsResultDto> => {
    const response = await apiClient.get(`/instagram/accounts/${accountId}/posts`, {
      params: {
        limit,
        ...(after ? { after } : {}),
      },
    });

    return unwrapObject(response.data, instagramPostsResultSchema);
  },

  getInstagramPostById: async (accountId: string, mediaId: string): Promise<InstagramPostsResultDto> => {
    const response = await apiClient.get(`/instagram/accounts/${accountId}/posts/${mediaId}`);
    return unwrapObject(response.data, instagramPostsResultSchema);
  },

  getInstagramMediaInsights: async (
    accountId: string,
    mediaId: string,
    metrics: string[] = ["engagement", "impressions", "reach"],
  ): Promise<InstagramInsightsResultDto> => {
    const response = await apiClient.get(`/instagram/accounts/${accountId}/posts/${mediaId}/insights`, {
      params: {
        metrics: parseCommaSeparatedMetrics(metrics),
      },
    });

    return unwrapObject(response.data, instagramInsightsResultSchema);
  },

  getInstagramAccountInsights: async (
    accountId: string,
    params: InstagramInsightParams,
  ): Promise<InstagramInsightsResultDto> => {
    const response = await apiClient.get(`/instagram/accounts/${accountId}/insights`, {
      params: {
        metrics: parseCommaSeparatedMetrics(params.metrics),
        ...(params.period ? { period: params.period } : {}),
        ...(params.since ? { since: params.since } : {}),
        ...(params.until ? { until: params.until } : {}),
      },
    });

    return unwrapObject(response.data, instagramInsightsResultSchema);
  },

  getInstagramPublishingLimit: async (accountId: string): Promise<InstagramPublishingLimitDto> => {
    const response = await apiClient.get(`/instagram/accounts/${accountId}/publishing-limit`);
    return unwrapObject(response.data, instagramPublishingLimitSchema);
  },

  getInstagramContainerStatus: async (
    accountId: string,
    containerId: string,
  ): Promise<InstagramContainerStatusDto> => {
    const response = await apiClient.get(`/instagram/accounts/${accountId}/containers/${containerId}/status`);
    return unwrapObject(response.data, instagramContainerStatusSchema);
  },

  getPublishedPosts: async (): Promise<PublishedPostDto[]> => {
    const response = await apiClient.get("/publishing/published-posts");
    return unwrapArray(response.data, publishedPostSchema);
  },
};
