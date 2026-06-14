import { ApiClientError, apiClientErrorCodes, createApiClient } from "@burro/shared";
import type { ApiClient, AuthSessionResponse } from "@burro/shared";
import { clearAuthSession, getStoredAuthSession, storeAuthSession } from "./auth-session";

const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

const STUDENT_ID_STORAGE_KEY = "burro.studentId";

const localizedMessages: Record<string, string> = {
  [apiClientErrorCodes.timeout]: "So‘rov vaqti tugadi. Qayta urinib ko‘ring.",
  [apiClientErrorCodes.network]: "Tarmoq xatosi. Qayta urinib ko‘ring.",
  [apiClientErrorCodes.invalidResponse]: "Kutilmagan javob formati."
};

function localizeError(error: unknown): never {
  if (error instanceof ApiClientError && error.code && localizedMessages[error.code]) {
    throw new ApiClientError({ status: error.status, code: error.code, message: localizedMessages[error.code] });
  }
  throw error;
}

async function refreshStoredSession(): Promise<boolean> {
  const session = getStoredAuthSession();
  if (!session?.refreshToken) {
    return false;
  }
  try {
    const refreshed = await client.post<AuthSessionResponse>("/auth/refresh", { refreshToken: session.refreshToken });
    storeAuthSession(refreshed.session);
    return true;
  } catch {
    clearAuthSession();
    return false;
  }
}

async function requestWithSessionRefresh<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401 && await refreshStoredSession()) {
      return operation();
    }
    localizeError(error);
  }
}

const client = createApiClient({
  baseUrl,
  credentials: "include",
  headers: (): Record<string, string> => {
    const session = getStoredAuthSession();
    if (session?.accessToken) {
      return { Authorization: `${session.tokenType} ${session.accessToken}` };
    }
    const studentId = localStorage.getItem(STUDENT_ID_STORAGE_KEY);
    return studentId ? { "x-student-id": studentId } : {};
  }
});

export const api: ApiClient = {
  get: <T>(path: string) => requestWithSessionRefresh(() => client.get<T>(path)),
  post: <T>(path: string, body?: unknown) => requestWithSessionRefresh(() => client.post<T>(path, body)),
  patch: <T>(path: string, body?: unknown) => requestWithSessionRefresh(() => client.patch<T>(path, body))
};
