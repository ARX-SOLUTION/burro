import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@burro/shared";
import type { StudentStatsSummaryDto } from "@burro/shared";
import { fetchStatsSummary } from "./api";

export function useStatsSummary() {
  return useQuery<StudentStatsSummaryDto>({
    queryKey: queryKeys.stats.summary,
    queryFn: fetchStatsSummary
  });
}
