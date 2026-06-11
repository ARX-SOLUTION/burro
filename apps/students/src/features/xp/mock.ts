// Mock adapter: no backend endpoint exists for the XP total yet.
// Single seam — replace this module's fetch with an `api.get` call when the endpoint lands.

export interface XpTotalData {
  totalXp: number;
}

export function fetchXpTotalMock(): Promise<XpTotalData> {
  return Promise.resolve({ totalXp: 1280 });
}
