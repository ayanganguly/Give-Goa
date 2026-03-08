import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { SocialRequest, ResourceItem, AuditLogEntry, User, PriorityWeights, ResourceUsageLog } from '../types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data');
const FILES = {
  users: join(DATA_DIR, 'users.json'),
  requests: join(DATA_DIR, 'requests.json'),
  resources: join(DATA_DIR, 'resources.json'),
  logs: join(DATA_DIR, 'logs.json'),
  weights: join(DATA_DIR, 'weights.json'),
  resourceUsage: join(DATA_DIR, 'resourceUsage.json'),
};

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function read<T>(file: string, fallback: T): T {
  ensureDataDir();
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(readFileSync(file, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

function write<T>(file: string, data: T) {
  ensureDataDir();
  writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

const INITIAL_RESOURCES: ResourceItem[] = [
  { id: 'res1', name: 'Annual Community Fund', type: 'BUDGET', quantity: 5000000, unit: 'INR', available: 5000000 },
  { id: 'res2', name: 'Medical Kits', type: 'MATERIAL', quantity: 200, unit: 'Kits', available: 150 },
  { id: 'res3', name: 'Solar Lanterns', type: 'MATERIAL', quantity: 500, unit: 'Units', available: 500 },
  { id: 'res4', name: 'Skilled Educators', type: 'VOLUNTEER_SKILL', quantity: 15, unit: 'People', available: 10 },
  { id: 'res5', name: 'Engineers', type: 'VOLUNTEER_SKILL', quantity: 5, unit: 'People', available: 5 },
];

const INITIAL_REQUESTS: SocialRequest[] = [
  {
    id: 'req1',
    trackingId: 'RG-2024-001',
    title: 'Rural School Solar Power',
    description: 'Provide solar lighting for the Govt Primary School in Valpoi to allow evening study sessions.',
    category: 'EDUCATION',
    urgency: 'HIGH',
    beneficiaries: 120,
    location: 'Valpoi, Sattari',
    status: 'IN_PROGRESS',
    createdAt: new Date().toISOString(),
    submittedBy: 'Village Council Valpoi',
    priorityScore: 85,
    aiClassificationConfidence: 0.98,
    requiredBudget: 150000,
    allocatedBudget: 150000,
    assignedVolunteers: ['v1', 'v2'],
  },
];

const INITIAL_WEIGHTS: PriorityWeights = {
  urgency: 30,
  beneficiaries: 25,
  risk: 15,
  feasibility: 15,
  alignment: 15,
};

export const db = {
  getUsers: () => read<User[]>(FILES.users, []),
  saveUsers: (users: User[]) => write(FILES.users, users),

  getRequests: () => read<SocialRequest[]>(FILES.requests, INITIAL_REQUESTS),
  saveRequests: (requests: SocialRequest[]) => write(FILES.requests, requests),

  getResources: () => read<ResourceItem[]>(FILES.resources, INITIAL_RESOURCES),
  saveResources: (resources: ResourceItem[]) => write(FILES.resources, resources),

  getLogs: () => read<AuditLogEntry[]>(FILES.logs, []),
  appendLog: (entry: AuditLogEntry) => {
    const logs = read<AuditLogEntry[]>(FILES.logs, []);
    write(FILES.logs, [entry, ...logs]);
  },

  getWeights: () => read<PriorityWeights>(FILES.weights, INITIAL_WEIGHTS),
  saveWeights: (weights: PriorityWeights) => write(FILES.weights, weights),

  getResourceUsage: () => read<ResourceUsageLog[]>(FILES.resourceUsage, []),
  appendResourceUsage: (entry: ResourceUsageLog) => {
    const logs = read<ResourceUsageLog[]>(FILES.resourceUsage, []);
    write(FILES.resourceUsage, [entry, ...logs]);
  },
};
