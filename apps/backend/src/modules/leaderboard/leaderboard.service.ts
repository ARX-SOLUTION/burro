import { Inject, Injectable } from "@nestjs/common";
import type { LeaderboardQuery, LeaderboardResponse } from "@burro/shared";
import { LEADERBOARD_STORE } from "./leaderboard.ports";
import type { LeaderboardStorePort } from "./leaderboard.ports";
import { findCurrentStudent, rankEntries } from "./leaderboard-ranking";

@Injectable()
export class LeaderboardService {
  constructor(@Inject(LEADERBOARD_STORE) private readonly store: LeaderboardStorePort) {}

  async getGlobal(studentId: string, query: LeaderboardQuery): Promise<LeaderboardResponse> {
    const rows = await this.store.listRanked(query.period);
    const ranked = rankEntries(rows, studentId);
    const entries = ranked.slice(0, query.limit);
    const currentStudentRank = findCurrentStudent(ranked, studentId);
    return {
      period: query.period,
      entries,
      // Pin the rank card only when the student is outside the visible slice.
      currentStudentRank,
      cursor: null
    };
  }

  async getMe(studentId: string, query: LeaderboardQuery): Promise<LeaderboardResponse> {
    const rows = await this.store.listRanked(query.period);
    const ranked = rankEntries(rows, studentId);
    const currentStudentRank = findCurrentStudent(ranked, studentId);
    return {
      period: query.period,
      entries: currentStudentRank ? [currentStudentRank] : [],
      currentStudentRank,
      cursor: null
    };
  }
}
