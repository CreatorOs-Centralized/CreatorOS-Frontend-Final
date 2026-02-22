import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { authApi, profileApi, isProfileComplete, type UserDto, type LoginCredentials, type RegisterData } from '@/lib/api';
import type { CreatorProfile } from '@/types';
import { tokenStorage } from '@/lib/auth/tokens';
import { useAuthStore } from '@/stores/auth-store';

const getProfileDataKey = (userId: string) => `creatoros.profile.data:${userId}`;

interface AuthContextType {
  user: UserDto | null;
  profile: CreatorProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; nextRoute?: string; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (profileData: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setUser = useAuthStore((state) => state.setUser);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);
  const setTokens = useAuthStore((state) => state.setTokens);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const hydrateUser = useCallback((userData: UserDto): UserDto => {
    if (!userData?.id) return userData;
    const dataKey = getProfileDataKey(userData.id);
    let profileData: Record<string, unknown> | undefined;

    const raw = localStorage.getItem(dataKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          profileData = parsed as Record<string, unknown>;
        }
      } catch {
        // ignore
      }
    }

    return {
      ...userData,
      profileData
    };
  }, []);

  const applyProfileToUser = (userData: UserDto, loadedProfile: CreatorProfile | null): UserDto => {
    return {
      ...userData,
      isProfileComplete: isProfileComplete(loadedProfile),
    };
  };

  const getNextRouteForUser = (userData: UserDto) => {
    return userData.isProfileComplete ? '/dashboard' : '/complete-profile';
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.getAccessToken();

      if (token) {
        try {
          const [rawUser, loadedProfile] = await Promise.all([
            authApi.getCurrentUser(),
            profileApi.getMyProfile(),
          ]);

          const hydrated = hydrateUser(rawUser);
          setProfile(loadedProfile);
          setUser(applyProfileToUser(hydrated, loadedProfile));
        } catch (error) {
          tokenStorage.clear();
          setProfile(null);
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, [hydrateUser]);

  const login = async (email: string, password: string) => {
    try {
      const credentials: LoginCredentials = { email, password };
      const response = await authApi.login(credentials);

      setTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken });

      const [rawUser, loadedProfile] = await Promise.all([
        authApi.getCurrentUser(),
        profileApi.getMyProfile(),
      ]);

      const hydrated = hydrateUser(rawUser);
      const withProfile = applyProfileToUser(hydrated, loadedProfile);

      setProfile(loadedProfile);
      setUser(withProfile);

      return { success: true, nextRoute: getNextRouteForUser(withProfile) };
    } catch (error: unknown) {
      return {
        success: false,
        error: authApi.getErrorMessage(error, 'Login failed')
      };
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const registerData: RegisterData = { username, email, password };
      await authApi.register(registerData);

      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: authApi.getErrorMessage(error, 'Registration failed')
      };
    }
  };

  const updateProfile = async (profileData: Record<string, unknown>) => {
    try {
      if (!user?.id) {
        return { success: false, error: 'Not authenticated' };
      }

      // Persist extra fields locally for prefill only.
      localStorage.setItem(getProfileDataKey(user.id), JSON.stringify(profileData));

      const asString = (v: unknown) => (typeof v === 'string' ? v : '');
      const updatedProfile = await profileApi.upsertMyProfile({
        username: asString(profileData.username),
        display_name: asString(profileData.display_name),
        bio: asString(profileData.bio),
        niche: asString(profileData.niche),
        profile_photo_url: asString(profileData.profile_photo_url),
        location: asString(profileData.location),
        language: asString(profileData.language),
        is_public: typeof profileData.is_public === 'boolean' ? profileData.is_public : true,
      });

      setProfile(updatedProfile);
      if (user) {
        setUser({
          ...user,
          isProfileComplete: isProfileComplete(updatedProfile),
          profileData,
        });
      }

      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: authApi.getErrorMessage(error, 'Failed to update profile') };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error(error);
    } finally {
      clearAuth();
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      await authApi.verifyEmail(token);

      if (tokenStorage.getAccessToken()) {
        const [rawUser, loadedProfile] = await Promise.all([
          authApi.getCurrentUser(),
          profileApi.getMyProfile(),
        ]);

        const hydrated = hydrateUser(rawUser);
        setProfile(loadedProfile);
        setUser(applyProfileToUser(hydrated, loadedProfile));
      }

      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: authApi.getErrorMessage(error, 'Verification failed')
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        updateProfile,
        logout,
        verifyEmail
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
