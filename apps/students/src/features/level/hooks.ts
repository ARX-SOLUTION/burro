import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@burro/shared";
import { fetchLevelInfoMock } from "./mock";

export function useLevel() {
  return useQuery({
    queryKey: queryKeys.level.info,
    queryFn: fetchLevelInfoMock
  });
}
