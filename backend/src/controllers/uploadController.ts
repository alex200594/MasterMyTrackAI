import { Response } from 'express';
import { z } from 'zod';
import path from 'path';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { probeFile } from '../utils/ffmpeg.js';

const MAX_SIZE = 100 * 1024 * 1024;

export async function createUpload(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: 'Missing file' });
  }
  if (file.size > MAX_SIZE) {
    await fs.unlink(file.path);
    return res.status(400).json({ message: 'File too large' });
  }

  const allowed = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg', 'audio/aac', 'audio/x-wav'];
  if (!allowed.includes(file.mimetype)) {
    await fs.unlink(file.path);
    return res.status(400).json({ message: 'Unsupported file type' });
  }

  const probe = await probeFile(file.path);
  const duration = Number(probe.format?.duration ?? 0);
  if (duration < 3) {
    await fs.unlink(file.path);
    return res.status(400).json({ message: 'Audio too short' });
  }

  const formatName = String(probe.format?.format_name ?? 'unknown');
  const bitrate = Number(probe.format?.bit_rate ?? 0);

  const upload = await prisma.upload.create({
    data: {
      userId: req.user.id,
      filename: file.originalname,
      originalPath: file.path,
      mimeType: file.mimetype,
      size: file.size,
      duration,
      bitrate,
      format: formatName
    }
  });

  return res.json({
    uploadId: upload.id,
    metadata: {
      filename: upload.filename,
      duration: upload.duration,
      format: upload.format,
      bitrate: upload.bitrate
    },
    streamUrl: `/api/uploads/${upload.id}/stream`
  });
}

export async function streamUpload(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const upload = await prisma.upload.findUnique({ where: { id: req.params.id } });
  if (!upload || upload.userId !== req.user.id) {
    return res.status(404).json({ message: 'Upload not found' });
  }
  res.setHeader('Content-Type', upload.mimeType);
  res.setHeader('Accept-Ranges', 'bytes');
  const stat = await fs.stat(upload.originalPath);
  const range = req.headers.range;
  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = Number(startStr);
    const end = endStr ? Number(endStr) : stat.size - 1;
    const chunkSize = end - start + 1;
    res.status(206);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`);
    res.setHeader('Content-Length', chunkSize);
    const stream = createReadStream(upload.originalPath, { start, end });
    return stream.pipe(res);
  }
  res.setHeader('Content-Length', stat.size);
  const stream = createReadStream(upload.originalPath);
  return stream.pipe(res);
}
