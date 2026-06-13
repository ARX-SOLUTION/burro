import { Injectable } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import type { BurroDb } from "../../../db/client";
import { premiumGrants, premiumRequests } from "../../../db/schema";
import type { PremiumGrantRecord, PremiumStorePort } from "../premium.ports";

@Injectable()
export class DrizzlePremiumStore implements PremiumStorePort {
  constructor(private readonly database: BurroDb) {}

  async getLatestGrant(studentId: string): Promise<PremiumGrantRecord | undefined> {
    const [row] = await this.database
      .select({ status: premiumGrants.status, expiresAt: premiumGrants.expiresAt })
      .from(premiumGrants)
      .where(eq(premiumGrants.studentUserId, studentId))
      .orderBy(desc(premiumGrants.grantedAt))
      .limit(1);
    if (!row) {
      return undefined;
    }
    return { status: row.status, expiresAt: row.expiresAt };
  }

  async hasPendingRequest(studentId: string): Promise<boolean> {
    const [row] = await this.database
      .select({ id: premiumRequests.id })
      .from(premiumRequests)
      .where(and(eq(premiumRequests.studentUserId, studentId), eq(premiumRequests.status, "pending")))
      .limit(1);
    return Boolean(row);
  }

  async createPendingRequest(studentId: string): Promise<boolean> {
    // Idempotent-ish: do not create a second pending request for the student.
    if (await this.hasPendingRequest(studentId)) {
      return false;
    }
    await this.database.insert(premiumRequests).values({ studentUserId: studentId, status: "pending" });
    return true;
  }
}
