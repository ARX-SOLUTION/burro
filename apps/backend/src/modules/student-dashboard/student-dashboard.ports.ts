export interface XpTotalRecord {
  totalXp: number;
}

export interface StudentDashboardStorePort {
  getXpTotal(studentId: string): Promise<XpTotalRecord | undefined>;
  countActiveDays(studentId: string): Promise<number>;
}

export const STUDENT_DASHBOARD_STORE = Symbol("STUDENT_DASHBOARD_STORE");
