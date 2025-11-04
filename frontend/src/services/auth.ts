import type { LoginForm, RegisterForm, UserProfile } from '../types'; // Quitar AuthResponse
import { authService } from './api';

export const auth = {
  // Login
  login: async (credentials: LoginForm): Promise<void> => {
    const response = await authService.login({
      email: credentials.mail,
      password: credentials.password
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al iniciar sesión');
    }

    localStorage.setItem('token', response.data.token || '');
    localStorage.setItem('user', JSON.stringify(response.data.user));
  },

  // Registro
  register: async (userData: RegisterForm): Promise<void> => {
    if (userData.password !== userData.confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    const response = await authService.register({
      username: `${userData.grade} ${userData.username}`,
      email: userData.mail,
      password: userData.password,
      phone: userData.phone
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al registrar usuario');
    }

    localStorage.setItem('token', response.data.token || '');
    localStorage.setItem('user', JSON.stringify(response.data.user));
  },

  // Obtener usuario actual
  getCurrentUser: (): UserProfile | null => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  // Cerrar sesión
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Verificar autenticación
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
};