import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { env } from '../config/env.js';
import { authenticate } from '../middleware/auth.js';
import { createUpload, streamUpload } from '../controllers/uploadController.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dest = path.join(env.uploadsDir, 'originals');
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname}`;
    cb(null, unique);
  }
});

const upload = multer({ storage });

router.post('/', authenticate, upload.single('file'), createUpload);
router.get('/:id/stream', authenticate, streamUpload);

export default router;
