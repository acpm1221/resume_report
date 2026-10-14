import { API_BASE } from './config';

const BASE = `${API_BASE}/api/auth`;

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${endpoint}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const register = async ({ username, email, password }) => {
  const data = await request('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  if (data.token) {
    localStorage.setItem('auth_token', data.token);
  }
  return data;
};

export const login = async ({ username, password }) => {
  const data = await request('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (data.token) {
    localStorage.setItem('auth_token', data.token);
  }
  return data;
};

export const logout = async () => {
  try {
    await request('/logout', { method: 'GET' });
  } finally {
    localStorage.removeItem('auth_token');
  }
};

export const getProfile = () => request('/profile', { method: 'GET' });
