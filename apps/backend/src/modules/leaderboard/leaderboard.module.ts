import { Module } from "@nestjs/common";
import { appConfig } from "../../config";
import type { BurroDb } from "../../db/client";
import { BURRO_DB, DatabaseModule } from "../../db/database.module";
import { DrizzleLeaderboardStore } from "./adapters/drizzle-leaderboard.store";
import { InMemoryLeaderboardStore } from "./adapters/in-memory-leaderboard.store";
import { LEADERBOARD_STORE } from "./leaderboard.ports";
import { LeaderboardController } from "./leaderboard.controller";
import { LeaderboardService } from "./leaderboard.service";

const storeProvider = {
  provide: LEADERBOARD_STORE,
  inject: [BURRO_DB],
  useFactory: (db: BurroDb | null) => {
    if (appConfig().attemptsStore === "memory") {
      return new InMemoryLeaderboardStore();
    }
    if (!db) {
      throw new Error("Drizzle leaderboard store requires a database, but BURRO_DB resolved to null.");
    }
    return new DrizzleLeaderboardStore(db);
  }
};

@Module({
  imports: [DatabaseModule],
  controllers: [LeaderboardController],
  providers: [LeaderboardService, storeProvider]
})
export class LeaderboardModule {}
