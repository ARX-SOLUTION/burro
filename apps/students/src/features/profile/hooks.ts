import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@burro/shared";
import { fetchProfileMock } from "./mock";

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile.all,
    queryFn: fetchProfileMock
  });
}
