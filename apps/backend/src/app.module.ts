import { Module } from "@nestjs/common";
import { HealthController } from "./common/health.controller";
import { AttemptsModule } from "./modules/attempts/attempts.module";
import { AuthModule } from "./modules/auth/auth.module";
import { LeaderboardModule } from "./modules/leaderboard/leaderboard.module";
import { LearningModule } from "./modules/learning/learning.module";
import { PremiumModule } from "./modules/premium/premium.module";
import { ProfileModule } from "./modules/profile/profile.module";
import { StatsModule } from "./modules/stats/stats.module";
import { StudentDashboardModule } from "./modules/student-dashboard/student-dashboard.module";

@Module({
  imports: [
    AuthModule,
    AttemptsModule,
    StudentDashboardModule,
    LearningModule,
    ProfileModule,
    PremiumModule,
    LeaderboardModule,
    StatsModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
