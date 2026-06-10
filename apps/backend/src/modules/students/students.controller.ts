import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import type { CheckExerciseAnswerDto } from "./dto";
import { StudentsService } from "./students.service";

@Controller()
export class StudentsController {
  constructor(private readonly service: StudentsService) {}

  @Get("students")
  index() {
    return this.service.status();
  }

  @Post("student/exercises/:exerciseId/check")
  checkExerciseAnswer(
    @Param("exerciseId") exerciseId: string,
    @Body() body: Partial<CheckExerciseAnswerDto> = {}
  ) {
    return this.service.checkExerciseAnswer(exerciseId, body);
  }
}
