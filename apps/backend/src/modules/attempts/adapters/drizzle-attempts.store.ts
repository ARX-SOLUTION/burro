import { Injectable } from "@nestjs/common";
import { and, asc, eq, sql } from "drizzle-orm";
import { db, type BurroDb } from "../../../db/client";
import { attemptAnswers, attemptExercises, attempts, studentXpTotals, xpTransactions } from "../../../db/schema";
import { AttemptAnswerRecord, AttemptRecord, AttemptsStorePort } from "../attempts.ports";

@Injectable()
export class DrizzleAttemptsStore implements AttemptsStorePort {
  constructor(private readonly database: BurroDb = db) {}

  async getAttempt(id: string): Promise<AttemptRecord | undefined> {
    const [attempt] = await this.database.select().from(attempts).where(eq(attempts.id, id)).limit(1);
    if (!attempt) {
      return undefined;
    }

    const exerciseRows = await this.database
      .select()
      .from(attemptExercises)
      .where(eq(attemptExercises.attemptId, id))
      .orderBy(asc(attemptExercises.sortOrder));
    const answerRows = await this.database
      .select()
      .from(attemptAnswers)
      .where(eq(attemptAnswers.attemptId, id))
      .orderBy(asc(attemptAnswers.answeredAt));

    return {
      id: attempt.id,
      studentId: attempt.studentUserId,
      moduleId: attempt.moduleId,
      mode: attempt.attemptType,
      status: attempt.status,
      heartsRemaining: attempt.heartsRemaining ?? 0,
      exerciseIds: exerciseRows.map((row) => row.exerciseId),
      answeredExerciseIds: answerRows.map((row) => row.exerciseId),
      correctCount: attempt.correctCount,
      xpEarned: attempt.xpEarned
    };
  }

  async saveAttempt(attempt: AttemptRecord): Promise<void> {
    const score = attempt.exerciseIds.length > 0 ? Math.round((attempt.correctCount / attempt.exerciseIds.length) * 100) : null;
    const completedAt = attempt.status === "in_progress" ? null : new Date();

    await this.database
      .insert(attempts)
      .values({
        id: attempt.id,
        studentUserId: attempt.studentId,
        moduleId: attempt.moduleId,
        attemptType: attempt.mode,
        status: attempt.status,
        score,
        heartsStart: attempt.heartsRemaining,
        heartsRemaining: attempt.heartsRemaining,
        correctCount: attempt.correctCount,
        xpEarned: attempt.xpEarned,
        completedAt
      })
      .onConflictDoUpdate({
        target: attempts.id,
        set: {
          status: attempt.status,
          score,
          heartsRemaining: attempt.heartsRemaining,
          correctCount: attempt.correctCount,
          xpEarned: attempt.xpEarned,
          completedAt
        }
      });

    if (attempt.exerciseIds.length === 0) {
      return;
    }

    await this.database
      .insert(attemptExercises)
      .values(
        attempt.exerciseIds.map((exerciseId, index) => ({
          attemptId: attempt.id,
          exerciseId,
          sortOrder: index
        }))
      )
      .onConflictDoNothing();
  }

  async recordAnswer(answer: AttemptAnswerRecord): Promise<void> {
    await this.database
      .insert(attemptAnswers)
      .values({
        attemptId: answer.attemptId,
        exerciseId: answer.exerciseId,
        selectedOptionId: answer.selectedOptionId,
        correctOptionId: answer.correctOptionId,
        isCorrect: answer.isCorrect,
        xpDelta: answer.xpDelta,
        answeredAt: answer.answeredAt ?? new Date()
      })
      .onConflictDoNothing({
        target: [attemptAnswers.attemptId, attemptAnswers.exerciseId]
      });
  }

  async grantXpOnce(studentId: string, sourceType: string, sourceId: string, xpDelta: number): Promise<number> {
    if (xpDelta <= 0) {
      return 0;
    }

    const [transaction] = await this.database
      .insert(xpTransactions)
      .values({
        studentUserId: studentId,
        sourceType,
        sourceId,
        xpDelta,
        reason: sourceType
      })
      .onConflictDoNothing({
        target: [xpTransactions.studentUserId, xpTransactions.sourceType, xpTransactions.sourceId]
      })
      .returning({ xpDelta: xpTransactions.xpDelta });

    if (!transaction) {
      return 0;
    }

    await this.database
      .insert(studentXpTotals)
      .values({ studentUserId: studentId, totalXp: xpDelta })
      .onConflictDoUpdate({
        target: studentXpTotals.studentUserId,
        set: { totalXp: sql`${studentXpTotals.totalXp} + ${xpDelta}` }
      });

    return transaction.xpDelta;
  }
}
