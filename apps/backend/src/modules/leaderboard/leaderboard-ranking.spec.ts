import { describe, expect, it } from "vitest";
import type { LeaderboardRow } from "./leaderboard.ports";
import { periodWindowStart, rankEntries } from "./leaderboard-ranking";

describe("periodWindowStart", () => {
  const now = new Date("2026-06-13T15:30:00.000Z");

  it("returns null for all_time", () => {
    expect(periodWindowStart("all_time", now)).toBeNull();
  });

  it("returns midnight UTC today for daily", () => {
    expect(periodWindowStart("daily", now)?.toISOString()).toBe("2026-06-13T00:00:00.000Z");
  });

  it("returns midnight UTC 6 days ago for weekly (rolling 7-day window)", () => {
    expect(periodWindowStart("weekly", now)?.toISOString()).toBe("2026-06-07T00:00:00.000Z");
  });
});

describe("rankEntries identity projection", () => {
  function row(overrides: Partial<LeaderboardRow> & { studentUserId: string; score: number }): LeaderboardRow {
    return {
      telegramFirstName: "Name",
      telegramUsername: "handle",
      avatarUrl: "https://example/avatar.png",
      totalXp: overrides.score,
      completedModules: 1,
      activeDays: 2,
      ...overrides
    };
  }

  it("assigns 1-based ranks to already-sorted rows", () => {
    const rows = [row({ studentUserId: "a", score: 100 }), row({ studentUserId: "b", score: 50 })];
    const entries = rankEntries(rows, "b");
    expect(entries.map((entry) => entry.rank)).toEqual([1, 2]);
  });

  it("flags only the current student", () => {
    const rows = [row({ studentUserId: "a", score: 100 }), row({ studentUserId: "b", score: 50 })];
    const entries = rankEntries(rows, "b");
    expect(entries[0].isCurrentStudent).toBeUndefined();
    expect(entries[1].isCurrentStudent).toBe(true);
  });

  it("exposes only the public identity fields and nothing else", () => {
    const entry = rankEntries([row({ studentUserId: "a", score: 100 })], "a")[0];
    expect(Object.keys(entry).sort()).toEqual(
      [
        "activeDays",
        "avatarUrl",
        "completedModules",
        "isCurrentStudent",
        "rank",
        "score",
        "studentUserId",
        "telegramFirstName",
        "telegramUsername",
        "totalXp"
      ].sort()
    );
    // No full name / age / phone / parent fields leak through.
    expect(entry).not.toHaveProperty("telegramLastName");
    expect(entry).not.toHaveProperty("fullName");
    expect(entry).not.toHaveProperty("phone");
  });
});
