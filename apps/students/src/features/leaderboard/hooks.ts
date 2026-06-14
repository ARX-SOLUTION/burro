import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@burro/shared";
import type { LeaderboardPeriod, LeaderboardResponse } from "@burro/shared";
import { api } from "../../lib/api";

/**
 * Fetches the global leaderboard top N with the pinned current-student rank.
 * Backed by `GET /leaderboards/global` (doc 13 §8). Identity projection is
 * narrow by contract (doc 12 §9.14): only telegramFirstName, telegramUsername,
 * avatarUrl, rank, score/XP, completedModules, activeDays.
 */
export function useLeaderboard(period: LeaderboardPeriod = "all_time", limit = 10) {
  return useQuery<LeaderboardResponse>({
    queryKey: [...queryKeys.leaderboard.all, period, limit] as const,
    queryFn: () => api.get<LeaderboardResponse>(`/leaderboards/global?period=${period}&limit=${limit}`)
  });
}
