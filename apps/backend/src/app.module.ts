import { Module } from "@nestjs/common";
import { HealthController } from "./common/health.controller";
import { AttemptsModule } from "./modules/attempts/attempts.module";
import { AuthModule } from "./modules/auth/auth.module";

@Module({
  imports: [AuthModule, AttemptsModule],
  controllers: [HealthController]
})
export class AppModule {}
