import { Module } from "@nestjs/common";
import { HealthController } from "./common/health.controller";
import { AttemptsModule } from "./modules/attempts/attempts.module";
import { AuthModule } from "./modules/auth/auth.module";
import { StudentDashboardModule } from "./modules/student-dashboard/student-dashboard.module";

@Module({
  imports: [AuthModule, AttemptsModule, StudentDashboardModule],
  controllers: [HealthController]
})
export class AppModule {}
