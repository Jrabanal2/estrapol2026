import express from 'express';
import { body } from 'express-validator';
import { register, login, logout, getProfile } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Validaciones actualizadas con teléfono requerido
const registerValidation = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('El nombre de usuario debe tener al menos 3 caracteres')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Por favor ingresa un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('phone')
    .isLength({ min: 9 })
    .withMessage('El teléfono debe tener al menos 9 caracteres')
    .trim()
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Por favor ingresa un email válido')
    .normalizeEmail(),
  body('password')
    .exists()
    .withMessage('La contraseña es requerida')
];

// Rutas
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', auth, logout);
router.get('/profile', auth, getProfile);

export default router;