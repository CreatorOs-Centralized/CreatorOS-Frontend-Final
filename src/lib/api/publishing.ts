import { apiClient } from "@/lib/utils/axios";
import {
  connectedAccountSchema,
  linkedInPublishRequestSchema,
  linkedInPublishResponseSchema,
  loginUrlSchema,
  publishedPostSchema,
  publishingPlatformSchema,
  youtubePublishRequestSchema,
  youtubePublishResponseSchema,
  type ConnectedAccountDto,
  type LinkedInPublishRequestDto,
  type LinkedInPublishResponseDto,
  type PublishedPostDto,
  type PublishingPlatform,
  type YouTubePublishRequestDto,
  type YouTubePublishResponseDto,
} from "@/lib/validations/publishing";

type ApiResponse<T> = {
  data?: T;
  success?: boolean;
  message?: string;
  error?: string;
};

const unwrapArray = <T>(raw: unknown, itemSchema: { parse: (value: unknown) => T }): T[] => {
  const payload = raw as ApiResponse<unknown>;
  const data = Array.isArray(payload?.data) ? payload.data : Array.isArray(raw) ? raw : [];
  return data.map((item) => itemSchema.parse(item));
};

const unwrapObject = <T>(raw: unknown, parser: { parse: (value: unknown) => T }): T => {
  const payload = raw as ApiResponse<unknown>;
  const data = payload?.data ?? raw;
  return parser.parse(data);
};

const getLoginUrl = async (provider: "youtube" | "linkedin"): Promise<string> => {
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

  getPublishedPosts: async (): Promise<PublishedPostDto[]> => {
    const response = await apiClient.get("/publishing/published-posts");
    return unwrapArray(response.data, publishedPostSchema);
  },
};
