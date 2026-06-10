import { Body, Controller, Param, Post } from "@nestjs/common";
import { answerAttemptRequestSchema, startAttemptRequestSchema } from "@burro/shared";
import type { AnswerAttemptRequest, StartAttemptRequest } from "@burro/shared";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { AttemptsService } from "./attempts.service";

@Controller("student/attempts")
export class AttemptsController {
  constructor(private readonly service: AttemptsService) {}

  @Post("start")
  start(@Body(new ZodValidationPipe(startAttemptRequestSchema)) body: StartAttemptRequest) {
    return this.service.start(body);
  }

  @Post(":attemptId/answer")
  answer(
    @Param("attemptId") attemptId: string,
    @Body(new ZodValidationPipe(answerAttemptRequestSchema)) body: AnswerAttemptRequest
  ) {
    return this.service.answer(attemptId, body);
  }
}
