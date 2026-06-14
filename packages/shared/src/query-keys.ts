export const queryKeys = {
  attempts: {
    all: ["attempts"] as const,
    detail: (attemptId: string) => ["attempts", attemptId] as const
  },
  dashboard: {
    all: ["dashboard"] as const,
    summary: ["dashboard", "summary"] as const
  },
  leaderboard: {
    all: ["leaderboard"] as const
  },
  profile: {
    all: ["profile"] as const
  },
  stats: {
    all: ["stats"] as const,
    summary: ["stats", "summary"] as const
  }
} as const;
