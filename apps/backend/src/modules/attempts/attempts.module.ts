import { Module } from "@nestjs/common";
import { DrizzleAttemptsStore } from "./adapters/drizzle-attempts.store";
import { InMemoryAttemptsStore } from "./adapters/in-memory-attempts.store";
import { InMemoryExerciseCatalog } from "./adapters/in-memory-exercise.catalog";
import { ATTEMPTS_STORE, EXERCISE_CATALOG } from "./attempts.ports";
import { AttemptsController } from "./attempts.controller";
import { AttemptsService } from "./attempts.service";

const attemptsStoreProvider = {
  provide: ATTEMPTS_STORE,
  useFactory: () =>
    process.env.BURRO_ATTEMPTS_STORE === "drizzle" ? new DrizzleAttemptsStore() : new InMemoryAttemptsStore()
};

@Module({
  controllers: [AttemptsController],
  providers: [
    AttemptsService,
    attemptsStoreProvider,
    { provide: EXERCISE_CATALOG, useClass: InMemoryExerciseCatalog }
  ],
  exports: [AttemptsService]
})
export class AttemptsModule {}
