import express from 'express';
import { login, logout } from '../../adapters/controller/AuthController';
import { validateToken } from '../../Middleware/AuthMiddleware';

const router = express.Router();

// Ruta para login (no requiere validación de token)
router.post('/login', login);

// Ruta para verificar token
router.post('/verify-token', validateToken, (req, res) => {
    res.status(200).json({ valid: true });
});

// Ruta para logout (requiere validación de token)
router.post('/logout', validateToken, logout);

export default router;