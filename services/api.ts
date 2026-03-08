/**
 * Frontend API client - all data flows from backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getToken(): string | null {
  return localStorage.getItem('givegoa_token');
}

async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (res.status === 401) {
    localStorage.removeItem('givegoa_token');
    localStorage.removeItem('givegoa_session');
    window.location.reload();
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }

  return res.json();
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),
  me: () =>
    fetchApi<{ user: { id: string; name: string; email: string; role: string } }>('/auth/me'),
};

// Requests
export const requestsApi = {
  getAll: () => fetchApi<{ requests: import('../types').SocialRequest[] }>('/requests'),
  getOne: (id: string) => fetchApi<import('../types').SocialRequest>(`/requests/${id}`),
  create: (body: Partial<import('../types').SocialRequest>) =>
    fetchApi<import('../types').SocialRequest>('/requests', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (id: string, body: Partial<import('../types').SocialRequest>) =>
    fetchApi<import('../types').SocialRequest>(`/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  batchUpdate: (requests: import('../types').SocialRequest[]) =>
    fetchApi<{ ok: boolean }>('/requests/batch', {
      method: 'PUT',
      body: JSON.stringify({ requests }),
    }),
};

// Resources
export const resourcesApi = {
  getAll: () => fetchApi<{ resources: import('../types').ResourceItem[] }>('/resources'),
  update: (resources: import('../types').ResourceItem[]) =>
    fetchApi<{ ok: boolean }>('/resources', {
      method: 'PUT',
      body: JSON.stringify({ resources }),
    }),
};

// Audit logs
export const logsApi = {
  getAll: () =>
    fetchApi<{ logs: import('../types').AuditLogEntry[] }>('/logs'),
  create: (action: string, targetId: string, details: string) =>
    fetchApi<import('../types').AuditLogEntry>('/logs', {
      method: 'POST',
      body: JSON.stringify({ action, targetId, details }),
    }),
};

// Priority weights
export const weightsApi = {
  get: () => fetchApi<import('../types').PriorityWeights>('/weights'),
  update: (weights: import('../types').PriorityWeights) =>
    fetchApi<import('../types').PriorityWeights>('/weights', {
      method: 'PUT',
      body: JSON.stringify(weights),
    }),
};

// AI ( proxied through backend - keeps API key secure )
export const aiApi = {
  classify: (title: string, description: string) =>
    fetchApi<{
      category: string;
      confidence: number;
      reasoning: string;
      suggestedUrgency: string;
      estimatedBudget: number;
    }>('/ai/classify', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    }),
  score: (request: import('../types').SocialRequest) =>
    fetchApi<{ score: number; breakdown: string }>('/ai/score', {
      method: 'POST',
      body: JSON.stringify({ request }),
    }),
  allocate: (
    requests: import('../types').SocialRequest[],
    resources: import('../types').ResourceItem[]
  ) =>
    fetchApi<{
      allocations: { requestId: string; allocatedAmount: number; status: string; reason: string }[];
      totalImpact: number;
      remainingBudget: number;
    }>('/ai/allocate', {
      method: 'POST',
      body: JSON.stringify({ requests, resources }),
    }),
};
