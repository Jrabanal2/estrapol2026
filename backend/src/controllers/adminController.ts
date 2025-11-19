import { Request, Response } from 'express';
import User from '../models/User';
import UserSession from '../models/UserSession';
import { AuthRequest } from '../middleware/auth';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los usuarios'
    });
  }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el usuario'
    });
  }
};

export const updateUserPermissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { permissions, role } = req.body;

    const user = await User.findById(id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    if (permissions) {
      user.permissions = permissions;
    }
    
    if (role) {
      user.role = role;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Permisos actualizados correctamente',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar los permisos'
    });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    user.isActive = isActive;
    await user.save();

    if (!isActive) {
      await UserSession.updateMany(
        { userId: id, isActive: true },
        { isActive: false, logoutTime: new Date() }
      );
    }

    res.json({
      success: true,
      message: `Usuario ${isActive ? 'activado' : 'desactivado'} correctamente`,
      data: {
        id: user._id,
        username: user.username,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar el estado del usuario'
    });
  }
};

export const getUserSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const sessions = await UserSession.find({ userId: id })
      .sort({ loginTime: -1 })
      .populate('userId', 'username email');
    
    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error getting user sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las sesiones del usuario'
    });
  }
};

export const logoutUserFromAllDevices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await UserSession.updateMany(
      { userId: id, isActive: true },
      { 
        isActive: false, 
        logoutTime: new Date(),
        forcedLogout: true 
      }
    );

    res.json({
      success: true,
      message: 'Usuario desconectado de todos los dispositivos'
    });
  } catch (error) {
    console.error('Error logging out user from all devices:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desconectar al usuario'
    });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    await UserSession.deleteMany({ userId: id });
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el usuario'
    });
  }
};

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Query de búsqueda requerido'
      });
      return;
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar usuarios'
    });
  }
};