import { Injectable } from "@nestjs/common";
import { AttemptAnswerRecord, AttemptRecord, AttemptsStorePort } from "../attempts.ports";

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

  async recordAnswer(answer: AttemptAnswerRecord): Promise<void> {
    this.answers.set(`${answer.attemptId}:${answer.exerciseId}`, { ...answer });
  }

  async grantXpOnce(studentId: string, sourceType: string, sourceId: string, xpDelta: number): Promise<number> {
    const key = `${studentId}:${sourceType}:${sourceId}`;
    if (this.grantedXpKeys.has(key)) {
      return 0;
    }
    this.grantedXpKeys.add(key);
    return xpDelta;
  }
}

function cloneAttempt(attempt: AttemptRecord): AttemptRecord {
  return {
    ...attempt,
    exerciseIds: [...attempt.exerciseIds],
    answeredExerciseIds: [...attempt.answeredExerciseIds]
  };
}
