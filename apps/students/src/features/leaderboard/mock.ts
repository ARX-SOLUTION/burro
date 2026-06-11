// Mock adapter: no backend endpoint exists for the leaderboard yet.
// Single seam — replace this module's fetch with an `api.get` call when the endpoint lands.
// Note: podium and pinnedRank values are currently also baked into the prop-less
// @burro/ui LeaderboardPodium and PinnedRankCard components; once those accept
// props, feed them from this data.

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
}

export interface LeaderboardData {
  podium: { rank: number; name: string }[];
  pinnedRank: { rank: number; xp: number };
  rows: LeaderboardEntry[];
}

export function fetchLeaderboardMock(): Promise<LeaderboardData> {
  return Promise.resolve({
    podium: [
      { rank: 1, name: "Amina" },
      { rank: 2, name: "Ali" },
      { rank: 3, name: "Omar" }
    ],
    pinnedRank: { rank: 12, xp: 540 },
    rows: [
      { rank: 4, name: "Maryam", xp: 720 },
      { rank: 5, name: "Yusuf", xp: 690 }
    ]
  });
}
