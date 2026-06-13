import { Injectable } from "@nestjs/common";
import type {
  AccuracyTotals,
  DailyXpRow,
  ModuleAccuracyRow,
  StatsStorePort
} from "../stats.ports";

@Injectable()
export class InMemoryStatsStore implements StatsStorePort {
  private dailyXp = new Map<string, DailyXpRow[]>();
  private accuracy = new Map<string, AccuracyTotals>();
  private activeDays = new Map<string, number>();
  private moduleAccuracy = new Map<string, ModuleAccuracyRow[]>();

  setDailyXp(studentId: string, rows: DailyXpRow[]): void {
    this.dailyXp.set(studentId, rows);
  }

  setAccuracy(studentId: string, totals: AccuracyTotals): void {
    this.accuracy.set(studentId, totals);
  }

  setActiveDays(studentId: string, days: number): void {
    this.activeDays.set(studentId, days);
  }

  setModuleAccuracy(studentId: string, rows: ModuleAccuracyRow[]): void {
    this.moduleAccuracy.set(studentId, rows);
  }

  async getDailyXp(studentId: string): Promise<DailyXpRow[]> {
    return this.dailyXp.get(studentId) ?? [];
  }

  async getAccuracyTotals(studentId: string): Promise<AccuracyTotals> {
    return this.accuracy.get(studentId) ?? { correct: 0, total: 0 };
  }

  async countActiveDays(studentId: string): Promise<number> {
    return this.activeDays.get(studentId) ?? 0;
  }

  async getModuleAccuracy(studentId: string): Promise<ModuleAccuracyRow[]> {
    return this.moduleAccuracy.get(studentId) ?? [];
  }
}
