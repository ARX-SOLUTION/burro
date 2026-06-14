import { Injectable } from "@nestjs/common";
import { and, asc, eq, sql } from "drizzle-orm";
import type { BurroDb } from "../../../db/client";
import {
  attemptAnswers,
  attemptExercises,
  attempts,
  studentActiveDays,
  studentXpTotals,
  xpTransactions
} from "../../../db/schema";
import {
  ApplyAnswerInput,
  ApplyAnswerResult,
  AttemptAnswerRecord,
  AttemptRecord,
  AttemptsStorePort,
  XpGrantRequest
} from "../attempts.ports";

type BurroTx = Parameters<Parameters<BurroDb["transaction"]>[0]>[0];
type AttemptAnswerRow = typeof attemptAnswers.$inferSelect;

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

  async getAnswerByClientAnswerId(
    attemptId: string,
    clientAnswerId: string
  ): Promise<AttemptAnswerRecord | undefined> {
    const [answer] = await this.database
      .select()
      .from(attemptAnswers)
      .where(and(eq(attemptAnswers.attemptId, attemptId), eq(attemptAnswers.clientAnswerId, clientAnswerId)))
      .limit(1);
    return answer ? toAttemptAnswerRecord(answer) : undefined;
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
      const answeredAt = answer.answeredAt ?? new Date();
      const [existingByClientAnswerId] = await tx
        .select()
        .from(attemptAnswers)
        .where(
          and(
            eq(attemptAnswers.attemptId, answer.attemptId),
            eq(attemptAnswers.clientAnswerId, answer.clientAnswerId)
          )
        )
        .limit(1);
      if (existingByClientAnswerId) {
        return { grantedTotal: 0, answer: toAttemptAnswerRecord(existingByClientAnswerId) };
      }

      const [insertedAnswer] = await tx
        .insert(attemptAnswers)
        .values({
          attemptId: answer.attemptId,
          exerciseId: answer.exerciseId,
          clientAnswerId: answer.clientAnswerId,
          selectedOptionId: answer.selectedOptionId,
          correctOptionId: answer.correctOptionId,
          isCorrect: answer.isCorrect,
          xpDelta: 0,
          answeredAt
        })
        .onConflictDoNothing({
          target: [attemptAnswers.attemptId, attemptAnswers.exerciseId]
        })
        .returning();

      if (!insertedAnswer) {
        const [existingByExercise] = await tx
          .select()
          .from(attemptAnswers)
          .where(and(eq(attemptAnswers.attemptId, answer.attemptId), eq(attemptAnswers.exerciseId, answer.exerciseId)))
          .limit(1);
        if (!existingByExercise) {
          throw new Error("answer conflict could not be reloaded");
        }
        return { grantedTotal: 0, answer: toAttemptAnswerRecord(existingByExercise) };
      }

      const answerXpGranted = answerXpGrant ? await this.grantXpOnce(tx, attempt.studentId, answerXpGrant) : 0;
      let grantedTotal = answerXpGranted;
      for (const grant of completionXpGrants) {
        grantedTotal += await this.grantXpOnce(tx, attempt.studentId, grant);
      }
      await this.recordActiveDay(tx, attempt.studentId, answeredAt);

      if (answerXpGranted !== 0) {
        await tx
          .update(attemptAnswers)
          .set({
            xpDelta: answerXpGranted
          })
          .where(eq(attemptAnswers.id, insertedAnswer.id));
      }

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
          xpEarned: sql`${attempts.xpEarned} + ${grantedTotal}`,
          completedAt
        })
        .where(eq(attempts.id, attempt.id));

      return {
        grantedTotal,
        answer: {
          ...toAttemptAnswerRecord(insertedAnswer),
          xpDelta: answerXpGranted
        }
      };
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

  private async recordActiveDay(tx: BurroTx, studentId: string, answeredAt: Date): Promise<void> {
    await tx
      .insert(studentActiveDays)
      .values({
        studentUserId: studentId,
        activityDate: toActivityDate(answeredAt),
        answersCount: 1,
        isActiveDay: true
      })
      .onConflictDoUpdate({
        target: [studentActiveDays.studentUserId, studentActiveDays.activityDate],
        set: {
          answersCount: sql`${studentActiveDays.answersCount} + 1`,
          isActiveDay: true,
          updatedAt: new Date()
        }
      });
  }
}

function toAttemptAnswerRecord(row: AttemptAnswerRow): AttemptAnswerRecord {
  return {
    attemptId: row.attemptId,
    exerciseId: row.exerciseId,
    clientAnswerId: row.clientAnswerId,
    selectedOptionId: row.selectedOptionId,
    correctOptionId: row.correctOptionId,
    isCorrect: row.isCorrect,
    xpDelta: row.xpDelta,
    answeredAt: row.answeredAt
  };
}

function toActivityDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
