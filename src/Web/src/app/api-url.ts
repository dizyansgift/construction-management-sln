export function apiUrl(path: string): string {
  const raw = (globalThis as { __env?: { API_BASE?: string } }).__env?.API_BASE ?? '';
  const base = String(raw).replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}
