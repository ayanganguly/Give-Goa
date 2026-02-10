
export enum UserRole {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  VOLUNTEER = 'VOLUNTEER',
  COMMUNITY_REQUESTER = 'COMMUNITY_REQUESTER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export enum RequestStatus {
  SUBMITTED = 'SUBMITTED',
  CLASSIFIED = 'CLASSIFIED',
  PRIORITIZED = 'PRIORITIZED',
  APPROVED = 'APPROVED',
  FUNDED = 'FUNDED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export enum RequestCategory {
  EDUCATION = 'EDUCATION',
  HEALTHCARE = 'HEALTHCARE',
  WATER_SANITATION = 'WATER_SANITATION',
  MATERNAL_CHILD_HEALTH = 'MATERNAL_CHILD_HEALTH',
  ENVIRONMENT = 'ENVIRONMENT',
  COMMUNITY_DEVELOPMENT = 'COMMUNITY_DEVELOPMENT',
  DISASTER_RELIEF = 'DISASTER_RELIEF',
  UNCATEGORIZED = 'UNCATEGORIZED'
}

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
