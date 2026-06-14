import type { LeaderboardEntryDto } from "@burro/shared";
import { useLeaderboard } from "../features/leaderboard/hooks";

/**
 * Leaderboard (doc 12 §9.14, ref 01-leaderboard.png).
 *
 * Identity projection is intentionally narrow: only telegramFirstName,
 * telegramUsername, avatarUrl, rank, score/XP. Never full name, age, phone,
 * or parent data.
 */
export function LeaderboardScreen() {
  const { data, isPending, isError } = useLeaderboard("all_time", 10);

  if (isPending) {
    return (
      <section className="leaderboard-screen" aria-busy="true">
        <header className="leaderboard-screen__header"><h1>Leaderboard</h1></header>
        <p className="leaderboard-screen__status">Yuklanmoqda…</p>
      </section>
    );
  }
  if (isError || !data) {
    return (
      <section className="leaderboard-screen" role="alert">
        <header className="leaderboard-screen__header"><h1>Leaderboard</h1></header>
        <p className="leaderboard-screen__status">Ma'lumotni yuklab bo'lmadi.</p>
      </section>
    );
  }

  const top = data.entries.slice(0, 3);
  const rest = data.entries.slice(3);
  const pinned = data.currentStudentRank;
  const pinnedAlreadyInList = pinned ? data.entries.some((e) => e.studentUserId === pinned.studentUserId) : false;
  const showPinned = pinned && !pinnedAlreadyInList;

  return (
    <section className="leaderboard-screen">
      <header className="leaderboard-screen__header">
        <h1>Leaderboard</h1>
      </header>

      {top.length > 0 && <Podium entries={top} />}

      {rest.length > 0 && (
        <ol className="leaderboard-list" aria-label="Ro'yxat">
          {rest.map((entry) => (
            <li key={entry.studentUserId}>
              <RankRow entry={entry} />
            </li>
          ))}
        </ol>
      )}

      {showPinned && pinned && (
        <div className="leaderboard-pinned" aria-label="Sizning o'rningiz">
          <RankRow entry={pinned} variant="pinned" youLabel="Siz" />
        </div>
      )}
    </section>
  );
}

function Podium({ entries }: { entries: LeaderboardEntryDto[] }) {
  const byRank = new Map(entries.map((e) => [e.rank, e]));
  const second = byRank.get(2);
  const first = byRank.get(1);
  const third = byRank.get(3);

  return (
    <div className="leaderboard-podium" aria-label="Eng yuqori uchta o'rin">
      {second && <PodiumColumn entry={second} place={2} height="short" />}
      {first && <PodiumColumn entry={first} place={1} height="tall" />}
      {third && <PodiumColumn entry={third} place={3} height="short" />}
    </div>
  );
}

function PodiumColumn({ entry, place, height }: { entry: LeaderboardEntryDto; place: 1 | 2 | 3; height: "tall" | "short" }) {
  return (
    <article className={`podium-col podium-col--${place} podium-col--${height}`}>
      {place === 1 && <span className="podium-col__crown" aria-hidden="true">👑</span>}
      <span className="podium-col__rank">#{place}</span>
      <Avatar entry={entry} size={place === 1 ? "lg" : "md"} ringed />
      <strong className="podium-col__name" title={entry.telegramFirstName}>{entry.telegramFirstName}</strong>
      <span className="podium-col__class">{classLabel(entry)}</span>
      <span className="podium-col__xp">{formatXp(entry.totalXp)}</span>
    </article>
  );
}

function RankRow({ entry, variant, youLabel }: { entry: LeaderboardEntryDto; variant?: "pinned"; youLabel?: string }) {
  const classes = ["leaderboard-row", variant === "pinned" ? "leaderboard-row--pinned" : ""].filter(Boolean).join(" ");
  return (
    <div className={classes}>
      <span className="leaderboard-row__rank">#{entry.rank}</span>
      <Avatar entry={entry} size="sm" />
      <div className="leaderboard-row__id">
        <strong className="leaderboard-row__name" title={entry.telegramFirstName}>
          {entry.telegramFirstName}
          {youLabel && <span className="leaderboard-row__you">{youLabel}</span>}
        </strong>
        <span className="leaderboard-row__class">{classLabel(entry)}</span>
      </div>
      <span className="leaderboard-row__xp">{formatXp(entry.totalXp)}</span>
    </div>
  );
}

function Avatar({ entry, size, ringed }: { entry: LeaderboardEntryDto; size: "sm" | "md" | "lg"; ringed?: boolean }) {
  const classes = ["leaderboard-avatar", `leaderboard-avatar--${size}`, ringed ? "leaderboard-avatar--ringed" : ""].filter(Boolean).join(" ");
  if (entry.avatarUrl) {
    return <img className={classes} src={entry.avatarUrl} alt="" loading="lazy" />;
  }
  return <span className={classes} aria-hidden="true">{entry.telegramFirstName.slice(0, 1).toUpperCase()}</span>;
}

/**
 * Class/group label is optional in the DTO contract (doc 12 §9.14). The current
 * `LeaderboardEntryDto` does not carry it yet; render an empty placeholder so
 * the row keeps two lines but never invents a value.
 */
function classLabel(_entry: LeaderboardEntryDto): string {
  return "";
}

function formatXp(xp: number): string {
  return `${xp.toLocaleString("uz-Latn-UZ")} XP`;
}
