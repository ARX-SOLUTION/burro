import { ApiClientError, apiClientErrorCodes, createApiClient } from "@burro/shared";
import type { ApiClient } from "@burro/shared";

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

const client = createApiClient({
  baseUrl,
  credentials: "include",
  headers: (): Record<string, string> => {
    const studentId = localStorage.getItem(STUDENT_ID_STORAGE_KEY);
    return studentId ? { "x-student-id": studentId } : {};
  }
});

export const api: ApiClient = {
  get: <T>(path: string) => client.get<T>(path).catch(localizeError),
  post: <T>(path: string, body?: unknown) => client.post<T>(path, body).catch(localizeError)
};
