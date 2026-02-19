import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, CreatorProfile } from "@/types";

interface AuthContextType {
  user: User | null;
  profile: CreatorProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<CreatorProfile>) => void;
  profileCompletion: number;
<<<<<<< HEAD
  sendPasswordReset: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  getAccessToken: () => Promise<string>;
}

interface KeycloakUser {
  id: string;
  email?: string | null;
  username?: string | null;
  roles?: string[];
  isEmailVerified?: boolean;
  isProfileComplete: boolean;
  profileData?: CreatorProfile;
=======
>>>>>>> 574a14ff0b92232c053b706b93856ba50ad7e3c3
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const calcCompletion = (p: CreatorProfile | null): number => {
  if (!p) return 0;
  const fields = ['username', 'display_name', 'bio', 'niche', 'profile_photo_url', 'location', 'language'] as const;
  const filled = fields.filter(f => p[f] && p[f].trim() !== '').length;
  return Math.round((filled / fields.length) * 100);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("creatoros_user");
    const storedProfile = localStorage.getItem("creatoros_profile");
    if (stored) setUser(JSON.parse(stored));
    if (storedProfile) setProfile(JSON.parse(storedProfile));
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    const u: User = { id: "1", email, is_email_verified: true, is_active: true, created_at: new Date().toISOString() };
    setUser(u);
    localStorage.setItem("creatoros_user", JSON.stringify(u));
    const sp = localStorage.getItem("creatoros_profile");
    if (sp) setProfile(JSON.parse(sp));
  };

  const register = async (email: string, _password: string) => {
    const u: User = { id: "1", email, is_email_verified: false, is_active: true, created_at: new Date().toISOString() };
    setUser(u);
    localStorage.setItem("creatoros_user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem("creatoros_user");
    localStorage.removeItem("creatoros_profile");
  };

  const updateProfile = (updates: Partial<CreatorProfile>) => {
    const newProfile = { ...profile, ...updates, user_id: user?.id || "1", id: profile?.id || "1" } as CreatorProfile;
    setProfile(newProfile);
    localStorage.setItem("creatoros_profile", JSON.stringify(newProfile));
  };

  return (
<<<<<<< HEAD
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
        getAccessToken: getValidAccessToken,
      }}
    >
=======
    <AuthContext.Provider value={{ user, profile, isLoading, login, register, logout, updateProfile, profileCompletion: calcCompletion(profile) }}>
>>>>>>> 574a14ff0b92232c053b706b93856ba50ad7e3c3
      {children}
    </AuthContext.Provider>
  );
};
