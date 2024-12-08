import express from 'express';
import proxy from 'express-http-proxy';
import { config } from './config/config';


const router = express.Router();

router.use('/user', proxy(config.services.user));
router.use('/analytics', proxy(config.services.analytics));
router.use('/publication', proxy(config.services.publication));

export default router;
