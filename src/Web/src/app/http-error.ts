export function apiErrorMessage(err: { status?: number; error?: { detail?: string; message?: string }; message?: string }, fallback: string): string {
  const message = err?.error?.detail || err?.error?.message || err?.message;
  if (typeof message === 'string' && message.trim()) return message;
  if (err?.status === 404) return `${fallback} The API route was not found; redeploy the Render API.`;
  return fallback;
}
