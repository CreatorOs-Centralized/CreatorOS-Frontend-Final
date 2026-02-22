import axios from "axios";

import type { CreatorProfile } from "@/types";
import { apiClient } from "@/lib/utils/axios";

type ProfileResponseDto = {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  niche: string;
  profilePhotoUrl: string;
  location: string;
  language: string;
  isPublic: boolean;
};

type UpsertProfileInput = {
  username: string;
  display_name: string;
  bio: string;
  niche: string;
  profile_photo_url: string;
  location: string;
  language: string;
  is_public?: boolean;
};

type CreateProfileRequestDto = {
  username: string;
  displayName: string;
  bio: string;
  niche: string;
  profilePhotoUrl: string;
  location: string;
  language: string;
  isPublic: boolean;
};

const toCreatorProfile = (dto: ProfileResponseDto): CreatorProfile => ({
  id: dto.id,
  user_id: dto.userId,
  username: dto.username,
  display_name: dto.displayName,
  bio: dto.bio,
  niche: dto.niche,
  profile_photo_url: dto.profilePhotoUrl,
  cover_photo_url: "",
  location: dto.location,
  language: dto.language,
  is_public: dto.isPublic,
  is_verified: false,
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
      const response = await apiClient.get<ProfileResponseDto>("/profiles/me");
      return toCreatorProfile(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  upsertMyProfile: async (profile: UpsertProfileInput): Promise<CreatorProfile> => {
    const payload: CreateProfileRequestDto = {
      username: profile.username,
      displayName: profile.display_name,
      bio: profile.bio,
      niche: profile.niche,
      profilePhotoUrl: profile.profile_photo_url,
      location: profile.location,
      language: profile.language,
      isPublic: profile.is_public ?? true,
    };

    const response = await apiClient.post<ProfileResponseDto>("/profiles/me", payload);
    return toCreatorProfile(response.data);
  },
};
