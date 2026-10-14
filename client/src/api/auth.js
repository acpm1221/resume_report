const BASE = '/api/auth';

async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE}${endpoint}`, {
    credentials: 'include',
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

export const register = ({ username, email, password }) =>
  request('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });

export const login = ({ username, password }) =>
  request('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

export const logout = () => request('/logout', { method: 'GET' });

export const getProfile = () => request('/profile', { method: 'GET' });
