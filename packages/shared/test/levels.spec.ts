import { describe, expect, it } from "vitest";
import {
  MAX_LEVEL,
  getLevelInfo,
  levelFromXp,
  xpForLevel,
  xpProgressInLevel
} from "../src/contracts/levels";

describe("level utilities", () => {
  it("computes levels at XP boundaries", () => {
    expect(levelFromXp(-1)).toBe(1);
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(299)).toBe(2);
    expect(levelFromXp(300)).toBe(3);
  });

  it("clamps negative XP in aggregate level info", () => {
    expect(getLevelInfo(-5)).toEqual({
      level: 1,
      totalXp: 0,
      currentLevelXp: 0,
      nextLevelXp: 100,
      progressPercent: 0
    });
  });

  it("caps levels at MAX_LEVEL", () => {
    expect(MAX_LEVEL).toBe(30);
    expect(xpForLevel(MAX_LEVEL)).toBe(43500);
    expect(levelFromXp(43499)).toBe(29);
    expect(levelFromXp(43500)).toBe(30);
    expect(levelFromXp(999999)).toBe(30);
  });

  it("rounds progress percent within the current level", () => {
    expect(xpProgressInLevel(150)).toEqual({
      current: 50,
      required: 200,
      percent: 25
    });
    expect(xpProgressInLevel(151)).toEqual({
      current: 51,
      required: 200,
      percent: 26
    });
  });

  it("returns max-level info as complete progress", () => {
    expect(getLevelInfo(43500)).toEqual({
      level: 30,
      totalXp: 43500,
      currentLevelXp: 43500,
      nextLevelXp: 43500,
      progressPercent: 100
    });
  });
});
