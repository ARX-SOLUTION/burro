import { Injectable } from "@nestjs/common";
import type { PremiumGrantRecord, PremiumStorePort } from "../premium.ports";

@Injectable()
export class InMemoryPremiumStore implements PremiumStorePort {
  private readonly grants = new Map<string, PremiumGrantRecord>();
  private readonly pending = new Set<string>();

  /** Test helper: seed a grant. */
  setGrant(studentId: string, grant: PremiumGrantRecord): void {
    this.grants.set(studentId, grant);
  }

  /** Test helper: seed an existing pending request. */
  setPending(studentId: string): void {
    this.pending.add(studentId);
  }

  async getLatestGrant(studentId: string): Promise<PremiumGrantRecord | undefined> {
    return this.grants.get(studentId);
  }

  async hasPendingRequest(studentId: string): Promise<boolean> {
    return this.pending.has(studentId);
  }

  async createPendingRequest(studentId: string): Promise<boolean> {
    if (this.pending.has(studentId)) {
      return false;
    }
    this.pending.add(studentId);
    return true;
  }
}
