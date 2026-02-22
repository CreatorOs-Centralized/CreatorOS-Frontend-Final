import { z } from "zod";

export const socialPlatformSchema = z.enum([
  "TWITTER",
  "INSTAGRAM",
  "TIKTOK",
  "YOUTUBE",
  "LINKEDIN",
  "FACEBOOK",
  "PORTFOLIO",
  "CUSTOM",
]);

export const profileResponseSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  username: z.string().min(1),
  displayName: z.string().min(1),
  bio: z.string().nullable().optional(),
  niche: z.string().nullable().optional(),
  profilePhotoUrl: z.string().nullable().optional(),
  coverPhotoUrl: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  isPublic: z.boolean(),
  isVerified: z.boolean().optional(),
  verificationLevel: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const createProfileRequestSchema = z.object({
  username: z.string().min(1),
  displayName: z.string().min(1),
  bio: z.string().optional(),
  niche: z.string().optional(),
  profilePhotoUrl: z.string().optional(),
  coverPhotoUrl: z.string().optional(),
  location: z.string().optional(),
  language: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export const socialLinkRequestSchema = z.object({
  platform: socialPlatformSchema,
  handle: z.string().optional(),
  url: z.string().optional(),
});

export const socialLinkResponseSchema = z.object({
  id: z.string().min(1),
  profileId: z.string().min(1),
  platform: socialPlatformSchema,
  handle: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SocialPlatform = z.infer<typeof socialPlatformSchema>;
export type ProfileResponseDto = z.infer<typeof profileResponseSchema>;
export type CreateProfileRequestDto = z.infer<typeof createProfileRequestSchema>;
export type SocialLinkRequestDto = z.infer<typeof socialLinkRequestSchema>;
export type SocialLinkResponseDto = z.infer<typeof socialLinkResponseSchema>;
