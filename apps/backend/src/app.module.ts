import { Module } from "@nestjs/common";
import { HealthController } from "./common/health.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { StudentsModule } from "./modules/students/students.module";
import { ParentsModule } from "./modules/parents/parents.module";
import { AdminModule } from "./modules/admin/admin.module";
import { LearningModule } from "./modules/learning/learning.module";
import { ExercisesModule } from "./modules/exercises/exercises.module";
import { MediaModule } from "./modules/media/media.module";
import { QuizModule } from "./modules/quiz/quiz.module";
import { XpModule } from "./modules/xp/xp.module";
import { AchievementsModule } from "./modules/achievements/achievements.module";
import { LeaderboardModule } from "./modules/leaderboard/leaderboard.module";
import { PremiumModule } from "./modules/premium/premium.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { ModerationModule } from "./modules/moderation/moderation.module";
import { AuditModule } from "./modules/audit/audit.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { RealtimeModule } from "./modules/realtime/realtime.module";

@Module({
  imports: [AuthModule, UsersModule, StudentsModule, ParentsModule, AdminModule, LearningModule, ExercisesModule, MediaModule, QuizModule, XpModule, AchievementsModule, LeaderboardModule, PremiumModule, NotificationsModule, ModerationModule, AuditModule, AnalyticsModule, RealtimeModule],
  controllers: [HealthController]
})
export class AppModule {}
