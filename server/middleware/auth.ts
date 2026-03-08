import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'givegoa-dev-secret-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    const users = db.getUsers();
    const user = users.find((u) => u.id === decoded.userId);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    (req as any).user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
