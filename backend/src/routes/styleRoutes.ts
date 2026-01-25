import { Router } from 'express';
import { listStyles } from '../controllers/styleController.js';

const router = Router();

router.get('/', listStyles);

export default router;
