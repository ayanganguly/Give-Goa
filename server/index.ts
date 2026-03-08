import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env') });
config(); // fallback to server/.env

import express from 'express';
import cors from 'cors';
import { db } from './db/store.js';
import authRoutes from './routes/auth.js';
import requestsRoutes from './routes/requests.js';
import resourcesRoutes from './routes/resources.js';
import logsRoutes from './routes/logs.js';
import weightsRoutes from './routes/weights.js';
import aiRoutes from './routes/ai.js';

const PORT = process.env.PORT || 4000;

// Seed users if empty
const users = db.getUsers();
if (users.length === 0) {
  const seedUsers = [
    { id: 'u1', name: 'Admin User', email: 'admin@rotarypanjim.org', password: 'password', role: 'ADMIN' as const },
    { id: 'u2', name: 'PM John', email: 'pm@rotarypanjim.org', password: 'password', role: 'PROJECT_MANAGER' as const },
    { id: 'u3', name: 'Volunteer Jane', email: 'jane@volunteer.org', password: 'password', role: 'VOLUNTEER' as const },
    { id: 'u4', name: 'Community Member', email: 'member@goa.com', password: 'password', role: 'COMMUNITY_REQUESTER' as const },
  ];
  db.saveUsers(seedUsers);
  console.log('Seeded default users');
}

const app = express();
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/weights', weightsRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`GiveGoa backend running at http://localhost:${PORT}`);
});
