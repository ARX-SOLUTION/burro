import type { LeaderboardPeriod } from "@burro/shared";

/** One student's aggregate score plus the public identity projection. */
export interface LeaderboardRow {
  studentUserId: string;
  telegramFirstName: string;
  telegramUsername: string | null;
  avatarUrl: string | null;
  /** Period-scoped score (all_time = total XP). */
  score: number;
  totalXp: number;
  completedModules: number;
  activeDays: number;
}

export interface LeaderboardStorePort {
  /**
   * All active students with their period-scoped score and identity projection,
   * ordered by score descending then studentUserId for a stable tiebreak.
   */
  listRanked(period: LeaderboardPeriod): Promise<LeaderboardRow[]>;
}

export const LEADERBOARD_STORE = Symbol("LEADERBOARD_STORE");
