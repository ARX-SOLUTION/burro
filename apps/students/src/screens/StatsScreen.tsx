import { useNavigate } from "@tanstack/react-router";
import { AppBackground } from "@burro/ui";
import type { DailyXpPoint, ReviewRecommendationDto } from "@burro/shared";
import { useStatsSummary } from "../features/stats/hooks";

// Uzbek day-of-week labels, Monday-first, matching the figma reference (Du/Se/Ch/Pa/Ju/Sha/Yak).
const DAY_LABELS_UZ_MON_FIRST = ["Du", "Se", "Ch", "Pa", "Ju", "Sha", "Yak"];

function isoDayLabel(date: string): string {
  // 0=Sun .. 6=Sat from getUTCDay → map to Mon-first index.
  const day = new Date(date).getUTCDay();
  const monFirstIndex = (day + 6) % 7;
  return DAY_LABELS_UZ_MON_FIRST[monFirstIndex];
}

function XpBarChart({ series }: { series: ReadonlyArray<DailyXpPoint> }) {
  const max = Math.max(1, ...series.map((point) => point.xp));
  return (
    <div className="xp-chart" role="img" aria-label="So'nggi 7 kun XP grafigi">
      <ol className="xp-chart__bars">
        {series.map((point, index) => {
          const heightPercent = Math.max(4, Math.round((point.xp / max) * 100));
          const isHighest = point.xp === max && point.xp > 0;
          return (
            <li key={point.date} className="xp-chart__col">
              <span className="xp-chart__value">{point.xp} XP</span>
              <span
                className={`xp-chart__bar${isHighest ? " xp-chart__bar--peak" : ""}`}
                style={{ height: `${heightPercent}%` }}
              />
              <span className="xp-chart__label">{isoDayLabel(point.date) ?? DAY_LABELS_UZ_MON_FIRST[index]}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function RecommendationsList({ items }: { items: ReadonlyArray<ReviewRecommendationDto> }) {
  if (items.length === 0) {
    return (
      <p className="stats-recommendations__empty">
        Hozircha takrorlash uchun tavsiya yo‘q. Yangi modullarni o‘rganishda davom eting.
      </p>
    );
  }
  return (
    <ul className="stats-recommendations">
      {items.map((item, index) => (
        <li key={item.moduleId} className="stats-recommendation">
          <span className="stats-recommendation__eyebrow">{index + 2}-modul</span>
          <strong className="stats-recommendation__title">{item.title}</strong>
          <span
            className={`stats-recommendation__tag stats-recommendation__tag--${item.reason}`}
            aria-label={item.reason === "low_accuracy" ? `Aniqlik ${item.accuracy}%` : "Yakunlanmagan"}
          >
            {item.reason === "low_accuracy" ? `${item.accuracy}%` : "Yakunlanmagan"}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function StatsScreen() {
  const navigate = useNavigate();
  const { data, isPending, isError } = useStatsSummary();

  const body = (() => {
    if (isPending) {
      return <p className="stats-screen__state">Yuklanmoqda...</p>;
    }
    if (isError || !data) {
      return (
        <div className="stats-screen__state stats-screen__state--error" role="alert">
          <h2>Xatolik</h2>
          <p>Statistikani yuklab bo‘lmadi.</p>
        </div>
      );
    }

    return (
      <>
        <header className="stats-screen__header">
          <button
            type="button"
            className="stats-screen__back"
            onClick={() => navigate({ to: "/profile" })}
            aria-label="Orqaga"
          >
            <span className="stats-screen__back-arrow" aria-hidden="true" />
          </button>
          <h1>Statistika</h1>
        </header>

        <section className="stats-card" aria-labelledby="stats-week-title">
          <h2 id="stats-week-title">So'nggi 7 kun (XP)</h2>
          <XpBarChart series={data.xpSeries} />
        </section>

        <div className="stats-row">
          <article className="stats-mini stats-mini--accuracy">
            <strong>{data.overallAccuracy}%</strong>
            <span>Aniqlik</span>
          </article>
          <article className="stats-mini stats-mini--days">
            <strong>{data.activeDays}</strong>
            <span>Aktiv kun</span>
          </article>
        </div>

        <section className="stats-card" aria-labelledby="stats-recommend-title">
          <h2 id="stats-recommend-title">Qayta o'rganishga tavsiya</h2>
          <RecommendationsList items={data.recommendations} />
        </section>
      </>
    );
  })();

  return (
    <div className="stats-screen-shell">
      <AppBackground variant="app">
        <section className="stats-screen">{body}</section>
      </AppBackground>
    </div>
  );
}
