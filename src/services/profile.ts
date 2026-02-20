import axios from "axios";
import type { CreatorProfile } from "@/types";

const API_GATEWAY_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || "/__gw";

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

const api = axios.create({
  baseURL: API_GATEWAY_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const toCreatorProfile = (dto: ProfileResponseDto): CreatorProfile => {
  return {
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
  };
};

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
      const response = await api.get<ProfileResponseDto>("/profiles/me");
      return toCreatorProfile(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) return null;
      throw err;
    }
  },

  upsertMyProfile: async (profile: {
    username: string;
    display_name: string;
    bio: string;
    niche: string;
    profile_photo_url: string;
    location: string;
    language: string;
    is_public?: boolean;
  }): Promise<CreatorProfile> => {
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

    const response = await api.post<ProfileResponseDto>("/profiles/me", payload);
    return toCreatorProfile(response.data);
  },
};
