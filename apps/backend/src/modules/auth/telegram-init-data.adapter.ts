import { createHmac, timingSafeEqual } from "node:crypto";
import { Injectable } from "@nestjs/common";
import type { BurroDb } from "../../db/client";
import { users } from "../../db/schema";
import { headerValue, IdentityPort, IdentityRequest, StudentIdentity, UnauthorizedError } from "./identity.ports";

const INIT_DATA_HEADER = "x-telegram-init-data";
const MAX_AUTH_AGE_SECONDS = 24 * 60 * 60;

export interface TelegramInitDataUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
}

/**
 * Validates Telegram Mini App initData per the official spec:
 * data_check_string = sorted `key=value` pairs (hash removed) joined with "\n",
 * secret = HMAC_SHA256(bot_token, key="WebAppData"),
 * expected hash = hex(HMAC_SHA256(data_check_string, secret)).
 */
export function verifyTelegramInitData(initData: string, botToken: string, now: Date = new Date()): TelegramInitDataUser {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) {
    throw new UnauthorizedError("initData is missing hash.");
  }
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");
  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const expected = createHmac("sha256", secretKey).update(dataCheckString).digest();
  const provided = Buffer.from(hash, "hex");
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    throw new UnauthorizedError("initData hash mismatch.");
  }

  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate)) {
    throw new UnauthorizedError("initData is missing auth_date.");
  }
  if (Math.floor(now.getTime() / 1000) - authDate > MAX_AUTH_AGE_SECONDS) {
    throw new UnauthorizedError("initData auth_date is stale.");
  }

  const rawUser = params.get("user");
  if (!rawUser) {
    throw new UnauthorizedError("initData is missing user.");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawUser);
  } catch {
    throw new UnauthorizedError("initData user is not valid JSON.");
  }
  const user = parsed as { id?: unknown; first_name?: unknown; last_name?: unknown; username?: unknown; photo_url?: unknown };
  if (typeof user.id !== "number" || typeof user.first_name !== "string") {
    throw new UnauthorizedError("initData user is malformed.");
  }

  return {
    id: user.id,
    firstName: user.first_name,
    lastName: typeof user.last_name === "string" ? user.last_name : undefined,
    username: typeof user.username === "string" ? user.username : undefined,
    photoUrl: typeof user.photo_url === "string" ? user.photo_url : undefined
  };
}

export type UpsertStudentFn = (user: TelegramInitDataUser) => Promise<string>;

export const createDrizzleUpsertStudent = (db: BurroDb): UpsertStudentFn => async (user) => {
  const [row] = await db
    .insert(users)
    .values({
      telegramUserId: user.id,
      telegramFirstName: user.firstName,
      telegramLastName: user.lastName ?? null,
      telegramUsername: user.username ?? null,
      telegramAvatarUrl: user.photoUrl ?? null,
      role: "student"
    })
    .onConflictDoUpdate({
      target: users.telegramUserId,
      set: {
        telegramFirstName: user.firstName,
        telegramLastName: user.lastName ?? null,
        telegramUsername: user.username ?? null,
        telegramAvatarUrl: user.photoUrl ?? null,
        updatedAt: new Date()
      }
    })
    .returning({ id: users.id });

  if (!row) {
    throw new Error("Failed to upsert Telegram user.");
  }
  return row.id;
};

@Injectable()
export class TelegramInitDataAdapter implements IdentityPort {
  constructor(
    private readonly upsertStudent: UpsertStudentFn,
    private readonly botToken: string
  ) {}

  async resolveStudent(req: IdentityRequest): Promise<StudentIdentity> {
    const initData = headerValue(req, INIT_DATA_HEADER);
    if (!initData) {
      throw new UnauthorizedError(`Missing ${INIT_DATA_HEADER} header.`);
    }
    const user = verifyTelegramInitData(initData, this.botToken);
    const studentId = await this.upsertStudent(user);
    return { studentId };
  }
}
