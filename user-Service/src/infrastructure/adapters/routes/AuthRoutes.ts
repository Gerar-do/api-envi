import express from 'express';
import { login, logout } from '../controller/AuthController';
import { requestPasswordReset, verifyAndResetPassword } from '../controller/PasswordRecoveryController';
import { validateToken } from '../../Middleware/AuthMiddleware';

const router = express.Router();

// Rutas existentes
router.post('/login', login);
router.post('/verify-token', validateToken, (req, res) => {
    res.status(200).json({ valid: true });
});
router.post('/logout', validateToken, logout);

// Nuevas rutas para recuperación de contraseña
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', verifyAndResetPassword);

export default router;