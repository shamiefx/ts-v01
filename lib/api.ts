// Simple API utility for Next.js (fetch wrapper)
const SERVER_API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';
const CLIENT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const API_TOKEN = process.env.API_TOKEN || '';

function getBaseUrl(path: string) {
  // In the browser, we prefer going through Next.js route handlers (same-origin)
  // for any local /api/* path. This avoids CORS issues and keeps API_TOKEN server-side.
  if (typeof window !== 'undefined') {
    return path.startsWith('/api/') ? '' : CLIENT_API_BASE_URL;
  }
  return SERVER_API_BASE_URL;
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}) {
  const url = `${getBaseUrl(path)}${path}`;
  const headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json',
    ...(typeof window === 'undefined' && API_TOKEN ? { 'X-API-Token': API_TOKEN } : {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const message = await safeReadError(res);
    const fallback = `API error: ${res.status}${res.statusText ? ` ${res.statusText}` : ''}`;
    throw new Error(message && message.trim().length > 0 ? message : fallback);
  }
  return (await safeReadJson(res)) as T;
}

async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function safeReadError(res: Response) {
  try {
    const data = await safeReadJson(res);
    if (data && typeof data === 'object' && 'messages' in data) {
      return JSON.stringify((data as { messages: unknown }).messages);
    }
    if (data && typeof data === 'object' && 'error' in data) {
      // If the backend/proxy provides structured diagnostics (upstreamStatus, details, etc)
      // preserve them for easier debugging.
      const obj = data as Record<string, unknown>;
      const keys = Object.keys(obj);
      if (keys.length > 1) return JSON.stringify(obj);
      return String((data as { error: unknown }).error);
    }
    if (typeof data === 'string') return data;
  } catch {
    return null;
  }
  return null;
}
