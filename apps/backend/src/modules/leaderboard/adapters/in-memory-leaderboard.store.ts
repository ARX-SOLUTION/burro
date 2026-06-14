import { Injectable } from "@nestjs/common";
import type { LeaderboardPeriod } from "@burro/shared";
import type { LeaderboardRow, LeaderboardStorePort } from "../leaderboard.ports";

@Injectable()
export class InMemoryLeaderboardStore implements LeaderboardStorePort {
  private readonly byPeriod = new Map<LeaderboardPeriod, LeaderboardRow[]>();

  /** Test helper: seed ranked rows for a period (sorted by the caller). */
  setRows(period: LeaderboardPeriod, rows: LeaderboardRow[]): void {
    this.byPeriod.set(period, rows);
  }

  async listRanked(period: LeaderboardPeriod): Promise<LeaderboardRow[]> {
    return this.byPeriod.get(period) ?? [];
  }
}
