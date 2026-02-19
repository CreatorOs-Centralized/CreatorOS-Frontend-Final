import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi, type UserDto, type LoginCredentials, type RegisterData } from '@/lib/api';

interface AuthContextType {
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        try {
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const credentials: LoginCredentials = { email, password };
      const response = await authApi.login(credentials);
      
      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Fetch user data
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      
      return { success: true };
    } catch (error: any) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const registerData: RegisterData = { email, password };
      const response = await authApi.register(registerData);
      
      // Option 1: Auto-login after registration
      // You can automatically log them in
      // return await login(email, password);
      
      // Option 2: Return success and let them navigate to verify email
      return { success: true };
    } catch (error: any) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear tokens and user state regardless of API success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      await authApi.verifyEmail(token);
      
      // Refresh user data to get updated email verification status
      if (localStorage.getItem('accessToken')) {
        const userData = await authApi.getCurrentUser();
        setUser(userData);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Email verification failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Verification failed. Please try again.' 
      };
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};