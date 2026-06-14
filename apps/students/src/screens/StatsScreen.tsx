import { useNavigate } from "@tanstack/react-router";
import { AppBackground } from "@burro/ui";
import type { DailyXpPoint, ReviewRecommendationDto } from "@burro/shared";
import { useStatsSummary } from "../features/stats/hooks";
import "./StatsScreen.css";

// Uzbek day-of-week labels, Monday-first, matching the figma reference (Du/Se/Ch/Pa/Ju/Sha/Yak).
const DAY_LABELS_UZ_MON_FIRST = ["Du", "Se", "Ch", "Pa", "Ju", "Sha", "Yak"];

function isoDayLabel(date: string): string {
  // 0=Sun .. 6=Sat from getUTCDay → map to Mon-first index.
  const day = new Date(date).getUTCDay();
  const monFirstIndex = (day + 6) % 7;
  return DAY_LABELS_UZ_MON_FIRST[monFirstIndex];
}

function formatModuleEyebrow(item: ReviewRecommendationDto, index: number): string {
  const source = `${item.title} ${item.moduleId}`;
  const match = source.match(/\b(?:modul|module|модуль)[\s:-]*(\d+)\b/i) ?? source.match(/\b(\d+)\b/);
  return match?.[1] ? `${match[1]}-modul` : `Tavsiya ${index + 1}`;
}

function StatusBar() {
  return (
    <div className="stats17-status" aria-hidden="true">
      <span className="stats17-status__time">9:41</span>
      <span className="stats17-status__icons">
        <svg className="stats17-status__signal" viewBox="0 0 18 12" focusable="false">
          <rect x="1" y="7" width="3" height="4" rx="1" />
          <rect x="6" y="5" width="3" height="6" rx="1" />
          <rect x="11" y="2" width="3" height="9" rx="1" />
          <rect x="16" y="0" width="2" height="11" rx="1" />
        </svg>
        <svg className="stats17-status__wifi" viewBox="0 0 16 12" focusable="false">
          <path d="M1.2 3.6C5.1.4 10.9.4 14.8 3.6" />
          <path d="M4 6.4c2.3-1.8 5.7-1.8 8 0" />
          <path d="M6.7 9.1c.8-.6 1.8-.6 2.6 0" />
        </svg>
        <svg className="stats17-status__battery" viewBox="0 0 25 12" focusable="false">
          <rect x="1" y="1.5" width="20" height="9" rx="2.5" />
          <rect x="3" y="3.5" width="16" height="5" rx="1.2" />
          <rect x="22" y="4" width="2" height="4" rx="1" />
        </svg>
      </span>
    </div>
  );
}

function XpBarChart({ series }: { series: ReadonlyArray<DailyXpPoint> }) {
  const max = Math.max(1, ...series.map((point) => point.xp));
  return (
    <div className="stats17-chart" role="img" aria-label="So'nggi 7 kun XP grafigi">
      <ol className="stats17-chart__bars">
        {series.map((point, index) => {
          const barHeight = point.xp > 0 ? Math.max(6, Math.round((point.xp / max) * 134)) : 0;
          const isHighest = point.xp === max && point.xp > 0;
          return (
            <li key={point.date} className="stats17-chart__col">
              <span className={`stats17-chart__value${isHighest ? " stats17-chart__value--peak" : ""}`}>
                {point.xp} XP
              </span>
              <span
                className={`stats17-chart__bar${isHighest ? " stats17-chart__bar--peak" : ""}`}
                style={{ height: `${barHeight}px` }}
              />
              <span className="stats17-chart__label">{isoDayLabel(point.date) ?? DAY_LABELS_UZ_MON_FIRST[index]}</span>
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
      <p className="stats17-reviews__empty">
        Hozircha takrorlash uchun tavsiya yo'q. Yangi modullarni o'rganishda davom eting.
      </p>
    );
  }
  return (
    <ul className="stats17-reviews">
      {items.map((item, index) => (
        <li
          key={item.moduleId}
          className="stats17-review"
          aria-label={
            item.reason === "low_accuracy"
              ? `${item.title}, aniqlik ${item.accuracy}%`
              : `${item.title}, yakunlanmagan`
          }
        >
          <span className="stats17-review__eyebrow">{formatModuleEyebrow(item, index)}</span>
          <strong className="stats17-review__title">{item.title}</strong>
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
      return <p className="stats17-state">Yuklanmoqda...</p>;
    }
    if (isError || !data) {
      return (
        <div className="stats17-state stats17-state--error" role="alert">
          <h2>Xatolik</h2>
          <p>Statistikani yuklab bo'lmadi.</p>
        </div>
      );
    }

    return (
      <>
        <section className="stats17-card stats17-card--chart" aria-labelledby="stats-week-title">
          <h2 id="stats-week-title" className="stats17-card__title">
            So'nggi 7 kun (XP)
          </h2>
          <XpBarChart series={data.xpSeries} />
        </section>

        <div className="stats17-mini-grid">
          <article className="stats17-mini-card">
            <strong className="stats17-mini-card__value">{data.overallAccuracy}%</strong>
            <span className="stats17-mini-card__label">Aniqlik</span>
          </article>
          <article className="stats17-mini-card">
            <strong className="stats17-mini-card__value">{data.activeDays}</strong>
            <span className="stats17-mini-card__label">Kunlik streak</span>
          </article>
        </div>

        <section className="stats17-card stats17-card--reviews" aria-labelledby="stats-recommend-title">
          <h2 id="stats-recommend-title" className="stats17-card__title">
            Qayta o'rganishga tavsiya
          </h2>
          <RecommendationsList items={data.recommendations} />
        </section>
      </>
    );
  })();

  return (
    <div className="stats17-shell">
      <AppBackground variant="app" overlay="light" scroll={false}>
        <section className="stats17-frame" aria-label="Statistika">
          <StatusBar />
          <header className="stats17-header">
            <button
              type="button"
              className="stats17-back"
              onClick={() => navigate({ to: "/profile" })}
              aria-label="Orqaga"
            >
              <span className="stats17-back__arrow" aria-hidden="true" />
            </button>
            <h1 className="stats17-header__title">Statistika</h1>
          </header>
          <div className="stats17-content">{body}</div>
        </section>
      </AppBackground>
    </div>
  );
}
