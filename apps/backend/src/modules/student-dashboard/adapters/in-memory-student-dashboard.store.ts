import { Injectable } from "@nestjs/common";
import type { StudentDashboardStorePort, XpTotalRecord } from "../student-dashboard.ports";

@Injectable()
export class InMemoryStudentDashboardStore implements StudentDashboardStorePort {
  private readonly totals = new Map<string, number>();

  /** Test helper: seed an XP total. */
  setXp(studentId: string, totalXp: number): void {
    this.totals.set(studentId, totalXp);
  }

  async getXpTotal(studentId: string): Promise<XpTotalRecord | undefined> {
    const totalXp = this.totals.get(studentId);
    if (totalXp === undefined) {
      return undefined;
    }
    return { totalXp };
  }
}
