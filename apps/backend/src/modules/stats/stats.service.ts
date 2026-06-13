import { Inject, Injectable } from "@nestjs/common";
import type { StudentStatsSummaryDto } from "@burro/shared";
import { STATS_STORE } from "./stats.ports";
import type { StatsStorePort } from "./stats.ports";
import { buildRecommendations, buildXpSeries, seriesWindowStart } from "./stats-series";

@Injectable()
export class StatsService {
  constructor(@Inject(STATS_STORE) private readonly store: StatsStorePort) {}

  async getSummary(studentId: string): Promise<StudentStatsSummaryDto> {
    const since = seriesWindowStart();
    const [dailyXp, accuracy, activeDays, moduleAccuracy] = await Promise.all([
      this.store.getDailyXp(studentId, since),
      this.store.getAccuracyTotals(studentId),
      this.store.countActiveDays(studentId),
      this.store.getModuleAccuracy(studentId)
    ]);

    const xpSeries = buildXpSeries(dailyXp);
    const weeklyXp = xpSeries.reduce((sum, point) => sum + point.xp, 0);
    const overallAccuracy = accuracy.total > 0 ? Math.round((accuracy.correct / accuracy.total) * 100) : 0;

    return {
      xpSeries,
      weeklyXp,
      overallAccuracy,
      correctAnswers: accuracy.correct,
      totalAnswers: accuracy.total,
      activeDays,
      recommendations: buildRecommendations(moduleAccuracy)
    };
  }
}
