// infrastructure/routes/AuthRoutes.ts
import express from 'express';
import { login, logout } from '../controller/AuthController';
import { authenticateToken } from '../Middleware/AuthMiddleware';

const router = express.Router();

// Rutas de autenticación
router.post('/login', login);
router.post('/logout', authenticateToken , logout);

export default router;