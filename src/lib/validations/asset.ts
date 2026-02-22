import { z } from "zod";

// Upload status enum
export const UploadStatusSchema = z.enum(["PENDING", "UPLOADING", "COMPLETED", "FAILED"]);
export type UploadStatus = z.infer<typeof UploadStatusSchema>;

// Asset folder schema
export const AssetFolderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  parentFolderId: z.string().uuid().nullable().optional(),
  isDeleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type AssetFolder = z.infer<typeof AssetFolderSchema>;

// Media file schema
export const MediaFileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  folderId: z.string().uuid(),
  fileName: z.string(),
  originalFileName: z.string().nullable().optional(),
  fileType: z.string().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  sizeBytes: z.number().nullable().optional(),
  storageProvider: z.string(),
  bucketName: z.string().nullable().optional(),
  storagePath: z.string().nullable().optional(),
  publicUrl: z.string().nullable().optional(),
  checksum: z.string().nullable().optional(),
  uploadStatus: UploadStatusSchema.optional(),
  isDeleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type MediaFile = z.infer<typeof MediaFileSchema>;

// Folder contents schema
export const FolderContentsSchema = z.object({
  folders: z.array(AssetFolderSchema),
  files: z.array(MediaFileSchema),
});
export type FolderContents = z.infer<typeof FolderContentsSchema>;

// Request schemas
export const CreateFolderRequestSchema = z.object({
  name: z.string().min(1),
  userId: z.string().uuid(),
  description: z.string().optional(),
  parentFolderId: z.string().uuid().optional(),
});
export type CreateFolderRequest = z.infer<typeof CreateFolderRequestSchema>;

export const UploadFileRequestSchema = z.object({
  file: z.instanceof(File),
  userId: z.string().uuid(),
  folderId: z.string().uuid(),
});
export type UploadFileRequest = z.infer<typeof UploadFileRequestSchema>;
