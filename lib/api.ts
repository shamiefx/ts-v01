// Simple API utility for Next.js (fetch wrapper)
const SERVER_API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';
const CLIENT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const API_TOKEN = process.env.API_TOKEN || '';

function getBaseUrl() {
  return typeof window === 'undefined' ? SERVER_API_BASE_URL : CLIENT_API_BASE_URL;
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}) {
  const url = `${getBaseUrl()}${path}`;
  const headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json',
    ...(typeof window === 'undefined' && API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const message = await safeReadError(res);
    throw new Error(message || `API error: ${res.status}`);
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
    if (typeof data === 'string') return data;
  } catch {
    return null;
  }
  return null;
}
