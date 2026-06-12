import { describe, expect, it } from "vitest";
import { InMemoryStudentDashboardStore } from "./adapters/in-memory-student-dashboard.store";
import { StudentDashboardService } from "./student-dashboard.service";

function setup() {
  const store = new InMemoryStudentDashboardStore();
  const service = new StudentDashboardService(store);
  return { store, service };
}

describe("StudentDashboardService", () => {
  it("returns totalXp 0 and level 1 when the student has no XP row", async () => {
    const { service } = setup();
    const result = await service.getSummary("student-unknown");
    expect(result.totalXp).toBe(0);
    expect(result.level.level).toBe(1);
    expect(result.level.progressPercent).toBe(0);
  });

  it("returns the stored XP and derived level info", async () => {
    const { store, service } = setup();
    // 100 XP => level 2 threshold is xpForLevel(2) = 50*2*1 = 100 => just reached level 2
    store.setXp("student-1", 100);
    const result = await service.getSummary("student-1");
    expect(result.totalXp).toBe(100);
    expect(result.level.level).toBe(2);
  });

  it("computes level info fields consistently with getLevelInfo", async () => {
    const { store, service } = setup();
    store.setXp("student-2", 350);
    const result = await service.getSummary("student-2");
    expect(result.level.totalXp).toBe(350);
    // Level 3 threshold = 50*3*2 = 300; level 4 = 50*4*3 = 600
    expect(result.level.level).toBe(3);
    expect(result.level.currentLevelXp).toBe(300);
    expect(result.level.nextLevelXp).toBe(600);
    expect(result.level.progressPercent).toBe(Math.round(((350 - 300) / (600 - 300)) * 100));
  });
});
