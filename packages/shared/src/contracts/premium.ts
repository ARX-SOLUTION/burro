/** Effective premium status presented to the student. */
export type PremiumStatus = "free" | "premium" | "grace";

export interface PremiumCenterDto {
  status: PremiumStatus;
  expiresAt: string | null;
  /** Whether a premium request is awaiting an admin decision. */
  pendingRequest: boolean;
}

export interface PremiumRequestResponse {
  status: "pending";
  created: boolean;
}
