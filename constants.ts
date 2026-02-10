
import { UserRole, RequestStatus, RequestCategory } from './types';

export const APP_NAME = "GiveGoa ERP";
export const CLUB_NAME = "Rotary Club of Panjim";

export const MOCK_USERS = [
  { id: 'u1', name: 'Admin User', email: 'admin@rotarypanjim.org', role: UserRole.ADMIN, password: 'password' },
  { id: 'u2', name: 'PM John', email: 'pm@rotarypanjim.org', role: UserRole.PROJECT_MANAGER, password: 'password' },
  { id: 'u3', name: 'Volunteer Jane', email: 'jane@volunteer.org', role: UserRole.VOLUNTEER, password: 'password' },
  { id: 'u4', name: 'Community Member', email: 'member@goa.com', role: UserRole.COMMUNITY_REQUESTER, password: 'password' },
];

export const STATUS_ORDER = [
  RequestStatus.SUBMITTED,
  RequestStatus.CLASSIFIED,
  RequestStatus.PRIORITIZED,
  RequestStatus.APPROVED,
  RequestStatus.FUNDED,
  RequestStatus.IN_PROGRESS,
  RequestStatus.COMPLETED
];

export const CATEGORY_COLORS: Record<RequestCategory, string> = {
  [RequestCategory.EDUCATION]: 'bg-blue-100 text-blue-800',
  [RequestCategory.HEALTHCARE]: 'bg-red-100 text-red-800',
  [RequestCategory.WATER_SANITATION]: 'bg-cyan-100 text-cyan-800',
  [RequestCategory.MATERNAL_CHILD_HEALTH]: 'bg-pink-100 text-pink-800',
  [RequestCategory.ENVIRONMENT]: 'bg-green-100 text-green-800',
  [RequestCategory.COMMUNITY_DEVELOPMENT]: 'bg-amber-100 text-amber-800',
  [RequestCategory.DISASTER_RELIEF]: 'bg-orange-100 text-orange-800',
  [RequestCategory.UNCATEGORIZED]: 'bg-slate-100 text-slate-800',
};
