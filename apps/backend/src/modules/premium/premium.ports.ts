export interface PremiumGrantRecord {
  status: "active" | "expired" | "revoked";
  expiresAt: Date | null;
}

export interface PremiumStorePort {
  /** Most recent grant for the student, if any. */
  getLatestGrant(studentId: string): Promise<PremiumGrantRecord | undefined>;
  hasPendingRequest(studentId: string): Promise<boolean>;
  /** Inserts a pending request. Returns false if one is already pending. */
  createPendingRequest(studentId: string): Promise<boolean>;
}

export const PREMIUM_STORE = Symbol("PREMIUM_STORE");
