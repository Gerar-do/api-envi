import express from 'express';
import proxy from 'express-http-proxy';
import { config } from './config/config';
import { authMiddleware } from './middleware/authMiddleware';

const router = express.Router();

router.use('/auth', proxy(config.authServiceUrl));
router.use('/user', authMiddleware, proxy(config.userServiceUrl));
router.use('/institution', authMiddleware, proxy(config.institutionServiceUrl));
router.use('/analytics', authMiddleware, proxy(config.analyticsServiceUrl));
router.use('/publication', authMiddleware, proxy(config.publicationServiceUrl));

export default router;
