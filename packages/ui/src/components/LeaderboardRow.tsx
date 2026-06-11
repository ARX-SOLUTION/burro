export function LeaderboardRow({ rank, name, xp }: { rank: number; name: string; xp: number }) { return <div className="rank-row"><span>#{rank} {name}</span><strong>{xp} XP</strong></div>; }
