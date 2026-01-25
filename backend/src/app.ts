import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs/promises';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import masterRoutes from './routes/masterRoutes.js';
import { billingRoutes, webhook } from './routes/billingRoutes.js';
import styleRoutes from './routes/styleRoutes.js';
import { errorHandler } from './middleware/error.js';
import { apiLimiter } from './middleware/rateLimit.js';

export const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(
  cors({
    origin: env.frontendOrigins,
    credentials: true
  })
);

app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), webhook);

app.use(express.json({ limit: '2mb' }));
app.use(apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/masters', masterRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/styles', styleRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

export async function ensureUploadDirs() {
  await fs.mkdir(path.join(env.uploadsDir, 'originals'), { recursive: true });
  await fs.mkdir(path.join(env.uploadsDir, 'masters'), { recursive: true });
}
