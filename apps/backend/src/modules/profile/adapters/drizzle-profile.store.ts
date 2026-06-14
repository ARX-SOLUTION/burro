import { Injectable } from "@nestjs/common";
import { and, count, eq } from "drizzle-orm";
import type { PreferredLanguage } from "@burro/shared";
import type { BurroDb } from "../../../db/client";
import { studentActiveDays, studentXpTotals, users } from "../../../db/schema";
import type { ProfileStorePort, StudentProfileRecord } from "../profile.ports";

@Injectable()
export class DrizzleProfileStore implements ProfileStorePort {
  constructor(private readonly database: BurroDb) {}

  async getProfile(studentId: string): Promise<StudentProfileRecord | undefined> {
    const [user] = await this.database
      .select({
        firstName: users.telegramFirstName,
        avatarUrl: users.telegramAvatarUrl,
        language: users.preferredLanguage
      })
      .from(users)
      .where(eq(users.id, studentId))
      .limit(1);
    if (!user) {
      return undefined;
    }

    const [[xpRow], [daysRow]] = await Promise.all([
      this.database
        .select({ totalXp: studentXpTotals.totalXp })
        .from(studentXpTotals)
        .where(eq(studentXpTotals.studentUserId, studentId))
        .limit(1),
      this.database
        .select({ activeDays: count() })
        .from(studentActiveDays)
        .where(and(eq(studentActiveDays.studentUserId, studentId), eq(studentActiveDays.isActiveDay, true)))
    ]);

    return {
      displayName: user.firstName,
      avatarUrl: user.avatarUrl ?? null,
      totalXp: xpRow?.totalXp ?? 0,
      activeDays: daysRow?.activeDays ?? 0,
      language: user.language
    };
  }

  async updateLanguage(studentId: string, language: PreferredLanguage): Promise<void> {
    await this.database
      .update(users)
      .set({ preferredLanguage: language, updatedAt: new Date() })
      .where(eq(users.id, studentId));
  }
}
