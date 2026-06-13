import { LeaderboardPodium, LeaderboardRow, PinnedRankCard } from "@burro/ui";
import { useLeaderboard } from "../features/leaderboard/hooks";

export function LeaderboardScreen() {
  const { data, isPending, isError } = useLeaderboard();

  if (isPending) {
    return <p>Yuklanmoqda...</p>;
  }
  if (isError || !data) {
    return <><h2>Leaderboard</h2><p>Ma’lumotni yuklab bo‘lmadi.</p></>;
  }

  return (
    <section className="leaderboard-screen">
      <header className="leaderboard-header">
        <p>Haftalik</p>
        <h1>Reyting</h1>
      </header>
      <LeaderboardPodium />
      <div className="rank-list">
        {data.rows.map((entry) => <LeaderboardRow key={entry.rank} rank={entry.rank} name={entry.name} xp={entry.xp} />)}
      </div>
      <PinnedRankCard />
    </section>
  );
}
