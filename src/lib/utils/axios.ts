import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { env } from "@/lib/env";
import { tokenStorage } from "@/lib/auth/tokens";
import { authTokensResponseSchema } from "@/lib/validations/auth";

type RetriableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const AUTH_FREE_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/verify-email",
  "/auth/password-reset/request",
  "/auth/password-reset/confirm",
];

const isAuthFreePath = (url?: string) => {
  if (!url) return false;
  return AUTH_FREE_PATHS.some((path) => url.includes(path));
};

export const apiClient = axios.create({
  baseURL: env.VITE_API_GATEWAY_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  const response = await axios.post(
    `${env.VITE_API_GATEWAY_URL}/auth/refresh`,
    { refreshToken },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const parsed = authTokensResponseSchema.parse(response.data);
  tokenStorage.setTokens({
    accessToken: parsed.accessToken,
    refreshToken: parsed.refreshToken,
  });

  return parsed.accessToken;
};

apiClient.interceptors.request.use((config) => {
  if (!isAuthFreePath(config.url)) {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry || isAuthFreePath(originalRequest.url)) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const nextAccessToken = await refreshPromise;

      if (!nextAccessToken) {
        tokenStorage.clear();
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      tokenStorage.clear();
      return Promise.reject(refreshError);
    }
  },
);
