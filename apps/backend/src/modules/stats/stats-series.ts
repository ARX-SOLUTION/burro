import type { DailyXpPoint, ReviewRecommendationDto } from "@burro/shared";
import type { DailyXpRow, ModuleAccuracyRow } from "./stats.ports";

const SERIES_DAYS = 7;

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Builds a 7-point, zero-filled, oldest-first XP series ending today (UTC).
 * Sparse rows from the store are slotted into their day; absent days are 0.
 */
export function buildXpSeries(rows: DailyXpRow[], now: Date = new Date()): DailyXpPoint[] {
  const byDate = new Map(rows.map((row) => [row.date, row.xp]));
  const series: DailyXpPoint[] = [];
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  for (let offset = SERIES_DAYS - 1; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - offset);
    const date = isoDate(day);
    series.push({ date, xp: byDate.get(date) ?? 0 });
  }
  return series;
}

/** Start of the 7-day window (inclusive), midnight UTC. */
export function seriesWindowStart(now: Date = new Date()): Date {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - (SERIES_DAYS - 1));
  return start;
}

/**
 * Up to `limit` modules to review: incomplete modules the student has touched
 * but not finished, and completed modules with the weakest accuracy. Locked /
 * untouched modules are excluded so the list is actionable.
 */
export function buildRecommendations(rows: ModuleAccuracyRow[], limit = 3): ReviewRecommendationDto[] {
  const candidates = rows
    .filter((row) => row.status === "in_progress" || row.status === "completed")
    .map((row) => {
      const accuracy = row.total > 0 ? Math.round((row.correct / row.total) * 100) : 0;
      const reason: ReviewRecommendationDto["reason"] = row.status === "completed" ? "low_accuracy" : "incomplete";
      return { moduleId: row.moduleId, title: row.title, accuracy, reason };
    });

  // Incomplete first (most urgent), then lowest accuracy.
  candidates.sort((a, b) => {
    if (a.reason !== b.reason) {
      return a.reason === "incomplete" ? -1 : 1;
    }
    return a.accuracy - b.accuracy;
  });

  return candidates.slice(0, limit);
}
