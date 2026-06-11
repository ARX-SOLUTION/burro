import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { answerAttemptRequestSchema, startAttemptRequestSchema } from "@burro/shared";
import type { AnswerAttemptRequest, StartAttemptRequest } from "@burro/shared";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentStudent } from "../auth/current-student.decorator";
import { AttemptsService } from "./attempts.service";

@Controller("student/attempts")
@UseGuards(AuthGuard)
export class AttemptsController {
  constructor(private readonly service: AttemptsService) {}

  @Post("start")
  start(
    @CurrentStudent() studentId: string,
    @Body(new ZodValidationPipe(startAttemptRequestSchema)) body: StartAttemptRequest
  ) {
    return this.service.start(studentId, body);
  }

  @Post(":attemptId/answer")
  answer(
    @CurrentStudent() studentId: string,
    @Param("attemptId") attemptId: string,
    @Body(new ZodValidationPipe(answerAttemptRequestSchema)) body: AnswerAttemptRequest
  ) {
    return this.service.answer(studentId, attemptId, body);
  }
}
