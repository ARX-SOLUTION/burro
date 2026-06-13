import { Injectable } from "@nestjs/common";
import { UserRole } from "@burro/shared";
import { eq } from "drizzle-orm";
import type { BurroDb } from "../../../db/client";
import { users } from "../../../db/schema";
import type { AuthUserRecord, AuthUserStorePort } from "../auth-user.ports";

@Injectable()
export class DrizzleAuthUserStore implements AuthUserStorePort {
  constructor(private readonly database: BurroDb) {}

  async getUserById(userId: string): Promise<AuthUserRecord | undefined> {
    const [row] = await this.database.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!row) {
      return undefined;
    }
    return {
      id: row.id,
      role: row.role as UserRole,
      status: row.status,
      telegramFirstName: row.telegramFirstName,
      telegramLastName: row.telegramLastName,
      telegramUsername: row.telegramUsername,
      telegramAvatarUrl: row.telegramAvatarUrl,
      preferredLanguage: row.preferredLanguage
    };
  }
}
