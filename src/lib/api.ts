import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_AUTH_SERVICE_BASE_URL ||
  '/__auth/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export interface UserDto {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  roles: string[];
  emailVerified: boolean;

  // Frontend-only augmentation (profile completion is computed client-side from profile-service data)
  isProfileComplete?: boolean;
  profileData?: Record<string, unknown>;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await api.post('/register', data);
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/logout', { refreshToken });
  },

  verifyEmail: async (token: string): Promise<void> => {
    await api.post('/verify-email', { token });
  },

  getCurrentUser: async (): Promise<UserDto> => {
    const response = await api.get('/me');
    return response.data;
  }
};

export default api;
