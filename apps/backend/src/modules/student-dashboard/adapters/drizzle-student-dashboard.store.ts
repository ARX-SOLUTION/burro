import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { BurroDb } from "../../../db/client";
import { studentXpTotals } from "../../../db/schema";
import type { StudentDashboardStorePort, XpTotalRecord } from "../student-dashboard.ports";

@Injectable()
export class DrizzleStudentDashboardStore implements StudentDashboardStorePort {
  constructor(private readonly database: BurroDb) {}

  async getXpTotal(studentId: string): Promise<XpTotalRecord | undefined> {
    const [row] = await this.database
      .select({ totalXp: studentXpTotals.totalXp })
      .from(studentXpTotals)
      .where(eq(studentXpTotals.studentUserId, studentId))
      .limit(1);
    if (!row) {
      return undefined;
    }
    return { totalXp: row.totalXp };
  }
}
