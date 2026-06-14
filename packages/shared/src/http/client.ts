import type { ApiEnvelope } from "../contracts/attempts";

export interface ApiClientErrorInit {
  status: number;
  code?: string;
  message: string;
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(init: ApiClientErrorInit) {
    super(init.message);
    this.name = "ApiClientError";
    this.status = init.status;
    this.code = init.code;
  }
}

export const apiClientErrorCodes = {
  timeout: "TIMEOUT",
  network: "NETWORK_ERROR",
  invalidResponse: "INVALID_RESPONSE"
} as const;

export interface ApiClientOptions {
  baseUrl: string;
  headers?: Record<string, string> | (() => Record<string, string>);
  credentials?: RequestCredentials;
  timeoutMs?: number;
}

export interface ApiClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
}

interface RawNestError {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

function extractError(status: number, payload: unknown): ApiClientError {
  if (payload && typeof payload === "object") {
    const envelopeError = (payload as Partial<ApiEnvelope<unknown>>).error;
    if (envelopeError && typeof envelopeError === "object" && "message" in envelopeError) {
      const code = (envelopeError as { code?: unknown }).code;
      return new ApiClientError({
        status,
        code: typeof code === "string" ? code : undefined,
        message: String(envelopeError.message)
      });
    }
    const raw = payload as RawNestError;
    if (raw.message != null) {
      return new ApiClientError({
        status,
        code: typeof raw.error === "string" ? raw.error : undefined,
        message: Array.isArray(raw.message) ? raw.message.join(", ") : String(raw.message)
      });
    }
  }
  return new ApiClientError({ status, message: `Request failed: ${status}` });
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const baseUrl = options.baseUrl.replace(/\/$/, "");
  const timeoutMs = options.timeoutMs ?? 10_000;

  async function request<T>(path: string, init: { method: "GET" | "POST" | "PATCH"; body?: unknown }): Promise<T> {
    const extraHeaders = typeof options.headers === "function" ? options.headers() : options.headers ?? {};
    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method: init.method,
        headers: { "Content-Type": "application/json", ...extraHeaders },
        credentials: options.credentials,
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
        signal: AbortSignal.timeout(timeoutMs)
      });
    } catch (error) {
      const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
      throw new ApiClientError({
        status: 0,
        code: isTimeout ? apiClientErrorCodes.timeout : apiClientErrorCodes.network,
        message: isTimeout ? "Request timed out" : "Network error"
      });
    }
    const payload = (await response.json().catch(() => null)) as unknown;
    if (!response.ok) {
      throw extractError(response.status, payload);
    }
    const envelope = payload as Partial<ApiEnvelope<T>> | null;
    if (envelope?.error) {
      throw extractError(response.status, envelope);
    }
    if (!envelope || !("data" in envelope)) {
      throw new ApiClientError({
        status: response.status,
        code: apiClientErrorCodes.invalidResponse,
        message: "Unexpected response format"
      });
    }
    return envelope.data as T;
  }

  return {
    get: <T>(path: string) => request<T>(path, { method: "GET" }),
    post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
    patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body })
  };
}
