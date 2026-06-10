import { Injectable } from "@nestjs/common";
import { AttemptRecord, AttemptsStorePort } from "../attempts.ports";

// TODO: replace with Drizzle adapter over attempts/attempt_answers/xp_transactions (docs/03-DATABASE_SCHEMA.md).
@Injectable()
export class InMemoryAttemptsStore implements AttemptsStorePort {
  private readonly attempts = new Map<string, AttemptRecord>();
  private readonly grantedXpKeys = new Set<string>();

  getAttempt(id: string): AttemptRecord | undefined {
    return this.attempts.get(id);
  }

  saveAttempt(attempt: AttemptRecord): void {
    this.attempts.set(attempt.id, attempt);
  }

  grantXpOnce(studentId: string, sourceType: string, sourceId: string, xpDelta: number): number {
    const key = `${studentId}:${sourceType}:${sourceId}`;
    if (this.grantedXpKeys.has(key)) {
      return 0;
    }
    this.grantedXpKeys.add(key);
    return xpDelta;
  }
}
