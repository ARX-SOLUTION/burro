import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { AnswerAttemptRequest, AnswerResultView, AttemptView, StartAttemptRequest } from "@burro/shared";
import { AttemptEngine, AttemptError } from "./attempt-engine";
import { ATTEMPTS_STORE, EXERCISE_CATALOG } from "./attempts.ports";
import type { AttemptsStorePort, ExerciseCatalogPort } from "./attempts.ports";

// TODO(auth): resolve student from session once AuthModule lands.
const DEMO_STUDENT_ID = "student-demo";

@Injectable()
export class AttemptsService {
  private readonly engine: AttemptEngine;

  constructor(
    @Inject(ATTEMPTS_STORE) store: AttemptsStorePort,
    @Inject(EXERCISE_CATALOG) catalog: ExerciseCatalogPort
  ) {
    this.engine = new AttemptEngine(store, catalog);
  }

  async start(req: StartAttemptRequest): Promise<AttemptView> {
    try {
      return await this.engine.start(DEMO_STUDENT_ID, req);
    } catch (error) {
      throw this.toHttpError(error);
    }
  }

  async answer(attemptId: string, req: AnswerAttemptRequest): Promise<AnswerResultView> {
    try {
      return await this.engine.answer(DEMO_STUDENT_ID, attemptId, req);
    } catch (error) {
      throw this.toHttpError(error);
    }
  }

  private toHttpError(error: unknown): unknown {
    if (error instanceof AttemptError) {
      if (error.code === "not_found") {
        return new NotFoundException(error.message);
      }
      return new BadRequestException(error.message);
    }
    return error;
  }
}
