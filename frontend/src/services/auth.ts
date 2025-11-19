import type { LoginForm, RegisterForm, UserProfile } from '../types';
import { authService } from './api';

export const getCurrentUser = (): UserProfile | null => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('loginTime');
  console.log('✅ Sesión eliminada de localStorage');
  window.location.href = '/login';
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

export const checkSessionExpiry = (): boolean => {
  const loginTime = localStorage.getItem('loginTime');
  if (!loginTime) return true;
  
  const now = new Date().getTime();
  const loginTimestamp = parseInt(loginTime);
  const sessionDuration = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos
  
  return (now - loginTimestamp) > sessionDuration;
};

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

    // Guardar en localStorage para persistencia
    localStorage.setItem('token', response.data.token || '');
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('loginTime', new Date().getTime().toString());
    console.log('✅ Sesión guardada en localStorage');
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

    // Guardar en localStorage para persistencia
    localStorage.setItem('token', response.data.token || '');
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('loginTime', new Date().getTime().toString());
    console.log('✅ Sesión guardada en localStorage');
  },

  getCurrentUser,
  logout,
  isAuthenticated,
  checkSessionExpiry
};