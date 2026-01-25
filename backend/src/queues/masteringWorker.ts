import { Worker } from 'bullmq';
import path from 'path';
import fs from 'fs/promises';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { masterTrack } from '../services/mastering/masterTrack.js';
import { StyleName } from '../services/mastering/styles.js';

export function startMasteringWorker() {
  const worker = new Worker(
    'mastering',
    async (job) => {
      const { masterId } = job.data as { masterId: string };
      const master = await prisma.master.findUnique({
        where: { id: masterId },
        include: { upload: true }
      });
      if (!master) {
        throw new Error('Master record not found');
      }

      await prisma.master.update({
        where: { id: masterId },
        data: { status: 'processing', progress: 10 }
      });

      const uploadsBase = path.resolve(env.uploadsDir);
      const mastersDir = path.join(uploadsBase, 'masters');
      await fs.mkdir(mastersDir, { recursive: true });

      const outputWav = path.join(mastersDir, `${master.id}.wav`);
      const outputMp3 = path.join(mastersDir, `${master.id}.mp3`);

      const result = await masterTrack(
        master.style as StyleName,
        master.upload.originalPath,
        outputWav,
        outputMp3
      );

      await prisma.master.update({
        where: { id: masterId },
        data: {
          status: 'done',
          progress: 100,
          masterPath: outputWav,
          masterMp3Path: outputMp3,
          loudnessLufs: result.loudness ?? undefined
        }
      });

      return result;
    },
    { connection: { url: env.redisUrl } }
  );

  worker.on('failed', async (job, err) => {
    if (!job) return;
    await prisma.master.update({
      where: { id: job.data.masterId },
      data: { status: 'failed', errorMessage: err.message }
    });
  });

  return worker;
}
