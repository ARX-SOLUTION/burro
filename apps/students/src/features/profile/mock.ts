// Mock adapter: no backend endpoint exists for the profile yet.
// Single seam — replace this module's fetch with an `api.get` call when the endpoint lands.

export interface ProfileData {
  activeDays: number;
  achievements: number;
}

export function fetchProfileMock(): Promise<ProfileData> {
  return Promise.resolve({
    activeDays: 7,
    achievements: 5
  });
}
