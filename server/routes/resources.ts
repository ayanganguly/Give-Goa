import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../db/store.js';

const router = Router();
router.use(requireAuth);

router.get('/', (_req, res) => {
  const resources = db.getResources();
  res.json({ resources });
});

router.put('/', (req, res) => {
  const { resources } = req.body;
  if (!Array.isArray(resources)) {
    res.status(400).json({ error: 'resources array required' });
    return;
  }
  db.saveResources(resources);
  res.json({ ok: true });
});

export default router;
