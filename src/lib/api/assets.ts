import { z } from "zod";
import { env } from "@/lib/env";
import { tokenStorage } from "@/lib/auth/tokens";
import {
  AssetFolderSchema,
  MediaFileSchema,
  FolderContentsSchema,
  type AssetFolder,
  type MediaFile,
  type FolderContents,
  type CreateFolderRequest,
  type UploadFileRequest,
} from "@/lib/validations/asset";

const ASSET_BASE_PATH = "/assets";

/**
 * Asset Service API Client
 * Handles file uploads, folder management, and asset retrieval
 */
export const assetApi = {
  /**
   * Upload a file to a folder
   */
  async uploadFile(request: UploadFileRequest): Promise<MediaFile> {
    const formData = new FormData();
    formData.append("file", request.file);
    formData.append("userId", request.userId);
    formData.append("folderId", request.folderId);

    const token = tokenStorage.getAccessToken();
    const response = await fetch(`${env.VITE_API_GATEWAY_URL}${ASSET_BASE_PATH}/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    return MediaFileSchema.parse(data);
  },

  /**
   * Create a new folder
   */
  async createFolder(request: CreateFolderRequest): Promise<AssetFolder> {
    const params = new URLSearchParams();
    params.set("name", request.name);
    params.set("userId", request.userId);
    if (request.description) {
      params.set("description", request.description);
    }
    if (request.parentFolderId) {
      params.set("parentFolderId", request.parentFolderId);
    }

    const token = tokenStorage.getAccessToken();
    const response = await fetch(
      `${env.VITE_API_GATEWAY_URL}${ASSET_BASE_PATH}/folders?${params.toString()}`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Create folder failed with status ${response.status}`);
    }

    const data = await response.json();
    return AssetFolderSchema.parse(data);
  },

  /**
   * Get folder contents (subfolders and files)
   */
  async getFolderContents(userId: string, folderId: string): Promise<FolderContents> {
    const token = tokenStorage.getAccessToken();
    const response = await fetch(
      `${env.VITE_API_GATEWAY_URL}${ASSET_BASE_PATH}/folders/${folderId}?userId=${encodeURIComponent(userId)}`,
      {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Get folder contents failed with status ${response.status}`);
    }

    const data = await response.json();
    return FolderContentsSchema.parse(data);
  },

  /**
   * Get root-level folders for a user
   */
  async getRootFolders(userId: string): Promise<AssetFolder[]> {
    const token = tokenStorage.getAccessToken();
    const response = await fetch(
      `${env.VITE_API_GATEWAY_URL}${ASSET_BASE_PATH}/folders/root?userId=${encodeURIComponent(userId)}`,
      {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Get root folders failed with status ${response.status}`);
    }

    const data = await response.json();
    return z.array(AssetFolderSchema).parse(data);
  },

  /**
   * Get file metadata by ID
   */
  async getFileMetadata(fileId: string): Promise<MediaFile> {
    const token = tokenStorage.getAccessToken();
    const response = await fetch(
      `${env.VITE_API_GATEWAY_URL}${ASSET_BASE_PATH}/${fileId}/metadata`,
      {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Get file metadata failed with status ${response.status}`);
    }

    const data = await response.json();
    return MediaFileSchema.parse(data);
  },

  /**
   * Get the public view URL for a file
   */
  getFileViewUrl(fileId: string): string {
    return `${env.VITE_API_GATEWAY_URL}${ASSET_BASE_PATH}/view/${fileId}`;
  },
};
