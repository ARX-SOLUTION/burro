export function LeaderboardRow({ rank, name, xp }: { rank: number; name: string; xp: number }) {
  return (
    <div className="rank-row">
      <span className="rank-row__index">{rank}</span>
      <span className="rank-row__avatar" aria-hidden="true">{name.slice(0, 1)}</span>
      <span className="rank-row__name">{name}</span>
      <strong>{xp} XP</strong>
    </div>
  );
}
