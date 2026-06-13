import { Injectable } from "@nestjs/common";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import type { LeaderboardPeriod } from "@burro/shared";
import type { BurroDb } from "../../../db/client";
import {
  studentActiveDays,
  studentModuleProgress,
  studentXpTotals,
  users,
  xpTransactions
} from "../../../db/schema";
import type { LeaderboardRow, LeaderboardStorePort } from "../leaderboard.ports";
import { periodWindowStart } from "../leaderboard-ranking";

@Injectable()
export class DrizzleLeaderboardStore implements LeaderboardStorePort {
  constructor(private readonly database: BurroDb) {}

  async listRanked(period: LeaderboardPeriod): Promise<LeaderboardRow[]> {
    const windowStart = periodWindowStart(period);

    // Period-scoped score: all_time uses the materialized total; daily/weekly
    // sum xp_transactions within the rolling window.
    const periodScore = this.database
      .select({
        studentUserId: xpTransactions.studentUserId,
        score: sql<number>`coalesce(sum(${xpTransactions.xpDelta}), 0)::int`.as("period_score")
      })
      .from(xpTransactions)
      .where(windowStart ? gte(xpTransactions.createdAt, windowStart) : sql`true`)
      .groupBy(xpTransactions.studentUserId)
      .as("period_score_sub");

    const completed = this.database
      .select({
        studentUserId: studentModuleProgress.studentUserId,
        completedModules: sql<number>`count(*)::int`.as("completed_modules")
      })
      .from(studentModuleProgress)
      .where(eq(studentModuleProgress.status, "completed"))
      .groupBy(studentModuleProgress.studentUserId)
      .as("completed_sub");

    const active = this.database
      .select({
        studentUserId: studentActiveDays.studentUserId,
        activeDays: sql<number>`count(*)::int`.as("active_days")
      })
      .from(studentActiveDays)
      .where(eq(studentActiveDays.isActiveDay, true))
      .groupBy(studentActiveDays.studentUserId)
      .as("active_sub");

    const totalXpColumn = sql<number>`coalesce(${studentXpTotals.totalXp}, 0)::int`;
    const scoreColumn =
      period === "all_time"
        ? totalXpColumn
        : sql<number>`coalesce(${periodScore.score}, 0)::int`;

    const rows = await this.database
      .select({
        studentUserId: users.id,
        telegramFirstName: users.telegramFirstName,
        telegramUsername: users.telegramUsername,
        avatarUrl: users.telegramAvatarUrl,
        score: scoreColumn,
        totalXp: totalXpColumn,
        completedModules: sql<number>`coalesce(${completed.completedModules}, 0)::int`,
        activeDays: sql<number>`coalesce(${active.activeDays}, 0)::int`
      })
      .from(users)
      .leftJoin(studentXpTotals, eq(studentXpTotals.studentUserId, users.id))
      .leftJoin(periodScore, eq(periodScore.studentUserId, users.id))
      .leftJoin(completed, eq(completed.studentUserId, users.id))
      .leftJoin(active, eq(active.studentUserId, users.id))
      .where(and(eq(users.role, "student"), eq(users.status, "active")))
      .orderBy(desc(scoreColumn), users.id);

    return rows.map((row) => ({
      studentUserId: row.studentUserId,
      telegramFirstName: row.telegramFirstName,
      telegramUsername: row.telegramUsername ?? null,
      avatarUrl: row.avatarUrl ?? null,
      score: Number(row.score ?? 0),
      totalXp: Number(row.totalXp ?? 0),
      completedModules: Number(row.completedModules ?? 0),
      activeDays: Number(row.activeDays ?? 0)
    }));
  }
}
