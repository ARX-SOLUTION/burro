import { Inject, Injectable } from "@nestjs/common";
import type { PremiumCenterDto, PremiumRequestResponse, PremiumStatus } from "@burro/shared";
import { PREMIUM_STORE } from "./premium.ports";
import type { PremiumGrantRecord, PremiumStorePort } from "./premium.ports";

@Injectable()
export class PremiumService {
  constructor(@Inject(PREMIUM_STORE) private readonly store: PremiumStorePort) {}

  async getCenter(studentId: string): Promise<PremiumCenterDto> {
    const [grant, pendingRequest] = await Promise.all([
      this.store.getLatestGrant(studentId),
      this.store.hasPendingRequest(studentId)
    ]);
    const status = this.resolveStatus(grant);
    return {
      status,
      expiresAt: grant?.expiresAt ? grant.expiresAt.toISOString() : null,
      pendingRequest
    };
  }

  async requestPremium(studentId: string): Promise<PremiumRequestResponse> {
    const created = await this.store.createPendingRequest(studentId);
    return { status: "pending", created };
  }

  /**
   * `premium` = an active, unexpired grant. `grace` = an active grant whose
   * expiry has just passed (a job has not revoked it yet) — access continues.
   * Everything else (expired/revoked/none) is `free`.
   */
  private resolveStatus(grant: PremiumGrantRecord | undefined): PremiumStatus {
    if (!grant || grant.status !== "active") {
      return "free";
    }
    if (grant.expiresAt && grant.expiresAt.getTime() <= Date.now()) {
      return "grace";
    }
    return "premium";
  }
}
