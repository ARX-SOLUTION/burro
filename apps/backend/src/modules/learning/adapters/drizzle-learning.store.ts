import { Injectable } from "@nestjs/common";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import type { BurroDb } from "../../../db/client";
import {
  attemptAnswers,
  attempts,
  moduleExercises,
  moduleTranslations,
  modules,
  premiumGrants,
  studentModuleProgress,
  users
} from "../../../db/schema";
import type { LearningStorePort, ModuleProgressRecord, ModuleResultStats } from "../learning.ports";

const FALLBACK_LANGUAGE = "uz" as const;

/**
 * Reads the learning path from PostgreSQL. Module text is resolved by the
 * student's preferred language with a uz fallback; progress is left-joined so
 * students with no progress row still get a card. Premium is a read-only access
 * gate here — nothing in this store mutates progress.
 */
@Injectable()
export class DrizzleLearningStore implements LearningStorePort {
  constructor(private readonly database: BurroDb) {}

  private async preferredLanguage(studentId: string): Promise<"uz" | "ru" | "en"> {
    const [row] = await this.database
      .select({ language: users.preferredLanguage })
      .from(users)
      .where(eq(users.id, studentId))
      .limit(1);
    return row?.language ?? FALLBACK_LANGUAGE;
  }

  async listPath(studentId: string): Promise<ModuleProgressRecord[]> {
    const language = await this.preferredLanguage(studentId);
    const rows = await this.selectModules(studentId, language);
    return rows;
  }

  async getModuleProgress(studentId: string, moduleId: string): Promise<ModuleProgressRecord | undefined> {
    const language = await this.preferredLanguage(studentId);
    const rows = await this.selectModules(studentId, language, moduleId);
    return rows[0];
  }

  private async selectModules(
    studentId: string,
    language: "uz" | "ru" | "en",
    moduleId?: string
  ): Promise<ModuleProgressRecord[]> {
    const preferred = this.database
      .select({
        moduleId: moduleTranslations.moduleId,
        title: moduleTranslations.title,
        description: moduleTranslations.description
      })
      .from(moduleTranslations)
      .where(eq(moduleTranslations.language, language))
      .as("preferred_tr");

    const fallback = this.database
      .select({
        moduleId: moduleTranslations.moduleId,
        title: moduleTranslations.title,
        description: moduleTranslations.description
      })
      .from(moduleTranslations)
      .where(eq(moduleTranslations.language, FALLBACK_LANGUAGE))
      .as("fallback_tr");

    const exerciseCount = this.database
      .select({
        moduleId: moduleExercises.moduleId,
        count: sql<number>`count(*)::int`.as("exercise_count")
      })
      .from(moduleExercises)
      .groupBy(moduleExercises.moduleId)
      .as("exercise_count_sub");

    const whereClause = moduleId
      ? and(eq(modules.status, "published"), eq(modules.id, moduleId))
      : eq(modules.status, "published");

    const rows = await this.database
      .select({
        moduleId: modules.id,
        sequenceNo: modules.sequenceNo,
        title: sql<string>`coalesce(${preferred.title}, ${fallback.title}, '')`,
        description: sql<string>`coalesce(${preferred.description}, ${fallback.description}, '')`,
        estimatedMinutes: modules.estimatedMinutes,
        premiumRequired: modules.premiumRequired,
        passScore: modules.passScore,
        heartsCount: modules.heartsCount,
        exerciseCount: sql<number>`coalesce(${exerciseCount.count}, 0)`,
        progressStatus: studentModuleProgress.status,
        progressPercent: studentModuleProgress.progressPercent,
        finalQuizBestScore: studentModuleProgress.finalQuizBestScore,
        finalQuizPassed: studentModuleProgress.finalQuizPassed
      })
      .from(modules)
      .leftJoin(preferred, eq(preferred.moduleId, modules.id))
      .leftJoin(fallback, eq(fallback.moduleId, modules.id))
      .leftJoin(exerciseCount, eq(exerciseCount.moduleId, modules.id))
      .leftJoin(
        studentModuleProgress,
        and(eq(studentModuleProgress.moduleId, modules.id), eq(studentModuleProgress.studentUserId, studentId))
      )
      .where(whereClause)
      .orderBy(asc(modules.sequenceNo));

    return rows.map((row) => ({
      moduleId: row.moduleId,
      sequenceNo: row.sequenceNo,
      title: row.title,
      description: row.description,
      estimatedMinutes: row.estimatedMinutes,
      premiumRequired: row.premiumRequired,
      passScore: row.passScore,
      heartsCount: row.heartsCount,
      exerciseCount: Number(row.exerciseCount ?? 0),
      progressStatus: row.progressStatus ?? null,
      progressPercent: row.progressPercent ?? 0,
      finalQuizBestScore: row.finalQuizBestScore ?? null,
      finalQuizPassed: row.finalQuizPassed ?? false
    }));
  }

  async hasActivePremiumGrant(studentId: string): Promise<boolean> {
    const [row] = await this.database
      .select({ id: premiumGrants.id })
      .from(premiumGrants)
      .where(
        and(
          eq(premiumGrants.studentUserId, studentId),
          eq(premiumGrants.status, "active"),
          // A null expiresAt means "no expiry"; otherwise it must be in the future.
          sql`(${premiumGrants.expiresAt} is null or ${premiumGrants.expiresAt} > now())`
        )
      )
      .limit(1);
    return Boolean(row);
  }

  async getModuleResultStats(studentId: string, moduleId: string): Promise<ModuleResultStats> {
    // Attempt-level XP and answer-level accuracy across this student's attempts
    // on the module. Best final-quiz score and pass come from the attempts rows.
    const studentAttempts = await this.database
      .select({ id: attempts.id, attemptType: attempts.attemptType, status: attempts.status, score: attempts.score, xpEarned: attempts.xpEarned })
      .from(attempts)
      .where(and(eq(attempts.studentUserId, studentId), eq(attempts.moduleId, moduleId)));

    const xpEarned = studentAttempts.reduce((sum, attempt) => sum + attempt.xpEarned, 0);

    let finalQuizBestScore: number | null = null;
    let finalQuizPassed = false;
    for (const attempt of studentAttempts) {
      if (attempt.attemptType !== "final_quiz") {
        continue;
      }
      if (attempt.score !== null && (finalQuizBestScore === null || attempt.score > finalQuizBestScore)) {
        finalQuizBestScore = attempt.score;
      }
      if (attempt.status === "passed") {
        finalQuizPassed = true;
      }
    }

    const attemptIds = studentAttempts.map((attempt) => attempt.id);
    let correctCount = 0;
    let totalAnswered = 0;
    if (attemptIds.length > 0) {
      const [counts] = await this.database
        .select({
          total: sql<number>`count(*)::int`,
          correct: sql<number>`count(*) filter (where ${attemptAnswers.isCorrect})::int`
        })
        .from(attemptAnswers)
        .where(inArray(attemptAnswers.attemptId, attemptIds));
      totalAnswered = Number(counts?.total ?? 0);
      correctCount = Number(counts?.correct ?? 0);
    }

    return { xpEarned, correctCount, totalAnswered, finalQuizBestScore, finalQuizPassed };
  }
}
