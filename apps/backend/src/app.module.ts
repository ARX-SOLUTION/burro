import { Module } from "@nestjs/common";
import { HealthController } from "./common/health.controller";
import { AttemptsModule } from "./modules/attempts/attempts.module";

@Module({
  imports: [AttemptsModule],
  controllers: [HealthController]
})
export class AppModule {}
