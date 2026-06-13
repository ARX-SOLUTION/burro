import { describe, expect, it } from "vitest";
import { buildRecommendations, buildXpSeries, seriesWindowStart } from "./stats-series";
import type { ModuleAccuracyRow } from "./stats.ports";

describe("buildXpSeries", () => {
  const now = new Date("2026-06-13T10:00:00.000Z");

  it("always returns 7 points, oldest first, ending today", () => {
    const series = buildXpSeries([], now);
    expect(series).toHaveLength(7);
    expect(series[0].date).toBe("2026-06-07");
    expect(series[6].date).toBe("2026-06-13");
    expect(series.every((point) => point.xp === 0)).toBe(true);
  });

  it("zero-fills gaps and slots sparse rows into their day", () => {
    const series = buildXpSeries(
      [
        { date: "2026-06-13", xp: 40 },
        { date: "2026-06-10", xp: 25 }
      ],
      now
    );
    const byDate = Object.fromEntries(series.map((point) => [point.date, point.xp]));
    expect(byDate["2026-06-13"]).toBe(40);
    expect(byDate["2026-06-10"]).toBe(25);
    expect(byDate["2026-06-11"]).toBe(0);
  });
});

describe("seriesWindowStart", () => {
  it("is midnight UTC 6 days before today", () => {
    expect(seriesWindowStart(new Date("2026-06-13T10:00:00.000Z")).toISOString()).toBe("2026-06-07T00:00:00.000Z");
  });
});

describe("buildRecommendations", () => {
  function row(overrides: Partial<ModuleAccuracyRow> & { moduleId: string }): ModuleAccuracyRow {
    return { title: overrides.moduleId, status: "completed", correct: 0, total: 0, ...overrides };
  }

  it("excludes locked and untouched modules", () => {
    const recs = buildRecommendations([
      row({ moduleId: "locked", status: "locked" }),
      row({ moduleId: "untouched", status: null }),
      row({ moduleId: "untouched2", status: "not_started" })
    ]);
    expect(recs).toHaveLength(0);
  });

  it("orders incomplete modules before weak completed ones, then by accuracy", () => {
    const recs = buildRecommendations([
      row({ moduleId: "weak", status: "completed", correct: 5, total: 10 }),
      row({ moduleId: "incomplete", status: "in_progress", correct: 1, total: 4 }),
      row({ moduleId: "strong", status: "completed", correct: 9, total: 10 })
    ]);
    expect(recs.map((rec) => rec.moduleId)).toEqual(["incomplete", "weak", "strong"]);
    expect(recs[0].reason).toBe("incomplete");
    expect(recs[1].reason).toBe("low_accuracy");
    expect(recs[1].accuracy).toBe(50);
  });

  it("caps the list at the limit", () => {
    const rows = Array.from({ length: 5 }, (_, index) =>
      row({ moduleId: `m${index}`, status: "completed", correct: index, total: 10 })
    );
    expect(buildRecommendations(rows, 3)).toHaveLength(3);
  });
});
