import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginForm, RegisterForm, AuthContextType, ApiResponse, AuthResponse } from '../types';
import { authService } from '../services/api';

// Mover la interfaz fuera del componente
interface AuthProviderProps {
  children: ReactNode;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Componente AuthProvider
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay usuario logueado al cargar la app
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Verificar si el token es válido
          const response = await authService.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Token inválido, limpiar localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Error checking auth:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (credentials: LoginForm): Promise<ApiResponse<AuthResponse>> => {
    const response = await authService.login({
      email: credentials.mail,
      password: credentials.password
    });
    
    if (response.success && response.data) {
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  };

  const register = async (userData: RegisterForm): Promise<ApiResponse<AuthResponse>> => {
    const response = await authService.register({
      username: `${userData.grade} ${userData.username}`,
      email: userData.mail,
      password: userData.password,
      phone: userData.phone
    });
    
    if (response.success && response.data) {
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const checkPermission = (page: string, functionName?: string): boolean => {
    if (!user) return false;

    // Admin tiene acceso completo
    if (user.role === 'admin') return true;

    // Buscar permiso para la página
    const pagePermission = user.permissions.find(p => p.page === page);
    
    if (!pagePermission || !pagePermission.access) {
      return false;
    }

    // Si se solicita una función específica, verificar si está permitida
    if (functionName) {
      return pagePermission.functions.includes(functionName);
    }

    return true;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    isLoading,
    checkPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook useAuth
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};