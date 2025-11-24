import { Router } from 'express';
import { initializeUpload, submitProcessingJob } from './video.controller';
import { uploadratelimiter } from '../../common/middlewares/rate-limit';
import { isAuthenticated } from '../../common/middlewares/auth.middleware';

const router = Router();

router.post('/sign-upload', isAuthenticated, uploadratelimiter, initializeUpload);

router.post('/process', isAuthenticated, submitProcessingJob);

export default router;