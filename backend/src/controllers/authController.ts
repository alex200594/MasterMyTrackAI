import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = registerSchema;

function signTokens(user: { id: string; email: string }) {
  const accessToken = jwt.sign({ sub: user.id, email: user.email }, env.jwtAccessSecret, {
    expiresIn: '15m'
  });
  const refreshToken = jwt.sign({ sub: user.id }, env.jwtRefreshSecret, { expiresIn: '30d' });
  return { accessToken, refreshToken };
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ message: 'Email already in use' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash } });
  const { accessToken, refreshToken } = signTokens(user);
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });
  return res.json({ accessToken, refreshToken });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const { accessToken, refreshToken } = signTokens(user);
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });
  return res.json({ accessToken, refreshToken });
}

export async function refresh(req: Request, res: Response) {
  const schema = z.object({ refreshToken: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload' });
  }
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: parsed.data.refreshToken }
  });
  if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
  try {
    const decoded = jwt.verify(parsed.data.refreshToken, env.jwtRefreshSecret) as { sub: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    const { accessToken, refreshToken } = signTokens(user);
    await prisma.refreshToken.update({
      where: { token: parsed.data.refreshToken },
      data: { revoked: true }
    });
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
    return res.json({ accessToken, refreshToken });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
}

export async function me(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Missing token' });
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret) as { sub: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({
      id: user.id,
      email: user.email,
      isPremium: user.isPremium,
      currentPeriodEnd: user.currentPeriodEnd
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
