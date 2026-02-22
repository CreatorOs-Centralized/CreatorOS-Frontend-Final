import { apiClient } from "@/lib/utils/axios";
import {
  contentResponseSchema,
  createContentRequestSchema,
  updateContentRequestSchema,
  type ContentResponseDto,
  type CreateContentRequestDto,
  type UpdateContentRequestDto,
} from "@/lib/validations/content";

export const contentApi = {
  createContent: async (data: CreateContentRequestDto): Promise<ContentResponseDto> => {
    const payload = createContentRequestSchema.parse(data);
    const response = await apiClient.post("/contents", payload);
    return contentResponseSchema.parse(response.data);
  },

  getMyContents: async (): Promise<ContentResponseDto[]> => {
    const response = await apiClient.get("/contents");
    return contentResponseSchema.array().parse(response.data);
  },

  getContentById: async (contentId: string): Promise<ContentResponseDto> => {
    const response = await apiClient.get(`/contents/${contentId}`);
    return contentResponseSchema.parse(response.data);
  },

  updateContent: async (
    contentId: string,
    data: UpdateContentRequestDto,
  ): Promise<ContentResponseDto> => {
    const payload = updateContentRequestSchema.parse(data);
    const response = await apiClient.put(`/contents/${contentId}`, payload);
    return contentResponseSchema.parse(response.data);
  },

  deleteContent: async (contentId: string): Promise<void> => {
    await apiClient.delete(`/contents/${contentId}`);
  },

  moveToNextState: async (contentId: string): Promise<ContentResponseDto> => {
    const response = await apiClient.post(`/contents/${contentId}/workflow/next`);
    return contentResponseSchema.parse(response.data);
  },
};
