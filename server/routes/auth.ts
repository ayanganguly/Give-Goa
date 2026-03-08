import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/store.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'givegoa-dev-secret-change-in-production';

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }
  const users = db.getUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.get('/me', (req, res) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const users = db.getUsers();
    const user = users.find((u) => u.id === decoded.userId);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
