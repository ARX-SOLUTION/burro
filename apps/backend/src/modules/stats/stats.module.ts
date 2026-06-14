import { Module } from "@nestjs/common";
import { appConfig } from "../../config";
import type { BurroDb } from "../../db/client";
import { BURRO_DB, DatabaseModule } from "../../db/database.module";
import { DrizzleStatsStore } from "./adapters/drizzle-stats.store";
import { InMemoryStatsStore } from "./adapters/in-memory-stats.store";
import { STATS_STORE } from "./stats.ports";
import { StatsController } from "./stats.controller";
import { StatsService } from "./stats.service";

const storeProvider = {
  provide: STATS_STORE,
  inject: [BURRO_DB],
  useFactory: (db: BurroDb | null) => {
    if (appConfig().attemptsStore === "memory") {
      return new InMemoryStatsStore();
    }
    if (!db) {
      throw new Error("Drizzle stats store requires a database, but BURRO_DB resolved to null.");
    }
    return new DrizzleStatsStore(db);
  }
};

@Module({
  imports: [DatabaseModule],
  controllers: [StatsController],
  providers: [StatsService, storeProvider]
})
export class StatsModule {}
