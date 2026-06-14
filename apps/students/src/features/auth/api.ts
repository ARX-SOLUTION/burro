import type { AuthLogoutResponse, AuthMeResponse, AuthSessionResponse } from "@burro/shared";
import { api } from "../../lib/api";
import { clearAuthSession, getStoredAuthSession, storeAuthSession } from "../../lib/auth-session";

export function getMe(): Promise<AuthMeResponse> {
  return api.get<AuthMeResponse>("/auth/me");
}

export async function refreshSession(): Promise<AuthSessionResponse> {
  const session = getStoredAuthSession();
  if (!session?.refreshToken) {
    throw new Error("No refresh token is stored.");
  }
  const response = await api.post<AuthSessionResponse>("/auth/refresh", { refreshToken: session.refreshToken });
  storeAuthSession(response.session);
  return response;
}

export async function logout(): Promise<AuthLogoutResponse> {
  const session = getStoredAuthSession();
  if (!session?.refreshToken) {
    clearAuthSession();
    return { revoked: false };
  }
  try {
    return await api.post<AuthLogoutResponse>("/auth/logout", { refreshToken: session.refreshToken });
  } finally {
    clearAuthSession();
  }
}
