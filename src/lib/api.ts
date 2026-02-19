import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  // Add other fields if your RegisterRequest requires them
  // fullName?: string;
  // username?: string;
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
  // Add other fields based on your actual RegisterResponse DTO
}

export interface UserDto {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  roles: string[];
  emailVerified: boolean;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        const response = await axios.post(`${API_BASE_URL}/refresh`, {
          refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Update the authorization header and retry
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

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

  refresh: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await api.post('/refresh', { refreshToken });
    return response.data;
  },

  verifyEmail: async (token: string): Promise<void> => {
    await api.post('/verify-email', { token });
  },

  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/password-reset/request', { email });
    return response.data;
  },

  confirmPasswordReset: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/password-reset/confirm', { token, newPassword });
  },

  getCurrentUser: async (): Promise<UserDto> => {
    const response = await api.get('/me');
    return response.data;
  },
};

export default api;