import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { DevHeaderAdapter } from "./dev-header.adapter";
import { UnauthorizedError } from "./identity.ports";
import { TelegramInitDataAdapter, verifyTelegramInitData } from "./telegram-init-data.adapter";

const BOT_TOKEN = "1234567890:TEST_FIXTURE_BOT_TOKEN";

function signInitData(fields: Record<string, string>, botToken: string): string {
  const dataCheckString = Object.entries(fields)
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");
  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const hash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  const params = new URLSearchParams({ ...fields, hash });
  return params.toString();
}

function freshFields(authDate: number = Math.floor(Date.now() / 1000)): Record<string, string> {
  return {
    auth_date: String(authDate),
    query_id: "AAH-test",
    user: JSON.stringify({ id: 42, first_name: "Aisha", last_name: "K", username: "aisha_k" })
  };
}

describe("verifyTelegramInitData", () => {
  it("accepts valid initData and returns the parsed user", () => {
    const initData = signInitData(freshFields(), BOT_TOKEN);
    const user = verifyTelegramInitData(initData, BOT_TOKEN);
    expect(user).toEqual({
      id: 42,
      firstName: "Aisha",
      lastName: "K",
      username: "aisha_k",
      photoUrl: undefined
    });
  });

  it("rejects a tampered hash", () => {
    const initData = signInitData(freshFields(), BOT_TOKEN);
    const params = new URLSearchParams(initData);
    params.set("hash", params.get("hash")!.replace(/^./, (char) => (char === "0" ? "1" : "0")));
    expect(() => verifyTelegramInitData(params.toString(), BOT_TOKEN)).toThrow(UnauthorizedError);
  });

  it("rejects payloads signed with a different bot token", () => {
    const initData = signInitData(freshFields(), "9999:OTHER_BOT_TOKEN");
    expect(() => verifyTelegramInitData(initData, BOT_TOKEN)).toThrow(UnauthorizedError);
  });

  it("rejects stale auth_date older than 24h", () => {
    const staleAuthDate = Math.floor(Date.now() / 1000) - 25 * 60 * 60;
    const initData = signInitData(freshFields(staleAuthDate), BOT_TOKEN);
    expect(() => verifyTelegramInitData(initData, BOT_TOKEN)).toThrow(/stale/);
  });
});

describe("TelegramInitDataAdapter", () => {
  it("resolves studentId via the injected upsert after validation", async () => {
    const adapter = new TelegramInitDataAdapter(async (user) => `user-${user.id}`, BOT_TOKEN);
    const initData = signInitData(freshFields(), BOT_TOKEN);
    const identity = await adapter.resolveIdentity({ headers: { "x-telegram-init-data": initData } });
    expect(identity).toMatchObject({ userId: "user-42", studentId: "user-42", role: "student" });
  });

  it("throws UnauthorizedError when the header is missing", async () => {
    const adapter = new TelegramInitDataAdapter(async () => "never", BOT_TOKEN);
    await expect(adapter.resolveIdentity({ headers: {} })).rejects.toThrow(UnauthorizedError);
  });
});

describe("DevHeaderAdapter", () => {
  it("uses x-student-id header when present", async () => {
    const adapter = new DevHeaderAdapter();
    const identity = await adapter.resolveIdentity({ headers: { "x-student-id": "student-123" } });
    expect(identity).toMatchObject({ userId: "student-123", studentId: "student-123", role: "student" });
  });

  it("falls back to student-demo when header is absent", async () => {
    const adapter = new DevHeaderAdapter();
    const identity = await adapter.resolveIdentity({ headers: {} });
    expect(identity).toMatchObject({ userId: "student-demo", studentId: "student-demo", role: "student" });
  });
});
