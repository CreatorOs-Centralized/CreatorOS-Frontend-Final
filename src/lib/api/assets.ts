import { apiClient } from "@/lib/utils/axios";

type UploadAssetResponse = {
  url: string;
};

export const assetsApi = {
  uploadImage: async (file: File, userId: string, folderId: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    formData.append("folderId", folderId);

    const response = await apiClient.post<UploadAssetResponse>("/assets/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data?.url) {
      throw new Error("Upload failed: No URL returned");
    }

    return response.data.url;
  },
};
