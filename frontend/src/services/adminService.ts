import { ApiResponse } from '../types';
import api from './api';

export interface User {
  _id: string;
  username: string;
  email: string;
  phone: string;
  role: 'admin' | 'premium' | 'basic';
  permissions: PagePermission[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PagePermission {
  page: string;
  access: boolean;
  functions: string[];
  _id?: string;
}

export interface UserSession {
  _id: string;
  userId: string;
  deviceId: string;
  userAgent: string;
  ipAddress: string;
  loginTime: string;
  lastActivity: string;
  logoutTime?: string;
  isActive: boolean;
  forcedLogout?: boolean;
}

// Servicio para administración de usuarios
export const adminService = {
  // Obtener todos los usuarios
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error: any) {
      console.error('Error getting users:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener usuarios',
        error: error.message
      };
    }
  },

  // Buscar usuarios
  searchUsers: async (query: string): Promise<ApiResponse<User[]>> => {
    try {
      const response = await api.get(`/admin/users/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error: any) {
      console.error('Error searching users:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al buscar usuarios',
        error: error.message
      };
    }
  },

  // Obtener usuario por ID
  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener el usuario',
        error: error.message
      };
    }
  },

  // Actualizar permisos de usuario
  updateUserPermissions: async (
    id: string, 
    data: { permissions: PagePermission[]; role?: string }
  ): Promise<ApiResponse<User>> => {
    try {
      const response = await api.put(`/admin/users/${id}/permissions`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating user permissions:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar permisos',
        error: error.message
      };
    }
  },

  // Cambiar estado del usuario (activar/desactivar)
  toggleUserStatus: async (id: string, isActive: boolean): Promise<ApiResponse<User>> => {
    try {
      const response = await api.patch(`/admin/users/${id}/status`, { isActive });
      return response.data;
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cambiar estado del usuario',
        error: error.message
      };
    }
  },

  // Obtener sesiones del usuario
  getUserSessions: async (id: string): Promise<ApiResponse<UserSession[]>> => {
    try {
      const response = await api.get(`/admin/users/${id}/sessions`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting user sessions:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener sesiones',
        error: error.message
      };
    }
  },

  // Cerrar sesión en todos los dispositivos
  logoutUserFromAllDevices: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await api.post(`/admin/users/${id}/logout-all`);
      return response.data;
    } catch (error: any) {
      console.error('Error logging out user from all devices:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cerrar sesiones',
        error: error.message
      };
    }
  },

  // Eliminar usuario
  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar usuario',
        error: error.message
      };
    }
  }
};

// Definición de páginas disponibles para permisos
export const AVAILABLE_PAGES = [
  { id: 'dashboard', name: 'Dashboard', description: 'Página principal' },
  { id: 'temario', name: 'Temario', description: 'Contenido de estudio' },
  { id: 'balotario', name: 'Balotario', description: 'Práctica por temas' },
  { id: 'examen-temas', name: 'Exámenes por Temas', description: 'Exámenes específicos por tema' },
  { id: 'siecopol', name: 'SIECOPOL', description: 'Exámenes tipo SIECOPOL' },
  { id: 'audio', name: 'Versión Audio', description: 'Contenido en formato audio' },
  { id: 'resultados', name: 'Resultados', description: 'Historial de resultados' }
];

export const AVAILABLE_FUNCTIONS = [
  { id: 'view', name: 'Ver', description: 'Permiso para ver la página' },
  { id: 'take_exam', name: 'Realizar Examen', description: 'Permiso para realizar exámenes' },
  { id: 'view_results', name: 'Ver Resultados', description: 'Permiso para ver resultados' },
  { id: 'download', name: 'Descargar', description: 'Permiso para descargar contenido' }
];

export const ROLE_OPTIONS = [
  { value: 'basic', label: 'Básico', description: 'Acceso limitado a funciones básicas' },
  { value: 'premium', label: 'Premium', description: 'Acceso completo a todas las funciones' },
  { value: 'admin', label: 'Administrador', description: 'Acceso total + panel de administración' }
];