import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/lib/authClient";

// Simple API utility for Next.js (fetch wrapper)
const SERVER_API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";
const CLIENT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const API_TOKEN = process.env.API_TOKEN || "";

// Optional: when calling your own Next.js route handlers from the server.
// (In this app most calls happen in the browser, but this avoids surprising URLs.)
const NEXT_INTERNAL_BASE_URL =
  process.env.NEXT_INTERNAL_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function isBrowser() {
  return typeof window !== "undefined";
}

function getBaseUrl(path: string) {
  // In the browser, prefer going through Next.js route handlers (same-origin)
  // for any local /api/* path. This avoids CORS issues and keeps API_TOKEN server-side.
  if (isBrowser()) {
    return path.startsWith("/api/") ? "" : CLIENT_API_BASE_URL;
  }

  // On the server: /api/* refers to Next.js route handlers, everything else goes to backend.
  return path.startsWith("/api/") ? NEXT_INTERNAL_BASE_URL : SERVER_API_BASE_URL;
}

function shouldAttachJsonContentType(body: unknown) {
  if (!body) return false;
  if (typeof FormData !== "undefined" && body instanceof FormData) return false;
  if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) return false;
  if (typeof Blob !== "undefined" && body instanceof Blob) return false;
  return true;
}

function normalizeHeaders(init?: HeadersInit): Record<string, string> {
  const out: Record<string, string> = {};
  if (!init) return out;

  if (typeof Headers !== "undefined" && init instanceof Headers) {
    init.forEach((v, k) => {
      out[k] = v;
    });
    return out;
  }

  if (Array.isArray(init)) {
    for (const [k, v] of init) out[k] = v;
    return out;
  }

  return { ...(init as Record<string, string>) };
}

function withAuthHeader(headers: Record<string, string>, token: string | null) {
  if (!token) return headers;
  // Preserve explicit Authorization if caller set one.
  if (Object.keys(headers).some((k) => k.toLowerCase() === "authorization")) return headers;
  return { ...headers, Authorization: `Bearer ${token}` };
}

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!isBrowser()) return null;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.warn("No local refresh token found, attempting cookie-based refresh...");
  }

  try {
    console.log("Attempting to refresh access token...");
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        refreshToken ? { refresh_token: refreshToken } : {}
      ),
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Token refresh failed with status:", res.status);
      // Clear tokens and redirect to login on refresh failure
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/auth/sign-in";
      }
      return null;
    }

    const data = (await safeReadJson(res)) as
      | null
      | {
          access_token?: string;
          token?: string;
          refresh_token?: string;
        };

    const access = data?.access_token || data?.token;
    if (!access) {
      console.error("No access token in refresh response");
      clearTokens();
      return null;
    }

    console.log("Token refreshed successfully");
    setAccessToken(access);
    if (data?.refresh_token) setRefreshToken(data.refresh_token);

    return access;
  } catch (error) {
    console.error("Token refresh error:", error);
    clearTokens();
    return null;
  }
}

async function getFreshAccessTokenSingleFlight(): Promise<string | null> {
  if (!isBrowser()) return null;

  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
  } else {
    console.log("Refresh already in progress, waiting for existing refresh...");
  }

  return refreshInFlight;
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}) {
  const url = `${getBaseUrl(path)}${path}`;

  const baseHeaders: Record<string, string> = normalizeHeaders(options.headers);

  const body = (options as RequestInit & { body?: unknown }).body;
  if (shouldAttachJsonContentType(body)) {
    if (!Object.keys(baseHeaders).some((k) => k.toLowerCase() === "content-type")) {
      baseHeaders["Content-Type"] = "application/json";
    }
  }

  const headersWithServerToken = {
    ...baseHeaders,
    ...(typeof window === "undefined" && API_TOKEN ? { "X-API-Token": API_TOKEN } : {}),
  };

  const authToken = isBrowser() ? getAccessToken() : null;
  const shouldAttachAuth = isBrowser() && !path.startsWith("/api/auth/");
  const headers = shouldAttachAuth
    ? withAuthHeader(headersWithServerToken, authToken)
    : headersWithServerToken;

  const doFetch = (overrideAccessToken?: string | null) => {
    const h =
      shouldAttachAuth && overrideAccessToken
        ? withAuthHeader(headersWithServerToken, overrideAccessToken)
        : headers;

    const defaultCreds = isBrowser()
      ? path.startsWith("/api/")
        ? "include"
        : "same-origin"
      : undefined;

    return fetch(url, {
      ...options,
      headers: h,
      credentials: options.credentials ?? (defaultCreds as RequestCredentials | undefined),
    });
  };

  let res = await doFetch();

  // Auto-refresh (browser only): if access token expired, refresh once then retry the original call.
  const noRefresh = (options as unknown as { noRefresh?: boolean }).noRefresh === true;
  const isAuthRoute =
    path.startsWith("/api/auth/login") ||
    path.startsWith("/api/auth/signup") ||
    path.startsWith("/api/auth/refresh") ||
    path.startsWith("/api/auth/logout");

  if (isBrowser() && !noRefresh && !isAuthRoute && res.status === 401) {
    console.log("Received 401, attempting token refresh...");
    const refreshed = await getFreshAccessTokenSingleFlight();
    if (refreshed) {
      console.log("Token refreshed, retrying original request...");
      res = await doFetch(refreshed);
    } else {
      console.warn("Token refresh failed, session expired");
      throw new Error("Session expired. Please sign in again.");
    }
  }

  if (!res.ok) {
    const message = await safeReadError(res);
    const fallback = `API error: ${res.status}${res.statusText ? ` ${res.statusText}` : ""}`;
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
