import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import type { CheckExerciseAnswerDto } from "./dto";
import { StudentsService } from "./students.service";

@Controller("student")
export class StudentsController {
  constructor(private readonly service: StudentsService) {}

  @Get()
  index() { return this.service.status(); }

  @Post("exercises/:exerciseId/check")
  checkExerciseAnswer(
    @Param("exerciseId") exerciseId: string,
    @Body() body: Partial<CheckExerciseAnswerDto> = {}
  ) {
    return this.service.checkExerciseAnswer(exerciseId, body);
  }
}
