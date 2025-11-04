import axios from 'axios';
import type { User, ApiResponse, AuthResponse } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 Enviando request:', {
      url: config.url,
      method: config.method,
      data: config.data
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta recibida:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ Error en respuesta:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}

export const authService = {
  // Login - ahora retorna AuthResponse
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('❌ Error en login:', apiError);
      return {
        success: false,
        message: apiError.response?.data?.message || 'Error de conexión',
        error: apiError.message
      };
    }
  },

  // Registro - ahora retorna AuthResponse
  register: async (userData: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('❌ Error en registro:', apiError);
      return {
        success: false,
        message: apiError.response?.data?.message || 'Error de conexión',
        error: apiError.message
      };
    }
  },

  // Logout
  logout: async (): Promise<ApiResponse<void>> => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('❌ Error en logout:', apiError);
      return {
        success: false,
        message: apiError.response?.data?.message || 'Error de conexión',
        error: apiError.message
      };
    }
  },

  // Obtener perfil - retorna User directamente
  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('❌ Error obteniendo perfil:', apiError);
      return {
        success: false,
        message: apiError.response?.data?.message || 'Error de conexión',
        error: apiError.message
      };
    }
  },
};

export default api;