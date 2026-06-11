import { Injectable } from "@nestjs/common";
import { asc, eq, sql } from "drizzle-orm";
import type { BurroDb } from "../../../db/client";
import { attemptAnswers, attemptExercises, attempts, studentXpTotals, xpTransactions } from "../../../db/schema";
import {
  ApplyAnswerInput,
  ApplyAnswerResult,
  AttemptRecord,
  AttemptsStorePort,
  XpGrantRequest
} from "../attempts.ports";

type BurroTx = Parameters<Parameters<BurroDb["transaction"]>[0]>[0];

@Injectable()
export class DrizzleAttemptsStore implements AttemptsStorePort {
  constructor(private readonly database: BurroDb) {}

  async getAttempt(id: string): Promise<AttemptRecord | undefined> {
    const [attempt] = await this.database.select().from(attempts).where(eq(attempts.id, id)).limit(1);
    if (!attempt) {
      return undefined;
    }

    const [exerciseRows, answerRows] = await Promise.all([
      this.database
        .select()
        .from(attemptExercises)
        .where(eq(attemptExercises.attemptId, id))
        .orderBy(asc(attemptExercises.sortOrder)),
      this.database
        .select()
        .from(attemptAnswers)
        .where(eq(attemptAnswers.attemptId, id))
        .orderBy(asc(attemptAnswers.answeredAt))
    ]);

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

    // Exercise rows are immutable after start; only the start path (no answers
    // yet) needs to insert them.
    if (attempt.exerciseIds.length === 0 || attempt.answeredExerciseIds.length > 0) {
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

  async applyAnswer(input: ApplyAnswerInput): Promise<ApplyAnswerResult> {
    const { attempt, answer, answerXpGrant, completionXpGrants } = input;

    return this.database.transaction(async (tx) => {
      const answerXpGranted = answerXpGrant ? await this.grantXpOnce(tx, attempt.studentId, answerXpGrant) : 0;
      let grantedTotal = answerXpGranted;
      for (const grant of completionXpGrants) {
        grantedTotal += await this.grantXpOnce(tx, attempt.studentId, grant);
      }

      await tx
        .insert(attemptAnswers)
        .values({
          attemptId: answer.attemptId,
          exerciseId: answer.exerciseId,
          selectedOptionId: answer.selectedOptionId,
          correctOptionId: answer.correctOptionId,
          isCorrect: answer.isCorrect,
          xpDelta: answerXpGranted,
          answeredAt: answer.answeredAt ?? new Date()
        })
        .onConflictDoNothing({
          target: [attemptAnswers.attemptId, attemptAnswers.exerciseId]
        });

      const score =
        attempt.exerciseIds.length > 0 ? Math.round((attempt.correctCount / attempt.exerciseIds.length) * 100) : null;
      const completedAt = attempt.status === "in_progress" ? null : new Date();

      await tx
        .update(attempts)
        .set({
          status: attempt.status,
          score,
          heartsRemaining: attempt.heartsRemaining,
          correctCount: attempt.correctCount,
          xpEarned: attempt.xpEarned + grantedTotal,
          completedAt
        })
        .where(eq(attempts.id, attempt.id));

      return { grantedTotal, answerXpGranted };
    });
  }

  private async grantXpOnce(tx: BurroTx, studentId: string, grant: XpGrantRequest): Promise<number> {
    if (grant.xpDelta <= 0) {
      return 0;
    }

    const [transaction] = await tx
      .insert(xpTransactions)
      .values({
        studentUserId: studentId,
        sourceType: grant.sourceType,
        sourceId: grant.sourceId,
        xpDelta: grant.xpDelta,
        reason: grant.sourceType
      })
      .onConflictDoNothing({
        target: [xpTransactions.studentUserId, xpTransactions.sourceType, xpTransactions.sourceId]
      })
      .returning({ xpDelta: xpTransactions.xpDelta });

    if (!transaction) {
      return 0;
    }

    await tx
      .insert(studentXpTotals)
      .values({ studentUserId: studentId, totalXp: transaction.xpDelta })
      .onConflictDoUpdate({
        target: studentXpTotals.studentUserId,
        set: { totalXp: sql`${studentXpTotals.totalXp} + ${transaction.xpDelta}` }
      });

    return transaction.xpDelta;
  }
}
