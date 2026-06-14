export interface DailyXpPoint {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  xp: number;
}

export interface ReviewRecommendationDto {
  moduleId: string;
  title: string;
  accuracy: number;
  reason: "low_accuracy" | "incomplete";
}

export interface StudentStatsSummaryDto {
  /** Last 7 days, oldest first, with zero-filled gaps. */
  xpSeries: DailyXpPoint[];
  weeklyXp: number;
  overallAccuracy: number;
  correctAnswers: number;
  totalAnswers: number;
  activeDays: number;
  recommendations: ReviewRecommendationDto[];
}
