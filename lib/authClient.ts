type StoredTokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

const ACCESS_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    // ignore
  }
  setAuthCookie(token);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setRefreshToken(token: string) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearTokens() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore
  }
  clearAuthCookie();
}

export function getStoredTokens(): StoredTokens {
  return {
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
  };
}

// Mirror the access token into a cookie for middleware / route handlers.
// This cookie is intentionally NOT httpOnly in this app (existing behavior).
export function setAuthCookie(token: string) {
  if (!isBrowser()) return;
  const secure = window.location.protocol === "https:";
  const maxAge = 60 * 60 * 24; // 1 day
  const parts = [
    `${ACCESS_TOKEN_KEY}=${encodeURIComponent(token)}`,
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (secure) parts.push("Secure");
  document.cookie = parts.join("; ");
}

export function clearAuthCookie() {
  if (!isBrowser()) return;
  const parts = [
    `${ACCESS_TOKEN_KEY}=`,
    "Path=/",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (window.location.protocol === "https:") parts.push("Secure");
  document.cookie = parts.join("; ");
}
