import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@burro/shared";
import { fetchXpTotalMock } from "./mock";

export function useXpTotal() {
  return useQuery({
    queryKey: queryKeys.xp.total,
    queryFn: fetchXpTotalMock
  });
}
