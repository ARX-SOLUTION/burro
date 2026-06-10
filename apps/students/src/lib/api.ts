import type { ApiEnvelope } from "@burro/shared";

const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export async function apiPost<TResponse>(path: string, body: unknown): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000)
    });
  } catch (error) {
    throw new Error(error instanceof DOMException && error.name === "TimeoutError" ? "So‘rov vaqti tugadi. Qayta urinib ko‘ring." : "Tarmoq xatosi. Qayta urinib ko‘ring.");
  }
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<TResponse> | { message?: string } | null;
  if (!response.ok) {
    const message = payload && "message" in payload && payload.message ? String(payload.message) : `Request failed: ${response.status}`;
    throw new Error(message);
  }
  if (!payload || !("data" in payload)) throw new Error("Kutilmagan javob formati.");
  return payload.data;
}
