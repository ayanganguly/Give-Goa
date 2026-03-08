import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../db/store.js';

const router = Router();
router.use(requireAuth);

router.get('/', (_req, res) => {
  const requests = db.getRequests();
  res.json({ requests });
});

router.get('/:id', (req, res) => {
  const requests = db.getRequests();
  const req_ = requests.find((r) => r.id === req.params.id);
  if (!req_) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }
  res.json(req_);
});

router.post('/', (req, res) => {
  const body = req.body;
  const user = (req as any).user;
  const newReq = {
    id: Date.now().toString(),
    trackingId: `RG-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
    title: body.title,
    description: body.description,
    category: body.category || 'UNCATEGORIZED',
    urgency: body.urgency || 'MEDIUM',
    beneficiaries: body.beneficiaries || 0,
    location: body.location || '',
    status: body.status || 'CLASSIFIED',
    createdAt: new Date().toISOString(),
    submittedBy: user.name,
    priorityScore: body.priorityScore ?? 0,
    aiClassificationConfidence: body.aiClassificationConfidence ?? 0,
    aiReasoning: body.aiReasoning,
    requiredBudget: body.requiredBudget ?? 0,
    allocatedBudget: body.allocatedBudget,
    assignedVolunteers: body.assignedVolunteers ?? [],
  };
  const requests = db.getRequests();
  db.saveRequests([newReq, ...requests]);
  res.status(201).json(newReq);
});

router.patch('/:id', (req, res) => {
  const requests = db.getRequests();
  const idx = requests.findIndex((r) => r.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }
  const updated = { ...requests[idx], ...req.body, id: requests[idx].id };
  requests[idx] = updated;
  db.saveRequests(requests);
  res.json(updated);
});

router.put('/batch', (req, res) => {
  const { requests } = req.body;
  if (!Array.isArray(requests)) {
    res.status(400).json({ error: 'requests array required' });
    return;
  }
  db.saveRequests(requests);
  res.json({ ok: true });
});

export default router;
