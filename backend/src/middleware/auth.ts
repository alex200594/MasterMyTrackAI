import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }
  const token = header.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret) as { sub: string; email: string };
    req.user = { id: decoded.sub, email: decoded.email };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
