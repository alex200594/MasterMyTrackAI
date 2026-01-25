import { Response } from 'express';
import { z } from 'zod';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import mime from 'mime-types';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { masteringQueue } from '../queues/masteringQueue.js';

const createSchema = z.object({
  uploadId: z.string(),
  style: z.string()
});

export async function createMaster(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }
  const { uploadId, style } = parsed.data;
  const upload = await prisma.upload.findUnique({ where: { id: uploadId } });
  if (!upload || upload.userId !== req.user.id) {
    return res.status(404).json({ message: 'Upload not found' });
  }
  const styleRecord = await prisma.style.findUnique({ where: { name: style } });
  if (!styleRecord) {
    return res.status(400).json({ message: 'Style not found' });
  }
  if (styleRecord.isPremium) {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user?.isPremium) {
      return res.status(402).json({ message: 'Premium subscription required' });
    }
  }

  const master = await prisma.master.create({
    data: {
      userId: req.user.id,
      uploadId,
      style,
      status: 'queued'
    }
  });

  await masteringQueue.add('master-track', { masterId: master.id });

  return res.json({ id: master.id, status: master.status });
}

export async function getMaster(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const master = await prisma.master.findUnique({
    where: { id: req.params.id },
    include: { upload: true }
  });
  if (!master || master.userId !== req.user.id) {
    return res.status(404).json({ message: 'Master not found' });
  }
  return res.json({
    id: master.id,
    status: master.status,
    progress: master.progress,
    style: master.style,
    errorMessage: master.errorMessage,
    metadata: {
      filename: master.upload.filename,
      duration: master.upload.duration,
      format: master.upload.format,
      bitrate: master.upload.bitrate
    },
    urls: {
      original: `/api/masters/${master.id}/stream/original`,
      master: master.masterPath ? `/api/masters/${master.id}/stream/master` : null,
      download: master.masterPath ? `/api/masters/${master.id}/download` : null
    }
  });
}

export async function listMasters(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 10);
  const [masters, total] = await Promise.all([
    prisma.master.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { upload: true }
    }),
    prisma.master.count({ where: { userId: req.user.id } })
  ]);

  return res.json({
    data: masters.map((master) => ({
      id: master.id,
      status: master.status,
      style: master.style,
      createdAt: master.createdAt,
      duration: master.upload.duration,
      filename: master.upload.filename,
      urls: {
        original: `/api/masters/${master.id}/stream/original`,
        master: master.masterPath ? `/api/masters/${master.id}/stream/master` : null,
        download: master.masterPath ? `/api/masters/${master.id}/download` : null
      }
    })),
    pagination: { page, pageSize, total }
  });
}

export async function deleteMaster(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const master = await prisma.master.findUnique({
    where: { id: req.params.id },
    include: { upload: true }
  });
  if (!master || master.userId !== req.user.id) {
    return res.status(404).json({ message: 'Master not found' });
  }
  if (master.masterPath) {
    await fs.unlink(master.masterPath).catch(() => null);
  }
  if (master.masterMp3Path) {
    await fs.unlink(master.masterMp3Path).catch(() => null);
  }
  await prisma.master.delete({ where: { id: master.id } });
  return res.json({ success: true });
}

async function streamFile(filePath: string, mimeType: string, req: AuthRequest, res: Response) {
  const stat = await fs.stat(filePath);
  const range = req.headers.range;
  res.setHeader('Accept-Ranges', 'bytes');
  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = Number(startStr);
    const end = endStr ? Number(endStr) : stat.size - 1;
    const chunkSize = end - start + 1;
    res.status(206);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`);
    res.setHeader('Content-Length', chunkSize);
    res.setHeader('Content-Type', mimeType);
    const stream = createReadStream(filePath, { start, end });
    return stream.pipe(res);
  }
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Type', mimeType);
  const stream = createReadStream(filePath);
  return stream.pipe(res);
}

export async function streamOriginal(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const master = await prisma.master.findUnique({
    where: { id: req.params.id },
    include: { upload: true }
  });
  if (!master || master.userId !== req.user.id) {
    return res.status(404).json({ message: 'Master not found' });
  }
  return streamFile(master.upload.originalPath, master.upload.mimeType, req, res);
}

export async function streamMaster(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const master = await prisma.master.findUnique({ where: { id: req.params.id }, include: { upload: true } });
  if (!master || master.userId !== req.user.id) {
    return res.status(404).json({ message: 'Master not found' });
  }
  if (!master.masterPath) {
    return res.status(404).json({ message: 'Master not ready' });
  }
  const mimeType = mime.lookup(master.masterPath) || 'audio/wav';
  return streamFile(master.masterPath, mimeType, req, res);
}

export async function downloadMaster(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const master = await prisma.master.findUnique({ where: { id: req.params.id }, include: { upload: true } });
  if (!master || master.userId !== req.user.id) {
    return res.status(404).json({ message: 'Master not found' });
  }
  if (!master.masterPath) {
    return res.status(404).json({ message: 'Master not ready' });
  }
  const extension = path.extname(master.masterPath) || '.wav';
  const safeName = master.upload.filename.replace(/\.[^/.]+$/, '');
  const filename = `${safeName}-MASTER-${master.style.replace(/\s+/g, '-')}${extension}`;
  const mimeType = mime.lookup(master.masterPath) || 'audio/wav';
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', mimeType);
  return streamFile(master.masterPath, mimeType, req, res);
}
