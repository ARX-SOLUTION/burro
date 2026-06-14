import type { AuthSessionTokens } from "@burro/shared";

const AUTH_SESSION_STORAGE_KEY = "burro.authSession";

export function getStoredAuthSession(): AuthSessionTokens | null {
  const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthSessionTokens;
  } catch {
    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return null;
  }
}

export function storeAuthSession(session: AuthSessionTokens): void {
  localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}
