import { create } from "zustand";

import { tokenStorage } from "@/lib/auth/tokens";
import type { CreatorProfile } from "@/types";
import type { UserDto } from "@/lib/validations/auth";

type AuthState = {
  user: UserDto | null;
  profile: CreatorProfile | null;
  isLoading: boolean;
  setUser: (user: UserDto | null) => void;
  setProfile: (profile: CreatorProfile | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setTokens: (tokens) => tokenStorage.setTokens(tokens),
  clearAuth: () => {
    tokenStorage.clear();
    set({ user: null, profile: null, isLoading: false });
  },
}));
