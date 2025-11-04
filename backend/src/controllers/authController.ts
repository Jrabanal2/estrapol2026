import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { IUser } from '../types';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

// Versión actualizada con validaciones mejoradas
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Errores de validación en registro:', errors.array());
      res.status(400).json({ 
        success: false, 
        message: 'Errores de validación',
        errors: errors.array() 
      });
      return;
    }

    const { username, email, password, phone }: RegisterData = req.body;

    console.log('📥 Datos recibidos en registro:', { username, email, password, phone });

    // Convertir username a mayúsculas
    const formattedUsername = username.toUpperCase().trim();
    
    // Validar que el teléfono no esté vacío
    if (!phone || phone.trim() === '') {
      res.status(400).json({ 
        success: false, 
        message: 'El número de teléfono es requerido' 
      });
      return;
    }

    const formattedPhone = phone.trim();

    // Verificar si el usuario ya existe por email, username o teléfono
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: formattedUsername },
        { phone: formattedPhone }
      ]
    });

    if (existingUser) {
      let message = 'Ya existe un usuario con ';
      
      if (existingUser.email === email.toLowerCase()) {
        message += 'este email';
      } else if (existingUser.username === formattedUsername) {
        message += 'este nombre de usuario';
      } else if (existingUser.phone === formattedPhone) {
        message += 'este número de teléfono';
      }
      
      console.log('❌ Usuario ya existe:', { email, username: formattedUsername, phone: formattedPhone });
      res.status(400).json({ 
        success: false, 
        message 
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario con datos formateados
    const user = new User({
      username: formattedUsername, // Guardar en mayúsculas
      email: email.toLowerCase(),   // Guardar en minúsculas
      password: hashedPassword,
      phone: formattedPhone,       // Teléfono limpio
      role: 'basic',
      permissions: [
        { page: 'dashboard', access: true, functions: ['view'] },
        { page: 'exam-basic', access: true, functions: ['view', 'take_exam', 'view_results'] }
      ]
    });

    await user.save();
    console.log('✅ Usuario registrado exitosamente:', user._id);

    // Generar token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          permissions: user.permissions
        },
        token
      }
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// El resto del código de login, logout y getProfile se mantiene igual...
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Errores de validación en login:', errors.array());
      res.status(400).json({ 
        success: false, 
        message: 'Errores de validación',
        errors: errors.array() 
      });
      return;
    }

    const { email, password } = req.body;

    console.log('📥 Datos recibidos en login:', { email });

    // Buscar usuario por email (en minúsculas)
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      isActive: true 
    });
    
    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      res.status(400).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
      return;
    }

    // Verificar password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Contraseña incorrecta para usuario:', email);
      res.status(400).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
      return;
    }

    // Generar token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    console.log('✅ Login exitoso para usuario:', user._id);

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          permissions: user.permissions
        },
        token
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('✅ Logout exitoso');
    res.json({ 
      success: true, 
      message: 'Cierre de sesión exitoso' 
    });
  } catch (error) {
    console.error('❌ Error en logout:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    const user = await User.findById(authReq.user._id).select('-password');
    
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
      return;
    }

    console.log('✅ Perfil obtenido para usuario:', user._id);
    
    res.json({ 
      success: true, 
      data: { 
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          permissions: user.permissions
        }
      } 
    });
  } catch (error) {
    console.error('❌ Error obteniendo perfil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};