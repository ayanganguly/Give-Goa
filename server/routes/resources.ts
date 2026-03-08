import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { db } from '../db/store.js';

const router = Router();
router.use(requireAuth);

router.get('/', (_req, res) => {
  const resources = db.getResources();
  res.json({ resources });
});

// Add single resource - ADMIN, PM
router.post('/', requireRole('ADMIN', 'PROJECT_MANAGER'), (req, res) => {
  const body = req.body;
  if (!body.name || !body.type || body.quantity == null) {
    res.status(400).json({ error: 'name, type, quantity required' });
    return;
  }
  const newRes = {
    id: `res${Date.now()}`,
    name: body.name,
    type: body.type,
    quantity: body.quantity,
    unit: body.unit || (body.type === 'BUDGET' ? 'INR' : 'Units'),
    available: body.available ?? body.quantity,
  };
  const resources = db.getResources();
  db.saveResources([...resources, newRes]);
  res.status(201).json(newRes);
});

// Restock - ADMIN, PM
router.patch('/:id/restock', requireRole('ADMIN', 'PROJECT_MANAGER'), (req, res) => {
  const user = (req as any).user;
  const { amount, details } = req.body;
  const amt = parseInt(String(amount), 10);
  if (isNaN(amt) || amt <= 0) {
    res.status(400).json({ error: 'Valid positive amount required' });
    return;
  }
  const resources = db.getResources();
  const idx = resources.findIndex((r) => r.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }
  const res_ = resources[idx];
  res_.available += amt;
  res_.quantity = Math.max(res_.quantity, res_.available);
  resources[idx] = res_;
  db.saveResources(resources);

  db.appendResourceUsage({
    id: Date.now().toString(),
    resourceId: res_.id,
    action: 'RESTOCK',
    amount: amt,
    userId: user.id,
    userName: user.name,
    timestamp: new Date().toISOString(),
    details: details || `Restocked ${amt} ${res_.unit}`,
  });

  res.json(res_);
});

// Usage history for a resource
router.get('/:id/usage', (req, res) => {
  const logs = db.getResourceUsage();
  const filtered = logs.filter((l) => l.resourceId === req.params.id);
  res.json({ logs: filtered });
});

// Batch update - ADMIN, PM
router.put('/', requireRole('ADMIN', 'PROJECT_MANAGER'), (req, res) => {
  const { resources } = req.body;
  if (!Array.isArray(resources)) {
    res.status(400).json({ error: 'resources array required' });
    return;
  }
  db.saveResources(resources);
  res.json({ ok: true });
});

export default router;
