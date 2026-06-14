import { Injectable } from "@nestjs/common";
import { and, asc, count, eq, gte, sql } from "drizzle-orm";
import type { BurroDb } from "../../../db/client";
import {
  attemptAnswers,
  attempts,
  moduleTranslations,
  modules,
  studentActiveDays,
  studentModuleProgress,
  users,
  xpTransactions
} from "../../../db/schema";
import type { AccuracyTotals, DailyXpRow, ModuleAccuracyRow, StatsStorePort } from "../stats.ports";

const FALLBACK_LANGUAGE = "uz" as const;

@Injectable()
export class DrizzleStatsStore implements StatsStorePort {
  constructor(private readonly database: BurroDb) {}

  async getDailyXp(studentId: string, since: Date): Promise<DailyXpRow[]> {
    const day = sql<string>`to_char(date_trunc('day', ${xpTransactions.createdAt} at time zone 'UTC'), 'YYYY-MM-DD')`;
    const rows = await this.database
      .select({ date: day, xp: sql<number>`coalesce(sum(${xpTransactions.xpDelta}), 0)::int` })
      .from(xpTransactions)
      .where(and(eq(xpTransactions.studentUserId, studentId), gte(xpTransactions.createdAt, since)))
      .groupBy(day)
      .orderBy(asc(day));
    return rows.map((row) => ({ date: row.date, xp: Number(row.xp ?? 0) }));
  }

  async getAccuracyTotals(studentId: string): Promise<AccuracyTotals> {
    const [row] = await this.database
      .select({
        total: sql<number>`count(*)::int`,
        correct: sql<number>`count(*) filter (where ${attemptAnswers.isCorrect})::int`
      })
      .from(attemptAnswers)
      .innerJoin(attempts, eq(attemptAnswers.attemptId, attempts.id))
      .where(eq(attempts.studentUserId, studentId));
    return { total: Number(row?.total ?? 0), correct: Number(row?.correct ?? 0) };
  }

  async countActiveDays(studentId: string): Promise<number> {
    const [row] = await this.database
      .select({ activeDays: count() })
      .from(studentActiveDays)
      .where(and(eq(studentActiveDays.studentUserId, studentId), eq(studentActiveDays.isActiveDay, true)));
    return row?.activeDays ?? 0;
  }

  async getModuleAccuracy(studentId: string): Promise<ModuleAccuracyRow[]> {
    const language = await this.preferredLanguage(studentId);

    // Per-module answer accuracy aggregated across the student's attempts.
    const answerStats = this.database
      .select({
        moduleId: attempts.moduleId,
        correct: sql<number>`count(*) filter (where ${attemptAnswers.isCorrect})::int`.as("correct"),
        total: sql<number>`count(*)::int`.as("total")
      })
      .from(attempts)
      .innerJoin(attemptAnswers, eq(attemptAnswers.attemptId, attempts.id))
      .where(eq(attempts.studentUserId, studentId))
      .groupBy(attempts.moduleId)
      .as("answer_stats");

    const preferred = this.database
      .select({ moduleId: moduleTranslations.moduleId, title: moduleTranslations.title })
      .from(moduleTranslations)
      .where(eq(moduleTranslations.language, language))
      .as("preferred_tr");

    const fallback = this.database
      .select({ moduleId: moduleTranslations.moduleId, title: moduleTranslations.title })
      .from(moduleTranslations)
      .where(eq(moduleTranslations.language, FALLBACK_LANGUAGE))
      .as("fallback_tr");

    const rows = await this.database
      .select({
        moduleId: modules.id,
        title: sql<string>`coalesce(${preferred.title}, ${fallback.title}, '')`,
        status: studentModuleProgress.status,
        correct: sql<number>`coalesce(${answerStats.correct}, 0)::int`,
        total: sql<number>`coalesce(${answerStats.total}, 0)::int`
      })
      .from(modules)
      .leftJoin(preferred, eq(preferred.moduleId, modules.id))
      .leftJoin(fallback, eq(fallback.moduleId, modules.id))
      .leftJoin(
        studentModuleProgress,
        and(eq(studentModuleProgress.moduleId, modules.id), eq(studentModuleProgress.studentUserId, studentId))
      )
      .leftJoin(answerStats, eq(answerStats.moduleId, modules.id))
      .where(eq(modules.status, "published"))
      .orderBy(asc(modules.sequenceNo));

    return rows.map((row) => ({
      moduleId: row.moduleId,
      title: row.title,
      status: row.status ?? null,
      correct: Number(row.correct ?? 0),
      total: Number(row.total ?? 0)
    }));
  }

  private async preferredLanguage(studentId: string): Promise<"uz" | "ru" | "en"> {
    const [row] = await this.database
      .select({ language: users.preferredLanguage })
      .from(users)
      .where(eq(users.id, studentId))
      .limit(1);
    return row?.language ?? FALLBACK_LANGUAGE;
  }
}
