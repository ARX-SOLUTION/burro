// Mock adapter: no backend endpoint exists for the dashboard yet.
// Single seam — replace this module's fetch with an `api.get` call when the endpoint lands.

export interface DashboardModuleSummary {
  id: string;
  title: string;
  subtitle: string;
}

export interface DashboardData {
  studentName: string;
  primaryModuleId: string;
  modules: DashboardModuleSummary[];
}

export function fetchDashboardMock(): Promise<DashboardData> {
  return Promise.resolve({
    studentName: "Amina",
    primaryModuleId: "module-letters-1",
    modules: [
      { id: "module-letters-1", title: "Harflar", subtitle: "8/12 yakunlandi" },
      { id: "module-pronunciation-1", title: "Talaffuz", subtitle: "3 kun streak" }
    ]
  });
}
