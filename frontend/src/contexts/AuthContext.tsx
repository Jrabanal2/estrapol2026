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
          // Verificar si el token es válido en el backend
          const response = await authService.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
            console.log('✅ Sesión restaurada automáticamente');
          } else {
            // Token inválido, limpiar localStorage
            console.log('❌ Token inválido, limpiando sesión');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Error checking auth:', error);
          // En caso de error de conexión, mantener la sesión local
          const userData = JSON.parse(savedUser);
          setUser(userData);
          console.log('⚠️ Usando sesión local (sin verificar servidor)');
        }
      }
      setIsLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Verificar token periódicamente (cada 30 minutos)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        const response = await authService.getProfile();
        if (!response.success) {
          // Token inválido, cerrar sesión
          console.log('❌ Token expirado, cerrando sesión');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          window.location.href = '/login';
        } else {
          console.log('✅ Token verificado correctamente');
        }
      } catch (error) {
        console.error('Error verificando token:', error);
      }
    }, 30 * 60 * 1000); // 30 minutos

    return () => clearInterval(interval);
  }, [user]);

  const login = async (credentials: LoginForm): Promise<ApiResponse<AuthResponse>> => {
    const response = await authService.login({
      email: credentials.mail,
      password: credentials.password
    });
    
    if (response.success && response.data) {
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Guardar timestamp de login para expiración personalizada
      localStorage.setItem('loginTime', new Date().getTime().toString());
      console.log('✅ Sesión iniciada y guardada en localStorage');
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
      // Guardar timestamp de login para expiración personalizada
      localStorage.setItem('loginTime', new Date().getTime().toString());
      console.log('✅ Usuario registrado y sesión guardada en localStorage');
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
      localStorage.removeItem('loginTime');
      console.log('✅ Sesión cerrada y datos limpiados de localStorage');
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

  // Función para verificar expiración de sesión (7 días)
  const checkSessionExpiry = (): boolean => {
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) return true;
    
    const now = new Date().getTime();
    const loginTimestamp = parseInt(loginTime);
    const sessionDuration = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos
    
    const isExpired = (now - loginTimestamp) > sessionDuration;
    
    if (isExpired) {
      console.log('❌ Sesión expirada por tiempo');
      logout();
    }
    
    return isExpired;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    isLoading,
    checkPermission,
    checkSessionExpiry,
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