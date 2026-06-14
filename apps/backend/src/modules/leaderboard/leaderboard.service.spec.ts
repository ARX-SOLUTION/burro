import { describe, expect, it } from "vitest";
import type { LeaderboardPeriod } from "@burro/shared";
import { InMemoryLeaderboardStore } from "./adapters/in-memory-leaderboard.store";
import type { LeaderboardRow } from "./leaderboard.ports";
import { LeaderboardService } from "./leaderboard.service";

function rows(): LeaderboardRow[] {
  // 6 students sorted by score desc; "demo" sits 6th, outside a top-3 limit.
  return ["a", "b", "c", "d", "e", "demo"].map((id, index) => ({
    studentUserId: id,
    telegramFirstName: id,
    telegramUsername: id,
    avatarUrl: null,
    score: 600 - index * 100,
    totalXp: 600 - index * 100,
    completedModules: index,
    activeDays: index
  }));
}

function setup(period: LeaderboardPeriod = "all_time") {
  const store = new InMemoryLeaderboardStore();
  store.setRows(period, rows());
  return new LeaderboardService(store);
}

describe("LeaderboardService", () => {
  it("limits entries but pins the current student's rank when outside the limit", async () => {
    const service = setup();
    const result = await service.getGlobal("demo", { period: "all_time", limit: 3 });
    expect(result.entries).toHaveLength(3);
    expect(result.entries.map((entry) => entry.studentUserId)).toEqual(["a", "b", "c"]);
    expect(result.currentStudentRank?.studentUserId).toBe("demo");
    expect(result.currentStudentRank?.rank).toBe(6);
    expect(result.currentStudentRank?.isCurrentStudent).toBe(true);
  });

  it("still returns the current student rank when they are inside the limit", async () => {
    const service = setup();
    const result = await service.getGlobal("a", { period: "all_time", limit: 3 });
    expect(result.currentStudentRank?.studentUserId).toBe("a");
    expect(result.currentStudentRank?.rank).toBe(1);
  });

  it("/me returns a single-entry list with the pinned rank", async () => {
    const service = setup();
    const result = await service.getMe("demo", { period: "all_time", limit: 10 });
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].studentUserId).toBe("demo");
    expect(result.currentStudentRank?.rank).toBe(6);
  });

  it("returns a null rank for a student not on the board", async () => {
    const service = setup();
    const result = await service.getMe("ghost", { period: "all_time", limit: 10 });
    expect(result.entries).toHaveLength(0);
    expect(result.currentStudentRank).toBeNull();
  });
});
