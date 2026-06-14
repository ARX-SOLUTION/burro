import { useDashboardSummary } from "../dashboard/summary";

export function useLevel() {
  const query = useDashboardSummary();
  return {
    ...query,
    data: query.data?.level
  };
}
