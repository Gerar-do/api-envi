import express from 'express';
import proxy from 'express-http-proxy';
import { config } from './config/config';


const router = express.Router();

router.use('/user', proxy(config.userServiceUrl));
router.use('/analytics', proxy(config.analyticsServiceUrl));
router.use('/publication', proxy(config.publicationServiceUrl));

export default router;
