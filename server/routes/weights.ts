import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { db } from '../db/store.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const weights = db.getWeights();
  res.json(weights);
});

// Update weights - ADMIN only
router.put('/', requireRole('ADMIN'), (req, res) => {
  const weights = req.body;
  db.saveWeights(weights);
  res.json(weights);
});

export default router;
