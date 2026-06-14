import { z } from "zod";

export const leaderboardPeriodSchema = z.enum(["daily", "weekly", "all_time"]);
export type LeaderboardPeriod = z.infer<typeof leaderboardPeriodSchema>;

export const leaderboardQuerySchema = z.object({
  period: leaderboardPeriodSchema.default("all_time"),
  limit: z.coerce.number().int().min(1).max(100).default(10)
});
export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;

/**
 * Identity projection is intentionally narrow: only Telegram first name,
 * username, avatar, rank, score/XP, completed modules, and active days are
 * public. Never full name, age, phone, or parent data (docs 05/12).
 */
export interface LeaderboardEntryDto {
  rank: number;
  studentUserId: string;
  telegramFirstName: string;
  telegramUsername: string | null;
  avatarUrl: string | null;
  score: number;
  totalXp: number;
  completedModules: number;
  activeDays: number;
  isCurrentStudent?: boolean;
}

export interface LeaderboardResponse {
  period: LeaderboardPeriod;
  entries: LeaderboardEntryDto[];
  currentStudentRank: LeaderboardEntryDto | null;
  cursor: string | null;
}
