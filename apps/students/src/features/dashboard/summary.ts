import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@burro/shared";
import type { StudentDashboardSummary } from "@burro/shared";
import { api } from "../../lib/api";

export function useDashboardSummary() {
  return useQuery<StudentDashboardSummary>({
    queryKey: queryKeys.dashboard.summary,
    queryFn: () => api.get<StudentDashboardSummary>("/student/dashboard")
  });
}
