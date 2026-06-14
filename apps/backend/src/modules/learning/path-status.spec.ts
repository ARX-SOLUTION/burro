import { describe, expect, it } from "vitest";
import type { ModuleProgressRecord } from "./learning.ports";
import { mapPathStatuses } from "./path-status";

function record(
  seq: number,
  progressStatus: ModuleProgressRecord["progressStatus"],
  overrides: Partial<ModuleProgressRecord> = {}
): ModuleProgressRecord {
  return {
    moduleId: `m${seq}`,
    sequenceNo: seq,
    title: `Module ${seq}`,
    description: "",
    estimatedMinutes: 10,
    premiumRequired: false,
    passScore: 80,
    heartsCount: 5,
    exerciseCount: 6,
    progressStatus,
    progressPercent: progressStatus === "completed" ? 100 : progressStatus === "in_progress" ? 33 : 0,
    finalQuizBestScore: null,
    finalQuizPassed: false,
    ...overrides
  };
}

describe("mapPathStatuses", () => {
  it("maps the seed demo layout to the five UI statuses", () => {
    // m1 completed, m2 in_progress, m3-5 not_started, m6 premium, m7-8 locked.
    const records: ModuleProgressRecord[] = [
      record(1, "completed"),
      record(2, "in_progress"),
      record(3, "not_started"),
      record(4, "not_started"),
      record(5, "not_started"),
      record(6, "locked", { premiumRequired: true }),
      record(7, "locked"),
      record(8, "locked")
    ];

    const result = mapPathStatuses(records, false);
    const byStatus = result.map((card) => card.status);

    expect(byStatus).toEqual([
      "completed",
      "current",
      "available",
      "available",
      "available",
      "premium_locked",
      "locked",
      "locked"
    ]);
  });

  it("trusts the stored status: not_started -> available, locked -> locked", () => {
    const records = [record(1, "completed"), record(2, "not_started"), record(3, "locked")];
    const result = mapPathStatuses(records, false);
    expect(result.map((card) => card.status)).toEqual(["completed", "available", "locked"]);
  });

  it("treats a missing progress row (null) as available", () => {
    const records = [record(1, null)];
    expect(mapPathStatuses(records, false)[0].status).toBe("available");
  });

  it("premium gate wins over progress and is lifted by an active grant", () => {
    const records = [record(1, "in_progress", { premiumRequired: true })];
    expect(mapPathStatuses(records, false)[0].status).toBe("premium_locked");
    // With an active grant the same module resolves by its progress instead.
    expect(mapPathStatuses(records, true)[0].status).toBe("current");
  });

  it("carries progressPercent and premiumRequired straight through", () => {
    const records = [record(1, "in_progress", { progressPercent: 42, premiumRequired: true })];
    const [card] = mapPathStatuses(records, true);
    expect(card.progressPercent).toBe(42);
    expect(card.premiumRequired).toBe(true);
  });
});
