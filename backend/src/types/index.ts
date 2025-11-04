import { Document, ObjectId } from 'mongoose';

export interface IUser extends Document {
  _id: ObjectId;
  username: string;
  email: string;
  password: string;
  phone?: string; // Agregar esta línea
  role: 'admin' | 'premium' | 'basic';
  permissions: PagePermission[];
  isActive: boolean;
  currentSession?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PagePermission {
  page: string;
  access: boolean;
  functions: string[];
}

export interface IUserSession extends Document {
  userId: ObjectId;
  deviceId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  loginTime: Date;
  lastActivity: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
  deviceId?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone?: string;
}