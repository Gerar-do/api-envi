import express from 'express';
import { 
  createUser, 
  getUser, 
  getUserByUUID, 
  updateUser, 
  deleteUser, 
  listUsers,
  uploadProfilePicture 
} from '../controller/UserController';
import { validateToken } from '../../Middleware/AuthMiddleware';

const router = express.Router();

// Lista de usuarios (debe ir antes de las rutas con parámetros)
router.get('/', validateToken, listUsers);

// Ruta UUID debe ir antes que la ruta con :id
router.get('/uuid/:uuid', validateToken, getUserByUUID);

// Rutas con parámetro id
router.get('/:id', validateToken, getUser);
router.put('/:id', validateToken, uploadProfilePicture, updateUser);
router.delete('/:id', validateToken, deleteUser);

// Crear usuario (no requiere token)
router.post('/', uploadProfilePicture, createUser);

export default router;