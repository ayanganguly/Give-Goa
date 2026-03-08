export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'VOLUNTEER' | 'COMMUNITY_REQUESTER';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export type RequestStatus =
  | 'SUBMITTED' | 'CLASSIFIED' | 'PRIORITIZED' | 'APPROVED'
  | 'FUNDED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export type RequestCategory =
  | 'EDUCATION' | 'HEALTHCARE' | 'WATER_SANITATION' | 'MATERNAL_CHILD_HEALTH'
  | 'ENVIRONMENT' | 'COMMUNITY_DEVELOPMENT' | 'DISASTER_RELIEF' | 'UNCATEGORIZED';

export interface SocialRequest {
  id: string;
  trackingId: string;
  title: string;
  description: string;
  category: RequestCategory;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  beneficiaries: number;
  location: string;
  status: RequestStatus;
  createdAt: string;
  submittedBy: string;
  priorityScore: number;
  aiClassificationConfidence: number;
  aiReasoning?: string;
  requiredBudget: number;
  allocatedBudget?: number;
  assignedVolunteers: string[];
  comments?: RequestComment[];
}

export interface RequestComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface ResourceUsageLog {
  id: string;
  resourceId: string;
  action: 'USE' | 'RESTOCK';
  amount: number;
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
}

export interface ResourceItem {
  id: string;
  name: string;
  type: 'BUDGET' | 'MATERIAL' | 'VOLUNTEER_SKILL';
  quantity: number;
  unit: string;
  available: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  targetId: string;
  details: string;
}

export interface PriorityWeights {
  urgency: number;
  beneficiaries: number;
  risk: number;
  feasibility: number;
  alignment: number;
}
