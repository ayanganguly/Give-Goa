
import { SocialRequest, ResourceItem, AuditLogEntry, RequestCategory, RequestStatus } from '../types';

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
    category: RequestCategory.EDUCATION,
    urgency: 'HIGH',
    beneficiaries: 120,
    location: 'Valpoi, Sattari',
    status: RequestStatus.IN_PROGRESS,
    createdAt: new Date().toISOString(),
    submittedBy: 'Village Council Valpoi',
    priorityScore: 85,
    aiClassificationConfidence: 0.98,
    requiredBudget: 150000,
    allocatedBudget: 150000,
    assignedVolunteers: ['v1', 'v2']
  }
];

export const getStore = () => {
  const requests = JSON.parse(localStorage.getItem('givegoa_requests') || JSON.stringify(INITIAL_REQUESTS));
  const resources = JSON.parse(localStorage.getItem('givegoa_resources') || JSON.stringify(INITIAL_RESOURCES));
  const logs = JSON.parse(localStorage.getItem('givegoa_logs') || '[]');
  const weights = JSON.parse(localStorage.getItem('givegoa_weights') || JSON.stringify({
    urgency: 30,
    beneficiaries: 25,
    risk: 15,
    feasibility: 15,
    alignment: 15
  }));

  return { requests, resources, logs, weights };
};

export const saveRequests = (requests: SocialRequest[]) => {
  localStorage.setItem('givegoa_requests', JSON.stringify(requests));
};

export const saveResources = (resources: ResourceItem[]) => {
  localStorage.setItem('givegoa_resources', JSON.stringify(resources));
};

export const logAction = (user: any, action: string, targetId: string, details: string) => {
  const logs = JSON.parse(localStorage.getItem('givegoa_logs') || '[]');
  const newLog: AuditLogEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    action,
    targetId,
    details
  };
  localStorage.setItem('givegoa_logs', JSON.stringify([newLog, ...logs]));
};
