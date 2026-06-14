import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentStudent } from "../auth/current-student.decorator";
import { LearningService } from "./learning.service";

@Controller("student")
@UseGuards(AuthGuard)
export class LearningController {
  constructor(private readonly service: LearningService) {}

  @Get("path")
  getPath(@CurrentStudent() studentId: string) {
    return this.service.getPath(studentId);
  }

  @Get("modules/:moduleId")
  getModule(@CurrentStudent() studentId: string, @Param("moduleId") moduleId: string) {
    return this.service.getModule(studentId, moduleId);
  }

  @Get("modules/:moduleId/exercises")
  getExercises(@CurrentStudent() studentId: string, @Param("moduleId") moduleId: string) {
    return this.service.getExercises(studentId, moduleId);
  }

  @Post("modules/:moduleId/start")
  startPractice(@CurrentStudent() studentId: string, @Param("moduleId") moduleId: string) {
    return this.service.startPractice(studentId, moduleId);
  }

  @Post("modules/:moduleId/final-quiz/start")
  startFinalQuiz(@CurrentStudent() studentId: string, @Param("moduleId") moduleId: string) {
    return this.service.startFinalQuiz(studentId, moduleId);
  }

  @Get("modules/:moduleId/result")
  getResult(@CurrentStudent() studentId: string, @Param("moduleId") moduleId: string) {
    return this.service.getResult(studentId, moduleId);
  }
}
