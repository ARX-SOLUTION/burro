// Mock adapter: level is derived from XP total.
// When the backend XP endpoint lands, this will compute from real data.

import { getLevelInfo, type LevelInfo } from "@burro/shared";

export function fetchLevelInfoMock(): Promise<LevelInfo> {
  // Uses the same mock XP value as xp/mock.ts (1280)
  return Promise.resolve(getLevelInfo(1280));
}
