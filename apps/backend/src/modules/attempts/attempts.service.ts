import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { AnswerAttemptRequest, AnswerResultView, AttemptView, StartAttemptRequest } from "@burro/shared";
import { AttemptEngine, AttemptError } from "./attempt-engine";
import { ATTEMPTS_STORE, EXERCISE_CATALOG } from "./attempts.ports";
import type { AttemptsStorePort, ExerciseCatalogPort } from "./attempts.ports";

@Injectable()
export class AttemptsService {
  private readonly engine: AttemptEngine;

  constructor(
    @Inject(ATTEMPTS_STORE) store: AttemptsStorePort,
    @Inject(EXERCISE_CATALOG) catalog: ExerciseCatalogPort
  ) {
    this.engine = new AttemptEngine(store, catalog);
  }

  async start(studentId: string, req: StartAttemptRequest): Promise<AttemptView> {
    try {
      return await this.engine.start(studentId, req);
    } catch (error) {
      throw this.toHttpError(error);
    }
  }

  async answer(studentId: string, attemptId: string, req: AnswerAttemptRequest): Promise<AnswerResultView> {
    try {
      return await this.engine.answer(studentId, attemptId, req);
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
