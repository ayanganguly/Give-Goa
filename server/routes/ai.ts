import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../db/store.js';
import * as gemini from '../services/gemini.js';

const router = Router();
router.use(requireAuth);

router.post('/classify', async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    res.status(400).json({ error: 'title and description required' });
    return;
  }
  try {
    const result = await gemini.classifyRequest(title, description);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI classification failed' });
  }
});

router.post('/score', async (req, res) => {
  const { request } = req.body;
  if (!request) {
    res.status(400).json({ error: 'request required' });
    return;
  }
  const weights = db.getWeights();
  try {
    const result = await gemini.calculatePriorityScore(request, weights);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI scoring failed' });
  }
});

router.post('/allocate', async (req, res) => {
  const { requests, resources } = req.body;
  if (!requests || !resources) {
    res.status(400).json({ error: 'requests and resources required' });
    return;
  }
  try {
    const result = await gemini.suggestAllocations(requests, resources);
    res.json(result || { allocations: [], totalImpact: 0, remainingBudget: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI allocation failed' });
  }
});

export default router;
