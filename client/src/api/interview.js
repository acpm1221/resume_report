import { API_BASE } from './config';

export async function generateReport(formData) {
  const token = localStorage.getItem('auth_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api/interview`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || 'Report generation failed');
  return data;
}
