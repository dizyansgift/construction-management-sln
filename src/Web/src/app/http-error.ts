export function apiErrorMessage(err: { status?: number; error?: unknown; message?: string }, fallback: string): string {
  const payload = err?.error;
  if (typeof payload === 'string' && payload.trim()) return payload;
  if (Array.isArray(payload)) {
    const joined = payload.map((item) => (typeof item === 'string' ? item : '')).filter(Boolean).join(' ');
    if (joined) return joined;
  }
  if (payload && typeof payload === 'object') {
    const record = payload as { detail?: string; message?: string };
    const message = record.detail || record.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (typeof err?.message === 'string' && err.message.trim() && !err.message.startsWith('Http failure')) return err.message;
  if (err?.status === 401) return 'Invalid email or password.';
  if (err?.status === 404) return `${fallback} The API route was not found; redeploy the Render API.`;
  return fallback;
}
