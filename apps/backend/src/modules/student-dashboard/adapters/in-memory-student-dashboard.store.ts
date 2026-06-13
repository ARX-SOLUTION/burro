import { Injectable } from "@nestjs/common";
import type { StudentDashboardStorePort, XpTotalRecord } from "../student-dashboard.ports";

@Injectable()
export class InMemoryStudentDashboardStore implements StudentDashboardStorePort {
  private readonly totals = new Map<string, number>();
  private readonly activeDays = new Map<string, number>();

  /** Test helper: seed an XP total. */
  setXp(studentId: string, totalXp: number): void {
    this.totals.set(studentId, totalXp);
  }

  /** Test helper: seed an active-day count. */
  setActiveDays(studentId: string, activeDays: number): void {
    this.activeDays.set(studentId, activeDays);
  }

  async getXpTotal(studentId: string): Promise<XpTotalRecord | undefined> {
    const totalXp = this.totals.get(studentId);
    if (totalXp === undefined) {
      return undefined;
    }
    return { totalXp };
  }

  async countActiveDays(studentId: string): Promise<number> {
    return this.activeDays.get(studentId) ?? 0;
  }
}
