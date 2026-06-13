import { Injectable } from "@nestjs/common";
import {
  ApplyAnswerInput,
  ApplyAnswerResult,
  AttemptAnswerRecord,
  AttemptRecord,
  AttemptsStorePort,
  XpGrantRequest
} from "../attempts.ports";

interface ActiveDayRecord {
  studentId: string;
  activityDate: string;
  answersCount: number;
  isActiveDay: boolean;
}

@Injectable()
export class InMemoryAttemptsStore implements AttemptsStorePort {
  private readonly attempts = new Map<string, AttemptRecord>();
  private readonly answers = new Map<string, AttemptAnswerRecord>();
  private readonly answersByClientAnswerId = new Map<string, AttemptAnswerRecord>();
  private readonly grantedXpKeys = new Set<string>();
  private readonly activeDays = new Map<string, ActiveDayRecord>();

  async getAttempt(id: string): Promise<AttemptRecord | undefined> {
    const attempt = this.attempts.get(id);
    return attempt ? cloneAttempt(attempt) : undefined;
  }

  async getAnswerByClientAnswerId(
    attemptId: string,
    clientAnswerId: string
  ): Promise<AttemptAnswerRecord | undefined> {
    const answer = this.answersByClientAnswerId.get(clientAnswerKey(attemptId, clientAnswerId));
    return answer ? cloneAnswer(answer) : undefined;
  }

  async saveAttempt(attempt: AttemptRecord): Promise<void> {
    this.attempts.set(attempt.id, cloneAttempt(attempt));
  }

  async applyAnswer(input: ApplyAnswerInput): Promise<ApplyAnswerResult> {
    const { attempt, answer, answerXpGrant, completionXpGrants } = input;
    const answerKey = `${answer.attemptId}:${answer.exerciseId}`;
    const idempotencyKey = clientAnswerKey(answer.attemptId, answer.clientAnswerId);
    const existingByClientAnswerId = this.answersByClientAnswerId.get(idempotencyKey);
    if (existingByClientAnswerId) {
      return { grantedTotal: 0, answer: cloneAnswer(existingByClientAnswerId) };
    }

    const existingByExercise = this.answers.get(answerKey);
    if (existingByExercise) {
      this.answersByClientAnswerId.set(idempotencyKey, existingByExercise);
      return { grantedTotal: 0, answer: cloneAnswer(existingByExercise) };
    }

    const answerXpGranted = answerXpGrant ? this.grantXpOnce(attempt.studentId, answerXpGrant) : 0;
    let grantedTotal = answerXpGranted;
    for (const grant of completionXpGrants) {
      grantedTotal += this.grantXpOnce(attempt.studentId, grant);
    }

    const persistedAnswer = { ...answer, xpDelta: answerXpGranted };
    this.answers.set(answerKey, persistedAnswer);
    this.answersByClientAnswerId.set(idempotencyKey, persistedAnswer);
    this.recordActiveDay(attempt.studentId, answer.answeredAt);
    const persisted = cloneAttempt(attempt);
    persisted.xpEarned = attempt.xpEarned + grantedTotal;
    this.attempts.set(attempt.id, persisted);

    return { grantedTotal, answer: cloneAnswer(persistedAnswer) };
  }

  private grantXpOnce(studentId: string, grant: XpGrantRequest): number {
    if (grant.xpDelta <= 0) {
      return 0;
    }
    const key = `${studentId}:${grant.sourceType}:${grant.sourceId}`;
    if (this.grantedXpKeys.has(key)) {
      return 0;
    }
    this.grantedXpKeys.add(key);
    return grant.xpDelta;
  }

  private recordActiveDay(studentId: string, answeredAt: Date | undefined): void {
    const activityDate = toActivityDate(answeredAt ?? new Date());
    const key = `${studentId}:${activityDate}`;
    const activeDay = this.activeDays.get(key);
    if (!activeDay) {
      this.activeDays.set(key, { studentId, activityDate, answersCount: 1, isActiveDay: true });
      return;
    }
    activeDay.answersCount += 1;
    activeDay.isActiveDay = true;
  }
}

function clientAnswerKey(attemptId: string, clientAnswerId: string): string {
  return `${attemptId}:${clientAnswerId}`;
}

function cloneAttempt(attempt: AttemptRecord): AttemptRecord {
  return {
    ...attempt,
    exerciseIds: [...attempt.exerciseIds],
    answeredExerciseIds: [...attempt.answeredExerciseIds]
  };
}

function cloneAnswer(answer: AttemptAnswerRecord): AttemptAnswerRecord {
  return {
    ...answer,
    answeredAt: answer.answeredAt ? new Date(answer.answeredAt) : undefined
  };
}

function toActivityDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
