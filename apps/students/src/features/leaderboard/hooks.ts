import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@burro/shared";
import { fetchLeaderboardMock } from "./mock";

export function useLeaderboard() {
  return useQuery({
    queryKey: queryKeys.leaderboard.all,
    queryFn: fetchLeaderboardMock
  });
}
