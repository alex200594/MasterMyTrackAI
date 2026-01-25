import { Router } from 'express';
import { createCheckoutSession, webhook, billingStatus } from '../controllers/billingController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/create-checkout-session', authenticate, createCheckoutSession);
router.get('/status', authenticate, billingStatus);

export { router as billingRoutes, webhook };
