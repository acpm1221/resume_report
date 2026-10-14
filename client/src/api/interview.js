export async function generateReport(formData) {
  const res = await fetch('/api/interview', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Report generation failed');
  return data;
}
