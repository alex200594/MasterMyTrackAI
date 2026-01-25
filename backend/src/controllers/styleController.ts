import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export async function listStyles(_req: Request, res: Response) {
  const styles = await prisma.style.findMany({ orderBy: { createdAt: 'asc' } });
  return res.json(styles);
}
