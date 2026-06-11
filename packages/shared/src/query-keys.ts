export const queryKeys = {
  attempts: {
    all: ["attempts"] as const,
    detail: (attemptId: string) => ["attempts", attemptId] as const
  },
  dashboard: {
    all: ["dashboard"] as const
  },
  leaderboard: {
    all: ["leaderboard"] as const
  },
  profile: {
    all: ["profile"] as const
  },
  xp: {
    total: ["xp", "total"] as const
  }
} as const;
