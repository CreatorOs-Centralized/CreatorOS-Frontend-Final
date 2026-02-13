import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import type { User, CreatorProfile } from "@/types";
import {
  getKeycloakConfig,
  getKeycloakLoginUrl,
  getKeycloakRegisterUrl,
  getKeycloakLogoutUrl,
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
  isAuthenticated: boolean;
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
  const fields = [
    "username",
    "display_name",
    "bio",
    "niche",
    "profile_photo_url",
    "location",
    "language",
    "fullName",
    "dateOfBirth",
    "instagramToken",
    "youtubeToken",
  ] as const;
  const filled = fields.filter((f) => p[f] && p[f].trim() !== "").length;
  return Math.round((filled / fields.length) * 100);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<StoredTokens | null>(null);

  const keycloakCfg = useMemo(() => getKeycloakConfig(), []);
  const VERIFIER_PREFIX = "creatoros.kc.verifier.";
  const CALLBACK_CODE_GUARD_PREFIX = "creatoros.kc.cb.guard.";
  const PROFILE_KEY_PREFIX = "creatoros_profile.";

  const profileKeyForUserId = (userId: string) =>
    `${PROFILE_KEY_PREFIX}${userId}`;

  // Helper function to map Keycloak user to our User type
  const mapKeycloakUserToUser = (
    kcUser: KeycloakUser,
    storedProfile?: CreatorProfile | null,
  ): User => {
    return {
      id: kcUser.id,
      email: kcUser.email ?? null,
      username: kcUser.username || null,
      is_email_verified: kcUser.isEmailVerified || false,
      is_active: true,
      created_at: new Date().toISOString(),
      isProfileComplete: storedProfile
        ? true
        : kcUser.isProfileComplete || false,
      profileData: storedProfile ?? kcUser.profileData,
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

      // React 18 StrictMode intentionally double-invokes effects in dev.
      // Guard callback processing per authorization `code` so the verifier isn't consumed twice.
      if (code) {
        const guardKey = `${CALLBACK_CODE_GUARD_PREFIX}${code}`;
        const existing = sessionStorage.getItem(guardKey);
        const now = Date.now();
        const previous = existing ? Number(existing) : NaN;
        const recentlyHandled =
          Number.isFinite(previous) && now - previous < 30_000;
        if (recentlyHandled) {
          url.searchParams.delete("code");
          url.searchParams.delete("state");
          url.searchParams.delete("session_state");
          url.searchParams.delete("iss");
          window.history.replaceState(
            {},
            document.title,
            url.pathname + url.search + url.hash,
          );
          setIsLoading(false);
          return;
        }
        sessionStorage.setItem(guardKey, String(now));
      }

      if (error) {
        url.searchParams.delete("error");
        url.searchParams.delete("error_description");
        url.searchParams.delete("state");
        window.history.replaceState(
          {},
          document.title,
          url.pathname + url.search + url.hash,
        );
        setIsLoading(false);
        return;
      }

      if (code) {
        const verifierKey = returnedState
          ? `${VERIFIER_PREFIX}${returnedState}`
          : null;
        const verifier = verifierKey
          ? sessionStorage.getItem(verifierKey)
          : null;
        if (verifierKey) sessionStorage.removeItem(verifierKey);

        try {
          if (!returnedState || !verifier) {
            // Common case: user navigated back to an old Keycloak login page and submitted it again.
            // The PKCE verifier was already consumed, so we can't validate this callback.
            // If we already have a valid session, keep it and don't treat this as an error.
            try {
              const restoredTokens = loadTokens();
              const restoredUser = loadUser<KeycloakUser>();
              const restoredProfile = restoredUser?.id
                ? loadUser<CreatorProfile>(profileKeyForUserId(restoredUser.id))
                : null;

              if (restoredTokens && restoredUser) {
                await getMe(restoredTokens.accessToken);
                setTokens(restoredTokens);
                setUser(mapKeycloakUserToUser(restoredUser, restoredProfile));
                if (restoredProfile)
                  setProfile(mapStoredProfile(restoredProfile));
                setIsLoading(false);
                return;
              }
            } catch {
              // fall through
            }

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
          const storedProfile = loadUser<CreatorProfile>(
            profileKeyForUserId(synced.id),
          );
          const mappedStoredProfile = mapStoredProfile(storedProfile);
          const storedCompletion = mappedStoredProfile
            ? calcCompletion(mappedStoredProfile)
            : 0;

          const kcUser: KeycloakUser = {
            id: synced.id,
            email: synced.email,
            username: synced.username,
            roles: synced.roles,
            isEmailVerified: false,
            isProfileComplete: storedCompletion >= 100,
            profileData: mappedStoredProfile ?? undefined,
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
          // Allow retry if callback failed.
          if (code)
            sessionStorage.removeItem(`${CALLBACK_CODE_GUARD_PREFIX}${code}`);
          setIsLoading(false);
        } finally {
          url.searchParams.delete("code");
          url.searchParams.delete("state");
          url.searchParams.delete("session_state");
          url.searchParams.delete("iss");
          window.history.replaceState(
            {},
            document.title,
            url.pathname + url.search + url.hash,
          );
        }
        return;
      }
      setIsLoading(false);
    })();
  }, []);

  // Restore existing session (separate effect to avoid racing the OAuth callback).
  useEffect(() => {
    const url = new URL(window.location.href);
    const hasAuthCode = Boolean(url.searchParams.get("code"));
    if (hasAuthCode) return;

    const restoredTokens = loadTokens();
    const restoredUser = loadUser<KeycloakUser>();
    const restoredProfile = restoredUser?.id
      ? loadUser<CreatorProfile>(profileKeyForUserId(restoredUser.id))
      : null;

    if (!restoredTokens) return;

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
        const mappedRestored = restoredProfile
          ? mapStoredProfile(restoredProfile)
          : null;
        const hydrated: KeycloakUser = {
          id: me.id,
          email: me.email,
          username: me.username,
          roles: me.roles,
          isEmailVerified: false,
          isProfileComplete: Boolean(
            mappedRestored && calcCompletion(mappedRestored) >= 100,
          ),
          profileData: mappedRestored ?? undefined,
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

    const refreshed = await refreshAccessToken(
      current.refreshToken,
      keycloakCfg,
    );
    const updated: StoredTokens = {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token ?? current.refreshToken,
      accessTokenExpiresAt: Date.now() + refreshed.expires_in * 1000,
    };
    saveTokens(updated);
    setTokens(updated);
    return updated.accessToken;
  };

  const beginAuthRedirect = async (
    mode: "login" | "register",
    emailHint?: string,
  ) => {
    const { verifier, challenge } = await createPkcePair();
    const state = createState();

    // Store verifier keyed by state to avoid overwriting when multiple auth attempts happen.
    sessionStorage.setItem(`${VERIFIER_PREFIX}${state}`, verifier);

    if (mode === "register") {
      window.location.href =
        getKeycloakRegisterUrl(keycloakCfg, emailHint) +
        `&code_challenge=${encodeURIComponent(challenge)}` +
        `&code_challenge_method=S256` +
        `&state=${encodeURIComponent(state)}`;
      return;
    }

    const loginUrl = getKeycloakLoginUrl(keycloakCfg, {
      login_hint: emailHint,
    });
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
      const postLogoutRedirectUri = `${window.location.origin}/?postLogout=1`;
      try {
        const token = await getValidAccessToken();
        await logoutFromAuthService(token);
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        sessionStorage.removeItem("creatoros.auth.autoLogin.started");
        sessionStorage.removeItem("creatoros.auth.autoRegister.started");

        setUser(null);
        setProfile(null);
        setTokens(null);

        clearTokens();
        clearUser();

        // Clear Keycloak SSO session too. Without this, trying to register a new user
        // while still authenticated can trigger: "already authenticated as different user".
        try {
          window.location.href = getKeycloakLogoutUrl(
            keycloakCfg,
            postLogoutRedirectUri,
          );
        } catch (e) {
          console.error("Failed to redirect to Keycloak logout:", e);
          window.location.href = "/";
        }
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
      if (user?.id) {
        saveUser(newProfile, profileKeyForUserId(user.id));
      }

      // Update user's profile completion status
      if (user) {
        const updatedUser = {
          ...user,
          isProfileComplete: calcCompletion(newProfile) >= 100,
          profileData: newProfile,
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
    // Redirect to Keycloak's built-in forgot-credentials flow.
    // We do not process any callback here; Keycloak handles the email flow.
    const base = `${keycloakCfg.baseUrl}/realms/${encodeURIComponent(keycloakCfg.realm)}/protocol/openid-connect/forgot-credentials`;
    const url = new URL(base, window.location.origin);
    url.searchParams.set("client_id", keycloakCfg.clientId);
    url.searchParams.set("redirect_uri", getRedirectUri());
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid");
    if (email) url.searchParams.set("login_hint", email);
    window.location.href = url.toString();
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
        isAuthenticated: Boolean(user),
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
