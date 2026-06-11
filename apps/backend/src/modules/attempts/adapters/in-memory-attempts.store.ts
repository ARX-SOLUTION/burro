import { Injectable } from "@nestjs/common";
import {
  ApplyAnswerInput,
  ApplyAnswerResult,
  AttemptAnswerRecord,
  AttemptRecord,
  AttemptsStorePort,
  XpGrantRequest
} from "../attempts.ports";

@Injectable()
export class InMemoryAttemptsStore implements AttemptsStorePort {
  private readonly attempts = new Map<string, AttemptRecord>();
  private readonly answers = new Map<string, AttemptAnswerRecord>();
  private readonly grantedXpKeys = new Set<string>();

  async getAttempt(id: string): Promise<AttemptRecord | undefined> {
    const attempt = this.attempts.get(id);
    return attempt ? cloneAttempt(attempt) : undefined;
  }

  async saveAttempt(attempt: AttemptRecord): Promise<void> {
    this.attempts.set(attempt.id, cloneAttempt(attempt));
  }

  async applyAnswer(input: ApplyAnswerInput): Promise<ApplyAnswerResult> {
    const { attempt, answer, answerXpGrant, completionXpGrants } = input;
    const answerXpGranted = answerXpGrant ? this.grantXpOnce(attempt.studentId, answerXpGrant) : 0;
    let grantedTotal = answerXpGranted;
    for (const grant of completionXpGrants) {
      grantedTotal += this.grantXpOnce(attempt.studentId, grant);
    }

    this.answers.set(`${answer.attemptId}:${answer.exerciseId}`, { ...answer, xpDelta: answerXpGranted });
    const persisted = cloneAttempt(attempt);
    persisted.xpEarned = attempt.xpEarned + grantedTotal;
    this.attempts.set(attempt.id, persisted);

    return { grantedTotal, answerXpGranted };
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
}

function cloneAttempt(attempt: AttemptRecord): AttemptRecord {
  return {
    ...attempt,
    exerciseIds: [...attempt.exerciseIds],
    answeredExerciseIds: [...attempt.answeredExerciseIds]
  };
}
