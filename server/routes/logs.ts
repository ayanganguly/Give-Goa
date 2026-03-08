import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../db/store.js';

const router = Router();
router.use(requireAuth);

router.get('/', (_req, res) => {
  const logs = db.getLogs();
  res.json({ logs });
});

router.post('/', (req, res) => {
  const user = (req as any).user;
  const { action, targetId, details } = req.body;
  if (!action || !targetId || !details) {
    res.status(400).json({ error: 'action, targetId, details required' });
    return;
  }
  const entry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    action,
    targetId,
    details,
  };
  db.appendLog(entry);
  res.status(201).json(entry);
});

export default router;
