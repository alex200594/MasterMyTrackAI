import { Queue } from 'bullmq';
import { env } from '../config/env.js';

export const masteringQueue = new Queue('mastering', {
  connection: { url: env.redisUrl }
});
