import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import UserSession from '../models/UserSession';

// Define la interfaz AuthRequest
export interface AuthRequest extends Request {
  user?: any;
  deviceId?: string;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ success: false, message: 'No token, authorization denied' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Token is not valid' });
      return;
    }

    // Verificar sesión activa en el dispositivo
    const activeSession = await UserSession.findOne({
      userId: user._id,
      token: token,
      isActive: true
    });

    if (!activeSession) {
      res.status(401).json({ success: false, message: 'Session expired or invalid' });
      return;
    }

    // Actualizar última actividad
    activeSession.lastActivity = new Date();
    await activeSession.save();

    req.user = user;
    req.deviceId = activeSession.deviceId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

export const adminAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  await auth(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
      return;
    }
    next();
  });
};