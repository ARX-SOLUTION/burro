import { Module } from "@nestjs/common";
import { InMemoryAttemptsStore } from "./adapters/in-memory-attempts.store";
import { InMemoryExerciseCatalog } from "./adapters/in-memory-exercise.catalog";
import { ATTEMPTS_STORE, EXERCISE_CATALOG } from "./attempts.ports";
import { AttemptsController } from "./attempts.controller";
import { AttemptsService } from "./attempts.service";

@Module({
  controllers: [AttemptsController],
  providers: [
    AttemptsService,
    { provide: ATTEMPTS_STORE, useClass: InMemoryAttemptsStore },
    { provide: EXERCISE_CATALOG, useClass: InMemoryExerciseCatalog }
  ],
  exports: [AttemptsService]
})
export class AttemptsModule {}
