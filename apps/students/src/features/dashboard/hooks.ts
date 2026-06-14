import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@burro/shared";
import { fetchDashboard } from "./api";

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.all,
    queryFn: fetchDashboard
  });
}
