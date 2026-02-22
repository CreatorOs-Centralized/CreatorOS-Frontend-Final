import axios from "axios";

import type { CreatorProfile } from "@/types";
import { apiClient } from "@/lib/utils/axios";
import {
  createProfileRequestSchema,
  profileResponseSchema,
  socialLinkRequestSchema,
  socialLinkResponseSchema,
  type CreateProfileRequestDto,
  type ProfileResponseDto,
  type SocialLinkRequestDto,
  type SocialLinkResponseDto,
} from "@/lib/validations/profile";

type UpsertProfileInput = {
  username: string;
  display_name: string;
  bio: string;
  niche: string;
  profile_photo_url: string;
  cover_photo_url?: string;
  location: string;
  language: string;
  is_public?: boolean;
};

const toCreatorProfile = (dto: ProfileResponseDto): CreatorProfile => ({
  id: dto.id,
  user_id: dto.userId,
  username: dto.username,
  display_name: dto.displayName,
  bio: dto.bio ?? "",
  niche: dto.niche ?? "",
  profile_photo_url: dto.profilePhotoUrl ?? "",
  cover_photo_url: dto.coverPhotoUrl ?? "",
  location: dto.location ?? "",
  language: dto.language ?? "",
  is_public: dto.isPublic,
  is_verified: dto.isVerified ?? false,
});

export const isProfileComplete = (profile: CreatorProfile | null): boolean => {
  if (!profile) return false;
  return Boolean(
    profile.username?.trim() &&
      profile.display_name?.trim() &&
      profile.bio?.trim() &&
      profile.niche?.trim() &&
      profile.profile_photo_url?.trim() &&
      profile.location?.trim() &&
      profile.language?.trim(),
  );
};

export const profileApi = {
  getMyProfile: async (): Promise<CreatorProfile | null> => {
    try {
      const response = await apiClient.get("/profiles/me");
      const parsed = profileResponseSchema.parse(response.data);
      return toCreatorProfile(parsed);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getProfileByUsername: async (username: string): Promise<CreatorProfile> => {
    const response = await apiClient.get(`/profiles/${username}`);
    const parsed = profileResponseSchema.parse(response.data);
    return toCreatorProfile(parsed);
  },

  profileExists: async (): Promise<boolean> => {
    const response = await apiClient.get("/profiles/me/exists");
    return Boolean(response.data);
  },

  deleteProfile: async (): Promise<void> => {
    await apiClient.delete("/profiles/me");
  },

  upsertMyProfile: async (profile: UpsertProfileInput): Promise<CreatorProfile> => {
    const payload: CreateProfileRequestDto = createProfileRequestSchema.parse({
      username: profile.username,
      displayName: profile.display_name,
      bio: profile.bio,
      niche: profile.niche,
      profilePhotoUrl: profile.profile_photo_url,
      coverPhotoUrl: profile.cover_photo_url,
      location: profile.location,
      language: profile.language,
      isPublic: profile.is_public ?? true,
    });

    const response = await apiClient.post("/profiles/me", payload);
    const parsed = profileResponseSchema.parse(response.data);
    return toCreatorProfile(parsed);
  },

  addSocialLink: async (data: SocialLinkRequestDto): Promise<SocialLinkResponseDto> => {
    const payload = socialLinkRequestSchema.parse(data);
    const response = await apiClient.post("/profiles/me/social-links", payload);
    return socialLinkResponseSchema.parse(response.data);
  },

  getMySocialLinks: async (): Promise<SocialLinkResponseDto[]> => {
    const response = await apiClient.get("/profiles/me/social-links");
    return socialLinkResponseSchema.array().parse(response.data);
  },

  updateSocialLink: async (
    linkId: string,
    data: SocialLinkRequestDto,
  ): Promise<SocialLinkResponseDto> => {
    const payload = socialLinkRequestSchema.parse(data);
    const response = await apiClient.put(`/profiles/me/social-links/${linkId}`, payload);
    return socialLinkResponseSchema.parse(response.data);
  },

  deleteSocialLink: async (linkId: string): Promise<void> => {
    await apiClient.delete(`/profiles/me/social-links/${linkId}`);
  },

  deleteAllSocialLinks: async (): Promise<void> => {
    await apiClient.delete("/profiles/me/social-links");
  },

  getSocialLinksByProfileId: async (profileId: string): Promise<SocialLinkResponseDto[]> => {
    const response = await apiClient.get(`/profiles/me/social-links/profile/${profileId}`);
    return socialLinkResponseSchema.array().parse(response.data);
  },
};
