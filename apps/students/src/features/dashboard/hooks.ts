import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@burro/shared";
import { fetchDashboardMock } from "./mock";

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.all,
    queryFn: fetchDashboardMock
  });
}
