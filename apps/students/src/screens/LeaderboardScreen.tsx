import { LeaderboardPodium, LeaderboardRow, PinnedRankCard } from "../components";

export function LeaderboardScreen() {
  return <>
    <h2>Leaderboard</h2>
    <LeaderboardPodium/>
    <PinnedRankCard/>
    <LeaderboardRow rank={4} name="Maryam" xp={720}/>
    <LeaderboardRow rank={5} name="Yusuf" xp={690}/>
  </>;
}
