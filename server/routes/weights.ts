import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../db/store.js';

const router = Router();
router.use(requireAuth);

router.get('/', (_req, res) => {
  const weights = db.getWeights();
  res.json(weights);
});

router.put('/', (req, res) => {
  const weights = req.body;
  db.saveWeights(weights);
  res.json(weights);
});

export default router;
