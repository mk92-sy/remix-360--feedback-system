
export const API_BASE = '/feedback/api';

export const authenticatedFetch = async (url: string, token: string | null, options: RequestInit = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  return fetch(url, { ...options, headers });
};

export const fetchSessions = async (token: string | null) => {
  const response = await authenticatedFetch(`${API_BASE}/sessions?t=${Date.now()}`, token);
  if (!response.ok) throw new Error('Failed to fetch sessions');
  return response.json();
};

export const login = async (name: string, code: string) => {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, code })
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
};

export const adminLogin = async (password: string) => {
  const response = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (!response.ok) throw new Error('Admin login failed');
  return response.json();
};
