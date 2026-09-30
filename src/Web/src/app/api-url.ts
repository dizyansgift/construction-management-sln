const RENDER_API = 'https://construction-management-api-90nr.onrender.com';

export function apiUrl(path: string): string {
  const host = globalThis.location?.hostname ?? '';
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  const configured = String((globalThis as { __env?: { API_BASE?: string } }).__env?.API_BASE ?? '').replace(/\/$/, '');
  const base = configured || (isLocal ? '' : RENDER_API);
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}
