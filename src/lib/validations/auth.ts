import { z } from "zod";

export const loginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerDataSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const verifyEmailRequestSchema = z.object({
  token: z.string().min(1),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

export const googleOAuthRequestSchema = z.object({
  code: z.string().min(1),
  redirectUri: z.string().url(),
  codeVerifier: z.string().min(1).optional(),
});

export const authTokensResponseSchema = z.object({
  accessToken: z.string().min(1),
  accessTokenExpiresInSeconds: z.number().positive(),
  refreshToken: z.string().min(1),
  refreshTokenExpiresInSeconds: z.number().positive(),
});

export const registerResponseSchema = z.object({
  userId: z.string().min(1),
  emailVerified: z.boolean(),
  emailVerificationToken: z.string().nullable(),
});

export const currentUserSchema = z.object({
  id: z.string().min(1),
  username: z.string().nullable(),
  email: z.string().email(),
  roles: z.array(z.string()),
});

export const passwordResetRequestResponseSchema = z.object({
  resetToken: z.string().nullable(),
});

export const authErrorResponseSchema = z.object({
  timestamp: z.string().optional(),
  status: z.number(),
  error: z.string(),
  message: z.string(),
  path: z.string().optional(),
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type RegisterData = z.infer<typeof registerDataSchema>;
export type TokenResponse = z.infer<typeof authTokensResponseSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
export type GoogleOAuthRequest = z.infer<typeof googleOAuthRequestSchema>;
export type UserDto = z.infer<typeof currentUserSchema> & {
  isProfileComplete?: boolean;
  profileData?: Record<string, unknown>;
};
