import { useDashboardSummary } from "../dashboard/summary";

export function useXpTotal() {
  const query = useDashboardSummary();
  return {
    ...query,
    data: query.data
  };
}
