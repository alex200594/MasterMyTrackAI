import { Router } from 'express';
import { login, me, refresh, register } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.get('/me', me);

export default router;
