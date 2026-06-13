import { Module } from "@nestjs/common";
import { appConfig } from "../../config";
import type { BurroDb } from "../../db/client";
import { BURRO_DB, DatabaseModule } from "../../db/database.module";
import { DrizzleAttemptsStore } from "./adapters/drizzle-attempts.store";
import { DrizzleExerciseCatalog } from "./adapters/drizzle-exercise.catalog";
import { InMemoryAttemptsStore } from "./adapters/in-memory-attempts.store";
import { InMemoryExerciseCatalog } from "./adapters/in-memory-exercise.catalog";
import { ATTEMPTS_STORE, EXERCISE_CATALOG } from "./attempts.ports";
import { AttemptsController } from "./attempts.controller";
import { AttemptsService } from "./attempts.service";

const attemptsStoreProvider = {
  provide: ATTEMPTS_STORE,
  inject: [BURRO_DB],
  useFactory: (db: BurroDb | null) => {
    if (appConfig().attemptsStore === "memory") {
      return new InMemoryAttemptsStore();
    }
    if (!db) {
      // Never fall back to in-memory here: student progress would silently
      // stop being durable.
      throw new Error("Drizzle attempts store requires a database, but BURRO_DB resolved to null.");
    }
    return new DrizzleAttemptsStore(db);
  }
};

const exerciseCatalogProvider = {
  provide: EXERCISE_CATALOG,
  inject: [BURRO_DB],
  useFactory: (db: BurroDb | null) => {
    if (appConfig().attemptsStore === "memory") {
      return new InMemoryExerciseCatalog();
    }
    if (!db) {
      throw new Error("Drizzle exercise catalog requires a database, but BURRO_DB resolved to null.");
    }
    return new DrizzleExerciseCatalog(db);
  }
};

@Module({
  imports: [DatabaseModule],
  controllers: [AttemptsController],
  providers: [AttemptsService, attemptsStoreProvider, exerciseCatalogProvider],
  exports: [AttemptsService, EXERCISE_CATALOG]
})
export class AttemptsModule {}
