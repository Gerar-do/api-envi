import express from 'express';
import { createUser, getUser, updateUser, deleteUser, listUsers } from '../controller/UserController';

const router = express.Router();

router.post('/', createUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/', listUsers);

export default router;
