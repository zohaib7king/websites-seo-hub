const AUTH_KEY = "gulfJobsAuth";

export function getAuth() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(AUTH_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveAuth(auth) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  window.dispatchEvent(new Event("gulf-auth-changed"));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event("gulf-auth-changed"));
}

export function authHeaders() {
  const auth = getAuth();
  return auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};
}

export function requireLogin() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("gulf-auth-required"));
}
