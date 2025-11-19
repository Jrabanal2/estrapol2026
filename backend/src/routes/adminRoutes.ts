import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserPermissions,
  toggleUserStatus,
  getUserSessions,
  logoutUserFromAllDevices,
  deleteUser,
  searchUsers
} from '../controllers/adminController';
import { adminAuth } from '../middleware/auth';

const router = express.Router();

// Todas las rutas requieren autenticación de admin
router.use(adminAuth);

// Rutas de administración de usuarios
router.get('/users', getAllUsers);
router.get('/users/search', searchUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/permissions', updateUserPermissions);
router.patch('/users/:id/status', toggleUserStatus);
router.get('/users/:id/sessions', getUserSessions);
router.post('/users/:id/logout-all', logoutUserFromAllDevices);
router.delete('/users/:id', deleteUser);

export default router;