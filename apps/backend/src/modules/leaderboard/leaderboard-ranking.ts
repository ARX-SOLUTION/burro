import type { LeaderboardEntryDto, LeaderboardPeriod } from "@burro/shared";
import type { LeaderboardRow } from "./leaderboard.ports";

/**
 * Start (inclusive) of the period window in UTC, or null for all_time.
 *  - daily: midnight UTC today.
 *  - weekly: midnight UTC 6 days ago (a rolling 7-day window including today).
 */
export function periodWindowStart(period: LeaderboardPeriod, now: Date = new Date()): Date | null {
  if (period === "all_time") {
    return null;
  }
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (period === "weekly") {
    start.setUTCDate(start.getUTCDate() - 6);
  }
  return start;
}

/**
 * Ranks pre-sorted rows (1-based) and projects only the public identity fields.
 * `rows` must already be sorted by score desc with a stable tiebreak.
 */
export function rankEntries(rows: LeaderboardRow[], currentStudentId: string): LeaderboardEntryDto[] {
  return rows.map((row, index) => projectEntry(row, index + 1, row.studentUserId === currentStudentId));
}

function projectEntry(row: LeaderboardRow, rank: number, isCurrentStudent: boolean): LeaderboardEntryDto {
  // Identity projection is deliberately narrow (docs 05/12): only Telegram first
  // name, username, avatar, rank, score/XP, completed modules, active days.
  const entry: LeaderboardEntryDto = {
    rank,
    studentUserId: row.studentUserId,
    telegramFirstName: row.telegramFirstName,
    telegramUsername: row.telegramUsername,
    avatarUrl: row.avatarUrl,
    score: row.score,
    totalXp: row.totalXp,
    completedModules: row.completedModules,
    activeDays: row.activeDays
  };
  if (isCurrentStudent) {
    entry.isCurrentStudent = true;
  }
  return entry;
}

/**
 * Picks the current student's ranked entry, or null if they are not on the
 * board. Used to pin the rank card when they fall outside the limited top list.
 */
export function findCurrentStudent(
  entries: LeaderboardEntryDto[],
  currentStudentId: string
): LeaderboardEntryDto | null {
  return entries.find((entry) => entry.studentUserId === currentStudentId) ?? null;
}
