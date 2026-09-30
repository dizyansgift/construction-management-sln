export function apiErrorMessage(err: { status?: number; error?: unknown; message?: string }, fallback: string): string {
  const payload = err?.error;
  const pieces: string[] = [];
  if (typeof payload === 'string' && payload.trim()) pieces.push(payload);
  if (Array.isArray(payload)) {
    pieces.push(...payload.map((item) => (typeof item === 'string' ? item : '')).filter(Boolean));
  }
  if (payload && typeof payload === 'object') {
    const record = payload as { detail?: string; message?: string };
    if (record.detail) pieces.push(record.detail);
    if (record.message) pieces.push(record.message);
  }
  if (typeof err?.message === 'string' && err.message.trim() && !err.message.startsWith('Http failure')) {
    pieces.push(err.message);
  }

  const combined = pieces.join(' ');
  if (combined.toLowerCase().includes('initialization string')) {
    return 'Could not reach the database. The API connection string is invalid.';
  }
  if (pieces[0]) return pieces[0];
  if (err?.status === 401) return 'Invalid email or password.';
  if (err?.status === 404) return `${fallback} The API route was not found; redeploy the Render API.`;
  return fallback;
}
