import { Module } from "@nestjs/common";
import { appConfig } from "../../config";
import type { BurroDb } from "../../db/client";
import { BURRO_DB, DatabaseModule } from "../../db/database.module";
import { DrizzleStudentDashboardStore } from "./adapters/drizzle-student-dashboard.store";
import { InMemoryStudentDashboardStore } from "./adapters/in-memory-student-dashboard.store";
import { STUDENT_DASHBOARD_STORE } from "./student-dashboard.ports";
import { StudentDashboardController } from "./student-dashboard.controller";
import { StudentDashboardService } from "./student-dashboard.service";

const storeProvider = {
  provide: STUDENT_DASHBOARD_STORE,
  inject: [BURRO_DB],
  useFactory: (db: BurroDb | null) => {
    // attemptsStore is the single store-mode flag for all backend store adapters;
    // DatabaseModule only provides BURRO_DB when it is "drizzle".
    if (appConfig().attemptsStore === "memory") {
      return new InMemoryStudentDashboardStore();
    }
    if (!db) {
      throw new Error("Drizzle student-dashboard store requires a database, but BURRO_DB resolved to null.");
    }
    return new DrizzleStudentDashboardStore(db);
  }
};

@Module({
  imports: [DatabaseModule],
  controllers: [StudentDashboardController],
  providers: [StudentDashboardService, storeProvider]
})
export class StudentDashboardModule {}
