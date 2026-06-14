export interface DailyXpRow {
  /** ISO date (YYYY-MM-DD), UTC. */
  date: string;
  xp: number;
}

export interface AccuracyTotals {
  correct: number;
  total: number;
}

export interface ModuleAccuracyRow {
  moduleId: string;
  title: string;
  status: "not_started" | "in_progress" | "completed" | "locked" | null;
  correct: number;
  total: number;
}

export interface StatsStorePort {
  /** XP summed per day for the last `days` days; sparse (missing days absent). */
  getDailyXp(studentId: string, since: Date): Promise<DailyXpRow[]>;
  getAccuracyTotals(studentId: string): Promise<AccuracyTotals>;
  countActiveDays(studentId: string): Promise<number>;
  /** Per-module accuracy + progress for building review recommendations. */
  getModuleAccuracy(studentId: string): Promise<ModuleAccuracyRow[]>;
}

export const STATS_STORE = Symbol("STATS_STORE");
