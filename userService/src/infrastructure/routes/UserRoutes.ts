import express from 'express';
import { createUser, getUser, getUserByUUID, updateUser, deleteUser, listUsers } from '../controller/UserController';
import { authenticateToken } from '../Middleware/AuthMiddleware';

const router = express.Router();

router.post('/', createUser); //para crear el usuario


router.get('/:id',authenticateToken, getUser);
router.get('/uuid/:uuid',authenticateToken, getUserByUUID); // Nueva ruta
router.put('/:id', updateUser);
router.delete('/:id',authenticateToken, deleteUser);
router.get('/',authenticateToken, listUsers);

export default router;
