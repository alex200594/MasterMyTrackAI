import { Router } from 'express';
import {
  createMaster,
  getMaster,
  listMasters,
  deleteMaster,
  streamOriginal,
  streamMaster,
  downloadMaster
} from '../controllers/masterController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, createMaster);
router.get('/', authenticate, listMasters);
router.get('/:id', authenticate, getMaster);
router.delete('/:id', authenticate, deleteMaster);
router.get('/:id/stream/original', authenticate, streamOriginal);
router.get('/:id/stream/master', authenticate, streamMaster);
router.get('/:id/download', authenticate, downloadMaster);

export default router;
