import { Injectable } from "@nestjs/common";
import { and, count, eq } from "drizzle-orm";
import type { BurroDb } from "../../../db/client";
import { studentActiveDays, studentXpTotals } from "../../../db/schema";
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

  async countActiveDays(studentId: string): Promise<number> {
    const [row] = await this.database
      .select({ activeDays: count() })
      .from(studentActiveDays)
      .where(and(eq(studentActiveDays.studentUserId, studentId), eq(studentActiveDays.isActiveDay, true)));
    return row?.activeDays ?? 0;
  }
}
