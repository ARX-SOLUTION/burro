import { Module } from "@nestjs/common";
import { appConfig } from "../../config";
import type { BurroDb } from "../../db/client";
import { BURRO_DB, DatabaseModule } from "../../db/database.module";
import { AttemptsModule } from "../attempts/attempts.module";
import { DrizzleLearningStore } from "./adapters/drizzle-learning.store";
import { InMemoryLearningStore } from "./adapters/in-memory-learning.store";
import { LEARNING_STORE } from "./learning.ports";
import { LearningController } from "./learning.controller";
import { LearningService } from "./learning.service";

const storeProvider = {
  provide: LEARNING_STORE,
  inject: [BURRO_DB],
  useFactory: (db: BurroDb | null) => {
    if (appConfig().attemptsStore === "memory") {
      return new InMemoryLearningStore();
    }
    if (!db) {
      throw new Error("Drizzle learning store requires a database, but BURRO_DB resolved to null.");
    }
    return new DrizzleLearningStore(db);
  }
};

@Module({
  imports: [DatabaseModule, AttemptsModule],
  controllers: [LearningController],
  providers: [LearningService, storeProvider]
})
export class LearningModule {}
