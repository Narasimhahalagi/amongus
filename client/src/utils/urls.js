function normalizeUrl(url) {
  return url.replace(/\/$/, '');
}

export function getBackendBase() {
  if (import.meta.env.VITE_BACKEND_URL) return normalizeUrl(import.meta.env.VITE_BACKEND_URL);

  const host = import.meta.env.VITE_HOST || (typeof window !== 'undefined' && window.location.hostname) || 'localhost';
  const protocol = import.meta.env.VITE_BACKEND_PROTOCOL || (typeof window !== 'undefined' ? window.location.protocol.replace(':', '') : 'http');
  const port = import.meta.env.VITE_BACKEND_PORT || '3000';

  return `${protocol}://${host}:${port}`;
}

export function apiUrl(path) {
  const base = getBackendBase();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getSocketUrl() {
  if (import.meta.env.VITE_SOCKET_URL) return normalizeUrl(import.meta.env.VITE_SOCKET_URL);

  const host = import.meta.env.VITE_HOST || (typeof window !== 'undefined' && window.location.hostname) || 'localhost';
  const protocol = (typeof window !== 'undefined' && window.location.protocol === 'https:') ? 'https' : 'http';
  const port = import.meta.env.VITE_BACKEND_PORT || '3000';

  return `${protocol}://${host}:${port}`;
}
