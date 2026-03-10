import axios from "axios";

import { apiClient } from "@/lib/utils/axios";
import {
  authErrorResponseSchema,
  authTokensResponseSchema,
  currentUserSchema,
  loginCredentialsSchema,
  passwordResetConfirmSchema,
  passwordResetRequestResponseSchema,
  passwordResetRequestSchema,
  googleOAuthRequestSchema,
  refreshTokenRequestSchema,
  registerDataSchema,
  registerResponseSchema,
  verifyEmailRequestSchema,
  type LoginCredentials,
  type GoogleOAuthRequest,
  type RegisterData,
  type RegisterResponse,
  type TokenResponse,
  type UserDto,
} from "@/lib/validations/auth";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const parsed = authErrorResponseSchema.safeParse(error.response?.data);
    if (parsed.success && parsed.data.message.trim()) {
      return parsed.data.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const payload = loginCredentialsSchema.parse(credentials);
    const response = await apiClient.post("/auth/login", payload);
    return authTokensResponseSchema.parse(response.data);
  },

  googleOauth: async (data: GoogleOAuthRequest): Promise<TokenResponse> => {
    const payload = googleOAuthRequestSchema.parse(data);
    const response = await apiClient.post("/auth/oauth/google", payload);
    return authTokensResponseSchema.parse(response.data);
  },

  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const payload = registerDataSchema.parse(data);
    const response = await apiClient.post("/auth/register", payload);
    return registerResponseSchema.parse(response.data);
  },

  refresh: async (refreshToken: string): Promise<TokenResponse> => {
    const payload = refreshTokenRequestSchema.parse({ refreshToken });
    const response = await apiClient.post("/auth/refresh", payload);
    return authTokensResponseSchema.parse(response.data);
  },

  logout: async (refreshToken: string): Promise<void> => {
    const payload = refreshTokenRequestSchema.parse({ refreshToken });
    await apiClient.post("/auth/logout", payload);
  },

  verifyEmail: async (token: string): Promise<void> => {
    const payload = verifyEmailRequestSchema.parse({ token });
    await apiClient.post("/auth/verify-email", payload);
  },

  requestPasswordReset: async (
    email: string,
  ): Promise<{ resetToken: string | null }> => {
    const payload = passwordResetRequestSchema.parse({ email });
    const response = await apiClient.post(
      "/auth/password-reset/request",
      payload,
    );
    const parsed = passwordResetRequestResponseSchema.parse(response.data);
    return { resetToken: parsed.resetToken ?? null };
  },

  confirmPasswordReset: async (
    token: string,
    newPassword: string,
  ): Promise<void> => {
    const payload = passwordResetConfirmSchema.parse({ token, newPassword });
    await apiClient.post("/auth/password-reset/confirm", payload);
  },

  getCurrentUser: async (): Promise<UserDto> => {
    const response = await apiClient.get("/auth/me");
    return currentUserSchema.parse(response.data);
  },

  getErrorMessage,
};
