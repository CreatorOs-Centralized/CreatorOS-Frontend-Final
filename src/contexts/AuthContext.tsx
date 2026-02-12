import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { User, CreatorProfile } from "@/types";
import {
  getKeycloakConfig,
  getKeycloakLoginUrl,
  getKeycloakRegisterUrl,
  getRedirectUri,
} from "../auth/config";
import {
  exchangeAuthorizationCode,
  refreshAccessToken,
} from "../auth/keycloak";
import {
  getMe,
  logoutFromAuthService,
  syncCurrentUser,
} from "../auth/authServiceApi";
import {
  clearTokens,
  clearUser,
  loadTokens,
  loadUser,
  saveTokens,
  saveUser,
  StoredTokens,
} from "../auth/storage";
import { createPkcePair, createState } from "../auth/pkce";

interface AuthContextType {
  user: User | null;
  profile: CreatorProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<CreatorProfile>) => Promise<void>;
  profileCompletion: number;
  sendPasswordReset: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

interface KeycloakUser {
  id: string;
  email?: string | null;
  username?: string | null;
  roles?: string[];
  isEmailVerified?: boolean;
  isProfileComplete: boolean;
  profileData?: CreatorProfile;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const calcCompletion = (p: CreatorProfile | null): number => {
  if (!p) return 0;
  const fields = ['username', 'display_name', 'bio', 'niche', 'profile_photo_url', 'location', 'language', 'fullName', 'dateOfBirth', 'instagramToken', 'youtubeToken'] as const;
  const filled = fields.filter(f => p[f] && p[f].trim() !== '').length;
  return Math.round((filled / fields.length) * 100);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<StoredTokens | null>(null);

  const keycloakCfg = useMemo(() => getKeycloakConfig(), []);
  const CALLBACK_STATE_KEY = "creatoros.kc.state";
  const CALLBACK_VERIFIER_KEY = "creatoros.kc.verifier";

  // Helper function to map Keycloak user to our User type
  const mapKeycloakUserToUser = (kcUser: KeycloakUser, storedProfile?: CreatorProfile | null): User => {
    return {
      id: kcUser.id,
      email: kcUser.email || null,
      username: kcUser.username || null,
      is_email_verified: kcUser.isEmailVerified || false,
      is_active: true,
      created_at: new Date().toISOString(),
      isProfileComplete: storedProfile ? true : kcUser.isProfileComplete || false,
    };
  };

  // Helper function to map stored profile to CreatorProfile
  const mapStoredProfile = (stored: any): CreatorProfile | null => {
    if (!stored) return null;
    return {
      id: stored.id || "1",
      user_id: stored.user_id || user?.id || "1",
      username: stored.username || "",
      display_name: stored.display_name || "",
      fullName: stored.fullName || "",
      bio: stored.bio || "",
      niche: stored.niche || "",
      profile_photo_url: stored.profile_photo_url || "",
      location: stored.location || "",
      language: stored.language || "",
      dateOfBirth: stored.dateOfBirth || "",
      instagramToken: stored.instagramToken || "",
      youtubeToken: stored.youtubeToken || "",
    };
  };

  useEffect(() => {
    // Handle Keycloak redirect callback
    (async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const returnedState = url.searchParams.get("state");
      const error = url.searchParams.get("error");

      if (error) {
        url.searchParams.delete("error");
        url.searchParams.delete("error_description");
        url.searchParams.delete("state");
        window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
        setIsLoading(false);
        return;
      }

      if (code) {
        const expectedState = sessionStorage.getItem(CALLBACK_STATE_KEY);
        const verifier = sessionStorage.getItem(CALLBACK_VERIFIER_KEY);
        sessionStorage.removeItem(CALLBACK_STATE_KEY);
        sessionStorage.removeItem(CALLBACK_VERIFIER_KEY);

        try {
          if (!verifier || !expectedState || !returnedState || expectedState !== returnedState) {
            throw new Error("Invalid login state. Please try again.");
          }

          const tokenResponse = await exchangeAuthorizationCode(
            code,
            verifier,
            getRedirectUri(),
            keycloakCfg,
          );
          
          const stored: StoredTokens = {
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            accessTokenExpiresAt: Date.now() + tokenResponse.expires_in * 1000,
          };

          saveTokens(stored);
          setTokens(stored);

          const synced = await syncCurrentUser(stored.accessToken);
          const previouslyStored = loadUser<KeycloakUser>();
          const storedProfile = loadUser<CreatorProfile>("creatoros_profile");
          
          const isSameUser = previouslyStored?.id === synced.id;
          
          const kcUser: KeycloakUser = {
            id: synced.id,
            email: synced.email,
            username: synced.username,
            roles: synced.roles,
            isEmailVerified: synced.email_verified,
            isProfileComplete: isSameUser ? (previouslyStored?.isProfileComplete ?? false) : false,
            profileData: isSameUser ? mapStoredProfile(storedProfile) : undefined,
          };

          const mappedUser = mapKeycloakUserToUser(kcUser, kcUser.profileData);
          setUser(mappedUser);
          
          if (kcUser.profileData) {
            setProfile(kcUser.profileData);
          }
          
          saveUser(kcUser);
          setIsLoading(false);
        } catch (error) {
          console.error("Auth callback error:", error);
          setUser(null);
          setProfile(null);
          setTokens(null);
          clearTokens();
          clearUser();
          setIsLoading(false);
        } finally {
          url.searchParams.delete("code");
          url.searchParams.delete("state");
          url.searchParams.delete("session_state");
          url.searchParams.delete("iss");
          window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
        }
        return;
      }
      setIsLoading(false);
    })();

    // Restore existing session
    const restoredTokens = loadTokens();
    const restoredUser = loadUser<KeycloakUser>();
    const restoredProfile = loadUser<CreatorProfile>("creatoros_profile");

    if (restoredTokens) {
      setTokens(restoredTokens);
      
      if (restoredUser) {
        const mappedUser = mapKeycloakUserToUser(restoredUser, restoredProfile);
        setUser(mappedUser);
      }
      
      if (restoredProfile) {
        setProfile(mapStoredProfile(restoredProfile));
      }

      // Validate token
      (async () => {
        try {
          const me = await getMe(restoredTokens.accessToken);
          const hydrated: KeycloakUser = {
            id: me.id,
            email: me.email,
            username: me.username,
            roles: me.roles,
            isEmailVerified: me.email_verified,
            isProfileComplete: restoredUser?.isProfileComplete ?? false,
            profileData: restoredProfile || undefined,
          };
          
          const mappedUser = mapKeycloakUserToUser(hydrated, restoredProfile);
          setUser(mappedUser);
          saveUser(hydrated);
        } catch (error) {
          console.error("Token validation failed:", error);
          setUser(null);
          setProfile(null);
          setTokens(null);
          clearTokens();
          clearUser();
        }
      })();
    }
  }, []);

