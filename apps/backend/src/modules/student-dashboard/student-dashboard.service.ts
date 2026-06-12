import { Inject, Injectable } from "@nestjs/common";
import type { StudentDashboardSummary } from "@burro/shared";
import { getLevelInfo } from "@burro/shared";
import { STUDENT_DASHBOARD_STORE } from "./student-dashboard.ports";
import type { StudentDashboardStorePort } from "./student-dashboard.ports";

@Injectable()
export class StudentDashboardService {
  constructor(
    @Inject(STUDENT_DASHBOARD_STORE) private readonly store: StudentDashboardStorePort
  ) {}

  async getSummary(studentId: string): Promise<StudentDashboardSummary> {
    const record = await this.store.getXpTotal(studentId);
    const totalXp = record?.totalXp ?? 0;
    return {
      totalXp,
      level: getLevelInfo(totalXp)
    };
  }
}
