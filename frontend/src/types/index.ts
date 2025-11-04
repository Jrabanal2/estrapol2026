// Tipos para respuestas de API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Tipos para usuarios y permisos
export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  role: 'admin' | 'premium' | 'basic';
  permissions: PagePermission[];
  isActive: boolean;
  currentSession?: string;
}

export interface PagePermission {
  page: string;
  access: boolean;
  functions: string[];
}

// Tipo para la respuesta de login/register
export interface AuthResponse {
  user: User;
  token: string;
}

// Tipos para formularios de autenticación
export interface LoginForm {
  mail: string;
  password: string;
}

export interface RegisterForm {
  grade: string;
  username: string;
  phone: string;
  mail: string;
  password: string;
  confirmPassword: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  grade?: string;
  phone?: string;
  role: 'admin' | 'premium' | 'basic';
  permissions: PagePermission[];
}

// Opciones de grados
export const GRADE_OPTIONS = [
  'SB', 'ST1', 'ST2', 'ST3', 'S1', 'S2', 'S3'
] as const;

// Tipo para el contexto de autenticación
export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginForm) => Promise<ApiResponse<AuthResponse>>;
  logout: () => void;
  register: (userData: RegisterForm) => Promise<ApiResponse<AuthResponse>>;
  isLoading: boolean;
  checkPermission: (page: string, functionName?: string) => boolean;
}