  const getValidAccessToken = async (): Promise<string> => {
    const current = tokens ?? loadTokens();
    if (!current) throw new Error("Not authenticated");

    const now = Date.now();
    const skewMs = 15_000;
    if (current.accessTokenExpiresAt > now + skewMs) return current.accessToken;

    if (!current.refreshToken) {
      throw new Error("Session expired");
    }

    const refreshed = await refreshAccessToken(current.refreshToken, keycloakCfg);
    const updated: StoredTokens = {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token ?? current.refreshToken,
      accessTokenExpiresAt: Date.now() + refreshed.expires_in * 1000,
    };
    saveTokens(updated);
    setTokens(updated);
    return updated.accessToken;
  };

  const beginAuthRedirect = async (mode: "login" | "register", emailHint?: string) => {
    const { verifier, challenge } = await createPkcePair();
    const state = createState();

    sessionStorage.setItem(CALLBACK_VERIFIER_KEY, verifier);
    sessionStorage.setItem(CALLBACK_STATE_KEY, state);

    if (mode === "register") {
      window.location.href =
        getKeycloakRegisterUrl(keycloakCfg, emailHint) +
        `&code_challenge=${encodeURIComponent(challenge)}` +
        `&code_challenge_method=S256` +
        `&state=${encodeURIComponent(state)}`;
      return;
    }

    const loginUrl = getKeycloakLoginUrl(keycloakCfg, { login_hint: emailHint });
    window.location.href =
      loginUrl +
      `&code_challenge=${encodeURIComponent(challenge)}` +
      `&code_challenge_method=S256` +
      `&state=${encodeURIComponent(state)}`;
  };

  const login = async (email: string, password: string) => {
    void password;
    await beginAuthRedirect("login", email);
  };

  const register = async (email: string, password: string) => {
    void password;
    await beginAuthRedirect("register", email);
  };

  const logout = () => {
    (async () => {
      try {
        const token = await getValidAccessToken();
        await logoutFromAuthService(token);
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        sessionStorage.removeItem("creatoros.auth.autoLogin.started");
        sessionStorage.removeItem("creatoros.auth.autoRegister.started");
        sessionStorage.removeItem(CALLBACK_STATE_KEY);
        sessionStorage.removeItem(CALLBACK_VERIFIER_KEY);
        
        setUser(null);
        setProfile(null);
        setTokens(null);
        
        clearTokens();
        clearUser();
        localStorage.removeItem("creatoros_profile");
      }
    })();
  };

  const updateProfile = async (updates: Partial<CreatorProfile>) => {
    try {
      const token = await getValidAccessToken();
      
      const newProfile = {
        ...profile,
        ...updates,
        user_id: user?.id || "1",
        id: profile?.id || "1",
      } as CreatorProfile;
      
      setProfile(newProfile);
      localStorage.setItem("creatoros_profile", JSON.stringify(newProfile));
      
      // Update user's profile completion status
      if (user) {
        const updatedUser = {
          ...user,
          isProfileComplete: calcCompletion(newProfile) >= 100,
        };
        setUser(updatedUser);
        
        const kcUser = loadUser<KeycloakUser>();
        if (kcUser) {
          saveUser({
            ...kcUser,
            isProfileComplete: calcCompletion(newProfile) >= 100,
            profileData: newProfile,
          });
        }
      }
      
      // Here you would typically also sync with your backend
      // await syncUserProfile(token, newProfile);
      
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    // Keycloak password reset flow
    // Redirect to Keycloak's forgot password page
    const { verifier, challenge } = await createPkcePair();
    const state = createState();
    
    sessionStorage.setItem(CALLBACK_VERIFIER_KEY, verifier);
    sessionStorage.setItem(CALLBACK_STATE_KEY, state);
    
    const resetUrl = `${keycloakCfg.url}/realms/${keycloakCfg.realm}/protocol/openid-connect/auth?` +
      `client_id=${keycloakCfg.clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(getRedirectUri())}&` +
      `scope=openid email profile&` +
      `kc_action=UPDATE_PASSWORD&` +
      `login_hint=${encodeURIComponent(email)}&` +
      `code_challenge=${encodeURIComponent(challenge)}&` +
      `code_challenge_method=S256&` +
      `state=${encodeURIComponent(state)}`;
    
    window.location.href = resetUrl;
  };

  const deleteAccount = async () => {
    try {
      const token = await getValidAccessToken();
      // Call your backend API to delete the account
      // await deleteUserAccount(token);
      
      // Logout after deletion
      logout();
    } catch (error) {
      console.error("Failed to delete account:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        profileCompletion: calcCompletion(profile),
        sendPasswordReset,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};